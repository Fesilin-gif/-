import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Building, Navigation } from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '', city: 'Москва' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', phone: '', message: '', city: 'Москва' });
    }, 4000);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Banner */}
        <div className="bg-[#0F1115] text-white p-8 sm:p-12 clip-chamfer-tr-bl shadow-2xl border border-slate-800">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-[#1E222A] text-[#FF5500] border border-slate-700 px-3 py-1 font-mono text-xs font-bold uppercase clip-badge-slant">
              <MapPin className="w-3.5 h-3.5" />
              <span>// CONTACT_HUB // STORES_AND_SERVICE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Контакты <span className="text-[#FF5500]">PCMarket</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm">
              Флагманские шоурумы, сервисные центры сборки и пункты самовывоза. Приезжайте в гости или свяжитесь с нами удобным способом.
            </p>
          </div>
        </div>

        {/* Grid: Store Locations & Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Store Info Cards */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Moscow Store */}
            <div className="bg-white border border-slate-200 p-6 clip-button-tech shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-[#FF5500]" />
                  <h3 className="font-extrabold text-base text-[#0F1115] uppercase">
                    Флагманский магазин — Москва
                  </h3>
                </div>
                <span className="font-mono text-[10px] bg-[#FF5500] text-white px-2 py-0.5 clip-badge-slant font-bold">
                  ОТКРЫТО
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block mb-1">Адрес:</span>
                  <span className="font-bold text-slate-800">г. Москва, ул. Тверская, д. 12, стр. 1</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Режим работы:</span>
                  <span className="font-bold text-slate-800">Пн-Вс: 09:00 — 21:00</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Телефон:</span>
                  <a href="tel:88005553535" className="font-bold text-[#FF5500] hover:underline">
                    +7 (495) 800-35-35
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Услуги:</span>
                  <span className="text-slate-700">Шоурум, Сервис сборки, Выдача</span>
                </div>
              </div>
            </div>

            {/* Saint Petersburg Store */}
            <div className="bg-white border border-slate-200 p-6 clip-button-tech shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-[#FF5500]" />
                  <h3 className="font-extrabold text-base text-[#0F1115] uppercase">
                    Магазин и сервис — Санкт-Петербург
                  </h3>
                </div>
                <span className="font-mono text-[10px] bg-[#FF5500] text-white px-2 py-0.5 clip-badge-slant font-bold">
                  ОТКРЫТО
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block mb-1">Адрес:</span>
                  <span className="font-bold text-slate-800">г. Санкт-Петербург, Невский пр., д. 48</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Режим работы:</span>
                  <span className="font-bold text-slate-800">Пн-Вс: 10:00 — 21:00</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Телефон:</span>
                  <a href="tel:88005553535" className="font-bold text-[#FF5500] hover:underline">
                    +7 (812) 800-35-35
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Услуги:</span>
                  <span className="text-slate-700">Шоурум, Экспресс-сборка</span>
                </div>
              </div>
            </div>

            {/* Simulated Interactive Map Block */}
            <div className="bg-[#0F1115] text-white p-6 clip-button-tech border border-slate-800 relative overflow-hidden h-48 flex items-center justify-center">
              <div className="absolute inset-0 bg-dot-matrix-dark opacity-30"></div>
              <div className="relative z-10 text-center space-y-2">
                <Navigation className="w-8 h-8 text-[#FF5500] mx-auto animate-bounce" />
                <div className="font-mono text-xs font-bold uppercase text-white">
                  [ ИНТЕРАКТИВНАЯ КАРТА МАГАДИНОВ ]
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Интерактивная навигация для яндекс.карт и 2ГИС
                </p>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 p-6 clip-button-tech shadow-sm space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <span className="font-mono text-xs font-bold text-[#FF5500] uppercase block">
                  // FEEDBACK_FORM
                </span>
                <h3 className="text-lg font-black uppercase text-[#0F1115]">
                  Связаться с техническим экспертом
                </h3>
              </div>

              {sent ? (
                <div className="p-6 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono space-y-2 clip-button-tech">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <div className="font-bold text-sm uppercase">Заявка принята!</div>
                  <p>Мы перезвоним вам в течение 5 минут для консультации по комплектующим.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Александр"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#FF5500] clip-button-tech"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                      Телефон для связи
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 (999) 000-00-00"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#FF5500] clip-button-tech"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                      Выберите город
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#FF5500] clip-button-tech cursor-pointer font-mono"
                    >
                      <option>Москва</option>
                      <option>Санкт-Петербург</option>
                      <option>Другой город (доставка)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                      Сообщение / Пожелания по подбору
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Нужен ПК для 4K гейминга и 3D рендеринга с бюджетом около 200 000 руб..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#FF5500] clip-button-tech"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#FF5500] hover:bg-[#E04B00] text-white font-mono text-xs font-extrabold uppercase tracking-wider clip-button-tech shadow-md transition-all flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Запросить консультацию
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
