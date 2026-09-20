import Intro from '@/components/Intro';

/**
 * Главная: заставка (арка с девушкой, влёт камеры в окно) и открытый
 * ею основной сайт — заголовок и ряд медальонов. Кейсы проектов
 * появятся отдельными страницами, когда в lib/projects.ts будут
 * заполнены слоты.
 */
export default function HomePage() {
  return <Intro />;
}
