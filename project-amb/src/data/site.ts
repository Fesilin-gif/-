/**
 * Всё содержимое сайта в одном месте.
 *
 * Чтобы добавить проект, достаточно дописать объект в `projects`: раздел
 * галереи соберётся сам. Когда появится реальная съёмка, добавьте
 * `image: '/projects/имя.jpg'` — вместо студийного рендера подставится фото,
 * ничего больше менять не нужно.
 */

export type DecorKind = 'arch' | 'bloom' | 'ring' | 'cloud' | 'carousel' | 'fins'

export type CategoryId = 'wedding' | 'kids' | 'show'

export interface Category {
  id: CategoryId
  title: string
  caption: string
}

export interface Project {
  id: string
  index: string
  title: string
  category: CategoryId
  year: string
  place: string
  description: string
  facts: { label: string; value: string }[]
  /** Форма декорации для студийного рендера-заглушки. */
  decor: DecorKind
  /** Реальное фото проекта, если оно есть. */
  image?: string
  /** Крупный проект занимает всю ширину строки в галерее. */
  wide?: boolean
}

export const categories: Category[] = [
  {
    id: 'wedding',
    title: 'Свадьбы',
    caption: 'Арки, флористика, полное оформление залов и выездных площадок',
  },
  {
    id: 'kids',
    title: 'Детские праздники',
    caption: 'Объёмные формы, игровые инсталляции, безопасные материалы',
  },
  {
    id: 'show',
    title: 'Шоу и event',
    caption: 'Сценография, кинетика, оформление форумов и корпоративных событий',
  },
]

export const projects: Project[] = [
  {
    id: 'luna',
    index: '01',
    title: 'Арка «Луна»',
    category: 'wedding',
    year: '2025',
    place: 'Загородная резиденция',
    description:
      'Свадебная арка шести метров: гипсовые модули на скрытом каркасе и живая флористика по верхней дуге. Собирается на площадке за четыре часа.',
    facts: [
      { label: 'Высота', value: '6 м' },
      { label: 'Сборка', value: '4 часа' },
    ],
    decor: 'arch',
    wide: true,
  },
  {
    id: 'white-garden',
    index: '02',
    title: 'Белый сад',
    category: 'wedding',
    year: '2024',
    place: 'Банкетный зал, Москва',
    description:
      'Полное оформление зала на 180 гостей: колоннада по периметру, подвесные композиции над столами и световые ниши.',
    facts: [
      { label: 'Гостей', value: '180' },
      { label: 'Площадь', value: '640 м²' },
    ],
    decor: 'bloom',
  },
  {
    id: 'clouds',
    index: '03',
    title: 'Облака',
    category: 'kids',
    year: '2025',
    place: 'Семейный праздник',
    description:
      'Объёмные облака из лёгкого пенопласта с мягкой обтяжкой. Ни одного острого угла — можно трогать и залезать.',
    facts: [
      { label: 'Модулей', value: '14' },
      { label: 'Вес модуля', value: '2,4 кг' },
    ],
    decor: 'cloud',
  },
  {
    id: 'carousel',
    index: '04',
    title: 'Карусель',
    category: 'kids',
    year: '2024',
    place: 'День рождения, лофт',
    description:
      'Игровая инсталляция-карусель в центре зала: вращающиеся лучи, подвесные фигуры и фотозона по кругу.',
    facts: [
      { label: 'Диаметр', value: '4,2 м' },
      { label: 'Лучей', value: '8' },
    ],
    decor: 'carousel',
    wide: true,
  },
  {
    id: 'orbit',
    index: '05',
    title: 'Орбита',
    category: 'show',
    year: '2025',
    place: 'Главная сцена фестиваля',
    description:
      'Кинетическое кольцо над сценой: двенадцать сегментов раскрываются в начале шоу и держат свет весь вечер.',
    facts: [
      { label: 'Диаметр', value: '9 м' },
      { label: 'Сегментов', value: '12' },
    ],
    decor: 'ring',
  },
  {
    id: 'rhythm',
    index: '06',
    title: 'Ритм',
    category: 'show',
    year: '2024',
    place: 'Корпоративный форум',
    description:
      'Сценография форума: сорок восемь вертикальных ламелей, которые с одной стороны читаются стеной, с другой — открытым воздухом.',
    facts: [
      { label: 'Ламелей', value: '48' },
      { label: 'Длина', value: '18 м' },
    ],
    decor: 'fins',
  },
]

export const services = [
  {
    index: '01',
    title: 'Разработка концепции',
    text: 'Идея, референсы и эскизы под конкретную площадку и формат события.',
  },
  {
    index: '02',
    title: 'Проектирование',
    text: 'Чертежи, расчёт нагрузок, подбор материалов и смета до начала работ.',
  },
  {
    index: '03',
    title: 'Изготовление декораций',
    text: 'Собственный цех: дерево, металл, пластик, гипс, текстиль, печать.',
  },
  {
    index: '04',
    title: 'Монтаж',
    text: 'Доставка, сборка на площадке в оговорённое окно и демонтаж после события.',
  },
  {
    index: '05',
    title: 'Полное оформление мероприятия',
    text: 'Всё вместе — от первого эскиза до вывоза конструкций на следующее утро.',
  },
]

export const stats = [
  { value: '7', label: 'лет в декорациях' },
  { value: '260+', label: 'реализованных событий' },
  { value: '900', label: 'м² собственного цеха' },
]

export const contacts = {
  phone: '+7 495 000-00-00',
  phoneHref: 'tel:+74950000000',
  email: 'studio@projectamb.ru',
  telegram: '@projectamb',
  telegramHref: 'https://t.me/projectamb',
  whatsappHref: 'https://wa.me/74950000000',
  address: 'Москва, Дербеневская набережная, 7с2',
  socials: [
    { label: 'Telegram', href: 'https://t.me/projectamb' },
    { label: 'VK', href: 'https://vk.com/projectamb' },
    { label: 'Pinterest', href: 'https://pinterest.com/projectamb' },
  ],
}

export const nav = [
  { id: 'projects', label: 'Проекты' },
  { id: 'about', label: 'О нас' },
  { id: 'services', label: 'Услуги' },
  { id: 'contacts', label: 'Контакты' },
]
