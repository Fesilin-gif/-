'use client'

import { useEffect, useRef, useState } from 'react'
import { categories, projects, type Project } from '@/data/site'
import { useQuality } from '@/lib/quality'
import { Reveal } from './Reveal'

function ProjectCard({ project, still }: { project: Project; still: string | null }) {
  const source = project.image ?? still
  return (
    <article className={`project${project.wide ? ' project--wide' : ''}`}>
      <div className="project__frame">
        <span className="project__index micro">{project.index}</span>
        {source ? (
          <img
            className="project__image"
            src={source}
            alt={`${project.title} — декорация PROJECT AMB`}
            data-loaded="true"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>

      <div className="project__meta">
        <h4 className="project__title">{project.title}</h4>
        <span className="micro">{project.year}</span>
      </div>

      <p className="project__text">{project.description}</p>

      <div className="project__facts">
        <span className="project__fact">{project.place}</span>
        {project.facts.map((fact) => (
          <span className="project__fact" key={fact.label}>
            {fact.label} <b>{fact.value}</b>
          </span>
        ))}
      </div>
    </article>
  )
}

/**
 * Галерея проектов по направлениям.
 *
 * Визуалы — студийные рендеры декораций, которые считаются один раз, когда
 * галерея впервые подходит к экрану. Дальше это обычные картинки: при
 * прокрутке ничего не пересчитывается.
 */
export function Projects() {
  const quality = useQuality()
  const root = useRef<HTMLDivElement>(null)
  const [stills, setStills] = useState<Record<string, string>>({})

  useEffect(() => {
    const el = root.current
    if (!el) return

    const jobs = projects
      .filter((project) => !project.image)
      .map((project) => ({
        id: project.id,
        kind: project.decor,
        aspect: project.wide ? 21 / 9 : 4 / 3,
      }))

    let cancelled = false
    const start = async () => {
      // three.js подгружается только здесь — на первом экране галереи ещё нет.
      const { renderStills } = await import('@/lib/decorStill')
      if (cancelled) return
      await renderStills(
        jobs,
        (id, url) => {
          if (!cancelled) setStills((prev) => (prev[id] === url ? prev : { ...prev, [id]: url }))
        },
        { width: quality.still.width, detail: quality.still.detail },
      )
    }

    if (typeof IntersectionObserver === 'undefined') {
      void start()
      return () => {
        cancelled = true
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          void start()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [quality.still])

  return (
    <section className="section" id="projects" ref={root}>
      <div className="shell">
        <Reveal>
          <div className="section__head">
            <span className="micro">Проекты</span>
            <span className="micro">{projects.length} работ</span>
          </div>
          <h2 className="section__title">Декорации, которые уже состоялись</h2>
        </Reveal>

        {categories.map((category) => (
          <div className="category" key={category.id}>
            <Reveal>
              <div className="category__head">
                <h3 className="category__title">{category.title}</h3>
                <p className="category__caption">{category.caption}</p>
              </div>
            </Reveal>

            <div className="grid">
              {projects
                .filter((project) => project.category === category.id)
                .map((project, index) => (
                  <Reveal
                    key={project.id}
                    delay={index * 90}
                    className={project.wide ? 'project--wide' : ''}
                  >
                    <ProjectCard project={project} still={stills[project.id] ?? null} />
                  </Reveal>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
