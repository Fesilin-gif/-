import ArchScene from '@/components/ArchScene';

/**
 * Главная — одна сцена: панорама на весь экран, отъезд камеры к арке,
 * заголовок и ряд медальонов. Кейсы проектов появятся отдельными
 * страницами, когда в lib/projects.ts будут заполнены слоты.
 */
export default function HomePage() {
  return <ArchScene />;
}
