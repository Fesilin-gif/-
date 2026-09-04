/**
 * Реестр фотослотов.
 *
 * Сейчас в слотах лежат художественные плашки, сгенерированные
 * scripts/generate-media.mjs (внешние фотостоки недоступны в сборочном окружении).
 *
 * Чтобы поставить настоящие фотографии:
 *   1. положите файл в public/media/ — можно с тем же именем или любым другим;
 *   2. поправьте здесь `src`, `alt` и при необходимости `focus`;
 *   3. больше не запускайте scripts/generate-media.mjs — он перезапишет плашки.
 *
 * `focus` — точка кадрирования (object-position) для сильно обрезанных слотов.
 */

export type MediaSlot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  focus?: string;
};

export const MEDIA = {
  hero: {
    src: '/media/hero.webp',
    alt: 'Арка с флористическим оформлением в зале — работа PROJECT AMB',
    width: 1700,
    height: 2200,
    focus: '50% 42%',
  },
  weddings: {
    src: '/media/weddings.webp',
    alt: 'Флористическая композиция в оформлении свадебной зоны',
    width: 1600,
    height: 2000,
  },
  kids: {
    src: '/media/kids.webp',
    alt: 'Подвесные декорационные кольца в оформлении детского праздника',
    width: 2200,
    height: 1500,
  },
  show: {
    src: '/media/show.webp',
    alt: 'Сценические конструкции и свет на шоу-программе',
    width: 2200,
    height: 1500,
  },
  'project-01': {
    src: '/media/project-01.webp',
    alt: 'Сервировка и декор банкетного стола на свадьбе в загородном клубе',
    width: 2400,
    height: 1360,
  },
  'project-02': {
    src: '/media/project-02.webp',
    alt: 'Текстильная драпировка фотозоны детского праздника',
    width: 1400,
    height: 1860,
  },
  'project-03': {
    src: '/media/project-03.webp',
    alt: 'Сценический портал корпоративного мероприятия',
    width: 2400,
    height: 1040,
  },
  'project-04': {
    src: '/media/project-04.webp',
    alt: 'Декорационная арка в интерьере частного события',
    width: 1700,
    height: 1280,
  },
  'project-05': {
    src: '/media/project-05.webp',
    alt: 'Флористический объект шоу-программы',
    width: 1500,
    height: 1500,
  },
  statement: {
    src: '/media/statement.webp',
    alt: 'Текстильная декорация в тёплом свете',
    width: 2400,
    height: 1600,
  },
  approach: {
    src: '/media/approach.webp',
    alt: 'Подвесные конструкции декорации',
    width: 1600,
    height: 2000,
  },
  'team-01': { src: '/media/team-01.webp', alt: 'Портретный слот команды PROJECT AMB', width: 1200, height: 1500 },
  'team-02': { src: '/media/team-02.webp', alt: 'Портретный слот команды PROJECT AMB', width: 1200, height: 1500 },
  'team-03': { src: '/media/team-03.webp', alt: 'Портретный слот команды PROJECT AMB', width: 1200, height: 1500 },
  'team-04': { src: '/media/team-04.webp', alt: 'Портретный слот команды PROJECT AMB', width: 1200, height: 1500 },
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof MEDIA;
