import React, { useState } from 'react';
import { PageType, Product, CartItem, PcBuildState } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PopularCategories } from './components/PopularCategories';
import { WhyUsSection } from './components/WhyUsSection';
import { FinalCTA } from './components/FinalCTA';
import { CatalogPage } from './components/CatalogPage';
import { AboutPage } from './components/AboutPage';
import { FaqPage } from './components/FaqPage';
import { ContactsPage } from './components/ContactsPage';
import { PcBuilderModal } from './components/PcBuilderModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  
  // Modals & Drawers
  const [isBuilderOpen, setIsBuilderOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // PC Builder state
  const [buildState, setBuildState] = useState<PcBuildState>({
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    cooler: null,
    case: null
  });

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleAddMultipleToCart = (products: Product[]) => {
    products.forEach(p => handleAddToCart(p));
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Navigation helpers
  const handleGoToCatalog = (categorySlug: string = 'all') => {
    setSelectedCategorySlug(categorySlug);
    setCurrentPage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToBuilder = (product: Product) => {
    const slotKey = product.category as keyof PcBuildState;
    if (slotKey in buildState) {
      setBuildState(prev => ({ ...prev, [slotKey]: product }));
    }
    setIsBuilderOpen(true);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans flex flex-col selection:bg-[#FF5500] selection:text-white">
      
      {/* Main Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartCount={cartCount}
        cartTotal={cartTotal}
        openCart={() => setIsCartOpen(true)}
        openBuilder={() => setIsBuilderOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            {/* First Screen / Hero Section */}
            <HeroSection
              onGoToCatalog={() => handleGoToCatalog('all')}
              onOpenBuilder={() => setIsBuilderOpen(true)}
            />

            {/* Popular Categories Block */}
            <PopularCategories
              onSelectCategory={(slug) => handleGoToCatalog(slug)}
            />

            {/* Why Choose PCMarket Block */}
            <WhyUsSection />

            {/* Final Call To Action Block */}
            <FinalCTA
              onGoToCatalog={() => handleGoToCatalog('all')}
              onOpenBuilder={() => setIsBuilderOpen(true)}
            />
          </>
        )}

        {currentPage === 'catalog' && (
          <CatalogPage
            initialCategory={selectedCategorySlug}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddToCart={handleAddToCart}
            onAddToBuilder={handleAddToBuilder}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'about' && <AboutPage />}

        {currentPage === 'faq' && <FaqPage />}

        {currentPage === 'contacts' && <ContactsPage />}
      </main>

      {/* Footer */}
      <Footer
        setCurrentPage={setCurrentPage}
        openBuilder={() => setIsBuilderOpen(true)}
      />

      {/* Interactive Modals & Drawers */}
      <PcBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        buildState={buildState}
        setBuildState={setBuildState}
        onAddAllToCart={handleAddMultipleToCart}
      />

      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onAddToBuilder={handleAddToBuilder}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

    </div>
  );
}
