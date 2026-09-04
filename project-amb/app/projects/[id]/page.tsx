import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Figure from '@/components/Figure';
import { PROJECTS, PROCESS } from '@/lib/content';
import type { MediaKey } from '@/lib/media';

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const project = PROJECTS.find((item) => item.id === id);
  if (!project) return { title: 'Проект не найден — PROJECT AMB' };

  return {
    title: `${project.title} — PROJECT AMB`,
    description: project.text,
    openGraph: { title: project.title, description: project.text },
  };
}

/** Страница проекта: кадр во всю ширину, метаданные строкой, короткий текст. */
export default async function ProjectPage({ params }: Params) {
  const { id } = await params;
  const project = PROJECTS.find((item) => item.id === id);
  if (!project) notFound();

  const index = PROJECTS.indexOf(project);
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <article className="project-page">
      <div className="shell">
        <div className="project-page__head">
          <a className="link link--back" href="/#projects">
            Все проекты
          </a>
          <h1 className="display project-page__title">{project.title}</h1>
        </div>
      </div>

      <div className="shell">
        <Figure
          slot={project.slot as MediaKey}
          className="project-page__media"
          priority
          parallax
          sizes="100vw"
        />
      </div>

      <div className="shell grid project-page__body">
        <dl className="project-page__meta">
          <div>
            <dt>Тип события</dt>
            <dd>{project.type}</dd>
          </div>
          <div>
            <dt>Год</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Работы</dt>
            <dd>Концепция, проектирование, изготовление, монтаж</dd>
          </div>
        </dl>

        <div className="project-page__text">
          <p className="lead">{project.text}</p>
          <p className="muted">
            Проект вели по нашему стандартному циклу: {PROCESS.steps.map((s) => s.title.toLowerCase()).join(' → ')}.
            Материалы съёмки и полное описание добавим после согласования с заказчиком.
          </p>

          <div className="project-page__actions">
            <a className="btn" href="/#contact">
              Обсудить похожий проект
            </a>
            <a className="link link--arrow" href={`/projects/${next.id}`}>
              Следующий проект — {next.title}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
