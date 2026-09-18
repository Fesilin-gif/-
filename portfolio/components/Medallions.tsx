'use client';

import Link from 'next/link';

import { EMPTY_SLOT_LABEL, PROJECTS, ordinal, type Project } from '@/lib/projects';

type Props = {
  /** id выбранного медальона — пока кейсов нет, выбор только визуальный. */
  selected: string | null;
  onSelect: (id: string) => void;
};

/**
 * Ряд медальонов под аркой.
 *
 * Пока у проекта нет страницы кейса (caseHref === null), медальон —
 * кнопка выбора: она отмечает проект и никуда не ведёт. Как только
 * в lib/projects.ts появится адрес, тот же медальон станет ссылкой,
 * и разметка вокруг не меняется.
 *
 * Реакция на наведение — короткая и локальная: подъём, масштаб и свет
 * на самом медальоне. Ничего не крутится и не играет само по себе.
 * На телефоне (hover: none) роль наведения берёт на себя выбор нажатием.
 */
export default function Medallions({ selected, onSelect }: Props) {
  return (
    <ul className="choice__row">
      {PROJECTS.map((project, index) => (
        <li className="choice__item" key={project.id}>
          <Medallion
            project={project}
            index={index}
            selected={selected === project.id}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}

function Medallion({
  project,
  index,
  selected,
  onSelect,
}: {
  project: Project;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const label = project.title ?? `${EMPTY_SLOT_LABEL} ${ordinal(index)}`;

  const body = (
    <>
      <span className="medallion__disc">
        {project.medallion ? (
          <img
            className="medallion__image"
            src={project.medallion.src}
            alt=""
            width={project.medallion.width}
            height={project.medallion.height}
            style={project.medallion.focus ? { objectPosition: project.medallion.focus } : undefined}
            loading="lazy"
            decoding="async"
          />
        ) : (
          /* Заглушка: медальон без картинки не должен быть дырой
             в композиции. Номер держит место до настоящего кадра. */
          <span className="medallion__blank" aria-hidden="true">
            {ordinal(index)}
          </span>
        )}
        <span className="medallion__ring" aria-hidden="true" />
      </span>

      <span className="medallion__caption">
        <span className="medallion__title">{project.title ?? EMPTY_SLOT_LABEL}</span>
        {project.summary ? <span className="medallion__note">{project.summary}</span> : null}
      </span>
    </>
  );

  if (project.caseHref) {
    return (
      <Link className="medallion" href={project.caseHref} aria-label={label}>
        {body}
      </Link>
    );
  }

  return (
    <button
      className="medallion"
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onSelect(project.id)}
    >
      {body}
    </button>
  );
}
