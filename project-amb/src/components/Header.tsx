'use client'

import { useEffect, useState } from 'react'
import { nav } from '@/data/site'

/** Минимальная шапка: марка слева, четыре якоря справа. */
export function Header() {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="header" data-stuck={stuck}>
      <div className="shell header__inner">
        <a className="header__mark" href="#top" aria-label="PROJECT AMB — в начало">
          Project AMB
        </a>
        <nav className="header__nav" aria-label="Разделы">
          {nav.map((item) => (
            <a
              key={item.id}
              className="header__link"
              href={`#${item.id}`}
              data-secondary={item.id !== 'contacts'}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
