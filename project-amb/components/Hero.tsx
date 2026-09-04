'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import Figure from './Figure';
import { HERO } from '@/lib/content';

/**
 * Первый экран.
 *
 * Одна оркестрованная сцена входа вместо набора разрозненных анимаций:
 * кадр раскрывается по вертикали, текст выходит стагером поверх.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-frame',
        { clipPath: 'inset(12% 0% 12% 0%)', opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.4 },
      )
        .to(
          '.reveal-hero',
          { opacity: 1, y: 0, duration: 1, stagger: 0.08 },
          0.18,
        )
        .fromTo(
          '.hero-frame img',
          { scale: 1.08 },
          { scale: 1, duration: 1.8, ease: 'power2.out' },
          0,
        );
    },
    { scope: root },
  );

  return (
    <section className="hero" ref={root}>
      <div className="shell grid hero__grid">
        <div className="hero__body">
          <p className="eyebrow hero__eyebrow reveal-hero">{HERO.eyebrow}</p>

          <h1 className="display hero__title reveal-hero">
            {HERO.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>

          <p className="lead hero__lead reveal-hero">{HERO.lead}</p>
          <p className="hero__note reveal-hero">{HERO.note}</p>

          <div className="hero__actions reveal-hero">
            <a className="btn" href={HERO.primary.href}>
              {HERO.primary.label}
            </a>
            <a className="link link--arrow" href={HERO.secondary.href}>
              {HERO.secondary.label}
            </a>
          </div>
        </div>

        <Figure
          slot="hero"
          className="hero__media hero-frame"
          priority
          sizes="(min-width: 900px) 55vw, 100vw"
        />
      </div>

      <div className="hero__meta" aria-hidden="true">
        <span className="hero__scroll">Прокрутите</span>
      </div>
    </section>
  );
}
