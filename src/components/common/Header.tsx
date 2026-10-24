import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  MessageCircle,
  Package,
  LogOut,
  ExternalLink,
  Palette
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Product, isStoreAdmin } from '../../types';

export const Header: React.FC = () => {
  const { 
    cartCount, 
    subtotal, 
    wishlist, 
    user, 
    logout, 
    selectedLocation, 
    setIsLocationModalOpen,
    setIsCartOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    settings,
    setSelectedCategory,
    uiTheme,
    setUiTheme
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Autocomplete suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const prods = await api.getProducts({ search: searchQuery.trim() });
          setSuggestions(prods.slice(0, 5));
        } catch (e) {
          setSuggestions([]);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      setCurrentView('catalog');
    }
  };

  const navLinks = [
    { name: 'Home', view: 'home' },
    { name: 'All Products', view: 'catalog' },
    { name: 'Grocery & Staples', view: 'catalog', cat: 'Rice, Atta & Grains' },
    { name: 'Cooking Oil & Dal', view: 'catalog', cat: 'Cooking Oil & Ghee' },
    { name: 'Snacks & Biscuits', view: 'catalog', cat: 'Chips, Namkeen & Snacks' },
    { name: 'Beverages & Tea', view: 'catalog', cat: 'Tea, Coffee & Drinks' },
    { name: 'Dairy & Packaged', view: 'catalog', cat: 'Dairy & Packaged Foods' },
    { name: 'Household & Cleaning', view: 'catalog', cat: 'Home Cleaning Products' },
    { name: 'Special Offers', view: 'offers' },
    { name: 'Track Order', view: 'track-order' },
    { name: 'Contact Us', view: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-soft transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-forest text-white text-xs py-2 px-4 border-b border-forest-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-warmYellow text-charcoal">
              LOCAL STORE
            </span>
            <span>{settings.announcementText}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-ivory-100">
            {/* UI Theme Selector */}
            <div className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/15 transition-colors">
              <Palette className="w-3.5 h-3.5 text-warmYellow" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white hidden sm:inline">Theme:</span>
              <select
                value={uiTheme}
                onChange={(e) => setUiTheme(e.target.value as any)}
                className="bg-transparent text-[11px] font-bold text-white focus:outline-none cursor-pointer"
                title="Change UI Theme Color"
              >
                <option value="emerald" className="text-charcoal bg-white">Emerald Jade (Fresh & Modern)</option>
                <option value="royal" className="text-charcoal bg-white">Royal Green (Classic Heritage)</option>
                <option value="teal" className="text-charcoal bg-white">Citrus Teal (Energetic Modern)</option>
                <option value="botanical" className="text-charcoal bg-white">Botanical Green (Organic Nature)</option>
              </select>
            </div>

            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-warmYellow" />
              {settings.storeTimings}
            </span>
            <a 
              href={`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20SUPERMARKET,%20I%20have%20an%20inquiry.`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-warmYellow hover:underline font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              WhatsApp: +91 98113 40853
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-charcoal hover:text-forest rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div 
              onClick={() => setCurrentView('home')} 
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-xl bg-forest flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                {/* Custom Grocery Basket & Leaf Logo Icon */}
                <svg className="w-7 h-7 text-white" viewBox="0 0 48 48" fill="none">
                  <path d="M10 20h28l-3.5 20h-21z" fill="#FFC857" />
                  <path d="M18 20v-5a6 6 0 0 1 12 0v5" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="24" cy="30" r="3.5" fill="#176B45" />
                  <path d="M31 11c2-3 6-3 6-3s0 4-3 6" stroke="#48C269" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl md:text-2xl tracking-tight text-forest flex items-center gap-1">
                  KD <span className="text-charcoal font-bold">SUPERMARKET</span>
                </span>
                <span className="text-[10px] md:text-xs font-medium text-charcoal-muted tracking-wide flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-fresh"></span>
                  State Bank More, Madhubani
                </span>
              </div>
            </div>
          </div>

          {/* Location Selector (Desktop) */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-forest/40 bg-ivory-50 text-left hover:bg-white transition-all text-xs text-charcoal"
            >
              <div className="w-7 h-7 rounded-full bg-forest/10 flex items-center justify-center text-forest flex-shrink-0">
                <MapPin className="w-4 h-4 text-forest" />
              </div>
              <div className="max-w-[130px] truncate">
                <p className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wider">Deliver To</p>
                <p className="font-bold text-forest truncate text-xs">{selectedLocation}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted" />
            </button>
          </div>

          {/* Search Bar with Autocomplete (Desktop) */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search fresh atta, dal, oil, ghee, biscuits, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-10 pr-12 py-2.5 bg-ivory-50 border border-gray-200 rounded-full text-sm text-charcoal placeholder-charcoal-light focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-charcoal-light absolute left-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-10 text-charcoal-light hover:text-charcoal p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 bg-forest hover:bg-forest-dark text-white p-1.5 rounded-full transition-colors"
                aria-label="Submit search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Live Autocomplete Suggestions */}
            {searchFocused && (searchQuery.trim().length > 1 || suggestions.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-gray-100 text-xs font-semibold text-charcoal-muted flex items-center justify-between">
                  <span>Product Suggestions</span>
                  <span className="text-[10px] text-forest font-normal">Press Enter to view all</span>
                </div>
                {suggestions.length > 0 ? (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {suggestions.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setCurrentView('product-detail', prod.id);
                          setSearchFocused(false);
                        }}
                        className="p-2.5 hover:bg-ivory flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-10 h-10 object-contain p-0.5 bg-white rounded-md border border-gray-100" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-charcoal truncate">{prod.name}</p>
                          <p className="text-[11px] text-charcoal-muted">{prod.brand} • {prod.packSize}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-forest">₹{prod.price}</p>
                          {prod.mrp > prod.price && (
                            <p className="text-[10px] text-charcoal-light line-through">₹{prod.mrp}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-charcoal-muted">
                    No products found matching "{searchQuery}"
                  </div>
                )}
                <div className="p-2 bg-ivory-50 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      setSearchFocused(false);
                      setCurrentView('catalog');
                    }}
                    className="text-xs text-forest font-semibold hover:underline"
                  >
                    View all matching products in Catalogue →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* WhatsApp Store Direct Contact */}
            <a
              href={`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20SUPERMARKET,%20I%20want%20to%20order%20groceries.`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-fresh/10 text-fresh-dark hover:bg-fresh/20 rounded-lg text-xs font-semibold transition-colors"
              title="Chat with store on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-fresh text-white" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            {/* Wishlist */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                } else {
                  setCurrentView('account', 'wishlist');
                }
              }}
              className="relative p-2.5 text-charcoal hover:text-forest rounded-xl hover:bg-ivory transition-colors"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-warmYellow text-charcoal text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ivory border border-transparent hover:border-gray-200 transition-colors text-xs font-semibold text-charcoal"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-forest/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-ivory border border-gray-200 text-charcoal rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="hidden md:inline">Google Login</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-gray-100 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-charcoal truncate">{user.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-charcoal-muted truncate max-w-[150px]">{user.email}</p>
                      {user.provider === 'google' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                          Google
                        </span>
                      )}
                    </div>
                    {isStoreAdmin(user) && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-forest/10 text-forest text-[10px] font-bold">
                        Store Administrator
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentView('account', 'profile');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-ivory flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-forest" />
                    My Profile & Addresses
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('account', 'orders');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-ivory flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5 text-forest" />
                    My Orders
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('track-order');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-ivory flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-forest" />
                    Track My Order
                  </button>

                  {isStoreAdmin(user) && (
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-forest font-bold bg-forest/5 hover:bg-forest/10 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                      Admin Control Panel
                    </button>
                  )}

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-fresh text-white hover:bg-fresh-dark rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              aria-label="View Shopping Basket"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-warmYellow text-charcoal text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-semibold">
                {subtotal > 0 ? `₹${subtotal}` : 'Basket'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Full-Width Search Input (md:hidden) */}
        <div className="md:hidden mt-2.5 relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search atta, dal, oil, ghee, biscuits, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full pl-9 pr-10 py-2.5 bg-ivory-50 border border-gray-200 rounded-full text-xs text-charcoal placeholder-charcoal-light focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 focus:bg-white transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-charcoal-light absolute left-3 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-9 text-charcoal-light hover:text-charcoal p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 bg-forest hover:bg-forest-dark text-white p-1.5 rounded-full transition-colors"
              aria-label="Submit search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Navigation Categories Bar (Desktop) */}
      <nav className="hidden md:block bg-ivory-100 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal overflow-x-auto scrollbar-none py-2 gap-4">
            <div className="flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = currentView === link.view && (!link.cat || link.cat === undefined);
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      if (link.cat) {
                        setSelectedCategory(link.cat);
                        setCurrentView('catalog');
                      } else {
                        setSelectedCategory(null);
                        setCurrentView(link.view);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      isActive 
                        ? 'bg-forest text-white font-bold' 
                        : 'hover:text-forest hover:bg-white text-charcoal-muted'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </div>

            {/* Admin Panel button - ONLY visible when authorized admin is logged in */}
            {isStoreAdmin(user) && (
              <div className="flex items-center gap-2 text-forest text-[11px] font-bold">
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-2.5 py-1 bg-white border border-forest/30 text-forest rounded-md hover:bg-forest hover:text-white transition-colors flex items-center gap-1 shadow-xs"
                >
                  <ShieldCheck className="w-3 h-3 text-forest" />
                  Admin Panel
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl max-h-[80vh] overflow-y-auto">
          {/* Mobile Location Selector */}
          <div className="p-3 bg-ivory border-b border-gray-100">
            <p className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider mb-1">Delivering in Madhubani to:</p>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsLocationModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 text-xs font-semibold text-forest"
            >
              <span className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-forest" />
                <span className="truncate">{selectedLocation}</span>
              </span>
              <span className="text-[10px] bg-forest/10 px-2 py-0.5 rounded text-forest font-bold">Change</span>
            </button>
          </div>

          <div className="p-4 space-y-2">
            <p className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">Navigation</p>
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  if (link.cat) {
                    setSelectedCategory(link.cat);
                    setCurrentView('catalog');
                  } else {
                    setSelectedCategory(null);
                    setCurrentView(link.view);
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 text-xs font-semibold text-charcoal hover:bg-ivory rounded-lg flex items-center justify-between"
              >
                <span>{link.name}</span>
                <span className="text-gray-300">›</span>
              </button>
            ))}

            {isStoreAdmin(user) && (
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-forest bg-forest/5 rounded-lg flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Store Admin Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
