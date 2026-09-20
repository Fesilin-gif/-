import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Onest } from 'next/font/google';

import './globals.css';
import './scene.css';

/* Антиква на заголовке, гротеск на интерфейсе. Обе с кириллицей. */
const serif = Cormorant_Garamond({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-serif',
});

const sans = Onest({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-sans',
});

/* ЗАПОЛНИТЬ перед публикацией: имя, описание и домен.
   Здесь намеренно нет придуманного названия. */
export const metadata: Metadata = {
  title: 'Портфолио',
  description: 'Личный сайт-портфолио: выбор проекта.',
};

export const viewport: Viewport = {
  themeColor: '#fefefe',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Синхронный скрипт: ставит на <html> класс .js, только если движение
 * разрешено. По этому классу CSS выбирает режим страницы (заставка
 * с влётом или сразу открытый сайт), а Intro — играть ли сам влёт.
 * Скрипт выполняется до первой отрисовки, поэтому раскладка не мигает.
 */
const MOTION_FLAG = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning — класс .js ставит инлайн-скрипт ниже,
       до гидратации, поэтому разметка сервера и клиента здесь
       расходится намеренно. */
    <html
      lang="ru"
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
