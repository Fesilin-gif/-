import { Product, CategoryInfo, Benefit } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'cpu',
    name: 'Процессоры',
    slug: 'cpu',
    count: 148,
    image: '/images/cpu.png',
    description: 'Центральные процессоры Intel Core и AMD Ryzen для гейминга и профессиональных задач.',
    popularItem: 'AMD Ryzen 7 7800X3D'
  },
  {
    id: 'gpu',
    name: 'Видеокарты',
    slug: 'gpu',
    count: 215,
    image: '/images/gpu.png',
    description: 'Графические ускорители NVIDIA GeForce RTX и AMD Radeon RX для максимального FPS.',
    popularItem: 'NVIDIA GeForce RTX 4090 White'
  },
  {
    id: 'motherboard',
    name: 'Материнские платы',
    slug: 'motherboard',
    count: 182,
    image: '/images/motherboard.png',
    description: 'Надёжные системные платы на чипсетах Z790, X670E, B650 с фазами питания для разгона.',
    popularItem: 'ASUS ROG STRIX Z790-A Gaming WiFi'
  },
  {
    id: 'ram',
    name: 'Оперативная память',
    slug: 'ram',
    count: 124,
    image: '/images/ram.png',
    description: 'Скоростные модули DDR4 и DDR5 с радиаторами охлаждения и поддержкой XMP/EXPO.',
    popularItem: 'G.Skill Trident Z5 RGB DDR5 6000MHz 32GB'
  },
  {
    id: 'storage',
    name: 'SSD и HDD',
    slug: 'storage',
    count: 195,
    image: '/images/storage.png',
    description: 'Высокоскоростные накопители NVMe PCIe 4.0/5.0 M.2 и ёмкие жесткие диски.',
    popularItem: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe'
  },
  {
    id: 'psu',
    name: 'Блоки питания',
    slug: 'psu',
    count: 96,
    image: '/images/psu.png',
    description: 'Модульные блоки питания стандарта ATX 3.0 с сертификатом 80 PLUS Gold и Platinum.',
    popularItem: 'Corsair RM1000x Shift 1000W Gold'
  }
];

export const PRODUCTS: Product[] = [
  // CPUs
  {
    id: 'p1',
    name: 'Процессор AMD Ryzen 7 7800X3D OEM',
    category: 'cpu',
    brand: 'AMD',
    price: 44990,
    oldPrice: 48990,
    rating: 4.9,
    reviewsCount: 128,
    image: '/images/amd_ryzen_7_7800x3d.png',
    badge: 'Хит',
    inStock: true,
    socket: 'AM5',
    memoryType: 'DDR5',
    wattage: 120,
    specs: {
      'Сокет': 'AM5',
      'Ядра / Потоки': '8 / 16',
      'Базовая частота': '4.2 ГГц',
      'Частота в Turbo': '5.0 ГГц',
      'Кэш L3': '96 МБ (3D V-Cache)',
      'Техпроцесс': '5 нм',
      'TDP': '120 Вт'
    },
    description: 'Лучший игровой процессор в мире с технологией 3D V-Cache для максимальной частоты кадров в любых играх.'
  },
  {
    id: 'p2',
    name: 'Процессор Intel Core i9-14900KS Box',
    category: 'cpu',
    brand: 'Intel',
    price: 72990,
    oldPrice: 79990,
    rating: 4.8,
    reviewsCount: 64,
    image: '/images/intel_core_i9_14900ks.png',
    badge: 'ТОП',
    inStock: true,
    socket: 'LGA1700',
    memoryType: 'DDR5',
    wattage: 253,
    specs: {
      'Сокет': 'LGA1700',
      'Ядра / Потоки': '24 (8P + 16E) / 32',
      'Макс. частота': '6.2 ГГц',
      'Кэш L3': '36 МБ',
      'Поддержка памяти': 'DDR5-5600 / DDR4-3200',
      'TDP': '150-253 Вт'
    },
    description: 'Флагманский процессор Intel с рекордной базовой частотой до 6.2 ГГц для экстрим-гейминга и тяжелого рендеринга.'
  },
  {
    id: 'p3',
    name: 'Процессор AMD Ryzen 5 7600X OEM',
    category: 'cpu',
    brand: 'AMD',
    price: 21990,
    oldPrice: 24990,
    rating: 4.7,
    reviewsCount: 92,
    image: '/images/amd_ryzen_5_7600x.png',
    inStock: true,
    socket: 'AM5',
    memoryType: 'DDR5',
    wattage: 105,
    specs: {
      'Сокет': 'AM5',
      'Ядра / Потоки': '6 / 12',
      'Частота Boost': '5.3 ГГц',
      'Кэш L3': '32 МБ'
    },
    description: 'Отличный современный 6-ядерный процессор для сбалансированных игровых систем на платформе AM5.'
  },

  // GPUs
  {
    id: 'p4',
    name: 'Видеокарта Gigabyte GeForce RTX 4090 AERO OC 24G White',
    category: 'gpu',
    brand: 'NVIDIA',
    price: 219990,
    oldPrice: 235000,
    rating: 5.0,
    reviewsCount: 45,
    image: '/images/gigabyte_rtx_4090_aero.png',
    badge: 'ТОП',
    inStock: true,
    wattage: 450,
    specs: {
      'Видеопамять': '24 ГБ GDDR6X',
      'Шина памяти': '384 бит',
      'Частота ядра': '2535 МГц',
      'Разъемы': '1x HDMI 2.1, 3x DisplayPort 1.4a',
      'Питание': '16-pin (12VHPWR)',
      'Рекомендуемый БП': '850 Вт',
      'Цвет': 'Белый'
    },
    description: 'Ультимативная видеокарта в белоснежном исполнении для гейминга в 4K с максимальным трассированием лучей и DLSS 3.5.'
  },
  {
    id: 'p5',
    name: 'Видеокарта ASUS ROG Strix GeForce RTX 4080 SUPER OC White 16GB',
    category: 'gpu',
    brand: 'NVIDIA',
    price: 139990,
    oldPrice: 149990,
    rating: 4.9,
    reviewsCount: 88,
    image: '/images/asus_rog_strix_rtx_4080_super.png',
    badge: 'Хит',
    inStock: true,
    wattage: 320,
    specs: {
      'Видеопамять': '16 ГБ GDDR6X',
      'Шина памяти': '256 бит',
      'Частота GPU': '2670 МГц',
      'Охлаждение': '3 вентилятора Axial-tech'
    },
    description: 'Мощнейшая графическая карта с высшим качеством элементов питания и фирменной подсветкой Aura Sync.'
  },
  {
    id: 'p6',
    name: 'Видеокарта Sapphire AMD Radeon RX 7900 XTX Nitro+ Vapor-X 24GB',
    category: 'gpu',
    brand: 'AMD',
    price: 124990,
    rating: 4.8,
    reviewsCount: 39,
    image: '/images/sapphire_rx_7900_xtx.png',
    inStock: true,
    wattage: 355,
    specs: {
      'Видеопамять': '24 ГБ GDDR6',
      'Шина': '384 бит',
      'Интерфейс': 'PCIe 4.0'
    },
    description: 'Флагман на архитектуре RDNA 3 с испарительной камерой Vapor-X для тихой и быстрой работы.'
  },

  // Motherboards
  {
    id: 'p7',
    name: 'Материнская плата ASUS ROG STRIX Z790-A GAMING WIFI II',
    category: 'motherboard',
    brand: 'ASUS',
    price: 43990,
    oldPrice: 46990,
    rating: 4.9,
    reviewsCount: 52,
    image: '/images/asus_rog_strix_z790_a.png',
    badge: 'Новинка',
    inStock: true,
    socket: 'LGA1700',
    formFactor: 'ATX',
    memoryType: 'DDR5',
    specs: {
      'Сокет': 'LGA1700',
      'Чипсет': 'Intel Z790',
      'Форм-фактор': 'ATX',
      'Слоты DDR5': '4 x DDR5 (до 8000+ МГц)',
      'Слоты M.2': '5 x M.2 PCIe 4.0/5.0',
      'Беспроводные интерфейсы': 'Wi-Fi 7 + Bluetooth 5.4'
    },
    description: 'Бело-серебристая материнская плата премиум-серии со встроенным Wi-Fi 7 и усиленной VRM системой.'
  },
  {
    id: 'p8',
    name: 'Материнская плата MSI MAG B650 TOMAHAWK WIFI',
    category: 'motherboard',
    brand: 'MSI',
    price: 24990,
    rating: 4.8,
    reviewsCount: 110,
    image: '/images/msi_mag_b650_tomahawk.png',
    badge: 'Хит',
    inStock: true,
    socket: 'AM5',
    formFactor: 'ATX',
    memoryType: 'DDR5',
    specs: {
      'Сокет': 'AM5',
      'Чипсет': 'AMD B650',
      'Форм-фактор': 'ATX',
      'Питание': '14+2+1 фаз 80A'
    },
    description: 'Надежная плата для процессоров Ryzen 7000/8000/9000 с мощными радиаторами и современными портами.'
  },

  // RAM
  {
    id: 'p9',
    name: 'Оперативная память G.Skill Trident Z5 RGB DDR5 6000MHz 64GB (2x32GB) White',
    category: 'ram',
    brand: 'G.Skill',
    price: 27990,
    oldPrice: 30990,
    rating: 5.0,
    reviewsCount: 73,
    image: '/images/gskill_trident_z5_rgb.png',
    badge: 'Хит',
    inStock: true,
    memoryType: 'DDR5',
    specs: {
      'Объем': '64 ГБ (2 x 32 ГБ)',
      'Тип памяти': 'DDR5',
      'Частота': '6000 МГц',
      'Тайминги': 'CL30-40-40-96',
      'Напряжение': '1.35 В',
      'Поддержка профилей': 'Intel XMP 3.0 / AMD EXPO'
    },
    description: 'Эксклюзивный комплект оперативной памяти в стильном белом корпусе с управляемой RGB подсветкой.'
  },
  {
    id: 'p10',
    name: 'Оперативная память Kingston FURY Renegade RGB DDR5 7200MHz 32GB (2x16GB)',
    category: 'ram',
    brand: 'Kingston',
    price: 21990,
    rating: 4.9,
    reviewsCount: 41,
    image: '/images/kingston_fury_renegade.png',
    inStock: true,
    memoryType: 'DDR5',
    specs: {
      'Объем': '32 ГБ (2 x 16 ГБ)',
      'Частота': '7200 МГц',
      'Тайминги': 'CL38'
    },
    description: 'Суперскоростные модули для энтузиастов оверклокинга на сокетах LGA1700 и AM5.'
  },

  // Storage
  {
    id: 'p11',
    name: 'SSD накопитель Samsung 990 PRO M.2 NVMe PCIe 4.0 2TB',
    category: 'storage',
    brand: 'Samsung',
    price: 22990,
    oldPrice: 25990,
    rating: 4.9,
    reviewsCount: 210,
    image: '/images/samsung_990_pro.png',
    badge: 'Хит',
    inStock: true,
    specs: {
      'Объем': '2000 ГБ (2 ТБ)',
      'Форм-фактор': 'M.2 2280',
      'Интерфейс': 'PCIe 4.0 x4 NVMe 2.0',
      'Скорость чтения': 'до 7450 МБ/с',
      'Скорость записи': 'до 6900 МБ/с',
      'Ресурс (TBW)': '1200 ТБ'
    },
    description: 'Самый популярный и надежный NVMe SSD диск для мгновенной загрузки операционной системы и игр.'
  },
  {
    id: 'p12',
    name: 'SSD накопитель Crucial T700 PCIe 5.0 NVMe M.2 2TB с радиатором',
    category: 'storage',
    brand: 'Crucial',
    price: 34990,
    rating: 4.8,
    reviewsCount: 29,
    image: '/images/storage.png',
    badge: 'Новинка',
    inStock: true,
    specs: {
      'Объем': '2 ТБ',
      'Интерфейс': 'PCIe 5.0 x4',
      'Скорость чтения': 'до 12400 МБ/с',
      'Скорость записи': 'до 11800 МБ/с'
    },
    description: 'Рекордная скорость чтения свыше 12 000 МБ/с благодаря интерфейсу PCIe Gen5.'
  },

  // Power Supplies
  {
    id: 'p13',
    name: 'Блок питания Corsair RM1000x Shift 1000W 80 PLUS Gold ATX 3.0 White',
    category: 'psu',
    brand: 'Corsair',
    price: 23990,
    oldPrice: 26990,
    rating: 4.9,
    reviewsCount: 67,
    image: '/images/corsair_rm1000x_shift.png',
    badge: 'Хит',
    inStock: true,
    wattage: 1000,
    specs: {
      'Мощность': '1000 Вт',
      'Сертификат': '80 PLUS Gold',
      'Модульность': 'Полностью модульный (Shift боковые разъемы)',
      'Стандарт': 'ATX 3.0 (12VHPWR кабель в комплекте)',
      'Цвет': 'Белый'
    },
    description: 'Инновационный блок питания с боковым расположением разъемов для максимально удобного кабель-менеджмента.'
  },
  {
    id: 'p14',
    name: 'Блок питания Deepcool PX1200G 1200W 80 PLUS Gold ATX 3.0',
    category: 'psu',
    brand: 'Deepcool',
    price: 21990,
    rating: 4.8,
    reviewsCount: 44,
    image: '/images/deepcool_px1200g.png',
    inStock: true,
    wattage: 1200,
    specs: {
      'Мощность': '1200 Вт',
      'Сертификат': '80 PLUS Gold',
      'Стандарт': 'ATX 3.0'
    },
    description: 'Мощнейший БП для систем с RTX 4090 и мощным разгоном процессора.'
  }
];

export const BENEFITS: Benefit[] = [
  {
    id: 'assortment',
    title: 'Широкий ассортимент',
    description: 'Более 15 000 оригинальных комплектующих в наличии на складе. От базовых планок памяти до редких флагманских видеокарт.',
    iconName: 'Layers',
    stat: '15,000+'
  },
  {
    id: 'quality',
    title: 'Только проверенные комплектующие',
    description: '100% официальная продукция от вендоров ASUS, MSI, Gigabyte, Intel, AMD с жестким контролем серийных номеров.',
    iconName: 'ShieldCheck',
    stat: '100% Оригинал'
  },
  {
    id: 'selection_help',
    title: 'Помощь в подборе',
    description: 'Интерактивный конфигуратор совместимости и персональные консультации инженеров по сборке оптимального ПК.',
    iconName: 'Cpu',
    stat: '24/7 Эксперты'
  },
  {
    id: 'warranty',
    title: 'Официальная гарантия',
    description: 'До 5 лет гарантии на товары, собственное гарантийное обслуживание и экспресс-замена без лишних задержек.',
    iconName: 'Award',
    stat: 'До 5 лет'
  },
  {
    id: 'fast_delivery',
    title: 'Быстрая доставка',
    description: 'Курьерская экспресс-доставка за 2 часа по городу и надежная страховая доставка по всей стране.',
    iconName: 'Truck',
    stat: 'от 2 часов'
  }
];

export const FAQ_ITEMS = [
  {
    q: 'Как проверить совместимость комплектующих при самостоятельной сборке?',
    a: 'Воспользуйтесь нашим интерактивным «Конфигуратором ПК» на сайте. Система автоматически проверяет сокет процессора, тип оперативной памяти, габариты видеокарты и необходимую мощность блока питания.'
  },
  {
    q: 'Предоставляется ли официальная гарантия на товары?',
    a: 'Да, на все товары из каталога PCMarket распространяется полноценная официальная гарантия производителя (от 12 до 60 месяцев). С каждым заказом вы получаете гарантийный талон и кассовый чек.'
  },
  {
    q: 'Можно ли заказать сборку компьютера из выбранных комплектующих?',
    a: 'Да! При оформлении заказа или создании сборки в Конфигураторе вы можете добавить услугу «Профессиональная сборка и стресс-тестирование». Наши инженеры соберут ПК с идеальным кабель-менеджментом.'
  },
  {
    q: 'Каковы условия и сроки доставки?',
    a: 'По Москве и Санкт-Петербургу действует экспресс-доставка за 2-4 часа. По другим регионам отправляем транспортными компаниями (СДЭК, Яндекс Доставка) в противоударной упаковке со страховкой.'
  },
  {
    q: 'Какие способы оплаты доступны?',
    a: 'Вы можете оплатить банковской картой онлайн, по счету для юридических лиц, наличными/картой при получении, а также в рассрочку или кредит без первоначального взноса.'
  }
];
