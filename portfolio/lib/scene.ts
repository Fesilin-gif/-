/* ============================================================
   Геометрия сцены «отъезд камеры»
   ------------------------------------------------------------
   Здесь только чистые вычисления: никакого DOM, никаких
   побочных эффектов. Компонент ArchScene измеряет экран,
   зовёт эти функции и раскладывает результат по transform.

   Три слоя, снизу вверх:
     1. landscape — свободная панорама первого экрана, она же
        «отъезжающая камера»: пока движение не завершилось, лежит
        под аркой, уменьшаясь и уходя прозрачностью.
     2. window — вид в проёме. Неподвижный фон (CSS background-image,
        cover + фокус), обрезанный точной маской проёма
        (arch-opening-mask.png), проявляется встречной прозрачностью —
        это и есть «мягкий стык» вместо вспышки.
     3. arch — передний план: девушка и камень, PNG с прозрачным
        проёмом и прозрачным полем вокруг. Всё видимое за проёмом —
        заслуга слоя 2, сам файл ничего не рисует внутри окна.

   window — обычный CSS-фон (background-size:cover плюс
   background-position в процентах), а не <img> с transform: процент
   от собственного блока работает одинаково что в анимированной сцене
   (где блок — часть большой сходящейся матрицы), что в статичной
   раскладке без JS (где у блока произвольный, посчитанный браузером
   размер). Пиксельный transform на этом слое немедленно разъехался бы
   между двумя режимами. Слой 1 (панорама) остаётся на transform:
   он двигается, а не просто виден или скрыт, и его геометрия всегда
   считается в размере самой сцены (window от неё не зависит).
   ============================================================ */

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Point = { x: number; y: number };

/* ——— Кадры ————————————————————————————————————————————— */

/**
 * Горизонтальная панорама. Первый экран и вид в проёме — один и тот
 * же файл.
 * anchor — город на холме, доля от ширины и высоты кадра. Точка
 *   интереса при обрезке по «cover»: кадрирование всегда старается
 *   оставить её в кадре, а не резать по центру.
 */
export const LANDSCAPE = {
  src: '/media/landscape.webp',
  width: 1672,
  height: 941,
  anchor: { x: 0.75, y: 0.46 },
} as const;

/**
 * Девушка в арке, передний план. PNG с прозрачным проёмом и
 * прозрачным полем вокруг — камень и фигура непрозрачны, всё
 * остальное показывает то, что положено слоем ниже.
 *
 * content — рамка самой живописи внутри файла: вокруг арки в
 *   исходнике широкие прозрачные поля (слева и справа ~18%), без
 *   этой поправки арка визуально «тонет» в экране.
 * opening — прямоугольник проёма. Измерен по альфа-каналу файла
 *   (наибольшая топологически замкнутая прозрачная область —
 *   см. scripts/measure для метода), не оценка на глаз. По нему
 *   вписывается вид в проёме и целится край панорамы первого экрана.
 */
export const ARCH = {
  src: '/media/arch-transparent.png',
  width: 1122,
  height: 1402,
  content: { x: 0.1818, y: 0.0414, width: 0.6373, height: 0.8994 },
  opening: { x: 0.328, y: 0.1148, width: 0.3529, height: 0.5278 },
} as const;

/** Маска проёма: белое и непрозрачное внутри окна, прозрачное снаружи
 *  (включая силуэт девушки — она перекрывает окно, маска это учитывает).
 *  Наложена CSS-маской на слой вида, а не встроена в саму панораму —
 *  так под одной и той же маской можно менять картинку в проёме. */
export const ARCH_MASK_SRC = '/media/arch-opening-mask.png';

/* ——— Вид в проёме ———————————————————————————————————————— */

/**
 * Любое изображение, которое можно показать в проёме: сегодняшняя
 * панорама или будущий кадр конкретного проекта. Только путь к файлу
 * и точка интереса — размеры не нужны, задаёт их браузер (CSS
 * background-size:cover).
 * focus — точка интереса при обрезке (0..1), как у LANDSCAPE.anchor.
 *   Не задана — обрезка идёт от центра.
 */
export type WindowView = {
  src: string;
  focus?: Point;
};

export const DEFAULT_WINDOW_VIEW: WindowView = {
  src: LANDSCAPE.src,
  focus: LANDSCAPE.anchor,
};

/* ——— Фазы ————————————————————————————————————————————— */

/**
 * Окна прогресса сцены. Все значения — доли от 0 до 1 на общей
 * шкале, которую ведёт положение страницы. Окна перекрываются:
 * арка проявляется раньше, чем панорама первого экрана успевает
 * скрыться, — это и есть тот самый мягкий стык вместо вспышки.
 */
export const PHASE = {
  /** Отъезд камеры: панорама с полного экрана до размера у проёма. */
  pullBack: [0, 0.8],
  /** Растушёвка краёв панорамы первого экрана. Начинается рано и
      отдельно от прозрачности: как только кадр отрывается от краёв
      экрана, жёсткий прямоугольник на белом выглядит вырезкой, а не
      миром. */
  feather: [0.1, 0.5],
  /** Проявление арки и вида в проёме. Панорама первого экрана уходит
      тем же окном (см. ArchScene) — единая точка стыка, а не две
      рассинхронизированные. Длинное и раннее: белое пространство
      вокруг композиции должно появляться вместе с аркой, а не до неё. */
  archIn: [0.34, 0.72],
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
 * В файле арки вокруг рисунка широкие прозрачные поля. Если вписывать
 * файл целиком, арка выходит заметно мельче, чем могла бы. Полям
 * можно спокойно вылезать за рамку — снаружи всё равно прозрачно.
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

/** Кадр закрывает рамку целиком по центру, лишнее уходит за края. */
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

/**
 * Кадр закрывает рамку целиком, как fitCover, но обрезается не по
 * центру, а по той же формуле, что CSS background-position в паре с
 * background-size: cover: focus 0 — прижать левый/верхний край кадра
 * к рамке (обрезка уходит целиком в противоположную сторону), focus 1
 * — прижать правый/нижний, 0.5 — центр. Формула специально совпадает
 * с нативной: слой 1 (эта функция, панорама на transform) и слой 2
 * (сам CSS background-position в разметке) кадрируют панораму
 * одинаково, поэтому в момент стыка кадр не дёргается.
 */
export function fitCoverFocused(source: Size, box: Rect, focus: Point = { x: 0.5, y: 0.5 }): Rect {
  const rect = fitCover(source, box);
  return {
    x: box.x + (box.width - rect.width) * focus.x,
    y: box.y + (box.height - rect.height) * focus.y,
    width: rect.width,
    height: rect.height,
  };
}

/** Прямоугольник проёма внутри кадра арки на экране. */
function openingIn(box: Rect): Rect {
  return {
    x: box.x + ARCH.opening.x * box.width,
    y: box.y + ARCH.opening.y * box.height,
    width: ARCH.opening.width * box.width,
    height: ARCH.opening.height * box.height,
  };
}

export type SceneLayout = {
  /** Куда встаёт кадр с аркой. */
  arch: Rect;
  /** Панорама на первом экране. */
  landscapeStart: Rect;
  /** Панорама в конце отъезда — тот же кадр и та же точка обрезки,
      что и вид в проёме (см. DEFAULT_WINDOW_VIEW в разметке), но
      размер и позиция посчитаны для текущего экрана. */
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

  const landscapeEnd = fitCoverFocused(LANDSCAPE, openingIn(arch), LANDSCAPE.anchor);

  return { arch, landscapeStart, landscapeEnd };
}

/**
 * Положение панорамы первого экрана на произвольном прогрессе.
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
