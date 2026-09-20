'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  ARCH,
  ARCH_MASK_SRC,
  DEFAULT_WINDOW_VIEW,
  INTRO,
  clamp,
  computeLayout,
  landscapeRectAt,
  landscapeStartRect,
  localViewRect,
  phase,
  rigRectAt,
  smoothstep,
  transformFor,
  type Rect,
} from '@/lib/scene';

/* Layout-эффект нужен только на клиенте — на сервере он не выполняется,
   поэтому там достаточно обычного (см. тот же приём в прежней сцене). */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type Phase = 'loading' | 'flying' | 'done';

const VIEW = DEFAULT_WINDOW_VIEW;
const FOCUS = VIEW.focus ?? { x: 0.5, y: 0.5 };

/* Отступы вокруг стартового (контейнерного) кадра арки, доля экрана:
   по бокам и сверху — воздух, снизу — место под «Загрузка…», чтобы
   подол платья её не перекрывал. */
const FRAME_PAD_SIDE = 0.08;
const FRAME_PAD_TOP = 0.06;
const FRAME_PAD_BOTTOM = 0.18;

/**
 * Заставка портфолио: на белом фоне появляется арка с девушкой (вид
 * в проёме уже виден), затем сама, без участия посетителя, играет
 * влёт камеры в окно — и от неё остаётся только сам пейзаж, во весь
 * экран. Ни заголовка, ни выбора проектов здесь нет — чем заканчивать
 * страницу, пока в lib/projects.ts не заполнены настоящие слоты, ещё
 * предстоит решить отдельно.
 *
 * Как это устроено
 * ----------------
 * Один и тот же DOM — и во время влёта, и после него. Тот же приём,
 * что и у прежней версии сцены с прокруткой (см. заголовок
 * lib/scene.ts): .rig — контейнер размером с натуральный кадр арки,
 * внутри него .rig__window (неподвижная обёртка с постоянной маской
 * проёма) с панорамой внутри на своём отдельном transform, и поверх —
 * фигура арки без своего transform, только с анимируемой
 * непрозрачностью. Влёт устроен как та же геометрия, что раньше вела
 * отъезд камеры по прокрутке, только пройденная в обратную сторону
 * и по времени (requestAnimationFrame), а не по scrollTop: старт —
 * арка обычного размера на белом фоне, финиш — .rig настолько
 * огромен, что пейзаж внутри проёма занимает весь экран, как самый
 * обычный полноэкранный фон. Дойдя до конца, .rig и панорама
 * ЗАСТЫВАЮТ в этом положении (position: fixed, тот же элемент
 * <img>, тот же файл — вторая копия пейзажа нигде не заводится) —
 * это и есть весь итог страницы.
 *
 * Готовность и запуск
 * --------------------
 * Пока не готовы обе картинки (арка и панорама — с одноразовой
 * подстраховкой таймером на случай, если какая-то так и не загрузится)
 * — на экране только белый фон и надпись «Загрузка…» с тонкой
 * индикаторной полоской (без выдуманных процентов, полоска просто
 * бежит). Экран «Загрузка…» держится не меньше INTRO.minLoadingMs
 * (считая с открытия страницы, а не с готовности картинок) — на
 * быстрой сети или с картинками из кэша браузера готовность может
 * наступить почти сразу, и без этого порога посетитель не успевает
 * понять, что вообще происходит, прежде чем экран сменится. Дальше,
 * без клика и без прокрутки, сам начинается влёт.
 *
 * Пока идёт заставка (ожидание готовности или сам влёт), прокрутка
 * страницы заблокирована — случайный скролл не должен смешать кадр
 * влёта. При prefers-reduced-motion (или без JS) класс .js на <html>
 * не появляется вовсе (см. layout.tsx), и CSS переключает всю
 * разметку в статичный режим: заставки и влёта нет, сразу виден
 * пейзаж — тот же <img>, просто обычной картинкой на весь экран, без
 * .rig и маски.
 */
export default function Intro() {
  const introRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLImageElement>(null);
  const figureRef = useRef<HTMLImageElement>(null);

  const phaseRef = useRef<Phase>('loading');
  const motionAllowedRef = useRef(true);
  /** Момент открытия страницы — точка отсчёта для INTRO.minLoadingMs
   *  (не момент готовности картинок, см. заголовок компонента). */
  const mountedAtRef = useRef(0);

  const [phaseState, setPhaseState] = useState<Phase>('loading');
  const [ready, setReady] = useState({ figure: false, landscape: false, mask: false });
  const allReady = ready.figure && ready.landscape && ready.mask;

  function setPhase(next: Phase) {
    phaseRef.current = next;
    setPhaseState(next);
  }

  /* Мгновенно, ДО первой отрисовки: если движение запрещено, сразу
     ставим фазу «готово» — без этого на кадр мелькнула бы заставка.
     Без JS этот код и вовсе не выполнится — тогда всё решает CSS,
     см. app/scene.css.
     Заодно проверяем картинки СИНХРОННО, через complete/naturalWidth,
     а не только через onLoad в разметке ниже: страница отрисована на
     сервере, и браузер начинает грузить <img> сразу по разбору HTML,
     ещё до гидратации — на быстром или кэшированном файле событие
     load успевает произойти раньше, чем React вообще навесит
     обработчик, и onLoad в этом случае никогда не сработает. complete
     — обычное свойство DOM, ему всё равно, когда его прочли. */
  useIsomorphicLayoutEffect(() => {
    mountedAtRef.current = Date.now();
    const allowed = document.documentElement.classList.contains('js');
    motionAllowedRef.current = allowed;
    if (!allowed) {
      setPhase('done');
      return;
    }
    if (figureRef.current?.complete) setReady((r) => ({ ...r, figure: true }));
    if (landscapeRef.current?.complete) setReady((r) => ({ ...r, landscape: true }));
  }, []);

  /* Подстраховка на случай, если какая-то картинка так и не загрузится
     (медленная сеть, битая ссылка): заставка не должна виснуть вечно. */
  useEffect(() => {
    if (!motionAllowedRef.current) return;
    const timeout = window.setTimeout(() => {
      setReady({ figure: true, landscape: true, mask: true });
    }, 6000);
    return () => window.clearTimeout(timeout);
  }, []);

  /* Маска — CSS-фон, а не <img>, поэтому у неё нет onLoad в разметке:
     проверяем готовность отдельной синтетической картинкой. */
  useEffect(() => {
    if (!motionAllowedRef.current) return;
    const img = new window.Image();
    const done = () => setReady((r) => ({ ...r, mask: true }));
    img.onload = done;
    img.onerror = done;
    img.src = ARCH_MASK_SRC;
  }, []);

  /* Раскладка на текущий момент: стартовый и конечный кадр арки,
     стартовое и конечное местное положение панорамы — и функция apply,
     которая по произвольному t (0..1) пишет transform/opacity в DOM.
     Меряет экран заново при каждом вызове — вызывается прямо перед
     стартом влёта. */
  function prepareFlight(): ((rawT: number) => void) | null {
    const rig = rigRef.current;
    const landscape = landscapeRef.current;
    const figure = figureRef.current;
    const introEl = introRef.current;
    if (!rig || !landscape || !figure || !introEl) return null;

    const box = introEl.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return null;
    const viewport = { width: box.width, height: box.height };

    const padX = Math.min(viewport.width, viewport.height) * FRAME_PAD_SIDE;
    const padTop = viewport.height * FRAME_PAD_TOP;
    const padBottom = viewport.height * FRAME_PAD_BOTTOM;
    const frame: Rect = {
      x: padX,
      y: padTop,
      width: Math.max(1, viewport.width - padX * 2),
      height: Math.max(1, viewport.height - padTop - padBottom),
    };

    const layout = computeLayout(viewport, frame);
    const landscapeFrom = localViewRect(VIEW);
    const landscapeTo = landscapeStartRect(VIEW, viewport, layout.rigStart);

    return (rawT: number) => {
      const tRig = smoothstep(rawT);
      const rigRect = rigRectAt(tRig, layout.arch, layout.rigStart);
      rig.style.transform = transformFor(rigRect, ARCH);

      const tLandscape = phase(rawT, [INTRO.landscapeSettleFrom, 1]);
      const localRect = landscapeRectAt(tLandscape, landscapeFrom, landscapeTo, FOCUS);
      landscape.style.transform = transformFor(localRect, VIEW);

      const figureOpacity = 1 - phase(rawT, INTRO.figureOut);
      figure.style.opacity = figureOpacity.toFixed(3);
    };
  }

  /* Как только всё готово — влёт, но не раньше INTRO.minLoadingMs
     с открытия страницы (см. заголовок компонента). */
  useEffect(() => {
    if (phaseRef.current !== 'loading' || !allReady) return;
    const elapsed = Date.now() - mountedAtRef.current;
    const remaining = Math.max(0, INTRO.minLoadingMs - elapsed);
    const timeout = window.setTimeout(() => {
      if (phaseRef.current === 'loading') setPhase('flying');
    }, remaining);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allReady]);

  /* Сам влёт: requestAnimationFrame-цикл поверх prepareFlight(). */
  useEffect(() => {
    if (phaseState !== 'flying') return;

    const apply = prepareFlight();
    if (!apply) {
      setPhase('done');
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let start = 0;

    const tick = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      const rawT = clamp((now - start) / INTRO.duration);
      apply(rawT);
      if (rawT < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setPhase('done');
      }
    };

    apply(0);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseState]);

  /* Пока заставка играет (ожидание готовности или сам влёт) —
     прокрутка страницы заблокирована, иначе случайный скролл
     смешает кадр влёта. */
  useEffect(() => {
    if (phaseState === 'done') return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previous;
    };
  }, [phaseState]);

  return (
    <div
      className="intro"
      ref={introRef}
      data-phase={phaseState}
      inert={phaseState === 'done'}
      style={
        {
          '--nat-w': `${ARCH.width}px`,
          '--nat-h': `${ARCH.height}px`,
        } as React.CSSProperties
      }
    >
      <div className="rig" ref={rigRef}>
        <div className="rig__window">
          <img
            ref={landscapeRef}
            className="rig__landscape"
            src={VIEW.src}
            alt=""
            width={VIEW.width}
            height={VIEW.height}
            fetchPriority="high"
            decoding="async"
            /* object-position — только для запасного (без JS) режима,
               где панорама лежит обычной cover-картинкой, а не
               transform'ом; в режиме заставки ни на что не влияет. */
            style={{ objectPosition: `${FOCUS.x * 100}% ${FOCUS.y * 100}%` }}
            onLoad={() => setReady((r) => ({ ...r, landscape: true }))}
            onError={() => setReady((r) => ({ ...r, landscape: true }))}
          />
        </div>
        <img
          ref={figureRef}
          className="rig__figure"
          src={ARCH.src}
          alt="Девушка в зелёном платье сидит спиной к зрителю на подоконнике готической арки, глядя в проём наружу"
          width={ARCH.width}
          height={ARCH.height}
          fetchPriority="high"
          decoding="async"
          onLoad={() => setReady((r) => ({ ...r, figure: true }))}
          onError={() => setReady((r) => ({ ...r, figure: true }))}
        />
      </div>

      <div className="intro__curtain" aria-hidden="true" />

      <div className="intro__loading" aria-live="polite">
        <p className="intro__loading-text">Загрузка…</p>
        <div className="intro__loading-track" aria-hidden="true">
          <div className="intro__loading-bar" />
        </div>
      </div>
    </div>
  );
}
