import Figure from './Figure';
import { PROJECTS } from '@/lib/content';
import type { MediaKey } from '@/lib/media';

/**
 * Портфолио как печатный разворот: широкий кадр, вертикаль со сдвигом,
 * кадр во всю ширину, затем два разного размера. Сетка 3×3 здесь была бы
 * каталогом, а не доказательством качества.
 */
export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="shell">
        <div className="projects__intro">
          <div className="section-head reveal">
            <span className="section-head__index">03</span>
            <span className="label">Наши проекты</span>
          </div>
        </div>

        <div className="projects__list">
          {PROJECTS.map((project) => (
            <article className={`project project--${project.size} reveal`} key={project.id}>
              <Figure
                slot={project.slot as MediaKey}
                className="project__media"
                parallax
                zoom
                sizes={project.size === 'full' ? '100vw' : '(min-width: 900px) 60vw, 100vw'}
              />

              <div className="project__body">
                <div className="project__meta">
                  <span className="project__type">{project.type}</span>
                  <span className="project__year">{project.year}</span>
                </div>
                <h3 className="project__title">{project.title}</h3>
                <p className="project__text">{project.text}</p>
                <a className="link link--arrow" href={`/projects/${project.id}`}>
                  Смотреть проект
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
