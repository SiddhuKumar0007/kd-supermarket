import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Settings, 
  RefreshCw, 
  Truck, 
  LogOut, 
  ArrowRight,
  TrendingUp,
  MapPin,
  X,
  Minus,
  Check,
  Scale,
  Lock,
  UploadCloud,
  Image as ImageIcon,
  Camera,
  Loader2,
  Tag,
  BadgePercent,
  Copy,
  Calendar,
  Phone,
  MessageCircle,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Power,
  Eye,
  Radio
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Product, Order, StoreSettings, Category, PromoCode, isStoreAdmin } from '../types';

const ALL_STORE_CATEGORIES = [
  "Rice, Atta & Grains",
  "Dal & Pulses",
  "Cooking Oil & Ghee",
  "Spices & Masalas",
  "Salt, Sugar & Sweeteners",
  "Biscuits & Cookies",
  "Chips, Namkeen & Snacks",
  "Noodles, Pasta & Instant Foods",
  "Tea, Coffee & Drinks",
  "Dairy & Packaged Foods",
  "Chocolates, Sweets & Bakery",
  "Breakfast Cereals & Jams",
  "Pickles, Chutneys & Sauces",
  "Dry Fruits & Seeds",
  "Pooja Needs & Incense Sticks",
  "Bath, Body & Personal Hygiene",
  "Hair Care, Oral Care & Grooming",
  "Home Cleaning Products",
  "Kitchen Rolls, Foil & Disposables",
  "Other General Store Products"
];

export const AdminDashboard: React.FC = () => {
  const { user, logout, setCurrentView, showToast, refreshSettings, setIsAuthModalOpen } = useStore();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'inventory' | 'categories' | 'coupons' | 'settings'>('products');

  // Dashboard Data
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [adminSettings, setAdminSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Live Order Alarm & Master Switch States
  const [isAlarmSilenced, setIsAlarmSilenced] = useState(false);
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<string[]>([]);

  // Promo Code Filters & Modals
  const [couponSearch, setCouponSearch] = useState('');
  const [couponStatusFilter, setCouponStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<PromoCode | null>(null);
  const [couponForm, setCouponForm] = useState<{
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'flat' | 'free_delivery';
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number;
    isActive: boolean;
    isPublic: boolean;
    expiryDate: string;
  }>({
    code: '',
    title: '',
    description: '',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 499,
    maxDiscount: 50,
    isActive: true,
    isPublic: true,
    expiryDate: '2027-12-31'
  });

  // Order Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Product Filters & Search (In/Out, Weight, Stock, Search)
  const [productSearch, setProductSearch] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Product Modal (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    brand: string;
    category: string;
    packSize: string;
    price: number;
    mrp: number;
    stock: number;
    inStock: boolean;
    sku: string;
    description: string;
    image: string;
  }>({
    name: '',
    brand: 'KD Supermarket',
    category: 'Rice, Atta & Grains',
    packSize: '1 kg',
    price: 100,
    mrp: 120,
    stock: 50,
    inStock: true,
    sku: '',
    description: '',
    image: '/images/products/p-01.jpg'
  });

  // Direct Image Upload States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Photo size must be under 8MB', 'error');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setIsUploadingImage(false);
        return;
      }

      // Show immediate preview
      setProductForm(prev => ({ ...prev, image: dataUrl }));

      try {
        const res = await api.uploadProductImage(dataUrl, file.name);
        if (res.url) {
          setProductForm(prev => ({ ...prev, image: res.url }));
          showToast('Product photo uploaded successfully!', 'success');
        }
      } catch (err) {
        console.warn('Backend image persist error, fallback to data url', err);
        showToast('Photo attached successfully!', 'success');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read image file', 'error');
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, prodsData, catsData, settingsData, couponsData] = await Promise.all([
        api.getAdminStats(),
        api.getOrders(),
        api.getProducts(),
        api.getCategories(),
        api.getSettings(),
        api.getCoupons(true)
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(prodsData);
      setCategories(catsData);
      setAdminSettings(settingsData);
      setCoupons(couponsData);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Alert sound selection: 'chime' (Swiggy/Zomato Store Chime - pleasant & loud), 'bell' (Temple Ding-Dong), 'trill' (POS Trill), 'siren' (Police Siren)
  const [alarmTone, setAlarmTone] = useState<'chime' | 'bell' | 'trill' | 'siren'>('chime');

  const playOrderAlarmSound = (tone = alarmTone) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      if (tone === 'chime') {
        // 🎵 Pleasant Swiggy/Zomato/Blinkit Store Chime (Bright, melodious multi-bell chime)
        const notes = [
          { freq: 784, time: 0.0, dur: 0.35, gain: 0.55 },    // G5
          { freq: 1046.5, time: 0.14, dur: 0.35, gain: 0.65 }, // C6
          { freq: 1318.5, time: 0.28, dur: 0.35, gain: 0.70 }, // E6
          { freq: 1568, time: 0.42, dur: 0.65, gain: 0.80 },   // G6
          { freq: 1318.5, time: 0.85, dur: 0.35, gain: 0.60 }, // E6
          { freq: 1568, time: 1.0, dur: 0.75, gain: 0.85 }     // G6
        ];

        notes.forEach(({ freq, time, dur, gain }) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);

          // Subtle ringing overtone
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq * 2, now + time);
          g2.gain.setValueAtTime(gain * 0.25, now + time);
          g2.gain.exponentialRampToValueAtTime(0.001, now + time + dur * 0.8);

          g.gain.setValueAtTime(gain, now + time);
          g.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(g);
          g.connect(ctx.destination);
          osc2.connect(g2);
          g2.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur);
          osc2.start(now + time);
          osc2.stop(now + time + dur);
        });
      } else if (tone === 'bell') {
        // 🔔 Deep Resonant Temple / Big Doorbell (Ding - Dong)
        const dings = [
          { freq: 987.77, time: 0.0, dur: 0.7, gain: 0.7 },
          { freq: 659.25, time: 0.35, dur: 1.2, gain: 0.8 }
        ];
        dings.forEach(({ freq, time, dur, gain }) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);
          g.gain.setValueAtTime(gain, now + time);
          g.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        });
      } else if (tone === 'trill') {
        // 📟 Retail POS Electronic Trill
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          const t = now + i * 0.16;
          osc.frequency.setValueAtTime(i % 2 === 0 ? 1200 : 1600, t);
          g.gain.setValueAtTime(0.65, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        }
      } else {
        // 🚨 Police Siren
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        g.gain.setValueAtTime(0.7, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 1.4);
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.7);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 1.05);
        osc.frequency.exponentialRampToValueAtTime(700, now + 1.4);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.4);
      }
    } catch (e) {}
  };

  // Unlock Audio on First User Interaction (Touch / Tap on Mobile)
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          ctx.resume().then(() => ctx.close()).catch(() => {});
        }
      } catch (e) {}
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Find unconfirmed incoming orders
  const unconfirmedOrders = orders.filter(
    o => o.orderStatus === 'Order Placed' && !acknowledgedOrderIds.includes(o.id)
  );

  // Auto-unmute immediately if a brand new unconfirmed order arrives
  useEffect(() => {
    if (unconfirmedOrders.length > 0 && isAlarmSilenced) {
      // Keep silence only if explicitly muted by user for current batch
    }
  }, [unconfirmedOrders.length]);
  const isAlarmRinging = !isAlarmSilenced && unconfirmedOrders.length > 0;

  // Sound loop: plays repeatedly every 2 seconds while there is an unconfirmed order
  useEffect(() => {
    let timer: any = null;
    if (isAlarmRinging) {
      playOrderAlarmSound();
      timer = setInterval(() => {
        playOrderAlarmSound();
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAlarmRinging, alarmTone]);

  // Periodic polling every 5 seconds for new orders
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const freshOrders = await api.getOrders();
        setOrders(prev => {
          const prevPlacedIds = prev.filter(o => o.orderStatus === 'Order Placed').map(o => o.id);
          const freshPlaced = freshOrders.filter(o => o.orderStatus === 'Order Placed');
          const hasBrandNew = freshPlaced.some(o => !prevPlacedIds.includes(o.id));
          if (hasBrandNew) {
            setIsAlarmSilenced(false); // Unsilenec immediately for brand new incoming order!
          }
          return freshOrders;
        });
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Confirm order and stop alarm (Single or All Batch)
  const handleConfirmAndStopAlarm = async (orderId?: string) => {
    const idsToConfirm = orderId ? [orderId] : unconfirmedOrders.map(o => o.id);
    if (idsToConfirm.length === 0) return;

    // Immediately silence alarm and mark as acknowledged
    setIsAlarmSilenced(true);
    setAcknowledgedOrderIds(prev => [...new Set([...prev, ...idsToConfirm])]);

    for (const id of idsToConfirm) {
      try {
        await api.updateOrderStatus(id, 'Order Confirmed', 'Order confirmed by store admin');
      } catch (e) {}
    }

    setOrders(prev => prev.map(o => idsToConfirm.includes(o.id) ? { ...o, orderStatus: 'Order Confirmed' as any } : o));
    showToast(
      idsToConfirm.length > 1
        ? `All ${idsToConfirm.length} Orders Confirmed! Alarm stopped.`
        : `Order #${idsToConfirm[0]} confirmed! Alarm stopped.`,
      'success'
    );
    return;
  };

  const unusedOldConfirm = async (orderId: string) => {
    setAcknowledgedOrderIds(prev => [...new Set([...prev, orderId])]);
    try {
      await api.updateOrderStatus(orderId, 'Order Confirmed', 'Order confirmed by store admin');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'Order Confirmed' as any } : o));
      showToast(`Order #${orderId} confirmed! Alarm stopped.`, 'success');
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'Order Confirmed' as any } : o));
      showToast(`Order confirmed! Alarm stopped.`, 'info');
    }
  };

  // Master Store Switch: Toggle Accepting Orders ON/OFF
  const handleToggleAcceptingOrders = async () => {
    if (!adminSettings) return;
    const currentAccepting = adminSettings.acceptingOrders !== false;
    const nextState = !currentAccepting;
    try {
      const updated = await api.updateSettings({ ...adminSettings, acceptingOrders: nextState });
      setAdminSettings(updated);
      await refreshSettings();
      showToast(
        nextState 
          ? '🟢 Store is now OPEN & ACCEPTING ORDERS!' 
          : '🔴 Store is PAUSED! New customer orders are now blocked.',
        nextState ? 'success' : 'info'
      );
    } catch (e) {
      showToast('Failed to update store order status', 'error');
    }
  };



  // --- Handlers for Admin Operations ---

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await api.updateOrderStatus(
        orderId, 
        newStatus, 
        `Status updated to ${newStatus} by store admin`,
        newStatus === 'Delivered' ? 'PAID' : undefined
      );
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast(`Order ${orderId} updated to "${newStatus}"`, 'success');
      loadAdminData();
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  // Promo Code Operations (Save, Delete, Toggle)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }
    try {
      if (editingCoupon) {
        const updated = await api.updateCoupon(editingCoupon.id, couponForm);
        setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? updated : c));
        showToast(`Promo code '${updated.code}' updated successfully!`, 'success');
      } else {
        const created = await api.addCoupon(couponForm);
        setCoupons(prev => [created, ...prev]);
        showToast(`New promo code '${created.code}' created successfully!`, 'success');
      }
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save promo code', 'error');
    }
  };

  const handleDeleteCoupon = async (coupon: PromoCode) => {
    if (!window.confirm(`Are you sure you want to permanently delete promo code "${coupon.code}"?`)) {
      return;
    }
    try {
      const ok = await api.deleteCoupon(coupon.id);
      if (ok) {
        setCoupons(prev => prev.filter(c => c.id !== coupon.id));
        showToast(`Promo code "${coupon.code}" deleted permanently`, 'success');
      }
    } catch (err: any) {
      showToast('Failed to delete promo code', 'error');
    }
  };

  const handleToggleCouponStatus = async (coupon: PromoCode) => {
    const newStatus = !coupon.isActive;
    try {
      const updated = await api.updateCoupon(coupon.id, { isActive: newStatus });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? updated : c));
      showToast(`Promo code "${coupon.code}" is now ${newStatus ? 'ACTIVE 🟢' : 'INACTIVE 🔴'}`, 'info');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Product Add / Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!productForm.name.trim()) {
        showToast('Please enter a product title', 'error');
        return;
      }
      const finalCategory = productForm.category || ALL_STORE_CATEGORIES[0];
      const finalForm = {
        ...productForm,
        category: finalCategory,
        image: productForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        price: Number(productForm.price) || 10,
        mrp: Number(productForm.mrp) || Number(productForm.price) || 10,
        stock: Number(productForm.stock) >= 0 ? Number(productForm.stock) : 50,
      };

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, finalForm);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
        showToast('Product updated successfully! 🟢', 'success');
      } else {
        const created = await api.addProduct(finalForm);
        setProducts(prev => [created, ...prev]);
        showToast('New product added to store catalogue! 🛒', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (e: any) {
      console.error('Failed to save product', e);
      showToast(e.message || 'Failed to save product', 'error');
    }
  };

  // Stock update quick adjustment
  const handleQuickStockChange = async (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    try {
      await api.updateProduct(productId, { 
        stock: newStock, 
        inStock: newStock > 0 
      });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock, inStock: newStock > 0 } : p));
      showToast(`Stock updated for ${prod.name}`, 'info');
    } catch (e) {
      showToast('Failed to update stock', 'error');
    }
  };

  // 1-Click In / Out of Stock Toggle
  const handleToggleProductInStock = async (product: Product) => {
    const currentInStock = product.inStock !== false && (product.stock ?? 0) > 0;
    const newInStock = !currentInStock;
    const newStock = newInStock ? ((product.stock && product.stock > 0) ? product.stock : 25) : 0;
    
    try {
      await api.updateProduct(product.id, { 
        inStock: newInStock,
        stock: newStock 
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, inStock: newInStock, stock: newStock } : p));
      showToast(`${product.name} is now ${newInStock ? 'IN STOCK' : 'OUT OF STOCK'}`, newInStock ? 'success' : 'info');
    } catch (e) {
      showToast('Failed to update product stock status', 'error');
    }
  };

  // Quick Pack Size / Weight update
  const handleUpdatePackSize = async (productId: string, newSize: string) => {
    if (!newSize.trim()) return;
    try {
      await api.updateProduct(productId, { packSize: newSize.trim() });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, packSize: newSize.trim() } : p));
      showToast('Weight / Pack size updated', 'success');
    } catch (e) {
      showToast('Failed to update weight', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product removed from store catalogue', 'info');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSettings) return;
    try {
      await api.updateSettings(adminSettings);
      showToast('Store settings updated successfully', 'success');
    } catch (e) {
      showToast('Failed to save settings', 'error');
    }
  };

  // Helper to format comprehensive Madhubani delivery address
  const getFullAddress = (addr: any) => {
    if (!addr) return 'Address not available';
    if (addr.fullAddressText) return addr.fullAddressText;
    const parts = [
      addr.houseNo ? `House/Flat No: ${addr.houseNo}` : null,
      addr.street ? `Street/Gali: ${addr.street}` : null,
      addr.landmark ? `Landmark: ${addr.landmark}` : null,
      addr.locality ? `Locality: ${addr.locality}` : null,
      `${addr.city || 'Madhubani'}, ${addr.state || 'Bihar'} - ${addr.pinCode || '847211'}`
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Madhubani, Bihar';
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  // Filter products by search, category, in/out of stock
  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase().trim();
    if (q) {
      const match = p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.packSize && p.packSize.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

    const inStock = p.inStock !== false && (p.stock || 0) > 0;
    if (stockStatusFilter === 'in_stock' && !inStock) return false;
    if (stockStatusFilter === 'out_of_stock' && inStock) return false;
    if (stockStatusFilter === 'low_stock' && (p.stock || 0) > 15) return false;

    return true;
  });

  if (!isStoreAdmin(user)) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-5 border border-red-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-charcoal mb-2">Store Administrator Access Only</h2>
        <p className="text-muted text-sm leading-relaxed mb-6">
          This management portal is strictly restricted to authorized KD Supermarket administrators. Please sign in with an authorized account or return to the store catalog.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-forest text-white font-medium rounded-xl hover:bg-forest/90 transition-all shadow-sm"
          >
            Sign In as Admin
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full sm:w-auto px-6 py-2.5 bg-ivory-200 text-charcoal font-medium rounded-xl hover:bg-ivory-300 transition-all border border-ivory-300"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* Admin Top Navigation Bar */}
      <div className="bg-forest rounded-3xl p-4 md:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-warmYellow text-forest flex items-center justify-center font-black text-lg md:text-xl shadow">
            KD
          </div>
          <div>
            <h1 className="font-heading font-black text-lg md:text-2xl text-white">
              KD Supermarket Admin
            </h1>
            <p className="text-[11px] md:text-xs text-ivory-100 flex items-center gap-1.5">
              <span>State Bank More, Madhubani</span>
              <span>•</span>
              <span className="text-warmYellow font-bold">Admin Portal</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Master Store Toggle: Orders ON/OFF */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xs">
            <span className="text-[11px] font-bold text-white/90">Store Orders:</span>
            <button
              type="button"
              onClick={handleToggleAcceptingOrders}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                adminSettings?.acceptingOrders !== false
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title="Click to pause or resume accepting customer orders"
            >
              <Power className="w-3.5 h-3.5" />
              <span>{adminSettings?.acceptingOrders !== false ? '🟢 Store ON (Open)' : '🔴 Store OFF (Paused)'}</span>
            </button>
          </div>

          <button
            onClick={loadAdminData}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {/* Sound Tone Selector & Test Button */}
          <div className="flex items-center gap-1 bg-black/25 px-2 py-1 rounded-xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-amber-200 hidden sm:inline">Alert Tone:</span>
            <select
              value={alarmTone}
              onChange={(e) => {
                const newTone = e.target.value as any;
                setAlarmTone(newTone);
                playOrderAlarmSound(newTone);
              }}
              className="bg-transparent text-white font-bold text-xs py-1 px-1 focus:outline-none cursor-pointer"
              title="Select incoming order alert sound"
            >
              <option value="chime" className="text-charcoal bg-white">🎵 Store Chime (Zomato/Blinkit)</option>
              <option value="bell" className="text-charcoal bg-white">🔔 Resonant Bell / Ding-Dong</option>
              <option value="trill" className="text-charcoal bg-white">📟 POS Electronic Trill</option>
              <option value="siren" className="text-charcoal bg-white">🚨 Emergency Siren</option>
            </select>
            <button
              type="button"
              onClick={() => playOrderAlarmSound(alarmTone)}
              className="px-2 py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-forest-dark font-black rounded-lg text-xs flex items-center gap-1 transition-all shadow-sm"
              title="Click to test selected sound"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test 🔊</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentView('home')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-colors"
          >
            View Customer Site
          </button>

          <button
            onClick={logout}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 🚨 ACTIVE ORDER ALARM & NOTIFICATION BANNER */}
      {unconfirmedOrders.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-white/30 animate-pulse space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <BellRing className="w-7 h-7 animate-bounce text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-white text-red-600 uppercase tracking-wider">
                    {unconfirmedOrders.length} New Unconfirmed Order{unconfirmedOrders.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 animate-ping" />
                    <span>{isAlarmRinging ? '🔊 New Order Alert Ringing...' : '🔇 Alarm Silenced'}</span>
                  </span>
                </div>
                <h3 className="font-heading font-black text-base sm:text-lg text-white mt-1">
                  Order #{unconfirmedOrders[0].id} • ₹{unconfirmedOrders[0].total} ({unconfirmedOrders[0].customerName})
                </h3>
                <div className="text-xs text-white/95 mt-1 space-y-1">
                  <p className="font-semibold flex items-center gap-2">
                    <span>📞 {unconfirmedOrders[0].customerPhone}</span>
                    {unconfirmedOrders[0].address?.alternatePhone && (
                      <span className="text-amber-200">| Alt: {unconfirmedOrders[0].address.alternatePhone}</span>
                    )}
                  </p>
                  <p className="flex items-start gap-1.5 bg-black/25 p-2 rounded-xl border border-white/20 text-amber-50">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-300" />
                    <span><strong>Delivery Pata:</strong> {getFullAddress(unconfirmedOrders[0].address)}</span>
                  </p>
                  {unconfirmedOrders[0].instructions && (
                    <p className="text-[11px] text-amber-200 italic">
                      Note: "{unconfirmedOrders[0].instructions}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleConfirmAndStopAlarm()}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-red-700 hover:bg-ivory rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{unconfirmedOrders.length > 1 ? `Confirm & Stop All Alarms (${unconfirmedOrders.length})` : 'Confirm Order & Stop Alarm'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setOrderStatusFilter('all');
                  setOrderSearch(unconfirmedOrders[0].id);
                }}
                className="px-3.5 py-2.5 bg-black/30 hover:bg-black/50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>View Order</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAlarmSilenced(!isAlarmSilenced)}
                className="px-3 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                title={isAlarmSilenced ? "Resume Alarm" : "Silence Alarm"}
              >
                {isAlarmSilenced ? <Volume2 className="w-4 h-4 text-warmYellow" /> : <VolumeX className="w-4 h-4 text-white" />}
                <span className="hidden md:inline">{isAlarmSilenced ? 'Unmute' : 'Silence'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 text-xs font-bold no-scrollbar py-1 scroll-smooth">
        {[
          { id: 'overview', label: 'Dashboard Overview' },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'inventory', label: 'Stock & Inventory' },
          { id: 'coupons', label: `Promo Codes (${coupons.length})` },
          { id: 'settings', label: 'Store Settings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-forest text-forest font-black'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
              <span className="text-[11px] font-bold text-charcoal-muted uppercase">Total Orders</span>
              <p className="text-2xl font-black text-forest mt-1">{stats.totalOrders}</p>
              <span className="text-[10px] text-fresh font-semibold">Today: {stats.todayOrders}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
              <span className="text-[11px] font-bold text-charcoal-muted uppercase">Gross Revenue</span>
              <p className="text-2xl font-black text-forest mt-1">₹{stats.totalRevenue}</p>
              <span className="text-[10px] text-charcoal-muted">Paid/Confirmed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
              <span className="text-[11px] font-bold text-charcoal-muted uppercase">New Orders</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingCount}</p>
              <span className="text-[10px] text-charcoal-muted">Needs Attention</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
              <span className="text-[11px] font-bold text-charcoal-muted uppercase">Preparing</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{stats.preparingCount}</p>
              <span className="text-[10px] text-charcoal-muted">Being Packed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
              <span className="text-[11px] font-bold text-charcoal-muted uppercase">Dispatched</span>
              <p className="text-2xl font-black text-purple-600 mt-1">{stats.outForDeliveryCount}</p>
              <span className="text-[10px] text-charcoal-muted">Out for Delivery</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-card">
              <span className="text-[11px] font-bold text-charcoal-muted uppercase">Low Stock Alerts</span>
              <p className="text-2xl font-black text-red-600 mt-1">{stats.lowStockCount}</p>
              <span className="text-[10px] text-red-500 font-semibold">Below 15 Units</span>
            </div>
          </div>

          {/* Recent Orders in Dashboard */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-charcoal">
                Recent Orders in Madhubani
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-forest hover:underline"
              >
                View All {orders.length} Orders →
              </button>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-charcoal">{o.id}</span>
                    <span className="text-charcoal-muted ml-2 font-semibold">
                      {o.customerName} ({o.customerPhone})
                    </span>
                    <p className="text-[11px] text-charcoal font-medium mt-0.5">
                      📍 {getFullAddress(o.address)}
                    </p>
                    <p className="text-[10px] text-charcoal-muted">
                      {o.items.length} items • ₹{o.total} ({o.paymentMethod})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-ivory text-forest border border-forest/20">
                      {o.orderStatus}
                    </span>
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      className="text-xs font-bold py-1 px-2 rounded-lg bg-ivory-50 border border-gray-200 text-forest focus:outline-none"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Order Confirmed">Order Confirmed</option>
                      <option value="Preparing Your Order">Preparing Your Order</option>
                      <option value="Ready for Dispatch">Ready for Dispatch</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-charcoal">Order Management</h3>
              <p className="text-xs text-charcoal-muted">Search, verify payments, and update order delivery progress.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Order ID or phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-forest"
                />
                <Search className="w-3.5 h-3.5 text-charcoal-light absolute left-2.5 top-2.5" />
              </div>

              {/* Status Filter */}
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="py-1.5 px-3 bg-ivory-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none text-charcoal"
              >
                <option value="all">All Statuses</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Order Confirmed">Order Confirmed</option>
                <option value="Preparing Your Order">Preparing</option>
                <option value="Ready for Dispatch">Ready for Dispatch</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-muted uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Order ID</th>
                  <th className="p-3">Customer & Address</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total & Payment</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-forest">
                      {ord.id}
                      <span className="block text-[10px] text-charcoal-muted font-normal">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 max-w-sm">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-charcoal text-xs">{ord.customerName}</p>
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${ord.customerPhone}`}
                            title="Call Customer"
                            className="p-1 bg-ivory-100 hover:bg-forest hover:text-white text-forest border border-forest/20 rounded-lg transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://wa.me/91${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(ord.customerName)},%20update%20regarding%20your%20KD%20Supermarket%20Order%20${ord.id}:`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp Customer"
                            className="p-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress(ord.address))}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Google Maps Location"
                            className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg transition-colors flex items-center gap-0.5 text-[9px] font-bold"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Map</span>
                          </a>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-charcoal font-semibold mt-0.5">
                        📞 {ord.customerPhone}
                        {ord.address?.alternatePhone && (
                          <span className="text-charcoal-muted font-normal ml-1">
                            (Alt: {ord.address.alternatePhone})
                          </span>
                        )}
                      </p>

                      <div className="mt-1.5 p-2 bg-ivory-50 border border-gray-200 rounded-xl space-y-1 text-[11px]">
                        <p className="text-charcoal font-medium leading-relaxed">
                          <strong className="text-forest">Delivery Address:</strong> {getFullAddress(ord.address)}
                        </p>
                        {ord.address?.landmark && (
                          <p className="text-charcoal-muted">
                            <strong className="text-charcoal">Landmark:</strong> {ord.address.landmark}
                          </p>
                        )}
                        {ord.deliverySlot && (
                          <p className="text-forest font-semibold text-[10px]">
                            🕒 Slot: {ord.deliverySlot}
                          </p>
                        )}
                        {ord.instructions && (
                          <p className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] italic border border-amber-200">
                            📝 Note: {ord.instructions}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-forest text-xs block">
                          🛍️ {(ord.items || []).length} items to pack:
                        </span>
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {(ord.items || []).map((it, idx) => (
                            <div key={idx} className="text-[11px] flex items-center justify-between gap-1.5 bg-ivory-50 px-2 py-1 rounded-lg border border-gray-100">
                              <div className="truncate flex-1">
                                <span className="font-bold text-charcoal">{it.name}</span>
                                <span className="text-[10px] text-charcoal-muted ml-1">({it.packSize || '1 Unit'})</span>
                              </div>
                              <span className="font-black text-forest flex-shrink-0 text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                ×{it.quantity} (₹{(Number(it.price) || 0) * (Number(it.quantity) || 1)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-black text-forest">₹{ord.total}</span>
                      <p className="text-[10px] text-charcoal-muted">
                        {ord.paymentMethod} • <strong className={ord.paymentStatus === 'PAID' ? 'text-fresh' : 'text-amber-600'}>{ord.paymentStatus}</strong>
                      </p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-fresh/15 text-fresh-dark'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-warmYellow/30 text-charcoal'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="py-1 px-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-forest focus:outline-none cursor-pointer"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Preparing Your Order">Preparing Your Order</option>
                        <option value="Ready for Dispatch">Ready for Dispatch</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Orders Mobile Touch Cards */}
          <div className="md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-muted bg-ivory-50 rounded-2xl">
                No orders match your filter.
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-black text-xs text-forest">{ord.id}</span>
                      <p className="text-[10px] text-charcoal-muted">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.orderStatus === 'Delivered'
                        ? 'bg-fresh/15 text-fresh-dark'
                        : ord.orderStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-warmYellow/30 text-charcoal'
                    }`}>
                      {ord.orderStatus}
                    </span>
                  </div>

                  <div className="bg-ivory-50 p-3 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-charcoal">{ord.customerName}</p>
                        <p className="text-[11px] font-semibold text-charcoal">
                          📞 {ord.customerPhone}
                          {ord.address?.alternatePhone && (
                            <span className="text-charcoal-muted font-normal text-[10px] ml-1">
                              (Alt: {ord.address.alternatePhone})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-charcoal flex items-center gap-1 shadow-xs"
                        >
                          <Phone className="w-3 h-3 text-forest" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/91${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(ord.customerName)},%20update%20regarding%20your%20KD%20Supermarket%20Order%20${ord.id}:`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WA</span>
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress(ord.address))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                        >
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span>Map</span>
                        </a>
                      </div>
                    </div>

                    {/* Complete Full Address Card */}
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] space-y-1">
                      <p className="text-charcoal font-medium leading-snug">
                        <strong className="text-forest">Delivery Pata:</strong><br />
                        {getFullAddress(ord.address)}
                      </p>
                      {ord.address?.landmark && (
                        <p className="text-charcoal-muted text-[10px]">
                          <strong>Landmark:</strong> {ord.address.landmark}
                        </p>
                      )}
                      {ord.deliverySlot && (
                        <p className="text-forest font-semibold text-[10px]">
                          🕒 Slot: {ord.deliverySlot}
                        </p>
                      )}
                      {ord.instructions && (
                        <p className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] italic border border-amber-200">
                          📝 {ord.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">Total</span>
                      <span className="font-black text-forest text-sm">₹{ord.total}</span>
                      <span className={`text-[10px] font-bold ml-1 ${ord.paymentStatus === 'PAID' ? 'text-fresh' : 'text-amber-600'}`}>
                        ({ord.paymentStatus})
                      </span>
                    </div>
                  {/* Items to Pack Breakdown */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                      <span className="font-bold text-forest uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>Items to Pack ({(ord.items || []).length})</span>
                      </span>
                      <span className="text-[10px] text-charcoal-muted font-bold">Qty & Rate</span>
                    </div>
                    <div className="space-y-1.5 divide-y divide-gray-50 max-h-48 overflow-y-auto pr-1">
                      {(ord.items || []).map((it, idx) => (
                        <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-charcoal text-xs leading-snug">{it.name}</p>
                            <p className="text-[10px] text-charcoal-muted">
                              {it.packSize || '1 Unit'} × <strong className="text-forest text-[11px] font-black">{it.quantity}</strong>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-black text-forest text-xs">₹{(Number(it.price) || 0) * (Number(it.quantity) || 1)}</span>
                            <span className="text-[9px] text-charcoal-muted block">₹{it.price}/unit</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-charcoal-muted font-medium">
                      <span>Subtotal: ₹{ord.subtotal || ord.total} | Delivery: ₹{ord.deliveryFee || 0}</span>
                      {ord.couponCode && (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Coupon {ord.couponCode}: -₹{ord.discountAmount}
                        </span>
                      )}
                    </div>
                  </div>


                    <div className="flex-1 max-w-[140px] text-right">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="w-full py-1.5 px-2 bg-forest text-white rounded-xl text-xs font-bold focus:outline-none shadow-xs text-center cursor-pointer"
                      >
                        <option value="Order Placed">Placed</option>
                        <option value="Order Confirmed">Confirmed</option>
                        <option value="Preparing Your Order">Preparing</option>
                        <option value="Ready for Dispatch">Ready</option>
                        <option value="Out for Delivery">Out for Deliv</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-[10px] text-charcoal-muted border-t border-gray-100 pt-1.5 truncate">
                    <strong>Items ({ord.items.length}):</strong> {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. PRODUCTS & INVENTORY MANAGEMENT TAB */}
      {activeTab === 'products' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg text-charcoal">Store Product Catalogue & Inventory</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest/10 text-forest">
                  {products.length} Products
                </span>
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Manage stock levels, weights/pack sizes, in-stock/out-of-stock visibility & prices for KD Supermarket.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  brand: 'KD Supermarket',
                  category: 'Rice, Atta & Grains',
                  packSize: '1 kg',
                  price: 100,
                  mrp: 120,
                  stock: 50,
                  inStock: true,
                  sku: `KD-NEW-${Math.floor(100 + Math.random() * 900)}`,
                  description: 'Fresh quality grocery store item.',
                  image: ''
                });
                setImageInputMode('upload');
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-ivory-50 p-3.5 rounded-2xl border border-gray-200 text-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search 40 products by name, brand, weight, category, SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
              />
              {productSearch && (
                <button onClick={() => setProductSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-charcoal">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:border-forest"
            >
              <option value="all">All Categories</option>
              {(categories && categories.length > 0 ? categories.map(c => c.name) : ALL_STORE_CATEGORIES).map((catName) => (
                <option key={catName} value={catName}>{catName}</option>
              ))}
            </select>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setStockStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  stockStatusFilter === 'all' ? 'bg-forest text-white' : 'bg-white text-charcoal-muted border hover:bg-gray-50'
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setStockStatusFilter('in_stock')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  stockStatusFilter === 'in_stock' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
                }`}
              >
                In Stock ({products.filter(p => p.inStock !== false && (p.stock || 0) > 0).length})
              </button>
              <button
                type="button"
                onClick={() => setStockStatusFilter('out_of_stock')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  stockStatusFilter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                }`}
              >
                Out of Stock ({products.filter(p => p.inStock === false || (p.stock || 0) === 0).length})
              </button>
              <button
                type="button"
                onClick={() => setStockStatusFilter('low_stock')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  stockStatusFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Low Stock ({products.filter(p => (p.stock || 0) <= 15).length})
              </button>
            </div>
          </div>

          {/* Products Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-muted uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Product Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Weight / Size</th>
                  <th className="p-3">In / Out of Stock</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Price & MRP</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-charcoal-muted">
                      No products match your current search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isInStock = p.inStock !== false && (p.stock || 0) > 0;
                    return (
                      <tr key={p.id} className="hover:bg-ivory-50/80 transition-colors">
                        {/* Product Info */}
                        <td className="p-3 flex items-center gap-3">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-12 h-12 object-contain p-1 bg-white rounded-xl border border-gray-200 shadow-xs flex-shrink-0" 
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-charcoal truncate" title={p.name}>{p.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-charcoal-muted mt-0.5">
                              <span className="font-semibold text-forest uppercase">{p.brand}</span>
                              <span>•</span>
                              <span>SKU: {p.sku || p.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-ivory-200 text-charcoal">
                            {p.category.split('&')[0]}
                          </span>
                        </td>

                        {/* Weight / Pack Size */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                            <input
                              type="text"
                              defaultValue={p.packSize}
                              key={`${p.id}-${p.packSize}`}
                              onBlur={(e) => {
                                if (e.target.value !== p.packSize) {
                                  handleUpdatePackSize(p.id, e.target.value);
                                }
                              }}
                              className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-charcoal focus:border-forest focus:outline-none"
                              title="Click to edit weight/pack size"
                            />
                          </div>
                        </td>

                        {/* In / Out of Stock Toggle */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleProductInStock(p)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all flex items-center gap-1.5 shadow-xs active:scale-95 ${
                              isInStock
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                            }`}
                            title="Click to toggle In Stock / Out of Stock"
                          >
                            <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span>{isInStock ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                          </button>
                        </td>

                        {/* Stock Units Stepper */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, -5)}
                              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-charcoal font-bold flex items-center justify-center transition-colors"
                              title="Decrease stock by 5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              defaultValue={p.stock}
                              key={`${p.id}-${p.stock}`}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val) && val !== p.stock) {
                                  api.updateProduct(p.id, { stock: val, inStock: val > 0 });
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: val, inStock: val > 0 } : item));
                                  showToast(`Stock updated to ${val} units`, 'info');
                                }
                              }}
                              className={`w-14 px-1.5 py-1 text-center font-bold text-xs bg-white border rounded-lg focus:outline-none focus:border-forest ${
                                (p.stock || 0) <= 15 ? 'text-red-600 border-red-300 font-black' : 'text-charcoal border-gray-200'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, 5)}
                              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-charcoal font-bold flex items-center justify-center transition-colors"
                              title="Increase stock by 5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Price & MRP */}
                        <td className="p-3">
                          <span className="font-bold text-forest text-xs">₹{p.price}</span>
                          {p.mrp > p.price && (
                            <span className="text-[10px] text-charcoal-light line-through ml-1.5">₹{p.mrp}</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  brand: p.brand,
                                  category: p.category,
                                  packSize: p.packSize,
                                  price: p.price,
                                  mrp: p.mrp,
                                  stock: p.stock,
                                  inStock: p.inStock !== false && p.stock > 0,
                                  sku: p.sku || p.id,
                                  description: p.description || '',
                                  image: p.image
                                });
                                setImageInputMode('upload');
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-forest/10 rounded-lg text-forest transition-colors"
                              title="Edit full product details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Products Mobile Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-muted bg-ivory-50 rounded-2xl">
                No products match your current search or filters.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isInStock = p.inStock !== false && (p.stock || 0) > 0;
                return (
                  <div key={p.id} className="p-3.5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
                    {/* Top row: Image + Name + Category + Edit/Delete */}
                    <div className="flex items-start gap-3">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-14 h-14 object-contain p-1 bg-white rounded-xl border border-gray-200 shadow-xs flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-bold text-xs text-charcoal leading-tight line-clamp-2">{p.name}</p>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  brand: p.brand,
                                  category: p.category,
                                  packSize: p.packSize,
                                  price: p.price,
                                  mrp: p.mrp,
                                  stock: p.stock,
                                  inStock: p.inStock !== false && p.stock > 0,
                                  sku: p.sku || p.id,
                                  description: p.description || '',
                                  image: p.image
                                });
                                setImageInputMode('upload');
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-forest/10 rounded-lg text-forest"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-charcoal-muted mt-1">
                          <span className="font-semibold text-forest uppercase">{p.brand}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 bg-ivory-100 rounded text-charcoal">{p.category.split('&')[0]}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="font-black text-forest text-sm">₹{p.price}</span>
                          {p.mrp > p.price && (
                            <span className="text-[10px] text-charcoal-light line-through">₹{p.mrp}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle row: In/Out Toggle & Weight Input */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 items-center">
                      <button
                        type="button"
                        onClick={() => handleToggleProductInStock(p)}
                        className={`w-full py-2 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 ${
                          isInStock
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{isInStock ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                      </button>

                      <div className="flex items-center gap-1 bg-ivory-50 border border-gray-200 rounded-xl px-2 py-1">
                        <Scale className="w-3 h-3 text-forest flex-shrink-0" />
                        <input
                          type="text"
                          defaultValue={p.packSize}
                          key={`${p.id}-${p.packSize}`}
                          onBlur={(e) => {
                            if (e.target.value !== p.packSize) {
                              handleUpdatePackSize(p.id, e.target.value);
                            }
                          }}
                          className="w-full bg-transparent text-xs font-bold text-charcoal focus:outline-none"
                          placeholder="Pack size"
                        />
                      </div>
                    </div>

                    {/* Bottom row: Quick Weight Chips & Stock Stepper */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {['250 g', '500 g', '1 kg', '2 kg', '5 kg', '1 L'].map(sz => (
                          <button
                            type="button"
                            key={sz}
                            onClick={() => handleUpdatePackSize(p.id, sz)}
                            className={`px-1.5 py-0.5 rounded text-[9px] border font-bold ${
                              p.packSize === sz ? 'bg-forest text-white border-forest' : 'bg-white text-charcoal-muted border-gray-200'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuickStockChange(p.id, -5)}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs text-charcoal font-bold flex items-center justify-center active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-charcoal">{p.stock}</span>
                        <button
                          type="button"
                          onClick={() => handleQuickStockChange(p.id, 5)}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs text-charcoal font-bold flex items-center justify-center active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-charcoal">Inventory & Stock Adjustment</h3>
            <p className="text-xs text-charcoal-muted">Quickly adjust in-store physical inventory on shelf arrival.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-gray-200 bg-ivory-50 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-charcoal truncate">{p.name}</p>
                  <p className="text-[11px] text-charcoal-muted">{p.packSize} • {p.brand}</p>
                  <p className={`text-xs font-black mt-1 ${p.stock <= 15 ? 'text-red-600' : 'text-forest'}`}>
                    Current Stock: {p.stock} units
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickStockChange(p.id, -5)}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-charcoal hover:bg-gray-100"
                    title="Subtract 5"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleQuickStockChange(p.id, 10)}
                    className="px-2 py-1 bg-forest text-white rounded-lg font-bold hover:bg-forest-dark"
                    title="Add 10"
                  >
                    +10
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4b. PROMO CODES TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-card">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-extrabold text-lg text-charcoal">
                  Store Promo Codes & Discount Vouchers
                </h3>
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Create, edit, activate/deactivate, and delete discount codes for supermarket shoppers in Madhubani.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCoupon(null);
                setCouponForm({
                  code: '',
                  title: '',
                  description: '',
                  discountType: 'flat',
                  discountValue: 50,
                  minOrderValue: 499,
                  maxDiscount: 50,
                  isActive: true,
                  isPublic: true,
                  expiryDate: '2027-12-31'
                });
                setIsCouponModalOpen(true);
              }}
              className="px-4 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Promo Code</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-ivory-50 p-3.5 rounded-2xl border border-gray-200 text-xs">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search promo codes, titles..."
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-forest text-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              {(['all', 'active', 'inactive'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setCouponStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                    couponStatusFilter === status
                      ? 'bg-forest text-white'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  {status} ({
                    status === 'all' 
                      ? coupons.length 
                      : status === 'active' 
                        ? coupons.filter(c => c.isActive !== false).length 
                        : coupons.filter(c => c.isActive === false).length
                  })
                </button>
              ))}
            </div>
          </div>

          {/* Promo Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons
              .filter(c => {
                const matchesSearch = 
                  c.code.toLowerCase().includes(couponSearch.toLowerCase()) ||
                  c.title.toLowerCase().includes(couponSearch.toLowerCase()) ||
                  (c.description && c.description.toLowerCase().includes(couponSearch.toLowerCase()));
                const matchesStatus = 
                  couponStatusFilter === 'all' ? true :
                  couponStatusFilter === 'active' ? c.isActive !== false :
                  c.isActive === false;
                return matchesSearch && matchesStatus;
              })
              .map(coupon => (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-2xl border-2 p-5 shadow-card transition-all flex flex-col justify-between space-y-4 ${
                    coupon.isActive !== false 
                      ? 'border-forest/20 hover:border-forest/40' 
                      : 'border-gray-200 bg-gray-50/60 opacity-80'
                  }`}
                >
                  <div>
                    {/* Top Row: Code Badge & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm px-3 py-1 rounded-lg bg-forest/10 text-forest border border-forest/20 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            showToast(`Code ${coupon.code} copied!`, 'success');
                          }}
                          className="p-1 text-charcoal-muted hover:text-forest transition-colors"
                          title="Copy promo code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          coupon.isPublic !== false 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {coupon.isPublic !== false ? '🌐 Public' : '🔒 Secret'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleCouponStatus(coupon)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                            coupon.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${coupon.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span>{coupon.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h4 className="font-bold text-sm text-charcoal leading-snug">
                      {coupon.title}
                    </h4>
                    {coupon.description && (
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        {coupon.description}
                      </p>
                    )}

                    {/* Benefit Details Chips */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="bg-ivory-50 p-2 rounded-xl">
                        <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">Discount</span>
                        <span className="font-black text-forest text-sm">
                          {coupon.discountType === 'free_delivery'
                            ? 'FREE DELIVERY'
                            : coupon.discountType === 'flat'
                            ? `₹${coupon.discountValue} FLAT`
                            : `${coupon.discountValue}% OFF`}
                        </span>
                        {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                          <span className="text-[9px] text-charcoal-muted block">Up to ₹{coupon.maxDiscount}</span>
                        )}
                      </div>

                      <div className="bg-ivory-50 p-2 rounded-xl">
                        <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">Min Cart</span>
                        <span className="font-black text-charcoal text-sm">
                          {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : 'No Min'}
                        </span>
                        <span className="text-[9px] text-charcoal-muted block">Minimum cart total</span>
                      </div>
                    </div>

                    {coupon.expiryDate && (
                      <div className="flex items-center gap-1.5 text-[10px] text-charcoal-muted mt-2">
                        <Calendar className="w-3 h-3 text-forest" />
                        <span>Valid until: <strong>{coupon.expiryDate}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit & Delete Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCoupon(coupon);
                        setCouponForm({
                          code: coupon.code,
                          title: coupon.title,
                          description: coupon.description || '',
                          discountType: coupon.discountType || 'flat',
                          discountValue: coupon.discountValue || 0,
                          minOrderValue: coupon.minOrderValue || 0,
                          maxDiscount: coupon.maxDiscount || 0,
                          isActive: coupon.isActive !== false,
                          isPublic: coupon.isPublic !== false,
                          expiryDate: coupon.expiryDate || '2027-12-31'
                        });
                        setIsCouponModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 bg-forest/10 hover:bg-forest text-forest hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon)}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                      title="Delete promo code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {coupons.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
              <Tag className="w-12 h-12 text-charcoal-light mx-auto" />
              <h4 className="font-bold text-charcoal text-base">No Promo Codes Created Yet</h4>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                Create promotional discount codes for your supermarket customers in Madhubani to boost sales.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. STORE SETTINGS TAB */}
      {activeTab === 'settings' && adminSettings && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-card space-y-6 text-xs">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-charcoal">Supermarket Store Settings</h3>
            <p className="text-xs text-charcoal-muted">Configure store timings, delivery charges, and announcement banners.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal mb-1">Store Name</label>
              <input
                type="text"
                value={adminSettings.storeName}
                onChange={(e) => setAdminSettings({ ...adminSettings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-ivory-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">WhatsApp Order Number</label>
              <input
                type="text"
                value={adminSettings.whatsappNumber}
                onChange={(e) => setAdminSettings({ ...adminSettings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 bg-ivory-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">Daily Store Timings</label>
              <input
                type="text"
                value={adminSettings.storeTimings}
                onChange={(e) => setAdminSettings({ ...adminSettings, storeTimings: e.target.value })}
                className="w-full px-3 py-2 bg-ivory-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={adminSettings.deliveryFee}
                onChange={(e) => setAdminSettings({ ...adminSettings, deliveryFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-ivory-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={adminSettings.freeDeliveryThreshold}
                onChange={(e) => setAdminSettings({ ...adminSettings, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-ivory-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                value={adminSettings.minOrderValue}
                onChange={(e) => setAdminSettings({ ...adminSettings, minOrderValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-ivory-50 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-charcoal mb-1">Top Announcement Banner Text</label>
              <input
                type="text"
                value={adminSettings.announcementText}
                onChange={(e) => setAdminSettings({ ...adminSettings, announcementText: e.target.value })}
                className="w-full px-3 py-2 bg-ivory-50 border rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold shadow"
          >
            Save Settings
          </button>
        </form>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-forest text-white flex items-center justify-between flex-shrink-0 shadow-xs">
              <h3 className="font-heading font-bold text-sm">
                {editingProduct ? 'Edit Supermarket Product' : 'Add New Grocery Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Weight / Pack Size (e.g. 500 g, 1 kg)</label>
                  <input
                    type="text"
                    required
                    value={productForm.packSize}
                    onChange={(e) => setProductForm({ ...productForm, packSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                  {/* Quick Weight Chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['100 g', '250 g', '500 g', '1 kg', '2 kg', '5 kg', '200 ml', '500 ml', '1 L'].map(sz => (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => setProductForm({ ...productForm, packSize: sz })}
                        className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                          productForm.packSize === sz ? 'bg-forest text-white border-forest' : 'bg-white text-charcoal-muted hover:bg-gray-100'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* In Stock / Out of Stock Toggle in Modal */}
              <div className="p-3 rounded-xl bg-ivory-100 flex items-center justify-between border border-gray-200">
                <div>
                  <span className="font-bold text-charcoal block">Stock Availability</span>
                  <span className="text-[10px] text-charcoal-muted">Controls whether customers can add this item to cart</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 text-forest rounded focus:ring-forest cursor-pointer"
                  />
                  <span className={`font-bold text-xs ${productForm.inStock ? 'text-forest' : 'text-red-600'}`}>
                    {productForm.inStock ? '🟢 In Stock' : '🔴 Out of Stock'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-bold mb-1">Category *</label>
                <select
                  value={productForm.category || ALL_STORE_CATEGORIES[0]}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white text-charcoal font-medium focus:border-forest focus:outline-none"
                  required
                >
                  {(categories && categories.length > 0 ? categories.map(c => c.name) : ALL_STORE_CATEGORIES).map((catName) => (
                    <option key={catName} value={catName}>{catName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Product Photo - Direct Photo Upload or Paste URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-charcoal">
                    Product Photo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        imageInputMode === 'upload' 
                          ? 'bg-forest text-white shadow-xs' 
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      📸 Direct Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        imageInputMode === 'url' 
                          ? 'bg-forest text-white shadow-xs' 
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      🔗 Paste URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    {productForm.image ? (
                      <div className="p-3 bg-forest/5 border-2 border-forest/20 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-xl bg-white border border-forest/30 overflow-hidden shadow-xs flex-shrink-0 flex items-center justify-center">
                            <img
                              src={productForm.image}
                              alt="Product Preview"
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as any).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                              }}
                            />
                            {isUploadingImage && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-forest font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Photo Attached</span>
                            </div>
                            <p className="text-[10px] text-charcoal-muted truncate max-w-[200px]">
                              {productForm.image.startsWith('data:') ? 'Local preview attached' : productForm.image}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="px-2.5 py-1.5 bg-white border border-forest/30 hover:border-forest text-forest hover:bg-forest/5 font-bold text-[11px] rounded-xl cursor-pointer transition-colors shadow-xs flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, image: '' })}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-forest/40 hover:border-forest bg-forest/5 hover:bg-forest/10 rounded-2xl cursor-pointer transition-all group">
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center py-2">
                            <Loader2 className="w-8 h-8 text-forest animate-spin mb-2" />
                            <span className="font-bold text-forest text-xs">Uploading photo to supermarket...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-forest/20 flex items-center justify-center text-forest group-hover:scale-110 transition-transform mb-2">
                              <Camera className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xs text-charcoal group-hover:text-forest transition-colors">
                              Click or Tap to Upload Product Photo
                            </span>
                            <span className="text-[10px] text-charcoal-muted mt-0.5 text-center">
                              Select from Computer / Phone Gallery (JPG, PNG, WEBP max 8MB)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </>
                        )}
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://example.com/item-image.jpg"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                    {productForm.image && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        <img
                          src={productForm.image}
                          alt="URL preview"
                          className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-100"
                        />
                        <span className="text-[11px] text-charcoal-muted truncate flex-1">
                          {productForm.image}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-gray-100 flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold transition-colors shadow">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-xl font-bold transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promo Code Add / Edit Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-forest text-white flex items-center justify-between flex-shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-warmYellow" />
                <h3 className="font-heading font-bold text-sm">
                  {editingCoupon ? `Edit Promo Code: ${editingCoupon.code}` : 'Create New Promo Code'}
                </h3>
              </div>
              <button onClick={() => setIsCouponModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold mb-1 text-charcoal">
                  Promo Code Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI50, KD100, SAVE10"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  className="w-full px-3 py-2 border rounded-xl font-mono uppercase font-black tracking-wider focus:outline-none focus:border-forest text-sm bg-ivory-50"
                />
                <span className="text-[10px] text-charcoal-muted mt-0.5 block">
                  Shoppers will type this code exactly at checkout.
                </span>
              </div>

              <div>
                <label className="block font-bold mb-1 text-charcoal">Offer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat ₹50 Off on Groceries"
                  value={couponForm.title}
                  onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-charcoal">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Valid on minimum purchase of ₹499 across all supermarket products in Madhubani"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-forest"
                />
              </div>

              {/* Discount Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-charcoal">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => {
                      const dt = e.target.value as any;
                      setCouponForm({
                        ...couponForm,
                        discountType: dt,
                        title: dt === 'free_delivery' && !couponForm.title ? 'Free Home Delivery' : couponForm.title,
                        discountValue: dt === 'free_delivery' ? 0 : (couponForm.discountValue || 50)
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none focus:border-forest font-semibold"
                  >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="free_delivery">🚚 Free Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-charcoal">
                    {couponForm.discountType === 'free_delivery' 
                      ? 'Delivery Benefit' 
                      : couponForm.discountType === 'flat' 
                      ? 'Discount Amount (₹)' 
                      : 'Discount Rate (%)'}
                  </label>
                  {couponForm.discountType === 'free_delivery' ? (
                    <div className="w-full px-3 py-2 border rounded-xl bg-gray-50 text-forest font-bold text-xs flex items-center h-[42px]">
                      100% OFF on Delivery
                    </div>
                  ) : (
                    <input
                      type="number"
                      required
                      min={1}
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-forest font-bold"
                    />
                  )}
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-charcoal">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-charcoal">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block font-bold mb-1 text-charcoal">Expiry Date</label>
                <input
                  type="date"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-forest bg-white"
                />
              </div>

              {/* Public Visibility Toggle */}
              <div className="p-3.5 bg-ivory-50 rounded-xl border border-gray-200 space-y-2">
                <div>
                  <span className="font-bold text-xs text-charcoal block">Public Promo Code (Show to Customers?)</span>
                  <span className="text-[10px] text-charcoal-muted">Kya is promo code ko checkout aur offers list me sabhi customers ko dikhana hai?</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    couponForm.isPublic 
                      ? 'bg-emerald-50 border-emerald-400 text-forest font-bold shadow-xs' 
                      : 'bg-white border-gray-200 text-charcoal'
                  }`}>
                    <input
                      type="radio"
                      name="isPublic"
                      checked={couponForm.isPublic === true}
                      onChange={() => setCouponForm({ ...couponForm, isPublic: true })}
                      className="text-forest cursor-pointer"
                    />
                    <span>✅ Yes (Public List)</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    !couponForm.isPublic 
                      ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold shadow-xs' 
                      : 'bg-white border-gray-200 text-charcoal'
                  }`}>
                    <input
                      type="radio"
                      name="isPublic"
                      checked={couponForm.isPublic === false}
                      onChange={() => setCouponForm({ ...couponForm, isPublic: false })}
                      className="text-purple-600 cursor-pointer"
                    />
                    <span>🔒 No (Secret Code)</span>
                  </label>
                </div>
                <p className="text-[10px] text-charcoal-muted mt-1 leading-normal">
                  {couponForm.isPublic 
                    ? '👉 Customers checkout par Available Coupons list se directly 1-click me apply kar payenge.' 
                    : '👉 Customer jab tak khud exact code type karke "Apply" nahi dabayega, tab tak kisi ko list me nahi dikhega.'}
                </p>
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-ivory-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-charcoal block">Coupon Active Status</span>
                  <span className="text-[10px] text-charcoal-muted">Customers can only use active promo codes at checkout</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-forest rounded cursor-pointer"
                  />
                  <span className={`font-bold text-xs ${couponForm.isActive ? 'text-forest' : 'text-red-500'}`}>
                    {couponForm.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-gray-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold transition-colors shadow"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Promo Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
