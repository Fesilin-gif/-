import React from 'react';
import { ShieldCheck, Award, Cpu, Truck, Users, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Banner Header */}
        <div className="bg-[#0F1115] text-white p-8 sm:p-12 clip-chamfer-tr-bl shadow-2xl relative border border-slate-800">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-[#1E222A] text-[#FF5500] border border-slate-700 px-3 py-1 font-mono text-xs font-bold uppercase clip-badge-slant">
              <Cpu className="w-3.5 h-3.5" />
              <span>// ABOUT_PCMARKET // HARDWARE_EXPERTS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              О компании <span className="text-[#FF5500]">PCMarket</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              PCMarket — ведущий гипермаркет компьютерной техники и высокопроизводительных комплектующих. Мы объединяем энтузиастов гейминга, профессиональных инженеров и крупнейших мировых производителей.
            </p>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
          <div className="bg-white p-6 border border-slate-200 clip-button-tech shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-[#FF5500]">12 ЛЕТ</div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">На рынке с 2014 года</div>
          </div>

          <div className="bg-white p-6 border border-slate-200 clip-button-tech shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-[#0F1115]">85 000+</div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Собранных компьютеров</div>
          </div>

          <div className="bg-white p-6 border border-slate-200 clip-button-tech shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-[#FF5500]">15 000+</div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Товаров в наличии</div>
          </div>

          <div className="bg-white p-6 border border-slate-200 clip-button-tech shadow-sm">
            <div className="text-3xl sm:text-4xl font-black text-[#0F1115]">100%</div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Официальная гарантия</div>
          </div>
        </div>

        {/* Company Principles */}
        <div className="bg-white border border-slate-200 p-8 clip-button-tech shadow-sm space-y-6">
          <h2 className="text-2xl font-black uppercase text-[#0F1115]">
            Наши стандарты работы
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 border border-slate-200 clip-button-tech space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#FF5500]" />
              <h3 className="font-extrabold text-sm uppercase text-[#0F1115]">
                Входной контроль качества
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Каждая партия материнских плат, процессоров и видеокарт проходит тестирование на стендах перед отправкой клиентам.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 clip-button-tech space-y-2">
              <Award className="w-8 h-8 text-[#FF5500]" />
              <h3 className="font-extrabold text-sm uppercase text-[#0F1115]">
                Прямые контракты
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Сотрудничаем с официальными дистрибьюторами ASUS, MSI, Gigabyte, Kingston, Deepcool, Corsair, гарантируя отсутствие подделок.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 clip-button-tech space-y-2">
              <Truck className="w-8 h-8 text-[#FF5500]" />
              <h3 className="font-extrabold text-sm uppercase text-[#0F1115]">
                Собственная логистика
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Специализированная ударопрочная термоупаковка со страховкой полного груза для бережной транспортировки.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
