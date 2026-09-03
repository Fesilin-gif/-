'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuality } from '@/lib/quality'

// three.js уезжает в отдельный чанк: разметка и типографика первого экрана
// не ждут загрузки 3D.
const HeroCanvas = dynamic(() => import('./hero/HeroCanvas'), { ssr: false })

const TAGS = ['Свадьбы', 'Детские праздники', 'Шоу', 'Event']

/**
 * Первый экран.
 *
 * WebGL здесь ровно один и только ради него: три белых объекта, мягкие
 * тени и лёгкий параллакс. Кадры считаются, только пока экран виден — как
 * только герой уходит вверх, рендер останавливается полностью.
 */
export function Hero() {
  const quality = useQuality()
  const section = useRef<HTMLElement>(null)
  const brand = useRef<HTMLHeadingElement>(null)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)

  // Значения читает цикл рендера, поэтому они живут в ref, а не в состоянии:
  // движение мыши не должно перерисовывать React-дерево.
  const pointer = useMemo(() => ({ x: 0, y: 0 }), [])
  const scroll = useMemo(() => ({ value: 0 }), [])

  useEffect(() => {
    const el = section.current
    if (!el) return

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => setActive(entries[0].isIntersecting), {
            threshold: 0.01,
          })
    observer?.observe(el)

    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const height = el.offsetHeight || window.innerHeight
        const progress = Math.min(1, Math.max(0, window.scrollY / height))
        scroll.value = progress
        if (brand.current) {
          brand.current.style.transform = `translate3d(0, ${progress * -60}px, 0)`
          brand.current.style.opacity = String(1 - progress * 0.9)
        }
      })
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer?.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pointer, scroll])

  return (
    <section className="hero" id="top" ref={section}>
      <div className="hero__canvas" aria-hidden data-ready={ready}>
        <HeroCanvas
          quality={quality}
          active={active}
          pointer={pointer}
          scroll={scroll}
          onReady={() => setReady(true)}
        />
      </div>

      <div className="shell hero__inner">
        <h1 className="hero__brand" ref={brand}>
          Project AMB
        </h1>
        <p className="hero__lead">Создаём декорации, которые становятся частью события.</p>
        <ul className="hero__tags" aria-label="Направления">
          {TAGS.map((tag) => (
            <li className="micro" key={tag}>
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <a className="hero__scroll micro" href="#projects">
        <span>Смотреть проекты</span>
        <span aria-hidden />
      </a>
    </section>
  )
}
