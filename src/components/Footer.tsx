import React from 'react';
import { PageType } from '../types';

interface FooterProps {
  setCurrentPage: (page: PageType) => void;
  openBuilder: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage, openBuilder }) => {
  return (
    <footer className="bg-black text-slate-300 border-t-2 border-orange-500 pt-10 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Logo & Description */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                PC
              </div>
              <span className="text-xl font-black italic tracking-tighter text-white uppercase">
                PCMarket
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Гипермаркет высокопроизводительных комплектующих для компьютерных систем, игровых ПК и рабочих станций. Официальная гарантия и экспресс-доставка.
            </p>

            <div className="text-[10px] font-mono text-orange-500 font-bold uppercase tracking-wider pt-1">
              Москва // СПб // Доставка по РФ
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-2">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider border-b border-slate-800 pb-1.5">
              Навигация
            </h4>
            <ul className="space-y-1.5 text-slate-400 font-medium">
              <li>
                <button onClick={() => setCurrentPage('home')} className="hover:text-orange-500 transition-colors">
                  Главная страница
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('catalog')} className="hover:text-orange-500 transition-colors">
                  Каталог комплектующих
                </button>
              </li>
              <li>
                <button onClick={openBuilder} className="hover:text-orange-500 text-orange-500 font-bold transition-colors">
                  Конфигуратор ПК
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('about')} className="hover:text-orange-500 transition-colors">
                  О компании PCMarket
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('faq')} className="hover:text-orange-500 transition-colors">
                  Частые вопросы (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('contacts')} className="hover:text-orange-500 transition-colors">
                  Контакты
                </button>
              </li>
            </ul>
          </div>

          {/* Hardware categories */}
          <div className="lg:col-span-3 space-y-2">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider border-b border-slate-800 pb-1.5">
              Категории
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>Процессоры Intel &amp; AMD</li>
              <li>Видеокарты RTX 40 &amp; RX 7000</li>
              <li>Материнские платы Z790/B650</li>
              <li>Оперативная память DDR5</li>
              <li>Скоростные SSD M.2 NVMe</li>
              <li>Блоки питания Gold/Platinum</li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="lg:col-span-2 space-y-2">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider border-b border-slate-800 pb-1.5">
              Контакты
            </h4>
            <a href="tel:88005553535" className="block text-orange-500 font-black text-sm hover:underline font-mono">
              8 (800) 555-35-35
            </a>
            <span className="block text-slate-400 text-[10px] font-mono">Пн-Вс: 09:00 — 21:00</span>
            <span className="block text-slate-400 text-[10px] font-mono">info@pcmarket.ru</span>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
          <div>
            © 2026 PCMarket. Все права защищены.
          </div>
          <div className="flex gap-2">
            <span className="bg-slate-900 px-2 py-0.5 text-slate-400">VISA / Mastercard / МИР</span>
            <span className="bg-slate-900 px-2 py-0.5 text-orange-500 font-bold">СБП</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

