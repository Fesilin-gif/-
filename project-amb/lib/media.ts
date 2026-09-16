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
  /* Кадрирование подобрано по реальным пропорциям контейнеров:
     на десктопе глава почти квадратная, на телефоне — 4:5 или 3:2,
     поэтому focus держит в кадре именно декорации. */
  weddings: {
    src: '/media/wedding-hall.webp',
    alt: 'Оформление свадебного банкета: флористические колонны из белых роз, каллиграфический бэкдроп «Наше счастье здесь» и президиум со свечами',
    width: 1448,
    height: 1086,
    /* 80% по X — иначе на телефоне каллиграфия и президиум уходят за край */
    focus: '80% 50%',
  },
  kids: {
    src: '/media/kids-birthday.webp',
    alt: 'Оформление детского дня рождения: арка из разноцветных шаров, тематический бэкдроп «С Днём Рождения!» и зона сладкого стола',
    width: 1448,
    height: 1086,
    /* 35% по X сохраняет арку и бэкдроп целиком, 20% по Y не срезает верх арки */
    focus: '35% 20%',
  },
  show: {
    src: '/media/corporate-stage.webp',
    alt: 'Оформление корпоративного мероприятия: сценический портал с LED-экраном, световое оборудование и фуршетная зона',
    width: 1411,
    height: 1114,
    /* 78% по X — только при таком сдвиге сцена и экран попадают в кадр вместе */
    focus: '78% 40%',
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
