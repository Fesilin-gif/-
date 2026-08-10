import React from 'react';
import { CATEGORIES } from '../data/catalogData';
import { Cpu, Zap, Server, Layers, Disc, Shield } from 'lucide-react';

interface PopularCategoriesProps {
  onSelectCategory: (categorySlug: string) => void;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({ onSelectCategory }) => {
  const getCategoryVisual = (slug: string) => {
    switch (slug) {
      case 'cpu':
        return (
          <div className="w-10 h-10 bg-slate-100 group-hover:bg-orange-500 transition-colors rounded-sm flex items-center justify-center">
            <Cpu className="w-5 h-5 text-slate-800 group-hover:text-white transition-colors" />
          </div>
        );
      case 'gpu':
        return (
          <div className="w-12 h-8 bg-slate-100 group-hover:bg-orange-500 transition-colors rounded-sm flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-800 group-hover:text-white transition-colors" />
          </div>
        );
      case 'motherboard':
        return (
          <div className="w-10 h-10 rounded-sm border-2 border-slate-200 group-hover:border-orange-500 transition-colors flex items-center justify-center">
            <Server className="w-5 h-5 text-slate-800 group-hover:text-orange-500 transition-colors" />
          </div>
        );
      case 'ram':
        return (
          <div className="w-12 h-5 bg-slate-100 group-hover:bg-orange-500 transition-colors rounded-sm flex items-center justify-center">
            <Layers className="w-4 h-4 text-slate-800 group-hover:text-white transition-colors" />
          </div>
        );
      case 'storage':
        return (
          <div className="w-8 h-12 bg-slate-100 group-hover:bg-orange-500 transition-colors rounded-sm flex items-center justify-center">
            <Disc className="w-4 h-4 text-slate-800 group-hover:text-white transition-colors" />
          </div>
        );
      case 'psu':
        return (
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-slate-100 group-hover:bg-orange-500 transition-colors rounded-sm flex items-center justify-center">
            <Cpu className="w-5 h-5 text-slate-800 group-hover:text-white transition-colors" />
          </div>
        );
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-10 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-3">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter border-l-4 border-orange-500 pl-4 text-black">
          Популярные категории
        </h2>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-colors"
        >
          Все категории &rarr;
        </button>
      </div>

      {/* Grid of 6 Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((category) => {
          const isHot = category.slug === 'psu' || category.slug === 'gpu';
          return (
            <div
              key={category.id}
              onClick={() => onSelectCategory(category.slug)}
              className={`group bg-slate-50 border border-slate-100 p-4 hover:bg-black hover:border-black transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isHot ? 'bg-black border-black' : ''
              }`}
            >
              {isHot && (
                <div className="absolute top-0 right-0 p-1 bg-orange-500 text-[8px] text-white font-bold uppercase tracking-wider">
                  HOT
                </div>
              )}

              {/* Square Image / Visual Icon Container */}
              <div className="w-full aspect-square bg-white mb-3 p-3 flex items-center justify-center border border-slate-100 overflow-hidden relative">
                <img
                  src={category.image}
                  alt={category.name}
                  
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Title & Count */}
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${
                  isHot ? 'text-white' : 'text-black group-hover:text-white'
                }`}>
                  {category.name}
                </div>
                <div className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                  {category.count} моделей
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

