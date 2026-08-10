import React from 'react';
import { Product } from '../types';
import { X, Star, ShoppingBag, Wrench, ShieldCheck, Truck, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAddToBuilder: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onAddToBuilder
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 max-w-3xl w-full clip-dialog-tech shadow-2xl relative my-8 overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-[#0F1115] text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#FF5500] clip-badge-slant"></span>
            <span className="font-mono text-xs font-bold text-slate-300 uppercase">
              HARDWARE_SPEC_SHEET // {product.brand}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 clip-button-tech"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          
          {/* Image */}
          <div className="md:col-span-5 bg-slate-100 p-6 clip-button-tech flex items-center justify-center relative">
            {product.badge && (
              <span className="absolute top-3 left-3 bg-[#FF5500] text-white font-mono font-bold text-[10px] px-2.5 py-0.5 clip-badge-slant">
                {product.badge}
              </span>
            )}
            <img
              src={product.image}
              alt={product.name}
              
              className="max-w-full w-full max-h-64 object-contain"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
                <span className="font-bold text-[#0F1115] uppercase">{product.brand}</span>
                <span>•</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  <span className="font-bold">{product.rating}</span>
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-[#0F1115] uppercase tracking-wide">
                {product.name}
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="p-3 bg-slate-50 border border-slate-200 clip-button-tech flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-[#0F1115]">
                  {product.price.toLocaleString()} ₽
                </span>
                {product.oldPrice && (
                  <span className="ml-2 text-xs font-mono text-slate-400 line-through">
                    {product.oldPrice.toLocaleString()} ₽
                  </span>
                )}
              </div>

              <span className="text-xs font-mono font-bold text-emerald-600">
                ● В наличии в магазине
              </span>
            </div>

            {/* Specifications Table */}
            <div className="space-y-1 text-xs font-mono">
              <span className="block font-bold text-slate-800 uppercase text-[11px]">
                Характеристики:
              </span>
              <div className="bg-slate-50 p-3 border border-slate-200 space-y-1.5 max-h-40 overflow-y-auto">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-500">{key}:</span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white font-mono text-xs font-bold uppercase clip-button-tech flex items-center justify-center shadow-md"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                В корзину
              </button>

              <button
                onClick={() => {
                  onAddToBuilder(product);
                  onClose();
                }}
                className="py-3 bg-[#0F1115] hover:bg-[#1E222A] text-white font-mono text-xs font-bold uppercase clip-button-tech border border-slate-700 flex items-center justify-center"
              >
                <Wrench className="w-4 h-4 mr-2 text-[#FF5500]" />
                В сборку
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
