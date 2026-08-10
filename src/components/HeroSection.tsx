import React from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { PcAssemblyAnimation } from './PcAssemblyAnimation';

interface HeroSectionProps {
  onGoToCatalog: () => void;
  onOpenBuilder: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGoToCatalog,
  onOpenBuilder
}) => {
  return (
    <section className="relative min-h-[440px] lg:min-h-[500px] bg-white text-slate-900 flex items-center border-b border-slate-100 py-10 lg:py-0 overflow-hidden">
      
      {/* Background Dot Matrix Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>

      {/* Skewed Right Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -skew-x-12 translate-x-20 pointer-events-none z-0 hidden lg:block"></div>
      
      {/* Orange Ring Halo Top Right */}
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 border-[40px] border-orange-500 opacity-10 rounded-full pointer-events-none z-0"></div>

      {/* Background Pixel Art Animation Layer */}
      <div className="absolute inset-0 w-full h-full z-[1] pointer-events-none opacity-[0.85] overflow-visible">
        <PcAssemblyAnimation />
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="max-w-3xl">
          
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-10 bg-orange-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-600">
              Next Gen Hardware
            </span>
          </div>

          {/* Display Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-black leading-[0.92] tracking-tighter mb-6 italic uppercase">
            Комплектующие<br />
            <span className="text-orange-500">для вашего</span><br />
            компьютера
          </h1>

          {/* Description */}
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-medium">
            Всё для сборки, модернизации и профессионального ремонта ПК. Только сертифицированные бренды, экспресс-доставка и официальная гарантия.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onGoToCatalog}
              className="bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors flex items-center gap-2"
              style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)' }}
            >
              <span>Перейти в каталог</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={onOpenBuilder}
              className="border-2 border-black text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2"
              style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <Wrench className="w-5 h-5 text-orange-500" />
              <span>Подобрать детали</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
