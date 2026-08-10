import React from 'react';

export const WhyUsSection: React.FC = () => {
  const features = [
    {
      num: '01',
      title: 'Широкий выбор',
      desc: 'Более 15,000 позиций комплектующих'
    },
    {
      num: '02',
      title: 'Качество',
      desc: 'Только 100% оригинальная продукция'
    },
    {
      num: '03',
      title: 'Помощь',
      desc: 'Сборка ПК под ключ за 24 часа'
    },
    {
      num: '04',
      title: 'Гарантия',
      desc: 'Официальная гарантия до 36 месяцев'
    },
    {
      num: '05',
      title: 'Доставка',
      desc: 'Курьером за 2 часа или по всей РФ'
    }
  ];

  return (
    <section className="border-t border-b border-slate-100 bg-slate-50 px-4 sm:px-6 lg:px-12 py-8 max-w-7xl mx-auto my-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {features.map((feat) => (
          <div key={feat.num} className="flex flex-col gap-1.5 border-l-2 border-slate-200 pl-3 hover:border-orange-500 transition-colors">
            <div className="text-[10px] font-bold text-orange-500 font-mono uppercase tracking-widest">
              {feat.num}
            </div>
            <div className="text-xs sm:text-sm font-black uppercase italic text-black">
              {feat.title}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-medium">
              {feat.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

