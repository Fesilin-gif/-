import { contacts } from '@/data/site'
import { Reveal } from './Reveal'

export function Contacts() {
  return (
    <section className="section contacts" id="contacts">
      <div className="shell">
        <Reveal>
          <div className="section__head">
            <span className="micro">Контакты</span>
            <span className="micro">Работаем по России</span>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <h2 className="contacts__claim">Создадим декорацию для вашего события</h2>
          <a
            className="cta"
            href={`mailto:${contacts.email}?subject=${encodeURIComponent('Заявка с сайта PROJECT AMB')}`}
          >
            <span>Обсудить проект</span>
            <span className="cta__arrow" aria-hidden>
              →
            </span>
          </a>
        </Reveal>

        <Reveal delay={140}>
          <div className="contacts__grid">
            <dl className="contacts__col">
              <dt>Телефон</dt>
              <dd>
                <a href={contacts.phoneHref}>{contacts.phone}</a>
              </dd>
              <dd>
                <a href={contacts.whatsappHref} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </dd>
            </dl>

            <dl className="contacts__col">
              <dt>Почта</dt>
              <dd>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </dd>
            </dl>

            <dl className="contacts__col">
              <dt>Telegram</dt>
              <dd>
                <a href={contacts.telegramHref} target="_blank" rel="noreferrer">
                  {contacts.telegram}
                </a>
              </dd>
            </dl>

            <dl className="contacts__col">
              <dt>Студия</dt>
              <dd>{contacts.address}</dd>
            </dl>
          </div>
        </Reveal>

        <div className="footer micro">
          <span>© {new Date().getFullYear()} PROJECT AMB</span>
          <span style={{ display: 'flex', gap: '1.4rem' }}>
            {contacts.socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            ))}
          </span>
        </div>
      </div>
    </section>
  )
}
