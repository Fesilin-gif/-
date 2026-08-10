import React, { useState, useMemo } from 'react';
import { Product, CategoryInfo } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/catalogData';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ShoppingBag, 
  Wrench, 
  Eye, 
  Star, 
  Check, 
  X,
  ChevronDown,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface CatalogPageProps {
  initialCategory?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddToCart: (product: Product) => void;
  onAddToBuilder: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  initialCategory = 'all',
  searchQuery,
  setSearchQuery,
  onAddToCart,
  onAddToBuilder,
  onQuickView
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const brands = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS.forEach(p => set.add(p.brand));
    return Array.from(set);
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }
      // In stock filter
      if (inStockOnly && !p.inStock) {
        return false;
      }
      // Price filter
      if (minPrice && p.price < parseInt(minPrice, 10)) {
        return false;
      }
      if (maxPrice && p.price > parseInt(maxPrice, 10)) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchSpecs = Object.values(p.specs).some(val => val.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchCat && !matchSpecs) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount; // popular
    });
  }, [selectedCategory, selectedBrand, inStockOnly, searchQuery, sortBy, minPrice, maxPrice]);

  const handleAddCartClick = (product: Product) => {
    onAddToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Title Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-6 bg-orange-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                Hardware Hub
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-black">
              Каталог комплектующих
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase mt-2">
              Найдено моделей: <span className="text-orange-500 font-bold">{filteredProducts.length}</span>
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[260px]">
              <input
                type="text"
                placeholder="Поиск по названию или спецификации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs py-2.5 pl-9 pr-8 text-black focus:outline-none focus:border-orange-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-orange-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sorting selector */}
            <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-black font-bold uppercase tracking-wider focus:outline-none cursor-pointer text-[10px]"
              >
                <option value="popular">По популярности</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
                <option value="rating">По рейтингу</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Bar Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Все
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors whitespace-nowrap flex items-center ${
                selectedCategory === cat.slug
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Main Layout: Filters Sidebar & Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center space-x-2 font-bold text-sm text-black uppercase tracking-wider">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  <span>Фильтры</span>
                </div>
                {(selectedCategory !== 'all' || selectedBrand !== 'all' || inStockOnly || searchQuery || minPrice || maxPrice) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedBrand('all');
                      setInStockOnly(false);
                      setSearchQuery('');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="text-[10px] uppercase font-bold text-slate-500 hover:text-orange-500 transition-colors"
                  >
                    Сбросить
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="space-y-3 mb-6 border-b border-slate-200 pb-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Производитель
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={`w-full text-left text-xs py-2 px-3 transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-orange-50 text-orange-600 font-bold border-l-2 border-orange-500'
                        : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    Все бренды
                  </button>
                  {brands.map(b => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`w-full text-left text-xs py-2 px-3 transition-colors ${
                        selectedBrand === b
                          ? 'bg-orange-50 text-orange-600 font-bold border-l-2 border-orange-500'
                          : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-3 mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Цена, ₽
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="от"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs py-2 px-3 text-black focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="до"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs py-2 px-3 text-black focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-4 h-4 flex items-center justify-center border transition-colors ${inStockOnly ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300 group-hover:border-orange-500'}`}>
                    {inStockOnly && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Только в наличии
                  </span>
                </label>
              </div>

            </div>

            {/* Configurator Banner Promo */}
            <div className="bg-black text-white p-5 border border-slate-800 space-y-3 relative overflow-hidden group cursor-pointer" onClick={() => onAddToBuilder(PRODUCTS[0])}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center space-x-2 text-orange-500 relative z-10">
                <Wrench className="w-5 h-5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Сборка на заказ</span>
              </div>
              <p className="text-xs text-slate-400 relative z-10 leading-relaxed">
                Нужна проверка совместимости? Соберите ваш ПК в нашем фирменном конфигураторе.
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 mx-auto flex items-center justify-center rounded-full">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-black uppercase">
                  Товары не найдены
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Попробуйте изменить поисковый запрос или сбросить установленные фильтры.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setInStockOnly(false);
                    setSearchQuery('');
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-black transition-colors text-white text-[10px] font-bold uppercase tracking-widest mt-4"
                >
                  Сбросить все фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white border border-slate-200 hover:border-orange-500 transition-colors duration-300 flex flex-col justify-between relative"
                  >
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      {product.badge && (
                        <span className="bg-orange-500 text-white font-bold text-[9px] uppercase tracking-widest px-2 py-1 shadow-sm">
                          {product.badge}
                        </span>
                      )}
                      {product.socket && (
                        <span className="bg-black text-white font-bold text-[9px] uppercase tracking-widest px-2 py-1">
                          {product.socket}
                        </span>
                      )}
                    </div>

                    {/* Quick View Button */}
                    <button
                      onClick={() => onQuickView(product)}
                      className="absolute top-3 right-3 z-10 p-2 bg-white border border-slate-200 hover:border-orange-500 text-slate-400 hover:text-orange-500 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                      title="Быстрый просмотр"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Product Image */}
                    <div className="relative h-48 bg-white border-b border-slate-100 overflow-hidden flex items-center justify-center p-6">
                      <img
                        src={product.image}
                        alt={product.name}
                        
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Rating & Brand */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                          <span className="font-bold text-black uppercase tracking-widest">{product.brand}</span>
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current mr-1" />
                            <span className="font-bold text-black">{product.rating}</span>
                            <span className="text-slate-400 ml-1">({product.reviewsCount})</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 
                          onClick={() => onQuickView(product)}
                          className="font-bold text-sm text-black hover:text-orange-500 transition-colors line-clamp-2 cursor-pointer mb-4 leading-relaxed"
                        >
                          {product.name}
                        </h3>

                        {/* Spec Highlights */}
                        <div className="space-y-1.5 mb-5 text-[11px] text-slate-500">
                          {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-slate-400">{key}</span>
                              <span className="font-semibold text-black truncate max-w-[140px] text-right">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-xl font-black italic tracking-tighter text-black">
                              {product.price.toLocaleString()} ₽
                            </span>
                            {product.oldPrice && (
                              <span className="block text-[10px] text-slate-400 line-through">
                                {product.oldPrice.toLocaleString()} ₽
                              </span>
                            )}
                          </div>

                          <span className={`text-[9px] font-bold uppercase tracking-widest ${product.inStock ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {product.inStock ? 'В наличии' : 'Под заказ'}
                          </span>
                        </div>

                        {/* Action Buttons Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAddCartClick(product)}
                            className={`py-2 px-3 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center ${
                              addedIds[product.id]
                                ? 'bg-emerald-500 text-white'
                                : 'bg-orange-500 hover:bg-black text-white'
                            }`}
                          >
                            {addedIds[product.id] ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                <span>Добавлено</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                                <span>В корзину</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onAddToBuilder(product)}
                            className="py-2 px-2 bg-transparent text-black text-[10px] font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                            title="Добавить в конфигуратор сборки"
                          >
                            <Wrench className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                            <span>В сборку</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
