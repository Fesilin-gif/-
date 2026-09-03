import { stats } from '@/data/site'
import { Reveal } from './Reveal'

export function About() {
  return (
    <section className="section" id="about">
      <div className="shell">
        <Reveal>
          <div className="section__head">
            <span className="micro">О нас</span>
            <span className="micro">Москва</span>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="about__claim">Мы создаём пространство события</h2>
        </Reveal>

        <div className="about__body">
          <Reveal delay={140} className="about__text">
            <p>
              PROJECT AMB придумывает, проектирует, изготавливает и монтирует декорации под
              конкретное событие. Не берём готовые решения со склада: каждая конструкция
              рисуется под площадку, сценарий и свет.
            </p>
            <p>
              У нас собственный цех, поэтому за арку, подвесную композицию или сценический
              модуль отвечает одна команда — от эскиза до вывоза конструкций на следующее
              утро после праздника.
            </p>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <div className="stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="stat__value">{stat.value}</div>
                <div className="stat__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
