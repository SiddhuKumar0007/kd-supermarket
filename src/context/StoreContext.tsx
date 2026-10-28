import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, StoreSettings, User, Address, ToastMessage, isStoreAdmin } from '../types';
import { api } from '../services/api';

interface StoreContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  total: number;
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  shareCartOnWhatsApp: () => void;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string) => Promise<boolean>;
  loginWithGoogle: (payload: { email?: string; name?: string; avatar?: string; googleId?: string; credential?: string }) => Promise<boolean>;
  logout: () => void;

  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  locationsList: string[];

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;

  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  settings: StoreSettings;
  refreshSettings: () => Promise<void>;
  currentView: string;
  setCurrentView: (view: string, param?: any) => void;
  viewParam: any;
  uiTheme: 'emerald' | 'royal' | 'teal' | 'botanical';
  setUiTheme: (theme: 'emerald' | 'royal' | 'teal' | 'botanical') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation / View State
  const [currentView, setCurrentViewState] = useState<string>('home');
  const [viewParam, setViewParam] = useState<any>(null);

  // Theme UI state
  const [uiTheme, setUiThemeState] = useState<'emerald' | 'royal' | 'teal' | 'botanical'>(() => {
    return (localStorage.getItem('kd_theme') as any) || 'emerald';
  });

  const setUiTheme = (theme: 'emerald' | 'royal' | 'teal' | 'botanical') => {
    setUiThemeState(theme);
    localStorage.setItem('kd_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme);
  }, [uiTheme]);

  const setCurrentView = (view: string, param?: any) => {
    setCurrentViewState(view);
    setViewParam(param || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update hash for deep-linking
    if (view === 'home') {
      window.location.hash = '';
    } else if (param && (typeof param === 'string' || typeof param === 'number')) {
      window.location.hash = `${view}/${param}`;
    } else {
      window.location.hash = view;
    }
  };

  // Sync hash routing on popstate & load
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setCurrentViewState('home');
        setViewParam(null);
        return;
      }
      const parts = hash.split('/');
      const page = parts[0];
      const param = parts[1];
      setCurrentViewState(page);
      setViewParam(param || null);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Settings
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "KD SUPERMARKET",
    storeTagline: "Your Everyday Essentials, Delivered with Ease!",
    storeType: "General Store / Supermarket / Grocery",
    address: "STATE BANK MORE, Watson High School, Tirhut Colony, Madhubani, Bihar 847211",
    whatsappNumber: "+91 98113 40853",
    whatsappRaw: "919811340853",
    googleRating: 4.8,
    googleReviewsCount: 31,
    googleMapsUrl: "https://maps.google.com/?q=STATE+BANK+MORE+Watson+High+School+Tirhut+Colony+Madhubani+Bihar+847211",
    storeTimings: "Open 7 Days a week: 7:30 AM – 9:30 PM",
    minOrderValue: 199,
    deliveryFee: 30,
    freeDeliveryThreshold: 499,
    deliveryAreas: [
      "Tirhut Colony",
      "State Bank More",
      "Watson High School Road",
      "Babu Saheb Colony",
      "Suratganj",
      "Station Road",
      "Collectorate Area",
      "Madhubani Town (847211)"
    ],
    announcementText: "🎉 Free Home Delivery on orders above ₹499 in Madhubani Town! Call/WhatsApp: +91 98113 40853",
    razorpayKeyId: "rzp_test_KDSupermarket847211",
    isRazorpayTestMode: true,
    codEnabled: true,
    whatsappOrderingEnabled: true
  });

  const refreshSettings = async () => {
    try {
      const fresh = await api.getSettings();
      setSettings(fresh);
    } catch (e) {
      console.warn('Using cached settings');
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kd_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kd_cart', JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 499;
  const standardFee = settings.deliveryFee || 30;
  const deliveryFee = (subtotal === 0 || subtotal >= freeDeliveryThreshold) ? 0 : standardFee;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const total = subtotal + deliveryFee;

  const addToCart = (product: Product, quantity: number = 1, variantId?: string) => {
    setCart(prev => {
      let chosenVariant = product.variants?.[0];
      if (variantId && product.variants) {
        const found = product.variants.find(v => v.id === variantId);
        if (found) chosenVariant = found;
      }

      const itemKey = variantId || product.id;
      const existingIndex = prev.findIndex(item =>
        item.productId === product.id && (variantId ? item.variantId === variantId : true)
      );

      const price = chosenVariant ? chosenVariant.price : product.price;
      const mrp = chosenVariant ? chosenVariant.mrp : product.mrp;
      const packSize = chosenVariant ? chosenVariant.size : product.packSize;
      const maxStock = chosenVariant ? chosenVariant.stock : product.stock;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, maxStock || 50);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        showToast(`Updated "${product.name}" in your basket`, 'info');
        return updated;
      } else {
        showToast(`Added "${product.name}" (${packSize}) to basket!`, 'success');
        return [
          ...prev,
          {
            productId: product.id,
            variantId: chosenVariant?.id,
            name: product.name,
            brand: product.brand,
            packSize,
            price,
            mrp,
            quantity: Math.min(quantity, maxStock || 50),
            image: product.image,
            maxStock: maxStock || 50
          }
        ];
      }
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && (!variantId || item.variantId === variantId))));
    showToast('Item removed from basket', 'info');
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productId === productId && (!variantId || item.variantId === variantId)) {
        return { ...item, quantity: Math.min(quantity, item.maxStock || 50) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const shareCartOnWhatsApp = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    let message = `🛒 *KD SUPERMARKET — MADHUBANI*\n*Customer Order Inquiry via WhatsApp*\n\n`;
    message += `📍 *Delivery Area:* ${selectedLocation}\n\n`;
    message += `📦 *Items in Cart:*\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.packSize})\n   Qty: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}\n`;
    });

    message += `\n💵 *Estimated Subtotal:* ₹${subtotal}\n`;
    message += `🚚 *Estimated Delivery:* ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}\n`;
    message += `💰 *Estimated Total:* ₹${total}\n\n`;
    message += `_Note: Prices & availability to be confirmed by KD Supermarket store desk._\n\n`;
    message += `Please confirm if this order can be delivered to my address in Madhubani. Thank you!`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${settings.whatsappRaw || '919811340853'}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('kd_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kd_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // User Auth
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kd_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      localStorage.setItem('kd_user', JSON.stringify(res.user));
      if (isStoreAdmin(res.user)) {
        setCurrentView('admin');
        showToast(`Welcome Admin ${res.user.name}! Admin Control Panel opened.`, 'success');
      } else {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
      }
      return true;
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string): Promise<boolean> => {
    try {
      const res = await api.register(name, email, phone);
      setUser(res.user);
      localStorage.setItem('kd_user', JSON.stringify(res.user));
      showToast(`Account created! Welcome to KD Supermarket, ${res.user.name}.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      return false;
    }
  };

  const loginWithGoogle = async (payload: { email?: string; name?: string; avatar?: string; googleId?: string; credential?: string }): Promise<boolean> => {
    try {
      const res = await api.loginWithGoogle(payload);
      setUser(res.user);
      localStorage.setItem('kd_user', JSON.stringify(res.user));
      if (isStoreAdmin(res.user)) {
        setCurrentView('admin');
        showToast(`Welcome Admin ${res.user.name}! Admin Control Panel opened.`, 'success');
      } else {
        showToast(`Signed in with Google! Welcome, ${res.user.name}.`, 'success');
      }
      return true;
    } catch (err: any) {
      showToast(err.message || 'Google login failed', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kd_user');
    localStorage.removeItem('kd_token');
    showToast('Logged out successfully', 'info');
  };

  // Location Selector
  const locationsList = [
    "Tirhut Colony, Madhubani",
    "State Bank More, Madhubani",
    "Watson High School Road, Madhubani",
    "Babu Saheb Colony, Madhubani",
    "Suratganj Chowk, Madhubani",
    "Station Road, Madhubani",
    "Ganga Sagar Pokhar Area, Madhubani",
    "Collectorate & Court Area, Madhubani",
    "Sapta & Mills Area, Madhubani",
    "All Localities in Madhubani (PIN 847211)"
  ];

  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    return localStorage.getItem('kd_location') || "State Bank More, Madhubani (847211)";
  });

  const handleSetLocation = (loc: string) => {
    setSelectedLocation(loc);
    localStorage.setItem('kd_location', loc);
    showToast(`Delivery location updated to ${loc}`, 'info');
  };

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        shareCartOnWhatsApp,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        login,
        register,
        loginWithGoogle,
        logout,
        selectedLocation,
        setSelectedLocation: handleSetLocation,
        locationsList,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isCartOpen,
        setIsCartOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isLocationModalOpen,
        setIsLocationModalOpen,
        toasts,
        showToast,
        removeToast,
        settings,
        refreshSettings,
        currentView,
        setCurrentView,
        viewParam,
        uiTheme,
        setUiTheme
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
