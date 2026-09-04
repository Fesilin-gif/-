'use client';

import { useId, useState } from 'react';
import { CONTACT } from '@/lib/content';

type Status = { tone: 'ok' | 'error'; text: string } | null;

/**
 * Форма заявки. Валидация — минимальная и понятная: имя и телефон.
 * Ошибка показывается рядом с полем, состояние отправки — на кнопке.
 */
export default function ContactForm() {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const nextErrors: Record<string, string> = {};
    if (!data.name?.trim()) nextErrors.name = 'Как к вам обращаться?';
    if (!data.phone?.trim()) nextErrors.phone = 'Оставьте телефон для связи';
    else if (data.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Проверьте номер телефона';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus({ tone: 'error', text: 'Заполните обязательные поля.' });
      return;
    }

    setPending(true);
    setStatus(null);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('request failed');

      form.reset();
      setStatus({ tone: 'ok', text: 'Заявка отправлена. Свяжемся с вами в ближайшее время.' });
    } catch {
      setStatus({
        tone: 'error',
        text: 'Не получилось отправить. Напишите нам в WhatsApp или Telegram — ответим там.',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="form__row">
        <div className="field">
          <label htmlFor={`${id}-name`}>Имя</label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Анна"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
          />
          {errors.name ? (
            <span className="field__error" id={`${id}-name-error`}>
              {errors.name}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={`${id}-phone`}>Телефон</label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 900 000-00-00"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
          />
          {errors.phone ? (
            <span className="field__error" id={`${id}-phone-error`}>
              {errors.phone}
            </span>
          ) : null}
        </div>
      </div>

      <div className="form__row">
        <div className="field">
          <label htmlFor={`${id}-type`}>Тип мероприятия</label>
          <select id={`${id}-type`} name="eventType" defaultValue={CONTACT.eventTypes[0]}>
            {CONTACT.eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={`${id}-date`}>Дата</label>
          <input id={`${id}-date`} name="date" type="date" />
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${id}-comment`}>Комментарий</label>
        <textarea
          id={`${id}-comment`}
          name="comment"
          rows={4}
          placeholder="Площадка, количество гостей, идеи и референсы"
        />
      </div>

      {status ? (
        <p className="form__status" data-tone={status.tone === 'error' ? 'error' : undefined} role="status">
          {status.text}
        </p>
      ) : null}

      <button className="btn btn--wide" type="submit" disabled={pending}>
        {pending ? 'Отправляем…' : CONTACT.submit}
      </button>

      <p className="form__consent">{CONTACT.consent}</p>
    </form>
  );
}
