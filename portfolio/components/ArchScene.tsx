'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Medallions from '@/components/Medallions';
import { windowViewFor } from '@/lib/projects';
import {
  ARCH,
  HANDOFF_AT,
  LANDSCAPE,
  PHASE,
  SCENE_TRAVEL_VH,
  SETTLE_AT,
  clamp,
  computeLayout,
  landscapeRectAt,
  lerp,
  maskRectAt,
  phase,
  transformFor,
  type SceneLayout,
} from '@/lib/scene';

/* Сцена раскладывается до первой отрисовки, иначе кадр успевает
   мелькнуть в натуральном размере. На сервере layout-эффекта нет,
   поэтому берём обычный — там он всё равно не выполняется. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Первый экран портфолио: отъезд камеры от панорамы к арке.
 *
 * Как это устроено
 * ----------------
 * Высокий блок .scene задаёт длину прокрутки, внутри него залипает
 * экран .stage. Положение страницы внутри этого блока — единственный
 * источник прогресса: ничего не «проигрывается», поэтому сцена
 * одинаково идёт вперёд и назад и останавливается там, где остановили.
 *
 * Это НЕ перекрёстная прозрачность. Панорама первого экрана (слой 1)
 * всегда непрозрачна — она не тускнеет и не белеет ни на одном кадре.
 * Единственное, что с ней происходит, — маска (CSS mask, не opacity),
 * которая идёт в ногу с её собственным transform и стягивается от
 * «весь экран» до точной формы проёма арки. Снаружи маски панорама
 * жёстко обрывается, без полупрозрачного ореола.
 *
 * Слои лежат снизу вверх:
 *   1. .layer--landscape — панорама. Едет по transform (отъезд камеры,
 *      landscapeRectAt) и одновременно сжимается маской (maskRectAt)
 *      до формы проёма. Непрозрачность всегда 1.
 *   2. .arch-figure — передний план: девушка и камень, PNG с
 *      прозрачным проёмом. Проявляется обычной прозрачностью, но
 *      коротко и ближе к концу отъезда — когда маска панорамы уже
 *      почти стянулась до формы проёма, открытого пейзажа вокруг
 *      почти не остаётся, и прозрачность не читается как высветление.
 *   3. .window — вид в проёме про запас: неподвижный CSS-фон под той
 *      же маской. Скрыт весь отъезд; включается ровно в момент
 *      HANDOFF_AT, когда маска панорамы уже точно совпала с формой
 *      проёма — оба слоя в этот момент показывают одинаковые пиксели,
 *      переключение не видно. Дальше именно window меняет вид по
 *      выбору медальона (слой 1 — всегда LANDSCAPE, это первый экран,
 *      а не произвольная картинка).
 *
 * Вся арифметика вынесена в lib/scene.ts. Здесь — только измерения
 * реального экрана и запись результата в transform/mask/opacity.
 */
export default function ArchScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLImageElement>(null);
  const archFigureRef = useRef<HTMLImageElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string | null>(null);

  /* Вид в проёме следует за выбранным медальоном. Пока ни у одного
     проекта нет своего кадра для окна, windowViewFor всегда отдаёт
     вид по умолчанию — переключение готово и работает, только сегодня
     оно ничего не меняет визуально: подставлять пока нечего. */
  const view = useMemo(() => windowViewFor(selected), [selected]);
  const focus = view.focus ?? { x: 0.5, y: 0.5 };

  useIsomorphicLayoutEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const landscape = landscapeRef.current;
    const archFigure = archFigureRef.current;
    const windowEl = windowRef.current;
    const choice = choiceRef.current;
    if (!scene || !stage || !frame || !landscape || !archFigure || !windowEl || !choice) return;

    /* Тот же флаг, по которому CSS выбирает режим сцены: класс .js
       ставит синхронный скрипт в <head>, и только если движение
       разрешено. При prefers-reduced-motion сцена не запускается —
       страница остаётся обычной статичной раскладкой. */
    if (!document.documentElement.classList.contains('js')) return;

    let layout: SceneLayout | null = null;
    let interactive: boolean | null = null;
    let handedOff: boolean | null = null;
    let scheduled = false;

    const apply = () => {
      if (!layout) return;

      const travel = scene.offsetHeight - stage.offsetHeight;
      const raw = travel > 0 ? clamp(-scene.getBoundingClientRect().top / travel) : 1;
      /* Хвост прокрутки после SETTLE_AT — собранная сцена стоит на месте. */
      const progress = clamp(raw / SETTLE_AT);

      /* Панорама: transform двигает и масштабирует кадр (откуда что
         видно), маска — отдельно и всегда поверх — решает, сколько
         от уже трансформированного кадра остаётся на экране. Ни то,
         ни другое не трогает opacity: панорама не бледнеет. */
      const rect = landscapeRectAt(progress, layout.landscapeStart, layout.landscapeEnd);
      landscape.style.transform = transformFor(rect, LANDSCAPE);
      landscape.style.opacity = '1';

      const maskBox = maskRectAt(progress, layout.maskStart, layout.arch);
      const scale = rect.width / LANDSCAPE.width;
      /* mask-size/position считаются в СОБСТВЕННЫХ (нетрансформированных)
         пикселях панорамы — тех же, где transform уже посчитал rect, —
         поэтому просто переводим экранный прямоугольник маски в эту
         систему координат делением на тот же масштаб. */
      landscape.style.setProperty('--mask-w', `${(maskBox.width / scale).toFixed(2)}px`);
      landscape.style.setProperty('--mask-h', `${(maskBox.height / scale).toFixed(2)}px`);
      landscape.style.setProperty('--mask-x', `${((maskBox.x - rect.x) / scale).toFixed(2)}px`);
      landscape.style.setProperty('--mask-y', `${((maskBox.y - rect.y) / scale).toFixed(2)}px`);

      /* Передний план — обычная прозрачность, но короткая и ближе
         к концу: см. PHASE.figureIn. */
      const figureIn = phase(progress, PHASE.figureIn);
      archFigure.style.transform = transformFor(layout.arch, ARCH, lerp(1.035, 1, figureIn));
      archFigure.style.opacity = figureIn.toFixed(3);

      /* Передача от маски панорамы к статичному window — обычное
         переключение, не постепенный переход: оба слоя в этот момент
         показывают одинаковые пиксели (см. HANDOFF_AT), поэтому щелчок
         не виден. Плавный переход здесь означал бы новую полупрозрачность
         ровно там, где её не должно быть. */
      const next = progress >= HANDOFF_AT;
      if (next !== handedOff) {
        handedOff = next;
        windowEl.style.opacity = next ? '1' : '0';
      }

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

      layout = computeLayout(
        { width: stageBox.width, height: stageBox.height },
        {
          x: frameBox.left - stageBox.left,
          y: frameBox.top - stageBox.top,
          width: frameBox.width,
          height: frameBox.height,
        },
      );
      /* window стоит смирно на месте арки — его transform зависит
         только от layout (пересчитывается при resize), не от
         прогресса прокрутки, поэтому ставим его здесь, а не в apply(). */
      windowEl.style.transform = transformFor(layout.arch, ARCH);
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
  }, []);

  return (
    <div
      className="scene"
      ref={sceneRef}
      style={{ '--scene-travel': SCENE_TRAVEL_VH } as React.CSSProperties}
    >
      <div className="stage" ref={stageRef}>
        {/* ——— Слой 1: панорама первого экрана ————————————— */}
        <div className="layer layer--landscape" aria-hidden="true">
          <img
            className="layer__img"
            ref={landscapeRef}
            src={LANDSCAPE.src}
            alt=""
            width={LANDSCAPE.width}
            height={LANDSCAPE.height}
            fetchPriority="high"
            decoding="async"
            style={
              {
                '--nat-w': `${LANDSCAPE.width}px`,
                '--nat-h': `${LANDSCAPE.height}px`,
              } as React.CSSProperties
            }
          />
        </div>

        {/* ——— Слой 2 и 3: фигура арки и вид про запас ——————
            .window и .arch-figure наследуют --nat-w/--nat-h от общего
            родителя, но двигаются каждый своим transform — window
            неподвижен (ставится один раз при измерении), фигура едет
            каждый кадр прокрутки. */}
        <div
          className="layer layer--arch"
          style={
            {
              '--nat-w': `${ARCH.width}px`,
              '--nat-h': `${ARCH.height}px`,
            } as React.CSSProperties
          }
        >
          <div
            className="window"
            ref={windowRef}
            aria-hidden="true"
            style={{
              backgroundImage: `url(${view.src})`,
              backgroundPosition: `${focus.x * 100}% ${focus.y * 100}%`,
            }}
          />
          <img
            className="arch-figure"
            ref={archFigureRef}
            src={ARCH.src}
            alt="Девушка в длинном платье сидит на подоконнике готической арки и смотрит на долину с рекой и городом на холме"
            width={ARCH.width}
            height={ARCH.height}
            decoding="async"
          />
        </div>

        {/* ——— Слой 4: интерфейс ————————————————————————————
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
