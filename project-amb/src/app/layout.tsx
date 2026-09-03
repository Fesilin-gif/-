import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/archivo'
import '@fontsource-variable/inter-tight'
import './globals.css'

export const metadata: Metadata = {
  title: 'PROJECT AMB — декорации для свадеб, детских праздников и шоу',
  description:
    'Студия PROJECT AMB разрабатывает, изготавливает и монтирует декорации для свадеб, детских праздников, шоу и корпоративных мероприятий. Полный цикл: концепция, проектирование, производство, монтаж.',
  keywords: [
    'декорации на мероприятие',
    'оформление свадьбы',
    'детский праздник декорации',
    'сценография',
    'изготовление декораций',
  ],
  openGraph: {
    title: 'PROJECT AMB',
    description: 'Создаём декорации, которые становятся частью события.',
    locale: 'ru_RU',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#e9e7e2',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
