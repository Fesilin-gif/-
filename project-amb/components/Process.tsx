import { PROCESS } from '@/lib/content';

/** Этапы работы: крупная нумерация и вертикальный ритм,
    заголовок «залипает» слева на десктопе. */
export default function Process() {
  return (
    <section className="section" id="process">
      <div className="shell grid">
        <div className="process__aside reveal">
          <div className="section-head">
            <span className="section-head__index">{PROCESS.index}</span>
            <span className="label">{PROCESS.label}</span>
          </div>
          <h2 className="h3 process__title">{PROCESS.title}</h2>
        </div>

        <ol className="process__steps">
          {PROCESS.steps.map((step) => (
            <li className="process__step reveal" key={step.no}>
              <span className="process__no" aria-hidden="true">
                {step.no}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
