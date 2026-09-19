/* ============================================================
   Геометрия сцены «отъезд камеры»
   ------------------------------------------------------------
   Здесь только чистые вычисления: никакого DOM, никаких
   побочных эффектов. Компонент ArchScene измеряет экран,
   зовёт эти функции и раскладывает результат по transform.

   Один слой, одна система координат
   ----------------------------------
   Нет отдельного «пейзажа на первом экране» и отдельного «вида
   в проёме» — это один и тот же элемент <img> с одним и тем же
   файлом на всём протяжении сцены. Никакой смены источника,
   никакого перекрёстного затухания между двумя картинками.

   Устроено это через общий контейнер — .rig, размером ровно
   с натуральный кадр арки (1122×1402 = ARCH.width×ARCH.height).
   Внутри него, в ЭТИХ ЖЕ координатах:
     - панорама — <img>, посаженная один раз (без анимации, чистая
       константа DEFAULT_VIEW_PLACEMENT) так, чтобы накрыть проём
       арки, и обрезанная CSS-маской по его точной готической форме
       (arch-opening-mask.png, тот же файл, что и точный контур
       самой арки — один источник истины);
     - фигура арки (arch-transparent.png) — тот же кадр 1122×1402,
       без собственного transform вообще: она просто СОВПАДАЕТ
       с координатами .rig, пиксель в пиксель.
   Единственное, что движется, — сам .rig: один transform
   (translate + scale), который каждый кадр прокрутки пишет
   ArchScene.tsx. Он одновременно масштабирует и панораму
   (вместе с её маской — маска задана в тех же локальных
   координатах, поэтому растягивается заодно с картинкой,
   отдельно её двигать не нужно), и фигуру арки. Рассинхронизации
   в принципе не может быть: это буквально одна матрица на троих.

   На старте (progress 0) .rig взят таким огромным, что даже его
   проём с запасом перекрывает весь экран, — значит, и сама арка
   (она снаружи проёма) гарантированно за границами экрана, а
   панорама, обрезанная по всё ещё не показавшейся арке, читается
   как самостоятельный полноэкранный мир. К концу отъезда .rig
   уменьшается до обычного, финального размера — того, что раньше
   считался как layout.arch.

   Силуэт девушки внутри arch-opening-mask.png вычтен из маски
   (см. её комментарий) — там, где она сидит, панорама и не должна
   быть видна. Фигура арки нарисована непрозрачной ВСЕГДА, поэтому
   ровно в этом месте панораму всегда что-то закрывает — на любом
   масштабе, а не только рядом с финальным. Это и есть та гарантия,
   которой не хватало более ранним версиям сцены: синхронность
   маски и фигуры здесь не «подогнана по времени», а структурная —
   один и тот же transform, один и тот же кадр.
   ============================================================ */

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Point = { x: number; y: number };

/* ——— Кадры ————————————————————————————————————————————— */

/**
 * Горизонтальная панорама — единственный слой пейзажа во всей сцене.
 * anchor — город на холме, точка интереса при обрезке (см. focus
 *   у fitCoverFocused): кадрирование всегда старается оставить её
 *   в кадре, а не резать по центру.
 */
export const LANDSCAPE = {
  src: '/media/landscape.webp',
  width: 1672,
  height: 941,
  anchor: { x: 0.75, y: 0.46 },
} as const;

/**
 * Девушка в арке. PNG с прозрачным проёмом и прозрачным полем
 * вокруг — камень и фигура непрозрачны, задают систему координат
 * для всей сцены (см. заголовок файла).
 *
 * content — рамка самой живописи внутри файла: вокруг арки в
 *   исходнике широкие прозрачные поля (слева и справа ~18%), без
 *   этой поправки арка визуально «тонет» в экране. Используется
 *   только для финального (адаптивного) размера — см. computeLayout.
 * opening — прямоугольник проёма. Измерен по альфа-каналу файла
 *   (наибольшая топологически замкнутая прозрачная область), не
 *   оценка на глаз.
 */
export const ARCH = {
  src: '/media/arch-transparent.png',
  width: 1122,
  height: 1402,
  content: { x: 0.1818, y: 0.0414, width: 0.6373, height: 0.8994 },
  opening: { x: 0.328, y: 0.1148, width: 0.3529, height: 0.5278 },
} as const;

/**
 * Маска проёма: белое и непрозрачное внутри окна, прозрачное
 * снаружи — включая силуэт девушки (она перекрывает окно собой,
 * маска это учитывает). Тот же геометрический источник, что и сама
 * арка (альфа-канал arch-transparent.png), поэтому проём маски и
 * проём фигуры всегда совпадают пиксель в пиксель.
 */
export const ARCH_MASK_SRC = '/media/arch-opening-mask.png';

/* ——— Вид в проёме ———————————————————————————————————————— */

/**
 * Любое изображение, которое можно показать в проёме: сегодняшняя
 * панорама или будущий кадр конкретного проекта.
 * focus — точка интереса при обрезке (0..1), как у LANDSCAPE.anchor.
 *   Не задана — обрезка идёт от центра.
 */
export type WindowView = {
  src: string;
  width: number;
  height: number;
  focus?: Point;
};

export const DEFAULT_WINDOW_VIEW: WindowView = {
  src: LANDSCAPE.src,
  width: LANDSCAPE.width,
  height: LANDSCAPE.height,
  focus: LANDSCAPE.anchor,
};

/* ——— Фазы ————————————————————————————————————————————— */

/**
 * Окна прогресса сцены. Все значения — доли от 0 до 1 на общей
 * шкале, которую ведёт положение страницы.
 */
export const PHASE = {
  /** Отъезд камеры: единственный transform .rig идёт по всему этому
      окну, от огромного (проём с запасом больше экрана) до
      финального адаптивного размера. */
  pullBack: [0, 0.8],
  /** Заголовок и медальоны. */
  reveal: [0.86, 1],
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
 * к рамке, focus 1 — прижать правый/нижний, 0.5 — центр.
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

/** Прямоугольник проёма внутри кадра арки (в любых единицах — box
 *  задаёт масштаб и позицию, доли ARCH.opening всегда одни и те же). */
function openingIn(box: Rect): Rect {
  return {
    x: box.x + ARCH.opening.x * box.width,
    y: box.y + ARCH.opening.y * box.height,
    width: ARCH.opening.width * box.width,
    height: ARCH.opening.height * box.height,
  };
}

/** Проём в натуральных пикселях самого файла арки (0,0 — левый
 *  верхний угол кадра 1122×1402, та же система координат, что у .rig). */
const OPENING_LOCAL: Rect = openingIn({ x: 0, y: 0, width: ARCH.width, height: ARCH.height });

/**
 * Прямоугольная часть проёма, без стрельчатого свода сверху.
 * Единственное применение — ниже, в fitOpeningCover.
 *
 * ARCH.opening — это габаритный прямоугольник проёма, но у вершины
 * свод сужается в остриё: настоящая форма — не прямоугольник, а
 * стрельчатая арка. На узком портретном экране (телефон) угол ЭТОГО
 * прямоугольника может оказаться внутри видимой области раньше, чем
 * сам свод, — и тогда в самом первом кадре сцены приоткрывается
 * уголок камня, которого там ещё не должно быть.
 *
 * Эта версия — измеренная по альфа-каналу часть проёма, которая уже
 * на полную ширину (свод достигает боковых стен примерно к 1148px
 * из 1402 по высоте — здесь взято 1478px, ≈195px запаса на антиалиасинг
 * и сам изгиб кривой).
 */
const OPENING_RECT_SAFE: Rect = {
  x: ARCH.opening.x,
  y: 0.1427,
  width: ARCH.opening.width,
  height: ARCH.opening.y + ARCH.opening.height - 0.1427,
};

/**
 * Обратная задача к openingIn: не «какой проём внутри готового кадра
 * арки», а «кадр арки такого размера и в таком месте, чтобы именно
 * его (заведомо прямоугольная часть) проём накрыл рамку целиком» —
 * то, с чего .rig стартует: кадр арки настолько огромный, что даже
 * его проём (не говоря о самом камне) выходит за границы этой рамки.
 *
 * margin — запас (1 = впритык, 1.2 — с 20% на сторону): рамка обычно
 * это экран, а он может стать чуть больше проёма без предупреждения
 * (например, сразу после resize, до пересчёта раскладки) — без
 * запаса в этот момент по краю мелькнула бы полоска белого холста.
 */
function fitOpeningCover(box: Rect, margin = 1): Rect {
  const openingNat: Size = {
    width: OPENING_RECT_SAFE.width * ARCH.width,
    height: OPENING_RECT_SAFE.height * ARCH.height,
  };
  const scale = Math.max(
    (box.width * margin) / openingNat.width,
    (box.height * margin) / openingNat.height,
  );
  const archWidth = ARCH.width * scale;
  const archHeight = ARCH.height * scale;
  const openingWidth = OPENING_RECT_SAFE.width * archWidth;
  const openingHeight = OPENING_RECT_SAFE.height * archHeight;
  const openingX = box.x + (box.width - openingWidth) / 2;
  const openingY = box.y + (box.height - openingHeight) / 2;
  return {
    x: openingX - OPENING_RECT_SAFE.x * archWidth,
    y: openingY - OPENING_RECT_SAFE.y * archHeight,
    width: archWidth,
    height: archHeight,
  };
}

/** Центр проёма, доля от ширины/высоты кадра арки — опорная точка
 *  отъезда камеры: точка, чьё положение на экране ведётся по
 *  прогрессу линейно, поэтому в начале и в конце .rig садится ровно
 *  в рассчитанное место — и вперёд, и назад одинаково. */
const OPENING_CENTER: Point = {
  x: ARCH.opening.x + ARCH.opening.width / 2,
  y: ARCH.opening.y + ARCH.opening.height / 2,
};

export type SceneLayout = {
  /** Финальный, адаптивный кадр арки — куда встаёт .rig к концу
      отъезда. Раньше назывался просто «arch». */
  arch: Rect;
  /** Кадр арки в начале отъезда — такого размера, что его проём
      с запасом накрывает экран целиком (см. fitOpeningCover). */
  rigStart: Rect;
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

  const rigStart = fitOpeningCover(
    { x: 0, y: 0, width: viewport.width, height: viewport.height },
    1.2,
  );

  return { arch, rigStart };
}

/**
 * Положение .rig (кадр 1122×1402) на произвольном прогрессе —
 * единственная анимация сцены. Масштаб идёт геометрически: равные
 * шаги прокрутки — равные ДОЛИ изменения размера, а не равные
 * пиксели, — так ведёт себя настоящий отъезд камеры, темп читается
 * ровным на всём пути.
 */
export function rigRectAt(progress: number, from: Rect, to: Rect): Rect {
  const t = phase(progress, PHASE.pullBack);

  const width = from.width * Math.pow(to.width / from.width, t);
  const height = width * (ARCH.height / ARCH.width);

  const anchorX = lerp(
    from.x + OPENING_CENTER.x * from.width,
    to.x + OPENING_CENTER.x * to.width,
    t,
  );
  const anchorY = lerp(
    from.y + OPENING_CENTER.y * from.height,
    to.y + OPENING_CENTER.y * to.height,
    t,
  );

  return {
    x: anchorX - OPENING_CENTER.x * width,
    y: anchorY - OPENING_CENTER.y * height,
    width,
    height,
  };
}

/**
 * transform для слоя. Слой лежит в натуральном размере кадра в
 * левом верхнем углу сцены (transform-origin: 0 0), поэтому одна
 * матрица переносит и масштабирует его без пересчёта вёрстки.
 */
export function transformFor(rect: Rect, source: Size): string {
  const scale = rect.width / source.width;
  return `translate3d(${rect.x.toFixed(2)}px, ${rect.y.toFixed(2)}px, 0) scale(${scale.toFixed(5)})`;
}

/**
 * Где именно внутри .rig (в натуральных пикселях 1122×1402) должен
 * встать вид, чтобы накрыть проём — то же самое, что раньше называлось
 * «вид в проёме», только теперь это положение фиксированного дочернего
 * элемента внутри системы координат .rig, а не отдельная анимация.
 */
export function localViewRect(view: WindowView): Rect {
  return fitCoverFocused(view, OPENING_LOCAL, view.focus ?? { x: 0.5, y: 0.5 });
}

export type ViewPlacement = {
  /** CSS transform самого <img> вида — в НАТУРАЛЬНЫХ пикселях этого
      изображения (0,0 — его левый верхний угол), фиксированный,
      не зависит от прогресса прокрутки: двигается только .rig. */
  transform: string;
  /** mask-size/position — тоже в натуральных пикселях вида, тоже
      фиксированные: см. --mask-w/h/x/y в app/scene.css. */
  maskWidth: string;
  maskHeight: string;
  maskX: string;
  maskY: string;
};

/**
 * Постоянное (не зависящее от прогресса и экрана) положение вида
 * внутри .rig и параметры его маски. Чистая функция геометрии кадров
 * ARCH/WindowView — можно считать один раз при рендере или смене
 * выбранного медальона, пересчитывать на resize не нужно.
 */
export function placeView(view: WindowView): ViewPlacement {
  const local = localViewRect(view);
  const scale = local.width / view.width;
  return {
    transform: transformFor(local, view),
    maskWidth: `${(ARCH.width / scale).toFixed(2)}px`,
    maskHeight: `${(ARCH.height / scale).toFixed(2)}px`,
    maskX: `${(-local.x / scale).toFixed(2)}px`,
    maskY: `${(-local.y / scale).toFixed(2)}px`,
  };
}

/** Постоянные параметры для вида по умолчанию — используются в
 *  первом же рендере (SSR-безопасно, чистая функция констант). */
export const DEFAULT_VIEW_PLACEMENT: ViewPlacement = placeView(DEFAULT_WINDOW_VIEW);
