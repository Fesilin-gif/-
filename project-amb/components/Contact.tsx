import ContactForm from './ContactForm';
import { CONTACT, CONTACTS } from '@/lib/content';

/** Финальная секция: слева — обращение и прямые контакты, справа — форма. */
export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="shell grid">
        <div className="contact__body">
          <div className="section-head reveal">
            <span className="section-head__index">{CONTACT.index}</span>
            <span className="label">{CONTACT.label}</span>
          </div>

          <h2 className="h2 contact__title reveal">{CONTACT.title}</h2>
          <p className="lead contact__lead reveal">{CONTACT.lead}</p>

          <div className="contact__actions reveal">
            <a className="btn btn--ghost" href={CONTACTS.whatsappHref} target="_blank" rel="noopener noreferrer">
              {CONTACT.whatsapp}
            </a>
          </div>

          <div className="contact__direct reveal">
            <a href={CONTACTS.phoneHref}>{CONTACTS.phoneLabel}</a>
            <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
            <a href={CONTACTS.telegramHref} target="_blank" rel="noopener noreferrer">
              Telegram {CONTACTS.telegramLabel}
            </a>
            <span className="muted">{CONTACTS.city}</span>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
