import Figure from './Figure';
import { STATEMENT } from '@/lib/content';

/** Разворот без интерфейса: только кадр и крупная фраза. */
export default function Statement() {
  return (
    <section className="statement">
      <div className="statement__bg">
        <Figure slot="statement" parallax sizes="100vw" />
      </div>
      <div className="statement__scrim" aria-hidden="true" />

      <div className="statement__inner">
        <div className="shell">
          <p className="statement__text reveal">
            {STATEMENT.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="statement__caption reveal">{STATEMENT.caption}</p>
        </div>
      </div>
    </section>
  );
}
