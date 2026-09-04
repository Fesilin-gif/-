export default function NotFound() {
  return (
    <section className="section shell" style={{ paddingTop: 'clamp(140px, 20vh, 240px)' }}>
      <p className="eyebrow">Ошибка 404</p>
      <h1 className="h2" style={{ marginTop: 24, maxWidth: '16ch' }}>
        Такой страницы нет
      </h1>
      <p className="lead muted" style={{ marginTop: 20, maxWidth: '40ch' }}>
        Возможно, ссылка устарела. Вернитесь на главную — там все направления и проекты.
      </p>
      <p style={{ marginTop: 36 }}>
        <a className="btn" href="/">
          На главную
        </a>
      </p>
    </section>
  );
}
