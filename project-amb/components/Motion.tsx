'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Единый motion-слой страницы.
 *
 * Здесь ровно три приёма, и все медленные:
 *   1. появление блоков при скролле (opacity + translateY, стагер);
 *   2. лёгкий параллакс отдельных кадров;
 *   3. плавный скролл (Lenis).
 *
 * Всё выключается при prefers-reduced-motion — контент просто статичен.
 * Селекторы разрешаются явно через document, поэтому строковые селекторы
 * в gsap-вызовы не попадают и скоуп не нужен.
 */
export default function Motion() {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ——— Плавный скролл ——————————————————————————————— */
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3), // мягкий ease-out, без пружины
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    /* Якорные ссылки ведёт Lenis, иначе они «телепортируют» */
    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return;

      const url = new URL(anchor.href, window.location.href);
      const samePage =
        url.origin === window.location.origin && url.pathname === window.location.pathname;
      if (!samePage || !url.hash || url.hash === '#') return;

      const target = document.querySelector(url.hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80, duration: 1.2 });
    };
    document.addEventListener('click', onAnchorClick);

    /* ——— Появление ————————————————————————————————————
       Стартовое состояние задано в CSS через класс .js — здесь только выход. */
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const revealBatch = ScrollTrigger.batch(revealEls, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: true,
        }),
    });

    /* ——— Параллакс ————————————————————————————————————
       Только на крупных кадрах и только на широком экране: на телефоне
       он съедает кадр и ничего не добавляет композиции. */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax] img'));
      frames.forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: img.closest('[data-parallax]') as HTMLElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
      });
    });

    /* Шрифты приезжают позже разметки и сдвигают крупные заголовки */
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener('click', onAnchorClick);
      gsap.ticker.remove(ticker);
      revealBatch.forEach((trigger) => trigger.kill());
      mm.revert();
      lenis.destroy();
    };
  });

  return null;
}
