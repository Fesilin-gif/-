import Brand from './Brand';
import { CONTACTS, NAV } from '@/lib/content';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell">
        <p className="footer__wordmark">PROJECT AMB</p>

        <div className="footer__cols">
          <div className="footer__col">
            <h3>Студия</h3>
            <p style={{ color: 'var(--ink-on-dark-muted)', maxWidth: '32ch' }}>
              Создание, изготовление и монтаж декораций для свадеб, детских праздников,
              шоу, корпоративных и частных мероприятий.
            </p>
          </div>

          <div className="footer__col">
            <h3>Контакты</h3>
            <ul>
              <li>
                <a href={CONTACTS.phoneHref}>{CONTACTS.phoneLabel}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h3>Мессенджеры</h3>
            <ul>
              <li>
                <a href={CONTACTS.telegramHref} target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              </li>
              <li>
                <a href={CONTACTS.whatsappHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h3>Навигация</h3>
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <Brand />
          <span>© {year}. Все права защищены.</span>
        </div>
      </div>
    </footer>
  );
}
