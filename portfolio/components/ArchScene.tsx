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
  phase,
  placeView,
  rigRectAt,
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
 * Один слой, одна система координат (подробности — в lib/scene.ts,
 * в шапке файла). Коротко: .rig — контейнер размером с натуральный
 * кадр арки (1122×1402), внутри него неподвижно (без собственной
 * анимации) сидят панорама, обрезанная маской точно по форме проёма,
 * и сама фигура арки поверх. Единственное, что движется, — transform
 * самого .rig, который каждый кадр прокрутки пишет этот компонент.
 * Масштабируя .rig, мы масштабируем панораму, её маску и фигуру арки
 * ОДНОЙ И ТОЙ ЖЕ матрицей — рассинхронизации быть не может.
 *
 * На старте .rig взят настолько огромным, что даже его проём
 * с запасом перекрывает экран (computeLayout → fitOpeningCover):
 * сама арка (она снаружи проёма) гарантированно за кадром, а
 * панорама читается как самостоятельный полноэкранный мир. К концу
 * отъезда .rig уменьшается до обычного финального размера.
 *
 * Фигура арки нарисована непрозрачной всегда — не проявляется
 * прозрачностью. Это не упрощение, а гарантия: там, где по маске
 * панорама вырезана под силуэт девушки, всегда есть чем это
 * прикрыть, на любом масштабе, потому что фигура и маска — один
 * и тот же кадр под одним и тем же transform.
 *
 * Вся арифметика вынесена в lib/scene.ts. Здесь — только измерения
 * реального экрана и запись результата в transform .rig.
 */
export default function ArchScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string | null>(null);

  /* Вид в проёме следует за выбранным медальоном. Пока ни у одного
     проекта нет своего кадра, windowViewFor всегда отдаёт вид по
     умолчанию — переключение готово и работает, только сегодня оно
     ничего не меняет визуально: подставлять пока нечего.
     placeView — чистая функция констант кадра (не прогресса
     прокрутки), поэтому смена медальона — обычный React-рендер,
     без обращения к скролл-эффекту ниже. */
  const view = useMemo(() => windowViewFor(selected), [selected]);
  const placement = useMemo(() => placeView(view), [view]);

  useIsomorphicLayoutEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const rig = rigRef.current;
    const choice = choiceRef.current;
    if (!scene || !stage || !frame || !rig || !choice) return;

    /* Тот же флаг, по которому CSS выбирает режим сцены: класс .js
       ставит синхронный скрипт в <head>, и только если движение
       разрешено. При prefers-reduced-motion сцена не запускается —
       страница остаётся обычной статичной раскладкой. */
    if (!document.documentElement.classList.contains('js')) return;

    let layout: SceneLayout | null = null;
    let interactive: boolean | null = null;
    let scheduled = false;

    const apply = () => {
      if (!layout) return;

      const travel = scene.offsetHeight - stage.offsetHeight;
      const raw = travel > 0 ? clamp(-scene.getBoundingClientRect().top / travel) : 1;
      /* Хвост прокрутки после SETTLE_AT — собранная сцена стоит на месте. */
      const progress = clamp(raw / SETTLE_AT);

      /* Единственный transform сцены: одна матрица одновременно
         масштабирует панораму (её маска задана в тех же локальных
         координатах .rig и растягивается вместе с ним) и фигуру
         арки — см. заголовок lib/scene.ts. */
      const rect = rigRectAt(progress, layout.rigStart, layout.arch);
      rig.style.transform = transformFor(rect, ARCH);

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
            alt="Девушка в длинном платье сидит на подоконнике готической арки и смотрит на долину с рекой и городом на холме"
            width={ARCH.width}
            height={ARCH.height}
            decoding="async"
          />
        </div>

        {/* ——— Сцена (только .js) ————————————————————————————
            .rig — единственная анимация: один transform, который
            каждый кадр прокрутки пишет эффект выше. Внутри —
            панорама (обрезана маской точно по форме проёма) и
            фигура арки, обе неподвижны относительно .rig. */}
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
          <img
            className="rig__landscape"
            src={view.src}
            alt=""
            width={view.width}
            height={view.height}
            fetchPriority="high"
            decoding="async"
            style={
              {
                width: `${view.width}px`,
                height: `${view.height}px`,
                transform: placement.transform,
                '--mask-w': placement.maskWidth,
                '--mask-h': placement.maskHeight,
                '--mask-x': placement.maskX,
                '--mask-y': placement.maskY,
              } as React.CSSProperties
            }
          />
          <img
            className="rig__figure"
            src={ARCH.src}
            alt="Девушка в длинном платье сидит на подоконнике готической арки и смотрит на долину с рекой и городом на холме"
            width={ARCH.width}
            height={ARCH.height}
            decoding="async"
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
