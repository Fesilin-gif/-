'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Появление блока при первом попадании в кадр.
 *
 * Один IntersectionObserver на элемент, дальше он отключается — во время
 * прокрутки не выполняется никакого кода. При включённом «уменьшить
 * движение» блок сразу показан (это описано в CSS).
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  id,
}: {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      id={id}
      ref={ref}
      className={`reveal ${className}`.trim()}
      data-shown={shown}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
