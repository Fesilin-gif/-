import { NextResponse } from 'next/server';

/**
 * Приём заявки.
 *
 * Сейчас заявка валидируется и пишется в лог сервера — точка интеграции
 * с CRM, почтой или Telegram-ботом одна и находится ниже.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const name = String(payload.name ?? '').trim();
  const phone = String(payload.phone ?? '').trim();

  if (!name || phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 422 });
  }

  const lead = {
    name,
    phone,
    eventType: String(payload.eventType ?? '').trim() || null,
    date: String(payload.date ?? '').trim() || null,
    comment: String(payload.comment ?? '').trim().slice(0, 2000) || null,
    receivedAt: new Date().toISOString(),
  };

  // TODO: отправка в CRM / на почту / в Telegram-бот студии.
  console.info('[lead]', lead);

  return NextResponse.json({ ok: true });
}
