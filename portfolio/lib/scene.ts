/* ============================================================
   Геометрия сцены «отъезд камеры»
   ------------------------------------------------------------
   Здесь только чистые вычисления: никакого DOM, никаких
   побочных эффектов. Компонент ArchScene измеряет экран,
   зовёт эти функции и раскладывает результат по transform.

   Переход — это не перекрёстная прозрачность двух картинок: сама
   панорама первого экрана никогда не тускнеет и не белеет. У неё есть
   ровно один эффект — маска (CSS mask, не opacity), которая всё время
   идёт в ногу с её собственным transform и стягивается от «весь экран»
   до точной формы проёма. Снаружи маски панорама просто перестаёт
   существовать — жёстко, без полупрозрачного ореола, — а внутри
   остаётся такой же яркой, как в первом кадре.

   Слои, снизу вверх:
     1. landscape — панорама первого экрана. Едет по transform (отъезд
        камеры, geometry.landscapeRectAt) и одновременно сжимается
        маской (geometry.maskRectAt) от «весь экран» до формы проёма
        арки. Непрозрачность — всегда 1. Маска здесь — упрощённый
        контур без выреза под силуэт девушки (ARCH_OUTLINE_MASK_SRC):
        на большом масштабе этот вырез нечем прикрыть, а мелкая
        неточность по краям самого контура — не проблема, её в своё
        время закрывает непрозрачный передний план или window.
     2. arch-figure — передний план: девушка и камень, PNG с
        прозрачным проёмом и прозрачным полем вокруг. Проявляется
        обычной прозрачностью КОРОТКО и ближе к концу отъезда, когда
        маска уже почти стянулась до формы проёма, — камень
        материализуется вокруг уже готового окна, а не поверх целого
        пейзажа.
     3. window — вид в проёме про запас: неподвижный CSS-фон (cover +
        фокус) под той же маской проёма. В анимированной сцене скрыт
        весь отъезд и включается только тогда, когда маска панорамы
        (слой 1) уже точно совпала с формой проёма, — с этого момента
        оба слоя показывают одинаковые пиксели, переключение незаметно.
        Дальше именно window отвечает за смену вида по выбору
        медальона (слой 1 всегда показывает LANDSCAPE — это первый
        экран, а не произвольный вид). В статичной раскладке без JS
        window — единственный механизм: там нет отъезда, только
        готовая композиция.
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

/**
 * Маска проёма: белое и непрозрачное внутри окна, прозрачное снаружи
 * (включая силуэт девушки — она перекрывает окно, маска это учитывает).
 * Наложена CSS-маской на слой вида, а не встроена в саму панораму —
 * так под одной и той же маской можно менять картинку в проёме.
 *
 * Точная (по альфа-каналу самой арки) — но именно поэтому годится
 * только рядом с финальным размером: силуэт девушки вырезает из неё
 * кусок, и на большом масштабе (когда камера ещё не подъехала) эта
 * выемка растягивается на пол-экрана и читается как дыра в пейзаже.
 * Используется только для неподвижного window — там передний план
 * всегда непрозрачен (сразу в статичной раскладке, а в анимированной
 * сцене — с того же кадра, что и сам window, см. HANDOFF_AT), поэтому
 * выемка от девушки всегда закрыта её собственным изображением сверху.
 */
export const ARCH_MASK_SRC = '/media/arch-opening-mask.png';

/**
 * Упрощённый контур проёма БЕЗ выреза под девушку — просто форма окна
 * (заострённая сверху, прямоугольная ниже), с небольшим запасом внутрь
 * от реального камня. Годится на любом масштабе, в том числе огромном:
 * никакой выемки, которую нечем прикрыть, пока передний план ещё не
 * проявился. Используется для маски движущейся панорамы (слой 1) —
 * той небольшой неточности по краям, что остаётся, не видно: она либо
 * скрыта в поле вокруг арки (снаружи так и так пусто), либо позже
 * перекрывается камнем/девушкой переднего плана, когда он проявляется.
 */
export const ARCH_OUTLINE_MASK_SRC = '/media/arch-outline-mask.png';

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
  /** Отъезд камеры: и transform панорамы (landscapeRectAt), и стяжка
      маски (maskRectAt) от «весь экран» до формы проёма идут по этому
      же окну — одна и та же камера, один и тот же темп. */
  pullBack: [0, 0.75],
  /** Передний план (девушка и камень) проявляется прозрачностью —
      коротко и ближе к концу отъезда. Камень материализуется вокруг
      уже почти готового окна, а не поверх ещё целого пейзажа. */
  figureIn: [0.6, 0.8],
  /** Заголовок и медальоны. */
  reveal: [0.86, 1],
} as const;

/**
 * Момент передачи от анимированной маски (слой 1, panorama) к
 * статичному window (слой 3): маска уже точно совпала с формой
 * проёма, и передний план уже полностью проявился. Слои в этот
 * момент показывают одинаковые пиксели, поэтому переключение —
 * обычный, а не постепенный переход между ними, — незаметно.
 */
export const HANDOFF_AT = PHASE.figureIn[1];

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

/**
 * Обратная задача к openingIn: не «какой проём внутри готового кадра
 * арки», а «кадр арки такого размера и в таком месте, чтобы именно
 * его проём накрыл рамку целиком» — тот прямоугольник, которым нужно
 * замостить маску проёма, чтобы её «дыра» закрыла box без зазоров.
 *
 * margin — запас (1 = впритык, 1.2 — с 20% на сторону): рамка обычно
 * это экран, а он может стать чуть больше проёма без предупреждения
 * (после resize, до пересчёта раскладки) — небольшой запас страхует
 * от на мгновение проступившей белой полоски по краю.
 */
function fitOpeningCover(box: Rect, margin = 1): Rect {
  const openingNat: Size = {
    width: ARCH.opening.width * ARCH.width,
    height: ARCH.opening.height * ARCH.height,
  };
  const scale = Math.max(
    (box.width * margin) / openingNat.width,
    (box.height * margin) / openingNat.height,
  );
  const archWidth = ARCH.width * scale;
  const archHeight = ARCH.height * scale;
  const openingWidth = ARCH.opening.width * archWidth;
  const openingHeight = ARCH.opening.height * archHeight;
  const openingX = box.x + (box.width - openingWidth) / 2;
  const openingY = box.y + (box.height - openingHeight) / 2;
  return {
    x: openingX - ARCH.opening.x * archWidth,
    y: openingY - ARCH.opening.y * archHeight,
    width: archWidth,
    height: archHeight,
  };
}

/** Центр проёма, доля от ширины/высоты кадра арки — опорная точка
 *  стяжки маски, ровно то же по смыслу, что LANDSCAPE.anchor для
 *  панорамы: точка, чьё положение на экране ведётся по прогрессу. */
const OPENING_CENTER: Point = {
  x: ARCH.opening.x + ARCH.opening.width / 2,
  y: ARCH.opening.y + ARCH.opening.height / 2,
};

/**
 * Общая механика landscapeRectAt и maskRectAt: геометрический масштаб
 * (равные шаги прогресса — равные ДОЛИ изменения размера, а не равные
 * пиксели — так ведёт себя настоящий отъезд камеры, темп читается
 * ровным на всём пути) плюс лерп опорной точки по тому же t. Опорная
 * точка едет линейно, поэтому на обоих концах кадр садится ровно
 * в рассчитанное место — и вперёд, и назад одинаково.
 */
function lerpRectAt(t: number, from: Rect, to: Rect, anchor: Point, aspect: number): Rect {
  const width = from.width * Math.pow(to.width / from.width, t);
  const height = width * aspect;

  const anchorX = lerp(from.x + anchor.x * from.width, to.x + anchor.x * to.width, t);
  const anchorY = lerp(from.y + anchor.y * from.height, to.y + anchor.y * to.height, t);

  return {
    x: anchorX - anchor.x * width,
    y: anchorY - anchor.y * height,
    width,
    height,
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
  /** Кадр арки в начале отъезда — такого размера, что его проём
      (по упрощённому контуру ARCH_OUTLINE_MASK_SRC, см. там же) с
      запасом накрывает экран целиком: на первом кадре сцены маска
      панорамы ничего не обрезает. */
  maskStart: Rect;
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

  /* Запас 1.2, а не впритык: экран может на мгновение стать чуть шире
     самого свежего измерения (например, сразу после resize, до того
     как ResizeObserver пересчитает раскладку) — без запаса в этот
     момент по краю мелькнула бы полоска белого холста. */
  const maskStart = fitOpeningCover(
    { x: 0, y: 0, width: viewport.width, height: viewport.height },
    1.2,
  );

  return { arch, landscapeStart, landscapeEnd, maskStart };
}

/** Положение панорамы первого экрана на произвольном прогрессе. */
export function landscapeRectAt(progress: number, from: Rect, to: Rect): Rect {
  const t = phase(progress, PHASE.pullBack);
  return lerpRectAt(t, from, to, LANDSCAPE.anchor, LANDSCAPE.height / LANDSCAPE.width);
}

/**
 * Прямоугольник маски-проёма (упрощённый контур, ARCH_OUTLINE_MASK_SRC)
 * на произвольном прогрессе — тем же геометрическим темпом и по тому
 * же окну (PHASE.pullBack), что и landscapeRectAt: одна камера ведёт
 * обе анимации, не две рассинхронизированные.
 *
 * Результат — не сам проём, а кадр арки, которым нужно замостить
 * маску (как from и to, оба такого же вида — см. layout.maskStart
 * и layout.arch): вызывающий код накладывает его как mask-size/
 * mask-position панорамы, поэтому важен размер и положение целого
 * кадра 1122×1402, а не только дыры внутри него.
 *
 * Не привязан к содержимому панорамы: что именно видно сквозь дыру,
 * решает независимый transform самой панорамы (landscapeRectAt) —
 * эта функция только определяет, сколько от уже трансформированного
 * кадра панорамы остаётся видно.
 */
export function maskRectAt(progress: number, from: Rect, to: Rect): Rect {
  const t = phase(progress, PHASE.pullBack);
  return lerpRectAt(t, from, to, OPENING_CENTER, ARCH.height / ARCH.width);
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
