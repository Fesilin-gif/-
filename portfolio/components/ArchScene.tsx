'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Medallions from '@/components/Medallions';
import { windowViewFor } from '@/lib/projects';
import {
  ARCH,
  DEFAULT_WINDOW_VIEW,
  PHASE,
  SCENE_TRAVEL_VH,
  SETTLE_AT,
  clamp,
  computeLayout,
  landscapeRectAt,
  landscapeStartRect,
  localViewRect,
  phase,
  rigRectAt,
  transformFor,
  type Rect,
  type SceneLayout,
} from '@/lib/scene';

/* Сцена раскладывается до первой отрисовки, иначе кадр успевает
   мелькнуть в натуральном размере. На сервере layout-эффекта нет,
   поэтому берём обычный — там он всё равно не выполняется. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Первый экран портфолио: общий пейзаж, из которого при прокрутке
 * проявляется арка с девушкой, и который затем отдаляется внутри неё.
 *
 * Как это устроено
 * ----------------
 * Высокий блок .scene задаёт длину прокрутки, внутри него залипает
 * экран .stage. Положение страницы внутри этого блока — единственный
 * источник прогресса: ничего не «проигрывается», поэтому сцена
 * одинаково идёт вперёд и назад и останавливается там, где остановили.
 *
 * Один слой, одна система координат (подробности — в lib/scene.ts,
 * в шапке файла). Коротко: .rig — контейнер размером с натуральный
 * кадр арки (1122×1402). Внутри него, в этих же координатах, сидят
 * .rig__window (неподвижная обёртка с ПОСТОЯННОЙ маской проёма — её
 * mask-size/position никогда не пересчитываются, см. scene.css) и
 * сама фигура арки. Панорама лежит ВНУТРИ .rig__window, своим
 * собственным transform (не маска — только позиция/масштаб самой
 * картинки). Сам .rig двигается одним transform, который каждый кадр
 * прокрутки пишет этот компонент — им одновременно масштабируются и
 * .rig__window (вместе с панорамой и маской внутри), и фигура арки.
 *
 * На progress 0 арки не видно вовсе (её фигура прозрачна — см.
 * PHASE.figureIn, и к тому же камень геометрически вне экрана —
 * .rig стартует огромным, как и раньше), а местное положение
 * панорамы внутри .rig__window подобрано так (landscapeStartRect),
 * что в паре с этим огромным стартовым .rig на экране получается
 * ровно обычный полноэкранный пейзаж — как если бы страница была
 * просто картинкой. При прокрутке фигура арки проявляется, а
 * панорама и .rig одновременно едут к финальному состоянию
 * (landscapeRectAt/rigRectAt, одна и та же фаза, поэтому без
 * рассинхронизации): камень входит в кадр со всех сторон, а пейзаж
 * внутри проёма «отдаляется» от широкого кадра к точной обрезке по
 * форме окна. Это всё то же самое, один и тот же <img>, без смены
 * источника и без перехода через прозрачность пейзажа.
 *
 * Вся арифметика вынесена в lib/scene.ts. Здесь — только измерения
 * реального экрана и запись результата в transform .rig/панорамы.
 */
export default function ArchScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLImageElement>(null);
  const figureRef = useRef<HTMLImageElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string | null>(null);

  /* Вид в проёме следует за выбранным медальоном. Пока ни у одного
     проекта нет своего кадра, windowViewFor всегда отдаёт вид по
     умолчанию — переключение готово и работает, только сегодня оно
     ничего не меняет визуально: подставлять пока нечего. */
  const view = useMemo(() => windowViewFor(selected), [selected]);
  const focus = useMemo(() => view.focus ?? { x: 0.5, y: 0.5 }, [view]);

  /* Финальный (конечный) локальный кадр вида внутри .rig не зависит
     от экрана — чистая функция вида, пересчитывается только при
     смене медальона. Стартовый кадр (landscapeStartRect) зависит ещё
     и от размера экрана, поэтому считается только внутри эффекта
     ниже, вместе с остальной раскладкой. */
  const landscapeFinal = useMemo(() => localViewRect(view), [view]);

  useIsomorphicLayoutEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const rig = rigRef.current;
    const landscape = landscapeRef.current;
    const figure = figureRef.current;
    const choice = choiceRef.current;
    if (!scene || !stage || !frame || !rig || !landscape || !figure || !choice) return;

    /* Тот же флаг, по которому CSS выбирает режим сцены: класс .js
       ставит синхронный скрипт в <head>, и только если движение
       разрешено. При prefers-reduced-motion сцена не запускается —
       страница остаётся обычной статичной раскладкой. */
    if (!document.documentElement.classList.contains('js')) return;

    let layout: SceneLayout | null = null;
    let landscapeStart: Rect | null = null;
    let interactive: boolean | null = null;
    let scheduled = false;

    const apply = () => {
      if (!layout || !landscapeStart) return;

      const travel = scene.offsetHeight - stage.offsetHeight;
      const raw = travel > 0 ? clamp(-scene.getBoundingClientRect().top / travel) : 1;
      /* Хвост прокрутки после SETTLE_AT — собранная сцена стоит на месте. */
      const progress = clamp(raw / SETTLE_AT);

      /* .rig — одна матрица на панораму (вместе с маской) и фигуру
         арки, см. заголовок lib/scene.ts. */
      const rigRect = rigRectAt(progress, layout.rigStart, layout.arch);
      rig.style.transform = transformFor(rigRect, ARCH);

      /* Местное положение панорамы внутри .rig__window едет по той же
         фазе, что и сам .rig (landscapeRectAt использует
         PHASE.pullBack) — от широкого стартового кадра к точной
         обрезке под проём. Маска при этом не трогается вообще: она
         постоянное свойство самой обёртки (mask-size 100%/position
         0 0 в scene.css), а не панорамы. */
      const localRect = landscapeRectAt(progress, landscapeStart, landscapeFinal, focus);
      landscape.style.transform = transformFor(localRect, view);

      /* На входе арки не видно вовсе — только пейзаж. */
      figure.style.opacity = phase(progress, PHASE.figureIn).toFixed(3);

      const reveal = phase(progress, PHASE.reveal);
      stage.style.setProperty('--reveal', reveal.toFixed(3));

      /* Пока медальоны не проявились, они не должны ловить фокус:
         иначе табуляция уводит на невидимые кнопки. */
      const nextInteractive = reveal > 0.5;
      if (nextInteractive !== interactive) {
        interactive = nextInteractive;
        if (nextInteractive) choice.removeAttribute('inert');
        else choice.setAttribute('inert', '');
      }
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        apply();
      });
    };

    const measure = () => {
      const stageBox = stage.getBoundingClientRect();
      const frameBox = frame.getBoundingClientRect();
      if (stageBox.width === 0 || stageBox.height === 0) return;

      const viewport = { width: stageBox.width, height: stageBox.height };
      layout = computeLayout(viewport, {
        x: frameBox.left - stageBox.left,
        y: frameBox.top - stageBox.top,
        width: frameBox.width,
        height: frameBox.height,
      });
      landscapeStart = landscapeStartRect(view, viewport, layout.rigStart);
      apply();
    };

    measure();

    /* Экран меняется не только по resize: на телефоне сжимается
       адресная строка, на десктопе едет высота заголовка после
       подгрузки шрифтов. Наблюдаем за самими блоками. */
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(frame);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('orientationchange', measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('orientationchange', measure);
    };
  }, [view, focus, landscapeFinal]);

  return (
    <div
      className="scene"
      ref={sceneRef}
      style={{ '--scene-travel': SCENE_TRAVEL_VH } as React.CSSProperties}
    >
      <div className="stage" ref={stageRef}>
        {/* ——— Статичный запасной вариант (без JS / reduced motion) ———
            Отдельная, более простая раскладка: полноэкранная панорама
            и готовая композиция «арка + вид» друг под другом, без
            отъезда камеры. В режиме сцены (.js) не участвует —
            скрыта целиком, см. app/scene.css. */}
        <div className="layer layer--landscape" aria-hidden="true">
          <img
            className="layer__img"
            src={DEFAULT_WINDOW_VIEW.src}
            alt=""
            width={DEFAULT_WINDOW_VIEW.width}
            height={DEFAULT_WINDOW_VIEW.height}
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div className="layer layer--arch">
          <div
            className="window"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${view.src})`,
              backgroundPosition: `${(view.focus?.x ?? 0.5) * 100}% ${(view.focus?.y ?? 0.5) * 100}%`,
            }}
          />
          <img
            className="arch-figure"
            src={ARCH.src}
            alt="Девушка в зелёном платье сидит спиной к зрителю на подоконнике готической арки, глядя в проём наружу"
            width={ARCH.width}
            height={ARCH.height}
            decoding="async"
          />
        </div>

        {/* ——— Сцена (только .js) ————————————————————————————
            .rig — контейнер, его transform и всё, что внутри (transform
            и маска панорамы, непрозрачность фигуры арки), каждый кадр
            прокрутки пишет эффект выше. */}
        <div
          className="rig"
          ref={rigRef}
          aria-hidden="true"
          style={
            {
              '--nat-w': `${ARCH.width}px`,
              '--nat-h': `${ARCH.height}px`,
            } as React.CSSProperties
          }
        >
          <div className="rig__window">
            <img
              ref={landscapeRef}
              className="rig__landscape"
              src={view.src}
              alt=""
              width={view.width}
              height={view.height}
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <img
            ref={figureRef}
            className="rig__figure"
            src={ARCH.src}
            alt="Девушка в зелёном платье сидит спиной к зрителю на подоконнике готической арки, глядя в проём наружу"
            width={ARCH.width}
            height={ARCH.height}
            decoding="async"
            style={{ opacity: 0 }}
          />
        </div>

        {/* ——— Интерфейс ————————————————————————————————————
            Три строки сетки: заголовок, пустая середина под арку,
            медальоны. Середину измеряет ResizeObserver — из неё и
            берётся размер и положение всей композиции, поэтому она
            сама подстраивается под длину заголовка и число медальонов. */}
        <header className="stage__head">
          <h1 className="stage__title">Какой ваш выбор?</h1>
        </header>

        <div className="stage__frame" ref={frameRef} aria-hidden="true" />

        <div className="stage__choice" id="choice" ref={choiceRef}>
          <Medallions selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
}
