/* ============================================================
   Геометрия заставки «влёт камеры в окно»
   ------------------------------------------------------------
   Здесь только чистые вычисления: никакого DOM, никаких побочных
   эффектов. Компонент Intro измеряет экран, ждёт готовности
   картинок и каждый кадр анимации зовёт эти функции.

   Один слой, одна система координат
   ----------------------------------
   Нет отдельного «пейзажа в проёме» и отдельного «пейзажа на весь
   экран» — это один и тот же элемент <img> с одним и тем же файлом
   на всём протяжении заставки. Никакой смены источника, никакого
   перекрёстного затухания между двумя картинками.

   Устроено это через общий контейнер — .rig, размером ровно
   с натуральный кадр арки (1122×1402 = ARCH.width×ARCH.height).
   Внутри него, в ЭТИХ ЖЕ координатах:
     - .rig__window — обёртка размером ровно с сам .rig, НЕПОДВИЖНАЯ
       и с ПОСТОЯННОЙ маской: mask-size 100% 100%, mask-position 0 0 —
       сама обёртка и есть система координат маски, пересчитывать
       нечего. Маска — точная готическая форма проёма
       (arch-opening-mask.png, тот же геометрический источник, что
       и сама арка — один источник истины);
     - панорама — <img> ВНУТРИ обёртки, со своим отдельным transform
       (см. ниже, «панорама двух состояний») — маску это не касается
       вообще, у неё своя, фиксированная система координат. Приём
       (отдельная обёртка с постоянной маской вместо маски на самой
       панораме) — обход бага рендера CSS-маски в Chromium при
       больших значениях mask-size, всплывавшего в более ранней
       версии этой сцены;
     - фигура арки (arch-transparent.png) — тот же кадр 1122×1402,
       без собственного transform: она просто СОВПАДАЕТ с
       координатами .rig, пиксель в пиксель, но её непрозрачность
       анимируется (гаснет к концу влёта, см. Intro.tsx).
   Сам .rig двигается одним transform (translate + scale), который
   каждый кадр анимации пишет Intro.tsx — им масштабируются и
   обёртка с маской и панорамой внутри, и фигура арки разом.

   Направление — внутрь окна
   --------------------------
   Заставка идёт из «арка видна целиком, на белом фоне, обычного
   размера» (computeLayout().arch — тот же fit-contain расчёт, что
   раньше давал финальный кадр отъезда камеры) К «.rig взят настолько
   огромным, что даже его проём с запасом перекрывает весь экран»
   (computeLayout().rigStart — раньше это был СТАРТ отъезда камеры).
   Это ровно то же самое состояние, что и в прежней сцене с прокруткой,
   просто пройденное в обратную сторону и по времени, а не по
   прокрутке: камень и девушка увеличиваются и уходят за края экрана,
   а пейзаж внутри проёма «надвигается», пока не займёт экран целиком
   — в точности как fitCoverFocused дал бы для простого полноэкранного
   фона (см. landscapeStartRect). Общие с прежней сценой функции
   (rigRectAt, landscapeRectAt, transformFor, computeLayout и вся
   раскладка внутри неё) переиспользованы без изменений в математике
   — только переименован вход: вместо прогресса прокрутки внутри
   заранее заданного окна фаз они принимают уже сглаженное t (0..1),
   а какое окно и какую кривую по нему вести — решает вызывающий код.

   Панорама двух состояний
   ------------------------
   Местоположение самой панорамы ВНУТРИ обёртки — не константа,
   а функция t. У неё два опорных состояния:
     - на входе (t=0) — localViewRect: панорама, подогнанная точно
       под форму проёма (как в финале прежней сцены);
     - на выходе (t=1) — landscapeStartRect: панорама подобрана так,
       что в сочетании с огромным .rig на экране получается ровно
       fitCoverFocused(view, viewport, focus) — обычный полноэкранный
       фон, точный обратный расчёт, а не приближение на глаз.
   Между ними — тот же приём, что и у rigRectAt: геометрический
   интерфит масштаба плюс линейный интерфит опорной точки (фокус
   вида), чтобы кадр не «плыл», а стягивался к одной точке.

   Почти тот же t, что и у .rig, но с небольшой отсрочкой старта (см.
   INTRO.landscapeSettleFrom в Intro.tsx) — панорама начинает сжиматься
   к landscapeStartRect чуть позже, чем .rig начинает расти. Опытным
   путём (плотный прогон скриншотов по всей длительности влёта, на
   нескольких пропорциях экрана, включая широкие) подобрано так, чтобы
   в проёме никогда не проглядывал белый холст: веди панораму СТРОГО
   тем же t, что и .rig, — для широких экранов чуть-чуть не хватает
   (проём растёт чуть быстрее, чем успевает сжаться панорама); отложи
   старт заметно позже — не хватает уже с другого края, ближе к концу
   влёта. Найденная отсрочка — компромисс между этими двумя
   крайностями, а не точный аналитический расчёт (в отличие от
   localViewRect/landscapeStartRect выше, которые считаются точно).
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
 *   только для стартового (контейнерного) размера — см. computeLayout.
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
 * проём фигуры всегда совпадают пиксель в пиксель. Наложена на
 * .rig__window — неподвижную обёртку 1122×1402 — с постоянными
 * mask-size/position (100% / 0 0, см. app/scene.css): маска никогда
 * не пересчитывается, что бы ни делала панорама внутри обёртки.
 */
export const ARCH_MASK_SRC = '/media/arch-opening-mask.png';

/* ——— Вид в проёме ———————————————————————————————————————— */

/**
 * Любое изображение, которое можно показать в проёме. Сегодня
 * заставка всегда показывает LANDSCAPE — переключать вид больше
 * не на что: медальоны выбора вида больше не управляют окном арки
 * (окно существует только внутри заставки, а не на основном сайте).
 * Тип и запасной вид оставлены — тем же вызывающим кодом когда-то
 * пользовался прежний вариант сцены, и он не помешает, если этой
 * возможности снова найдётся применение.
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

/* ——— Математика ——————————————————————————————————————— */

export const clamp = (value: number, min = 0, max = 1) =>
  value < min ? min : value > max ? max : value;

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Сглаживание (smoothstep), 0..1 → 0..1: старт и финиш движения
 *  плавные, середина — ровный темп. Одно сглаживание на всю сцену —
 *  второе поверх него съедает начало и конец и рвёт темп. */
export function smoothstep(t: number): number {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
}

/** Сглаженная доля внутри окна [start, end] произвольной шкалы
 *  (доля прокрутки, доля времени — шкалу задаёт вызывающий код). */
export function phase(value: number, [start, end]: readonly [number, number]) {
  if (end <= start) return value >= end ? 1 : 0;
  return smoothstep((value - start) / (end - start));
}

/* ——— Тайминг заставки ———————————————————————————————————— */

/**
 * Тайминг влёта. Сама анимация ведётся временем (requestAnimationFrame),
 * а не прокруткой — заставка играет один раз сама, без участия
 * посетителя (см. Intro.tsx).
 */
export const INTRO = {
  /** Длительность самого влёта, мс. */
  duration: 1700,
  /** С какой доли длительности местное положение панорамы внутри
   *  .rig__window начинает сжиматься от localViewRect к
   *  landscapeStartRect (см. заголовок файла про «панораму двух
   *  состояний») — до этой точки панорама стоит на месте, в самом
   *  безопасном (заведомо накрывающем проём) положении. Подобрано
   *  прогоном скриншотов по всей длительности влёта на нескольких
   *  пропорциях экрана — см. заголовок файла. */
  landscapeSettleFrom: 0.08,
  /** Окно (доля длительности), в котором непрозрачность фигуры арки
   *  гаснет к концу влёта — к моменту, когда .rig уже настолько
   *  огромен, что камень и девушка в любом случае далеко за краями
   *  экрана; угасание — подстраховка на случай, если что-то в
   *  геометрии конкретного экрана рассчитано не впритык. */
  figureOut: [0.78, 1] as readonly [number, number],
  /** Сколько минимум держится экран «Загрузка…», мс — считая с самого
   *  открытия страницы, а не с готовности картинок. На быстрой сети
   *  и с картинками из кэша браузера готовность может наступить почти
   *  мгновенно — этого времени не хватает заметить, что вообще
   *  происходит, прежде чем экран сменится. Если картинки готовы
   *  раньше — просто ждём оставшееся до этого порога; если позже —
   *  влёт начинается сразу, как только они готовы (без лишнего
   *  ожидания сверх реального времени загрузки). */
  minLoadingMs: 4000,
} as const;

/* ——— Раскладка ———————————————————————————————————————— */

/** Кадр целиком внутри рамки. Ничего не обрезается. anchor — где именно
 *  внутри свободного места вдоль каждой оси встаёт кадр (0.5 — по
 *  центру, как background-position: у fitCoverFocused). */
export function fitContain(
  source: Size,
  box: Rect,
  anchor: Point = { x: 0.5, y: 0.5 },
): Rect {
  const scale = Math.min(box.width / source.width, box.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return {
    x: box.x + (box.width - width) * anchor.x,
    y: box.y + (box.height - height) * anchor.y,
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
 *
 * anchor — см. fitContain; по вертикали стартовый (контейнерный) кадр
 * арки специально взят чуть выше центра рамки (см. computeLayout) —
 * по центру середина проёма (где сидит девушка) визуально казалась
 * слишком низко.
 */
export function fitContentContain(
  source: Size,
  content: Rect,
  box: Rect,
  anchor: Point = { x: 0.5, y: 0.5 },
): Rect {
  const inner = fitContain(
    { width: source.width * content.width, height: source.height * content.height },
    box,
    anchor,
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
 * сам свод, — и тогда в конечном (самом крупном) кадре заставки
 * приоткрывается уголок камня, которого там уже не должно быть.
 *
 * Эта версия — измеренная по альфа-каналу часть проёма, которая уже
 * на полную ширину: боковые стены выходят на полную ширину примерно
 * к 30% высоты кадра (измерено по профилю ширины маски проёма
 * построчно, с запасом на антиалиасинг).
 */
const OPENING_RECT_SAFE: Rect = {
  x: ARCH.opening.x,
  y: 0.3,
  width: ARCH.opening.width,
  height: ARCH.opening.y + ARCH.opening.height - 0.3,
};

/**
 * Обратная задача к openingIn: не «какой проём внутри готового кадра
 * арки», а «кадр арки такого размера и в таком месте, чтобы именно
 * его (заведомо прямоугольная часть) проём накрыл рамку целиком» —
 * то состояние, которым заставка заканчивается: кадр арки настолько
 * огромный, что даже его проём (не говоря о самом камне) выходит за
 * границы этой рамки.
 *
 * margin — запас (1 = впритык, 1.2 — с 20% на сторону): рамка обычно
 * это экран, а он может стать чуть больше проёма без предупреждения
 * (например, сразу после resize, до пересчёта раскладки) — без
 * запаса в этот момент по краю мелькнула бы полоска белого холста.
 *
 * anchor — где именно внутри рамки встаёт проём (см. fitContain).
 * По вертикали здесь та же точка, что и у стартового (контейнерного)
 * кадра арки (ARCH_VERTICAL_ANCHOR) — иначе на середине влёта опорная
 * точка (OPENING_CENTER, см. ниже) ещё не успевала бы подняться
 * настолько высоко: свод арки на добрую часть анимации срезало бы
 * верхним краем экрана. Один и тот же перекос на обоих концах это
 * убирает.
 */
function fitOpeningCover(box: Rect, margin = 1, anchor: Point = { x: 0.5, y: 0.5 }): Rect {
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
  const openingX = box.x + (box.width - openingWidth) * anchor.x;
  const openingY = box.y + (box.height - openingHeight) * anchor.y;
  return {
    x: openingX - OPENING_RECT_SAFE.x * archWidth,
    y: openingY - OPENING_RECT_SAFE.y * archHeight,
    width: archWidth,
    height: archHeight,
  };
}

/** Центр проёма, доля от ширины/высоты кадра арки — опорная точка
 *  влёта: точка, чьё положение на экране ведётся по t линейно, поэтому
 *  в начале и в конце .rig садится ровно в рассчитанное место. */
const OPENING_CENTER: Point = {
  x: ARCH.opening.x + ARCH.opening.width / 2,
  y: ARCH.opening.y + ARCH.opening.height / 2,
};

export type SceneLayout = {
  /** Стартовый, контейнерный кадр арки (t=0 заставки) — обычного
      размера, целиком видна на белом фоне. Раньше это был финальный
      кадр отъезда камеры в версии сцены с прокруткой. */
  arch: Rect;
  /** Конечный кадр арки (t=1 заставки) — такого размера, что его
      проём с запасом накрывает экран целиком (см. fitOpeningCover).
      Раньше это был старт отъезда камеры. */
  rigStart: Rect;
};

/** Насколько выше геометрического центра рамки встаёт стартовый,
 *  контейнерный кадр арки по вертикали — 0.5 было бы точно по
 *  центру, меньше — выше. */
const ARCH_VERTICAL_ANCHOR = 0.4;

/**
 * То же самое, но для КОНЦА влёта (rigStart), и гораздо резче.
 *
 * .rig в конце влёта настолько огромен (много выше экрана), что свод
 * арки и подол платья физически не помещаются в экран одновременно —
 * при любой точке привязки что-то одно обрезано верхним/нижним краем
 * раньше, чем должно. Раз выбирать всё равно приходится, лучше
 * обрезать подол (к этому моменту фигура арки уже гаснет, см.
 * INTRO.figureOut в Intro.tsx), чем свод. Чем ближе эта точка к верху
 * экрана, тем раньше (по t) свод перестаёт быть виден целиком —
 * сама точка при этом всё равно едет от ARCH_VERTICAL_ANCHOR линейно,
 * так что рывка нет.
 */
const RIG_END_VERTICAL_ANCHOR = 0;

/**
 * Полная раскладка заставки.
 *
 * viewport — экран (высота берётся у самого корневого блока, а не
 *   у window: на телефоне адресная строка меняет высоту окна, а не
 *   блока).
 * frame — свободная область экрана под стартовый (контейнерный) кадр
 *   арки, с отступом снизу под надпись «Загрузка…».
 */
export function computeLayout(viewport: Size, frame: Rect): SceneLayout {
  const arch = fitContentContain(ARCH, ARCH.content, frame, { x: 0.5, y: ARCH_VERTICAL_ANCHOR });

  const rigStart = fitOpeningCover(
    { x: 0, y: 0, width: viewport.width, height: viewport.height },
    1.2,
    { x: 0.5, y: RIG_END_VERTICAL_ANCHOR },
  );

  return { arch, rigStart };
}

/**
 * Положение .rig (кадр 1122×1402) при произвольном t — единственная
 * анимация заставки. t уже сглажен вызывающим кодом (см. заголовок
 * файла) — здесь только геометрия. Масштаб идёт геометрически: равные
 * шаги t — равные ДОЛИ изменения размера, а не равные пиксели, — так
 * ведёт себя настоящее движение камеры, темп читается ровным на всём
 * пути.
 */
export function rigRectAt(t: number, from: Rect, to: Rect): Rect {
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
 * Запас поверх точного cover-кадра — см. localViewRect. Прямоугольник
 * проёма (396×740 в натуральных пикселях) заметно уже, чем пропорции
 * самой панорамы (1672×941), поэтому «cover» упирается в высоту:
 * готовый кадр накрывает проём по высоте РОВНО, без единого лишнего
 * пикселя запаса (по ширине запас огромный). Margin здесь ни на что
 * не влияет визуально — лишние пиксели кадра всё равно срезает маска
 * проёма, — это только про landscapeRectAt ниже: пока панорама едет
 * от landscapeStartRect к этому кадру, опорная точка вида идёт по
 * прямой между двумя РАЗНЫМИ позициями, и где-то в середине пути кадр
 * неизбежно проходит через положение, чуть отличное от «ровно
 * впритык». Без запаса это положение на паре кадров анимации
 * приоткрывает белый холст по краю проёма.
 */
const FINAL_VIEW_MARGIN = 2.2;

/**
 * Где именно внутри .rig__window (в натуральных пикселях 1122×1402)
 * должен встать вид, чтобы накрыть проём: панорама, подогнанная под
 * точную форму готического проёма (cover, focus — точка интереса
 * вида), с запасом — см. FINAL_VIEW_MARGIN. Состояние t=0 заставки.
 */
export function localViewRect(view: WindowView): Rect {
  const rect = fitCoverFocused(view, OPENING_LOCAL, view.focus ?? { x: 0.5, y: 0.5 });
  const width = rect.width * FINAL_VIEW_MARGIN;
  const height = rect.height * FINAL_VIEW_MARGIN;
  return {
    x: rect.x - (width - rect.width) / 2,
    y: rect.y - (height - rect.height) / 2,
    width,
    height,
  };
}

/**
 * Локальное положение вида внутри .rig__window при t=1 (конец
 * заставки): такое, что в паре с огромным rigStart на экране
 * получается ровно fitCoverFocused(view, viewport, focus) — обычный
 * полноэкранный фон, как если бы арки не было вовсе. Не приближение —
 * точный обратный расчёт: rigStart уже даёт экранный transform
 * (translate+scale), здесь тот же экранный кадр вида просто
 * выражается в ЛОКАЛЬНЫХ координатах .rig (делим на transform
 * rigStart). Получающийся масштаб обычно намного меньше, чем у
 * localViewRect, — но на маску это никак не влияет (см. заголовок
 * файла): можно спокойно использовать любой масштаб.
 */
export function landscapeStartRect(view: WindowView, viewport: Size, rigStart: Rect): Rect {
  const screen = fitCoverFocused(
    view,
    { x: 0, y: 0, width: viewport.width, height: viewport.height },
    view.focus ?? { x: 0.5, y: 0.5 },
  );
  const rigScale = rigStart.width / ARCH.width;
  return {
    x: (screen.x - rigStart.x) / rigScale,
    y: (screen.y - rigStart.y) / rigScale,
    width: screen.width / rigScale,
    height: screen.height / rigScale,
  };
}

/**
 * Локальное положение вида внутри .rig__window при произвольном t —
 * тем же приёмом, что и rigRectAt: геометрический интерфит масштаба
 * (равные доли изменения размера на равных шагах t) и линейный
 * интерфит экранного положения опорной точки вида (focus — та же
 * точка интереса, что и у fitCoverFocused), чтобы кадр стягивался
 * к ней, а не «плыл». t здесь обычно СВОЙ, отдельный от t самого
 * .rig — см. заголовок файла и INTRO.landscapeSettleFrom в Intro.tsx.
 */
export function landscapeRectAt(t: number, from: Rect, to: Rect, focus: Point): Rect {
  const width = from.width * Math.pow(to.width / from.width, t);
  const height = from.height * Math.pow(to.height / from.height, t);

  const anchorX = lerp(from.x + focus.x * from.width, to.x + focus.x * to.width, t);
  const anchorY = lerp(from.y + focus.y * from.height, to.y + focus.y * to.height, t);

  return {
    x: anchorX - focus.x * width,
    y: anchorY - focus.y * height,
    width,
    height,
  };
}
