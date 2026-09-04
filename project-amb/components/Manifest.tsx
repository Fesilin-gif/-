import { MANIFEST } from '@/lib/content';

/** Короткий разворот-подход сразу после первого экрана. */
export default function Manifest() {
  return (
    <section className="section section--tight" id="approach">
      <div className="shell grid">
        <div className="manifest__head reveal">
          <div className="section-head">
            <span className="section-head__index">{MANIFEST.index}</span>
            <span className="label">{MANIFEST.label}</span>
          </div>
        </div>

        <p className="manifest__lead reveal">{MANIFEST.lead}</p>

        <div className="manifest__points">
          {MANIFEST.points.map((point) => (
            <article className="manifest__point reveal" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
