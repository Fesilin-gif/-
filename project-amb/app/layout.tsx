import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Onest } from 'next/font/google';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Motion from '@/components/Motion';
import { HERO } from '@/lib/content';

import './globals.css';
import './sections.css';

/* Антиква для крупных заголовков, гротеск — для интерфейса.
   Обе гарнитуры с кириллицей. */
const serif = Cormorant_Garamond({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

const sans = Onest({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://projectamb.ru'),
  title: 'PROJECT AMB — декорации для событий',
  description:
    'Студия PROJECT AMB создаёт, изготавливает и монтирует декорации для свадеб, детских праздников, шоу, корпоративных и частных мероприятий. От концепции до монтажа на площадке.',
  keywords: [
    'декорации для мероприятий',
    'оформление свадьбы',
    'детский праздник декорации',
    'сценические конструкции',
    'event-декор',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'PROJECT AMB',
    title: 'PROJECT AMB — создаём пространства для событий',
    description:
      'Декорации для свадеб, детских праздников, шоу и частных мероприятий: концепция, проектирование, изготовление, монтаж.',
    images: ['/media/hero.webp'],
  },
};

export const viewport: Viewport = {
  themeColor: '#f5f1ea',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Синхронный скрипт: ставит на <html> класс .js, только если анимация
 * разрешена. От него зависят стартовые состояния появления — без JS
 * или при prefers-reduced-motion контент виден сразу и ничего не мигает.
 */
const MOTION_FLAG = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning — класс .js ставит инлайн-скрипт ниже,
       до гидратации, поэтому разметка сервера и клиента здесь расходится
       намеренно. */
    <html
      lang="ru"
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body>
        <div className="grain" aria-hidden="true" />

        <div className="rail" aria-hidden="true">
          <span className="rail__line" />
          <span className="rail__text">{HERO.rail}</span>
        </div>

        <a className="skip-link" href="#main">
          К основному содержанию
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer />

        <Motion />
      </body>
    </html>
  );
}
