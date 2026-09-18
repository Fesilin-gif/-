/* ============================================================
   Геометрия сцены «отъезд камеры»
   ------------------------------------------------------------
   Здесь только чистые вычисления: никакого DOM, никаких
   побочных эффектов. Компонент ArchScene измеряет экран,
   зовёт эти функции и раскладывает результат по transform.

   Две иллюстрации нарисованы отдельно и НЕ совпадают пиксель
   в пиксель. Поэтому сцена не притворяется одной 3D-сценой:
   панорама уезжает назад и садится на город в проёме арки
   по общей опорной точке, а расхождение гасится короткой
   мягкой перекрёстной прозрачностью.
   ============================================================ */

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

/* ——— Кадры ————————————————————————————————————————————— */

/**
 * Горизонтальная панорама. Первый экран.
 * anchor — город на холме, доля от ширины и высоты кадра.
 * Это общая точка двух иллюстраций: по ней они и сводятся.
 */
export const LANDSCAPE = {
  src: '/media/landscape.webp',
  width: 1672,
  height: 941,
  anchor: { x: 0.75, y: 0.46 },
} as const;

/**
 * Девушка в арке. Финальный кадр.
 *
 * anchor — тот же город, уже нарисованный внутри проёма.
 * content — рамка самой живописи внутри файла: вокруг арки
 *   в исходнике широкие белые поля (слева и справа ~18%),
 *   без этой поправки арка визуально «тонет» в экране.
 * opening — прямоугольник проёма. Сегодня не используется для
 *   отрисовки: файл непрозрачный. Он понадобится, когда появится
 *   версия арки с прозрачным проёмом, — см. README.
 * background — фон файла. Это НЕ чистый #ffffff, и фон сцены
 *   обязан совпадать с ним, иначе по краям иллюстрации виден
 *   светлый прямоугольник.
 */
export const ARCH = {
  src: '/media/arch-figure.webp',
  width: 1122,
  height: 1402,
  anchor: { x: 0.657, y: 0.424 },
  content: { x: 0.182, y: 0.041, width: 0.635, height: 0.9 },
  opening: { x: 0.29, y: 0.11, width: 0.39, height: 0.55 },
  background: '#fefefe',
} as const;

/**
 * Ширина панорамы в конце отъезда — доля от ширины кадра арки.
 *
 * Подобрано по масштабу города: в панораме он занимает ~22%
 * ширины кадра, в арке — ~6.7%. Отсюда 0.067 / 0.22 ≈ 0.3.
 * Чем меньше число, тем дальше «уехала камера» к моменту
 * перекрёстной прозрачности.
 */
export const LANDSCAPE_END_WIDTH_RATIO = 0.32;

/* ——— Фазы ————————————————————————————————————————————— */

/**
 * Окна прогресса сцены. Все значения — доли от 0 до 1 на общей
 * шкале, которую ведёт положение страницы. Окна перекрываются:
 * арка проявляется раньше, чем панорама успевает исчезнуть, —
 * это и есть тот самый мягкий стык вместо вспышки.
 */
export const PHASE = {
  /** Отъезд камеры: панорама с полного экрана до размера в проёме. */
  pullBack: [0, 0.8],
  /** Растушёвка краёв панорамы. Начинается рано и отдельно от
      прозрачности: как только кадр отрывается от краёв экрана, жёсткий
      прямоугольник на белом выглядит вырезкой, а не миром. */
  feather: [0.1, 0.5],
  /** Проявление арки. Длинное и раннее: белое пространство вокруг
      композиции должно появляться вместе с аркой, а не до неё. */
  archIn: [0.34, 0.72],
  /** Уход панорамы. Перекрывается с проявлением арки — это и есть
      тот самый короткий мягкий стык вместо вспышки. */
  landscapeOut: [0.52, 0.8],
  /** Уход подсказки «Прокрутите» — при первом же движении. */
  hintOut: [0, 0.14],
  /** Заголовок и медальоны. */
  reveal: [0.84, 1],
} as const;

/**
 * Доля прокрутки, на которой сцена уже собрана. Остаток —
 * спокойный «хвост»: финальная композиция стоит на месте,
 * пока страница докручивается до конца.
 */
export const SETTLE_AT = 0.88;

/** Высота блока прокрутки сцены в высотах экрана. */
export const SCENE_TRAVEL_VH = 300;

/* ——— Математика ——————————————————————————————————————— */

export const clamp = (value: number, min = 0, max = 1) =>
  value < min ? min : value > max ? max : value;

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Прогресс внутри окна фазы, уже сглаженный (smoothstep).
 * Сглаживание здесь одно на всю сцену: второе поверх него
 * съедает начало и конец движения и рвёт ровный темп.
 */
export function phase(progress: number, [start, end]: readonly [number, number]) {
  if (end <= start) return progress >= end ? 1 : 0;
  const t = clamp((progress - start) / (end - start));
  return t * t * (3 - 2 * t);
}

/* ——— Раскладка ———————————————————————————————————————— */

/** Кадр целиком внутри рамки, по центру. Ничего не обрезается. */
export function fitContain(source: Size, box: Rect): Rect {
  const scale = Math.min(box.width / source.width, box.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

/**
 * Кадр внутри рамки, но вписывается не файл целиком, а его живопись.
 *
 * В файле арки вокруг рисунка широкие белые поля. Если вписывать файл
 * целиком, арка выходит заметно мельче, чем могла бы. Поля белые на
 * белом холсте, поэтому им можно спокойно вылезать за рамку.
 */
export function fitContentContain(source: Size, content: Rect, box: Rect): Rect {
  const inner = fitContain(
    { width: source.width * content.width, height: source.height * content.height },
    box,
  );
  const width = inner.width / content.width;
  const height = inner.height / content.height;
  return {
    x: inner.x - content.x * width,
    y: inner.y - content.y * height,
    width,
    height,
  };
}

/** Кадр закрывает рамку целиком, лишнее уходит за края. */
export function fitCover(source: Size, box: Rect): Rect {
  const scale = Math.max(box.width / source.width, box.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

export type SceneLayout = {
  /** Куда встаёт кадр с аркой. */
  arch: Rect;
  /** Панорама на первом экране. */
  landscapeStart: Rect;
  /** Панорама в конце отъезда — сведена с аркой по опорной точке. */
  landscapeEnd: Rect;
};

/**
 * Полная раскладка сцены.
 *
 * viewport — экран (высота берётся у самого stage, а не у window:
 *   на телефоне адресная строка меняет высоту окна, а не блока).
 * frame — свободная середина экрана между заголовком и медальонами.
 *   Её размер компонент измеряет у реального пустого элемента, поэтому
 *   композиция сама подстраивается под длину заголовка, количество
 *   медальонов и любой размер шрифта.
 */
export function computeLayout(viewport: Size, frame: Rect): SceneLayout {
  const arch = fitContentContain(ARCH, ARCH.content, frame);

  const landscapeStart = fitCover(LANDSCAPE, {
    x: 0,
    y: 0,
    width: viewport.width,
    height: viewport.height,
  });

  /* Панорама в конце: ширина — от ширины арки, положение — так,
     чтобы её город лёг ровно на город, нарисованный в проёме. */
  const width = arch.width * LANDSCAPE_END_WIDTH_RATIO;
  const height = width * (LANDSCAPE.height / LANDSCAPE.width);
  const anchorX = arch.x + ARCH.anchor.x * arch.width;
  const anchorY = arch.y + ARCH.anchor.y * arch.height;

  return {
    arch,
    landscapeStart,
    landscapeEnd: {
      x: anchorX - LANDSCAPE.anchor.x * width,
      y: anchorY - LANDSCAPE.anchor.y * height,
      width,
      height,
    },
  };
}

/**
 * Положение панорамы на произвольном прогрессе.
 *
 * Масштаб идёт геометрически: равные шаги прокрутки — равные доли
 * уменьшения. Так ведёт себя настоящий отъезд камеры, и темп читается
 * ровным на всём пути; при линейном масштабе кадр сначала почти стоит,
 * а потом схлопывается за несколько процентов прокрутки.
 *
 * Опорная точка едет линейно по тому же сглаженному времени, поэтому
 * на обоих концах кадр садится ровно в рассчитанное место — и вперёд,
 * и назад одинаково.
 */
export function landscapeRectAt(progress: number, layout: SceneLayout): Rect {
  const t = phase(progress, PHASE.pullBack);
  const { landscapeStart: from, landscapeEnd: to } = layout;

  const width = from.width * Math.pow(to.width / from.width, t);
  const height = width * (LANDSCAPE.height / LANDSCAPE.width);

  const anchorX = lerp(
    from.x + LANDSCAPE.anchor.x * from.width,
    to.x + LANDSCAPE.anchor.x * to.width,
    t,
  );
  const anchorY = lerp(
    from.y + LANDSCAPE.anchor.y * from.height,
    to.y + LANDSCAPE.anchor.y * to.height,
    t,
  );

  return {
    x: anchorX - LANDSCAPE.anchor.x * width,
    y: anchorY - LANDSCAPE.anchor.y * height,
    width,
    height,
  };
}

/**
 * transform для слоя. Слой лежит в натуральном размере кадра в
 * левом верхнем углу сцены (transform-origin: 0 0), поэтому одна
 * матрица переносит и масштабирует его без пересчёта вёрстки.
 *
 * settle — небольшой доводочный масштаб вокруг центра кадра.
 */
export function transformFor(rect: Rect, source: Size, settle = 1): string {
  const scale = (rect.width / source.width) * settle;
  const x = rect.x - (rect.width * (settle - 1)) / 2;
  const y = rect.y - (rect.height * (settle - 1)) / 2;
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(5)})`;
}
