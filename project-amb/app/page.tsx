import Hero from '@/components/Hero';
import Manifest from '@/components/Manifest';
import Directions from '@/components/Directions';
import Trust from '@/components/Trust';
import Statement from '@/components/Statement';
import Process from '@/components/Process';
import Contact from '@/components/Contact';

/**
 * Ритм страницы: плотный кадр → воздух → главы направлений →
 * текстовый разворот доверия → эмоциональная пауза → процесс → заявка.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifest />
      <Directions />
      <Trust />
      <Statement />
      <Process />
      <Contact />
    </>
  );
}
