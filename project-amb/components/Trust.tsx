import { TRUST } from '@/lib/content';

/** Блок доверия сделан редакционно: крупный тезис и линейка пунктов,
    без иконок и карточек. */
export default function Trust() {
  return (
    <section className="section" id="trust">
      <div className="shell grid trust__grid">
        <div className="trust__head reveal">
          <div className="section-head">
            <span className="section-head__index">{TRUST.index}</span>
            <span className="label">{TRUST.label}</span>
          </div>
        </div>

        <h2 className="h2 trust__title reveal">{TRUST.title}</h2>

        <div className="trust__list">
          {TRUST.points.map((point) => (
            <article className="trust__item reveal" key={point.no}>
              <span className="trust__no">{point.no}</span>
              <div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="trust__closing reveal">{TRUST.closing}</p>
      </div>
    </section>
  );
}
