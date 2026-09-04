import Figure from './Figure';
import { DIRECTIONS, DIRECTIONS_NOTE } from '@/lib/content';
import type { MediaKey } from '@/lib/media';

/* Каждое направление — отдельная глава со своей композицией и тоном,
   а не карточка в общем ряду. */
const LAYOUTS = ['chapter--left', 'chapter--right chapter--wide', 'chapter--dark'] as const;

export default function Directions() {
  return (
    <section className="directions" id="directions">
      <div className="shell">
        <div className="section-head reveal">
          <span className="section-head__index">02</span>
          <span className="label">Направления</span>
        </div>
      </div>

      {DIRECTIONS.map((direction, index) => (
        <article className={`chapter ${LAYOUTS[index]}`} key={direction.index}>
          <div className="shell grid">
            <Figure
              slot={direction.slot as MediaKey}
              className="chapter__media"
              parallax
              zoom
              sizes="(min-width: 900px) 60vw, 100vw"
            />

            <div className="chapter__body reveal">
              <span className="chapter__index">{direction.index}</span>
              <h3 className="h2">{direction.title}</h3>
              <p className="chapter__lead">{direction.lead}</p>
              <p className="chapter__text">{direction.text}</p>
              <ul className="chapter__tags">
                {direction.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ))}

      <div className="shell">
        <p className="directions__note reveal">{DIRECTIONS_NOTE}</p>
      </div>
    </section>
  );
}
