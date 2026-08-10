import React from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

interface FinalCTAProps {
  onGoToCatalog: () => void;
  onOpenBuilder: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onGoToCatalog,
  onOpenBuilder
}) => {
  return (
    <section className="py-12 lg:py-16 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-black text-white p-8 sm:p-10 lg:p-12 relative shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          
          {/* Inner clip for background elements so they don't spill out of the black box */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Background dot matrix */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            ></div>
            {/* Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
          </div>

          {/* Copy */}
          <div className="space-y-2 text-left relative z-10 max-w-2xl">
            <div className="text-[10px] font-bold text-orange-500 font-mono uppercase tracking-[0.2em]">
              Hardware Station 2026
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white">
              Готовы собрать компьютер <span className="text-orange-500">своей мечты?</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
              Выбирайте оригинальные комплектующие в каталоге или воспользуйтесь конфигуратором с автоматической проверкой совместимости.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={onGoToCatalog}
              className="bg-orange-500 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
              style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)' }}
            >
              <span>Смотреть товары</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenBuilder}
              className="border border-slate-700 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
              style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <Wrench className="w-4 h-4 text-orange-500" />
              <span>Конфигуратор</span>
            </button>
          </div>
        </div>
      </div>

      {/* Character animated slide-in, positioned relative to the full section */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute top-1/2 -translate-y-[35%] right-[-10px] lg:right-[-20px] pointer-events-none z-[50] hidden md:flex justify-center items-center"
      >
        <img 
          src="/images/pc_builder_point_left.png" 
          alt="PC Builder" 
          className="w-[190px] lg:w-[220px] object-contain drop-shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />
      </motion.div>
    </section>
  );
};
