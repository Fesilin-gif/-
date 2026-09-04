import Hero from '@/components/Hero';
import Manifest from '@/components/Manifest';
import Directions from '@/components/Directions';
import Projects from '@/components/Projects';
import Trust from '@/components/Trust';
import Statement from '@/components/Statement';
import Process from '@/components/Process';
import Team from '@/components/Team';
import Contact from '@/components/Contact';

/**
 * Ритм страницы: плотный кадр → воздух → главы направлений → портфолио →
 * текстовый разворот доверия → эмоциональная пауза → процесс → люди → заявка.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifest />
      <Directions />
      <Projects />
      <Trust />
      <Statement />
      <Process />
      <Team />
      <Contact />
    </>
  );
}
