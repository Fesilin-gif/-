import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Ticket } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PCMARKET10') {
      setDiscountPercent(10);
      setPromoError('');
    } else {
      setPromoError('Неверный промокод (попробуйте PCMARKET10)');
    }
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);
    setTimeout(() => {
      onClearCart();
      setOrderComplete(false);
      setIsCheckout(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between relative border-l border-slate-300">
        
        {/* Header Bar */}
        <div className="bg-[#0F1115] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-lg font-black uppercase font-mono tracking-wide">
              Корзина товаров ({cartItems.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 clip-button-tech"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {orderComplete ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black uppercase text-[#0F1115]">
                Заказ №PC-{Math.floor(100000 + Math.random() * 900000)} оформлен!
              </h3>
              <p className="text-xs text-slate-600 font-mono max-w-xs mx-auto">
                Спасибо за заказ! Менеджер свяжется с вами в течение 5 минут для уточнения параметров доставки.
              </p>
            </div>
          ) : isCheckout ? (
            /* Checkout Form */
            <form onSubmit={handleConfirmOrder} className="space-y-4 font-mono text-xs">
              <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold uppercase text-slate-800">Быстрое оформление</span>
                <button
                  type="button"
                  onClick={() => setIsCheckout(false)}
                  className="text-[#FF5500] hover:underline"
                >
                  &larr; Назад к списку
                </button>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Имя и Фамилия</label>
                <input
                  type="text"
                  required
                  placeholder="Иван Иванов"
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-[#FF5500] clip-button-tech"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Номер телефона</label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-[#FF5500] clip-button-tech"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Способ получения</label>
                <select className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-[#FF5500] clip-button-tech">
                  <option>Курьерская экспресс-доставка (2 часа)</option>
                  <option>Самовывоз: Москва, ул. Тверская 12</option>
                  <option>Самовывоз: СПб, Невский пр. 48</option>
                  <option>Доставка по РФ (СДЭК)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-sm text-[#0F1115]">
                  <span>Итого к оплате:</span>
                  <span className="text-[#FF5500]">{total.toLocaleString()} ₽</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold text-xs uppercase tracking-wider clip-button-tech shadow-md"
                >
                  Подтвердить заказ
                </button>
              </div>
            </form>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="py-16 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold uppercase text-[#0F1115]">
                Ваша корзина пуста
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Добавьте комплектующие из каталога или воспользуйтесь конфигуратором сборки.
              </p>
            </div>
          ) : (
            /* Items List */
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-slate-50 border border-slate-200 p-3 clip-button-tech flex items-center justify-between gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    
                    className="w-14 h-14 object-contain bg-white p-1 clip-button-tech"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#0F1115] truncate">
                      {item.product.name}
                    </h4>
                    <span className="font-mono text-xs font-black text-[#FF5500]">
                      {item.product.price.toLocaleString()} ₽
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="font-bold px-1 text-[#0F1115]">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-6 h-6 bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 text-slate-400 hover:text-red-500 ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Summary Bar */}
        {cartItems.length > 0 && !isCheckout && !orderComplete && (
          <div className="bg-[#0F1115] text-white p-5 border-t border-slate-800 space-y-4 font-mono">
            {/* Promo code input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Промокод (PCMARKET10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 bg-[#1A1D24] border border-slate-700 text-xs p-2 text-white focus:outline-none focus:border-[#FF5500] clip-button-tech uppercase"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-[#FF5500] text-white text-xs font-bold uppercase clip-button-tech transition-colors"
              >
                ОК
              </button>
            </form>

            {promoError && (
              <p className="text-[10px] text-red-400">{promoError}</p>
            )}

            {discountPercent > 0 && (
              <p className="text-[11px] text-emerald-400">
                Применена скидка {discountPercent}%! (-{discountAmount.toLocaleString()} ₽)
              </p>
            )}

            {/* Total calculation */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-xs text-slate-400 uppercase">Итого к оплате:</span>
              <span className="text-2xl font-black text-[#FF5500]">
                {total.toLocaleString()} ₽
              </span>
            </div>

            <button
              onClick={() => setIsCheckout(true)}
              className="w-full py-3.5 bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold text-xs uppercase tracking-wider clip-button-tech shadow-md transition-all flex items-center justify-center"
            >
              <span>Оформить заказ</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
