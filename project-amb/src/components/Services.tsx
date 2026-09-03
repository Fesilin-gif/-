import { services } from '@/data/site'
import { Reveal } from './Reveal'

export function Services() {
  return (
    <section className="section" id="services">
      <div className="shell">
        <Reveal>
          <div className="section__head">
            <span className="micro">Услуги</span>
            <span className="micro">Полный цикл</span>
          </div>
          <h2 className="section__title">От идеи до вывоза конструкций</h2>
        </Reveal>

        <div className="services">
          {services.map((service, index) => (
            <Reveal key={service.index} delay={index * 70}>
              <div className="service">
                <span className="service__index">{service.index}</span>
                <h3 className="service__title">{service.title}</h3>
                <p className="service__text">{service.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
