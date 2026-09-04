import Figure from './Figure';
import { TEAM } from '@/lib/content';
import type { MediaKey } from '@/lib/media';

/** Роли, а не выдуманные имена и лица: слоты ждут реальных фотографий. */
export default function Team() {
  return (
    <section className="section" id="team">
      <div className="shell grid">
        <div className="team__head reveal">
          <div className="section-head">
            <span className="section-head__index">{TEAM.index}</span>
            <span className="label">{TEAM.label}</span>
          </div>
          <h2 className="h2 team__title">{TEAM.title}</h2>
          <p className="team__lead">{TEAM.lead}</p>
        </div>

        <div className="team__list">
          {TEAM.members.map((member) => (
            <article className="team__member reveal" key={member.role}>
              <Figure
                slot={member.slot as MediaKey}
                zoom
                sizes="(min-width: 900px) 24vw, 45vw"
              />
              <h3 className="team__role">{member.role}</h3>
              <p>{member.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
