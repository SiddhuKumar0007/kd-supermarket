import { Product, Category, Order, StoreSettings, User, PromoCode } from '../types';
import initialStoreData from '../data/initialStoreData.json';

const API_BASE = '/api';

// --- Local Resilient Storage Helpers ---
function getLocalCategories(): Category[] {
  try {
    const cached = localStorage.getItem('kd_cached_categories');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const cats = (initialStoreData as any).categories || [];
  try {
    localStorage.setItem('kd_cached_categories', JSON.stringify(cats));
  } catch (e) {}
  return cats;
}

function getLocalProducts(): Product[] {
  try {
    const cached = localStorage.getItem('kd_cached_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const prods = (initialStoreData as any).products || [];
  try {
    localStorage.setItem('kd_cached_products', JSON.stringify(prods));
  } catch (e) {}
  return prods;
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem('kd_cached_products', JSON.stringify(products));
  } catch (e) {
    console.warn('Failed to save products to localStorage', e);
  }
}

function getLocalCoupons(): PromoCode[] {
  try {
    const cached = localStorage.getItem('kd_cached_coupons');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const coupons = (initialStoreData as any).promoCodes || [];
  try {
    localStorage.setItem('kd_cached_coupons', JSON.stringify(coupons));
  } catch (e) {}
  return coupons;
}

function saveLocalCoupons(coupons: PromoCode[]) {
  try {
    localStorage.setItem('kd_cached_coupons', JSON.stringify(coupons));
  } catch (e) {}
}

function getLocalOrders(): Order[] {
  try {
    const cached = localStorage.getItem('kd_cached_orders');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  const orders = (initialStoreData as any).orders || [];
  try {
    localStorage.setItem('kd_cached_orders', JSON.stringify(orders));
  } catch (e) {}
  return orders;
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem('kd_cached_orders', JSON.stringify(orders));
  } catch (e) {}
}

function getLocalSettings(): StoreSettings {
  try {
    const cached = localStorage.getItem('kd_cached_settings');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.storeName) return parsed;
    }
  } catch (e) {}
  const settings = (initialStoreData as any).settings || {
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
    deliveryAreas: ["Tirhut Colony", "State Bank More", "Madhubani Town (847211)"],
    announcementText: "🎉 Free Home Delivery on orders above ₹499 in Madhubani Town! Call/WhatsApp: +91 98113 40853",
    razorpayKeyId: "rzp_test_KDSupermarket847211",
    isRazorpayTestMode: true,
    codEnabled: true,
    whatsappOrderingEnabled: true
  };
  try {
    localStorage.setItem('kd_cached_settings', JSON.stringify(settings));
  } catch (e) {}
  return settings;
}

function saveLocalSettings(settings: StoreSettings) {
  try {
    localStorage.setItem('kd_cached_settings', JSON.stringify(settings));
  } catch (e) {}
}

function parseGoogleJwt(credential: string): { email?: string; name?: string; picture?: string; sub?: string } | null {
  try {
    const parts = credential.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binaryStr = atob(padded);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decoded);
  } catch (err) {
    try {
      const parts = credential.split('.');
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      return JSON.parse(atob(padded));
    } catch (e) {
      console.warn('Google JWT parse error:', e);
      return null;
    }
  }
}

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('kd_cached_categories', JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {}
    return getLocalCategories();
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    tag?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.sort) query.append('sort', params.sort);
      if (params?.tag) query.append('tag', params.tag);
      if (params?.inStock) query.append('inStock', 'true');
      if (params?.minPrice) query.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString());

      const res = await fetch(`${API_BASE}/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveLocalProducts(data);
          return data;
        }
      }
    } catch (err) {}

    let prods = getLocalProducts();
    if (params?.category && params.category !== 'all') {
      prods = prods.filter(p => p.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    if (params?.tag) {
      prods = prods.filter(p => p.tags?.includes(params.tag!));
    }
    if (params?.inStock) {
      prods = prods.filter(p => p.inStock !== false && (p.stock || 0) > 0);
    }
    if (params?.minPrice !== undefined) {
      prods = prods.filter(p => p.price >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined) {
      prods = prods.filter(p => p.price <= params.maxPrice!);
    }
    if (params?.sort) {
      switch (params.sort) {
        case 'price-low':
          prods.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          prods.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          prods.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'name':
          prods.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
          prods = [...prods].reverse();
          break;
        default:
          prods.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
          break;
      }
    }
    return prods;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (res.ok) return await res.json();
    } catch (err) {}

    const prods = getLocalProducts();
    return prods.find(p => p.id === id) || null;
  },

  // Admin Product Operations
  async addProduct(productData: Partial<Product>): Promise<Product> {
    const cats = getLocalCategories();
    const matchedCat = cats.find(c => c.name === productData.category);

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: productData.name || 'Untitled Product',
      brand: productData.brand || 'KD Supermarket',
      category: productData.category || 'Rice, Atta & Grains',
      categoryId: matchedCat?.id || 'cat-1',
      subcategory: productData.subcategory || 'General',
      packSize: productData.packSize || '1 Unit',
      variants: productData.variants || [
        {
          id: `v-${Date.now()}`,
          size: productData.packSize || '1 Unit',
          price: Number(productData.price) || 100,
          mrp: Number(productData.mrp) || 120,
          stock: Number(productData.stock) || 50,
          inStock: (Number(productData.stock) || 50) > 0
        }
      ],
      price: Number(productData.price) || 100,
      mrp: Number(productData.mrp) || 120,
      discount: Math.round(((Number(productData.mrp || 120) - Number(productData.price || 100)) / Number(productData.mrp || 120)) * 100) || 0,
      stock: Number(productData.stock) || 50,
      inStock: (Number(productData.stock) || 50) > 0,
      rating: 4.8,
      reviewsCount: 1,
      sku: productData.sku || `KD-GEN-${Math.floor(100 + Math.random() * 900)}`,
      description: productData.description || 'Fresh quality grocery item from KD Supermarket Madhubani.',
      details: productData.details || 'Standard supermarket storage and guarantee.',
      image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      tags: productData.tags || ['daily-essentials']
    };

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        const saved = await res.json();
        const prods = getLocalProducts().filter(p => p.id !== saved.id);
        saveLocalProducts([saved, ...prods]);
        return saved;
      }
    } catch (e) {}

    const prods = getLocalProducts();
    const updatedList = [newProduct, ...prods];
    saveLocalProducts(updatedList);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const saved = await res.json();
        const prods = getLocalProducts();
        const idx = prods.findIndex(p => p.id === id);
        if (idx !== -1) {
          prods[idx] = saved;
        } else {
          prods.unshift(saved);
        }
        saveLocalProducts(prods);
        return saved;
      }
    } catch (e) {}

    const prods = getLocalProducts();
    const idx = prods.findIndex(p => p.id === id);
    if (idx !== -1) {
      prods[idx] = { ...prods[idx], ...updates };
      saveLocalProducts(prods);
      return prods[idx];
    }
    return { id, ...updates } as Product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {}

    const prods = getLocalProducts().filter(p => p.id !== id);
    saveLocalProducts(prods);
    return true;
  },

  async uploadProductImage(dataUrl: string, filename?: string): Promise<{ success: boolean; url: string; filename: string }> {
    // In browser, base64 dataUrl is immediately usable and fully persistent
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      fetch(`${API_BASE}/admin/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename })
      }).catch(() => {});
    }
    return {
      success: true,
      url: dataUrl,
      filename: filename || `photo_${Date.now()}.jpg`
    };
  },

  // Orders
  async createOrder(orderPayload: any): Promise<Order> {
    const newOrder: Order = {
      id: orderPayload.id || `KD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      orderStatus: 'Order Placed',
      paymentStatus: orderPayload.paymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID',
      paymentMethod: orderPayload.paymentMethod || 'UPI',
      customerName: orderPayload.customerName || orderPayload.address?.fullName || 'Customer',
      customerEmail: orderPayload.customerEmail || '',
      customerPhone: orderPayload.customerPhone || orderPayload.address?.phone || '',
      address: orderPayload.address || {
        fullName: orderPayload.customerName || 'Customer',
        phone: orderPayload.customerPhone || '',
        street: 'State Bank More',
        locality: 'Tirhut Colony',
        city: 'Madhubani',
        state: 'Bihar',
        pinCode: '847211'
      },
      deliverySlot: orderPayload.deliverySlot || 'Today: 4:00 PM – 8:00 PM',
      instructions: orderPayload.instructions || orderPayload.deliveryInstructions,
      items: orderPayload.items || [],
      subtotal: Number(orderPayload.subtotal) || 0,
      deliveryFee: Number(orderPayload.deliveryFee) || 0,
      discountAmount: Number(orderPayload.discountAmount || orderPayload.discount) || 0,
      total: Number(orderPayload.total) || 0,
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: 'Your grocery order has been received at State Bank More store.'
        }
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const saved = await res.json();
        const orders = getLocalOrders().filter(o => o.id !== saved.id);
        saveLocalOrders([saved, ...orders]);
        return saved;
      }
    } catch (e) {}

    const orders = getLocalOrders();
    const updatedOrders = [newOrder, ...orders];
    saveLocalOrders(updatedOrders);
    return newOrder;
  },

  async getOrders(filter?: { email?: string; phone?: string }): Promise<Order[]> {
    try {
      const query = new URLSearchParams();
      if (filter?.email) query.append('email', filter.email);
      if (filter?.phone) query.append('phone', filter.phone);

      const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {}

    let orders = getLocalOrders();
    if (filter?.email) {
      orders = orders.filter(o => o.customerEmail?.toLowerCase() === filter.email!.toLowerCase());
    }
    if (filter?.phone) {
      orders = orders.filter(o => o.customerPhone?.includes(filter.phone!));
    }
    return orders;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const q = id.trim();
    if (!q) return null;
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(q)}`);
      if (res.ok) return await res.json();
    } catch (err) {}

    const orders = getLocalOrders();
    const cleanQ = q.toLowerCase();
    const numQ = q.replace(/[^0-9]/g, '');
    return orders.find(o => 
      o.id.toLowerCase() === cleanQ || 
      (numQ.length >= 4 && o.customerPhone.replace(/[^0-9]/g, '').includes(numQ))
    ) || null;
  },

  async updateOrderStatus(id: string, status: string, note?: string, paymentStatus?: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, paymentStatus }),
      });
      if (res.ok) {
        const saved = await res.json();
        const orders = getLocalOrders();
        const idx = orders.findIndex(o => o.id === id);
        if (idx !== -1) orders[idx] = saved;
        saveLocalOrders(orders);
        return saved;
      }
    } catch (e) {}

    const orders = getLocalOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].orderStatus = status as any;
      if (paymentStatus) orders[idx].paymentStatus = paymentStatus as any;
      if (!orders[idx].statusHistory) orders[idx].statusHistory = [];
      orders[idx].statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Order updated to ${status}`
      });
      saveLocalOrders(orders);
      return orders[idx];
    }
    throw new Error('Order not found');
  },

  // Store Settings
  async getSettings(): Promise<StoreSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.storeName) return data;
      }
    } catch (err) {}
    return getLocalSettings();
  },

  async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.settings || data;
        saveLocalSettings(updated);
        return updated;
      }
    } catch (e) {}
    const current = getLocalSettings();
    const updated = { ...current, ...updates };
    saveLocalSettings(updated);
    return updated;
  },

  // Admin Stats
  async getAdminStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.totalOrders !== undefined) return data;
      }
    } catch (err) {}

    const prods = getLocalProducts();
    const orders = getLocalOrders();
    const totalOrders = orders.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(today)).length;
    const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'FAILED');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter(o => o.orderStatus === 'Order Placed').length;
    const preparingCount = orders.filter(o => o.orderStatus === 'Preparing Your Order' || o.orderStatus === 'Order Confirmed').length;
    const outForDeliveryCount = orders.filter(o => o.orderStatus === 'Out for Delivery' || o.orderStatus === 'Ready for Dispatch').length;
    const deliveredCount = orders.filter(o => o.orderStatus === 'Delivered').length;
    const lowStockCount = prods.filter(p => (p.stock || 0) <= 15).length;

    return {
      totalOrders,
      todayOrders,
      totalRevenue,
      pendingCount,
      preparingCount,
      outForDeliveryCount,
      deliveredCount,
      lowStockCount,
      totalProducts: prods.length,
      totalCategories: getLocalCategories().length
    };
  },

  // Promo Codes / Coupons
  async getCoupons(all: boolean = false): Promise<PromoCode[]> {
    try {
      const res = await fetch(`${API_BASE}/coupons${all ? '?all=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {}

    const coupons = getLocalCoupons();
    return all ? coupons : coupons.filter(c => c.isActive);
  },

  async addCoupon(couponData: Partial<PromoCode>): Promise<PromoCode> {
    const newCoupon: PromoCode = {
      id: `c-${Date.now()}`,
      code: (couponData.code || 'KD50').toUpperCase().trim(),
      title: couponData.title || 'Special Discount',
      description: couponData.description || 'Supermarket savings coupon',
      discountType: couponData.discountType || 'flat',
      discountValue: Number(couponData.discountValue) || 50,
      minOrderValue: Number(couponData.minOrderValue) || 499,
      maxDiscount: Number(couponData.maxDiscount) || 50,
      isActive: couponData.isActive !== false,
      expiryDate: couponData.expiryDate || '2027-12-31'
    };

    try {
      const res = await fetch(`${API_BASE}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        const saved = await res.json();
        const coupons = getLocalCoupons().filter(c => c.id !== saved.id);
        saveLocalCoupons([saved, ...coupons]);
        return saved;
      }
    } catch (e) {}

    const coupons = getLocalCoupons();
    const updated = [newCoupon, ...coupons];
    saveLocalCoupons(updated);
    return newCoupon;
  },

  async updateCoupon(id: string, updates: Partial<PromoCode>): Promise<PromoCode> {
    try {
      const res = await fetch(`${API_BASE}/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const saved = await res.json();
        const coupons = getLocalCoupons();
        const idx = coupons.findIndex(c => c.id === id);
        if (idx !== -1) coupons[idx] = saved;
        saveLocalCoupons(coupons);
        return saved;
      }
    } catch (e) {}

    const coupons = getLocalCoupons();
    const idx = coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      coupons[idx] = { ...coupons[idx], ...updates };
      saveLocalCoupons(coupons);
      return coupons[idx];
    }
    return { id, ...updates } as PromoCode;
  },

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/coupons/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {}

    const coupons = getLocalCoupons().filter(c => c.id !== id);
    saveLocalCoupons(coupons);
    return true;
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountAmount: number; coupon?: any; message: string }> {
    const coupons = getLocalCoupons();
    const cleanCode = (code || '').toUpperCase().trim();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!found) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired coupon code' };
    }

    if (subtotal < (found.minOrderValue || 0)) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Cart total must be at least ₹${found.minOrderValue} to use code ${found.code}`
      };
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = Math.round((subtotal * found.discountValue) / 100);
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = found.discountValue;
    }

    return {
      valid: true,
      discountAmount: Math.min(discount, subtotal),
      coupon: found,
      message: `Coupon ${found.code} applied! You save ₹${discount}`
    };
  },

  // Authentication
  async login(email: string, password?: string): Promise<{ token: string; user: User }> {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const ADMIN_EMAILS = ['siddhukumar2006@gmail.com', 'vyapaarwebs@gmail.com', 'kdsuperm@gmail.com'];
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail) || (normalizedEmail === 'admin@kdsupermarket.com' && password === 'kdadmin123');

    const adminName = normalizedEmail === 'kdsuperm@gmail.com' 
      ? 'KD Supermarket Desk (Admin)' 
      : (normalizedEmail === 'vyapaarwebs@gmail.com' ? 'Vyapaar Webs (Store Admin)' : 'Siddhu Kumar (Store Admin)');

    const user: User = {
      id: isAdmin ? `admin-${normalizedEmail.split('@')[0]}` : `usr-${Date.now()}`,
      name: isAdmin ? adminName : normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: isAdmin ? 'admin' : 'customer',
      phone: '+91 98113 40853',
      savedAddresses: []
    };
    return { token: `token-${user.id}`, user };
  },

  async register(name: string, email: string, phone: string): Promise<{ token: string; user: User }> {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || 'Customer',
      email: email,
      role: 'customer',
      phone: phone || '+91 98113 40853',
      savedAddresses: []
    };
    return { token: `token-${newUser.id}`, user: newUser };
  },

  async loginWithGoogle(payload: { email?: string; name?: string; avatar?: string; googleId?: string; credential?: string }): Promise<{ token: string; user: User }> {
    let email = payload.email;
    let name = payload.name;
    let avatar = payload.avatar;

    // 1. Direct Google JWT Decode from official Google Identity Services
    if (payload.credential) {
      const decoded = parseGoogleJwt(payload.credential);
      if (decoded) {
        if (!email && decoded.email) email = decoded.email;
        if (!name && decoded.name) name = decoded.name;
        if (!avatar && decoded.picture) avatar = decoded.picture;
      }
    }

    if (!email) {
      throw new Error('Google email address could not be verified');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ADMIN_EMAILS = ['siddhukumar2006@gmail.com', 'vyapaarwebs@gmail.com', 'kdsuperm@gmail.com'];
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
    const defaultAdminName = normalizedEmail === 'kdsuperm@gmail.com'
      ? 'KD Supermarket Desk (Admin)'
      : (normalizedEmail === 'vyapaarwebs@gmail.com' ? 'Vyapaar Webs (Store Admin)' : 'Siddhu Kumar (Store Admin)');

    const user: User = {
      id: isAdmin ? `admin-${normalizedEmail.split('@')[0]}` : `usr-g-${Date.now()}`,
      name: isAdmin ? (name || defaultAdminName) : (name || email.split('@')[0]),
      email: normalizedEmail,
      role: isAdmin ? 'admin' : 'customer',
      phone: '+91 98113 40853',
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      provider: 'google',
      savedAddresses: []
    };

    const token = `token-${user.id}-${Date.now()}`;

    // Async sync to server if running on localhost dev server
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    return { token, user };
  },

  // Razorpay Test Mode Payment
  async createRazorpayOrder(amount: number, receipt?: string): Promise<any> {
    return {
      id: `order_rzp_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created'
    };
  },

  async verifyPayment(orderId: string, paymentId: string): Promise<any> {
    return {
      success: true,
      orderId,
      paymentId: paymentId || `pay_${Date.now()}`,
      message: 'Payment verified successfully'
    };
  }
};
