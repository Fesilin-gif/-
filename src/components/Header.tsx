import React, { useState } from 'react';
import { PageType } from '../types';
import { 
  Search, 
  ShoppingBag, 
  Wrench, 
  Phone, 
  Menu, 
  X, 
  ChevronRight, 
  MapPin,
  Clock
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  cartCount: number;
  cartTotal: number;
  openCart: () => void;
  openBuilder: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  cartCount,
  cartTotal,
  openCart,
  openBuilder,
  searchQuery,
  setSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageType; label: string }[] = [
    { id: 'home', label: 'Главная' },
    { id: 'catalog', label: 'Каталог' },
    { id: 'about', label: 'О компании' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contacts', label: 'Контакты' },
  ];

  const handleNavClick = (page: PageType) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPage !== 'catalog') {
      setCurrentPage('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      {/* Top Utility Bar */}
      <div className="bg-black text-slate-300 text-[10px] py-1 px-4 hidden md:block border-b border-slate-800 font-mono">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-slate-400">
              <MapPin className="w-3 h-3 mr-1 text-orange-500" />
              Москва, ул. Тверская, 12 / СПб, Невский 48
            </span>
            <span className="flex items-center text-slate-400">
              <Clock className="w-3 h-3 mr-1 text-orange-500" />
              09:00 — 21:00 Ежедневно
            </span>
            <span className="text-orange-500 font-bold uppercase tracking-wider">
              ● Экспресс-доставка в день заказа
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a href="tel:88005553535" className="hover:text-orange-500 transition-colors flex items-center font-bold">
              <Phone className="w-3 h-3 mr-1 text-orange-500" />
              8 (800) 555-35-35
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">Официальная гарантия</span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
          
          {/* Left Group: Logo & Nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Logo */}
            <button 
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 focus:outline-none group text-left shrink-0 cursor-pointer"
            >
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 bg-black flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300 shrink-0" 
                style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}
              >
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 group-hover:bg-black transition-colors duration-300"></div>
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tighter text-black italic uppercase whitespace-nowrap select-none pr-2">
                PC<span className="text-orange-500">MARKET</span>
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`text-xs uppercase font-bold tracking-widest transition-colors whitespace-nowrap cursor-pointer py-1 ${
                      isActive
                        ? 'text-black border-b-2 border-orange-500'
                        : 'text-slate-500 hover:text-black'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="hidden lg:flex items-center gap-4 flex-1 min-w-0 max-w-sm ml-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Поиск комплектующих..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-black text-xs py-1.5 pl-8 pr-3 focus:outline-none focus:border-orange-500 font-mono transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </form>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0 ml-4 lg:ml-0">
            {/* PC Builder Button */}
            <button
              type="button"
              onClick={openBuilder}
              className="border border-black text-black px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <Wrench className="w-3.5 h-3.5 text-orange-500" />
              <span>Конфигуратор</span>
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="bg-orange-500 text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-tighter hover:bg-black transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-3.5 h-3.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-black text-white text-[8px] font-bold px-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>
                {cartTotal > 0 ? `${cartTotal.toLocaleString()} ₽` : 'Корзина'}
              </span>
            </button>
          </div>

          {/* Mobile Menu & Cart Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={openCart}
              className="bg-orange-500 text-white p-2 relative text-xs font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-black text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-500" /> : <Menu className="w-5 h-5 text-orange-500" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Поиск по каталогу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-black text-xs py-2 pl-8 pr-3 focus:outline-none focus:border-orange-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <nav className="flex flex-col gap-2 pt-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between p-2 text-xs font-bold uppercase tracking-widest text-left ${
                  currentPage === item.id
                    ? 'text-orange-500 bg-slate-50 border-l-2 border-orange-500'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            ))}
          </nav>

          <button
            onClick={() => {
              openBuilder();
              setMobileMenuOpen(false);
            }}
            className="w-full bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
          >
            <Wrench className="w-3.5 h-3.5 text-orange-500" />
            <span>Конфигуратор ПК</span>
          </button>
        </div>
      )}
    </header>
  );
};

