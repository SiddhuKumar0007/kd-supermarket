import React from 'react';
import { Home, Grid, Search, ShoppingBag, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { isStoreAdmin } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, cartCount, setIsCartOpen, user, setIsAuthModalOpen, setAuthModalMode } = useStore();

  const handleOrdersClick = () => {
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    } else {
      setCurrentView('account', 'orders');
    }
  };

  const isAdminUser = isStoreAdmin(user);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-3 shadow-lg flex items-center justify-around select-none">
      {/* Home */}
      <button
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
          currentView === 'home' ? 'text-forest font-bold' : 'text-charcoal-muted'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      {/* Categories */}
      <button
        onClick={() => setCurrentView('catalog')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
          currentView === 'catalog' ? 'text-forest font-bold' : 'text-charcoal-muted'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>Categories</span>
      </button>

      {/* Admin Panel button (for Admin) OR Track (for regular users) */}
      {isAdminUser ? (
        <button
          onClick={() => setCurrentView('admin')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            currentView === 'admin' ? 'text-forest font-bold' : 'text-charcoal-muted'
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5 text-forest" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span className="text-forest font-bold">Admin</span>
        </button>
      ) : (
        <button
          onClick={() => setCurrentView('track-order')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            currentView === 'track-order' ? 'text-forest font-bold' : 'text-charcoal-muted'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Track</span>
        </button>
      )}

      {/* My Account / Orders */}
      <button
        onClick={handleOrdersClick}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
          currentView === 'account' ? 'text-forest font-bold' : 'text-charcoal-muted'
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span>Account</span>
      </button>

      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-charcoal-muted relative"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-forest" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-warmYellow text-charcoal text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-forest font-bold">Cart</span>
      </button>
    </div>
  );
};
