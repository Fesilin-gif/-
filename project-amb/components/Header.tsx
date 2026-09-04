'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACTS, NAV } from '@/lib/content';
import Brand from './Brand';

/**
 * Тонкая шапка: прозрачная над первым экраном, с бумажной подложкой ниже.
 * При скролле вниз уезжает, при скролле вверх возвращается — чтобы не
 * закрывать крупные кадры.
 */
export default function Header() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        const y = window.scrollY;
        setSolid(y > 24);
        setHidden(y > 560 && y > lastY.current + 4);
        lastY.current = y;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  /* Меню на весь экран не должно оставлять прокрутку под собой */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className={`header${solid ? ' is-solid' : ''}${hidden && !menuOpen ? ' is-hidden' : ''}`}>
        <div className="shell header__inner">
          <a href="/#main" aria-label="PROJECT AMB — на главную">
            <Brand />
          </a>

          <nav className="header__nav" aria-label="Основная навигация">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="btn header__cta" href="/#contact">
            Обсудить проект
          </a>

          <button
            type="button"
            className={`burger${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="mobile-menu" className={`menu${menuOpen ? ' is-open' : ''}`} inert={!menuOpen}>
        <div className="shell">
          <nav className="menu__list" aria-label="Мобильная навигация">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="menu__foot">
            <a className="btn btn--wide" href="/#contact" onClick={() => setMenuOpen(false)}>
              Обсудить проект
            </a>
            <a className="link" href={CONTACTS.phoneHref}>
              {CONTACTS.phoneLabel}
            </a>
            <a className="link" href={`mailto:${CONTACTS.email}`}>
              {CONTACTS.email}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
