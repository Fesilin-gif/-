'use client';

import Link from 'next/link';

import { PROJECTS, ordinal, type Project } from '@/lib/projects';

type Props = {
  /** id выбранного медальона: помимо визуальной отметки, определяет
   *  вид в проёме арки (см. ArchScene). */
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
  /* Доступное имя нужно даже пустому слоту — иначе кнопка для
     скринридера безымянна. Порядковый номер, а не выдуманное
     название: единственное, что о слоте известно наверняка. */
  const label = project.title ?? `Проект ${ordinal(index)}`;
  const hasCaption = Boolean(project.title || project.summary);

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

      {hasCaption ? (
        <span className="medallion__caption">
          {project.title ? <span className="medallion__title">{project.title}</span> : null}
          {project.summary ? <span className="medallion__note">{project.summary}</span> : null}
        </span>
      ) : null}
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
