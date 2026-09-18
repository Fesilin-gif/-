'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import Medallions from '@/components/Medallions';
import {
  ARCH,
  LANDSCAPE,
  PHASE,
  SCENE_TRAVEL_VH,
  SETTLE_AT,
  clamp,
  computeLayout,
  landscapeRectAt,
  lerp,
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
 * Слои лежат снизу вверх: панорама, арка, интерфейс. Панорама уже
 * НИЖЕ арки — когда появится версия арки с прозрачным проёмом, её
 * достаточно положить на место нынешнего файла, и панорама начнёт
 * проглядывать сквозь проём без переделки сцены.
 *
 * Вся арифметика вынесена в lib/scene.ts. Здесь — только измерения
 * реального экрана и запись результата в transform.
 */
export default function ArchScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLImageElement>(null);
  const archRef = useRef<HTMLImageElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const landscape = landscapeRef.current;
    const arch = archRef.current;
    const choice = choiceRef.current;
    if (!scene || !stage || !frame || !landscape || !arch || !choice) return;

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

      const rect = landscapeRectAt(progress, layout);
      landscape.style.transform = transformFor(rect, LANDSCAPE);
      landscape.style.opacity = (1 - phase(progress, PHASE.landscapeOut)).toFixed(3);
      /* Растушёвка идёт раньше прозрачности: как только кадр отходит
         от краёв экрана, мягкая граница не даёт ему читаться вырезкой,
         и заодно прячет расхождение двух иллюстраций. */
      landscape.style.setProperty('--feather', phase(progress, PHASE.feather).toFixed(3));

      const archIn = phase(progress, PHASE.archIn);
      arch.style.transform = transformFor(layout.arch, ARCH, lerp(1.035, 1, archIn));
      arch.style.opacity = archIn.toFixed(3);

      const reveal = phase(progress, PHASE.reveal);
      stage.style.setProperty('--reveal', reveal.toFixed(3));
      stage.style.setProperty('--hint', (1 - phase(progress, PHASE.hintOut)).toFixed(3));

      /* Пока медальоны не проявились, они не должны ловить фокус:
         иначе табуляция уводит на невидимые кнопки. */
      const next = reveal > 0.5;
      if (next !== interactive) {
        interactive = next;
        if (next) choice.removeAttribute('inert');
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
        {/* ——— Слой 1: панорама ——————————————————————————— */}
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

        {/* ——— Слой 2: арка ————————————————————————————————
            Файл непрозрачный, его белый фон и гасит панораму в конце
            отъезда. С прозрачным проёмом здесь ничего не меняется. */}
        <div className="layer layer--arch">
          <img
            className="layer__img"
            ref={archRef}
            src={ARCH.src}
            alt="Девушка в длинном платье сидит на подоконнике готической арки и смотрит на долину с рекой и городом на холме"
            width={ARCH.width}
            height={ARCH.height}
            decoding="async"
            style={
              {
                '--nat-w': `${ARCH.width}px`,
                '--nat-h': `${ARCH.height}px`,
              } as React.CSSProperties
            }
          />
        </div>

        {/* ——— Слой 3: интерфейс ————————————————————————————
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

        <p className="stage__hint" aria-hidden="true">
          Прокрутите
        </p>
      </div>
    </div>
  );
}
