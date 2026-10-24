import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storeFilePath = path.join(__dirname, 'data', 'store.json');

function readStore() {
  try {
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store.json, re-initializing...', err);
    return { categories: [], products: [], orders: [], settings: {}, users: [] };
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to store.json', err);
    return false;
  }
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

export function apiMiddleware(req, res, next) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  if (!pathname.startsWith('/api')) {
    return next();
  }

  handleApiRequest(req, res, urlObj, pathname).catch(err => {
    console.error('API Error:', err);
    sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  });
}

async function handleApiRequest(req, res, urlObj, pathname) {
  const method = req.method;
  const store = readStore();

  // 1. Health check
  if (pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'online',
      storeName: 'KD SUPERMARKET',
      location: 'Madhubani, Bihar 847211',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Settings
  if (pathname === '/api/settings' || pathname === '/api/admin/settings') {
    if (method === 'GET') {
      return sendJson(res, 200, store.settings);
    }
    if (method === 'PUT' || method === 'POST') {
      const updates = await parseJsonBody(req);
      store.settings = { ...store.settings, ...updates };
      writeStore(store);
      return sendJson(res, 200, { success: true, settings: store.settings });
    }
  }

  // 3. Categories
  if (pathname === '/api/categories') {
    if (method === 'GET') {
      return sendJson(res, 200, store.categories);
    }
    if (method === 'POST') {
      const newCat = await parseJsonBody(req);
      newCat.id = `cat-${Date.now()}`;
      newCat.itemCount = 0;
      store.categories.push(newCat);
      writeStore(store);
      return sendJson(res, 201, newCat);
    }
  }

  // 3b. Promo Codes / Coupons
  if (pathname === '/api/coupons' || pathname === '/api/admin/coupons') {
    if (!Array.isArray(store.coupons)) {
      store.coupons = [];
    }
    if (method === 'GET') {
      const all = urlObj.searchParams.get('all') === 'true';
      if (all) {
        return sendJson(res, 200, store.coupons);
      }
      const activeCoupons = store.coupons.filter(c => c.isActive !== false);
      return sendJson(res, 200, activeCoupons);
    }
    if (method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.code) {
        return sendJson(res, 400, { error: 'Coupon code is required' });
      }
      const cleanCode = body.code.trim().toUpperCase();
      const existing = store.coupons.find(c => c.code.toUpperCase() === cleanCode);
      if (existing) {
        return sendJson(res, 400, { error: `Coupon code '${cleanCode}' already exists` });
      }
      const newCoupon = {
        id: `coupon-${Date.now()}`,
        code: cleanCode,
        title: body.title || `${cleanCode} Promo Discount`,
        description: body.description || '',
        discountType: body.discountType === 'percentage' ? 'percentage' : 'flat',
        discountValue: Number(body.discountValue) || 0,
        minOrderValue: Number(body.minOrderValue) || 0,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : (body.discountType === 'percentage' ? 100 : Number(body.discountValue) || 0),
        isActive: body.isActive !== false,
        expiryDate: body.expiryDate || '2027-12-31',
        usageCount: 0
      };
      store.coupons.unshift(newCoupon);
      writeStore(store);
      return sendJson(res, 201, newCoupon);
    }
  }

  // Update / Delete single coupon: /api/admin/coupons/:id
  if (pathname.startsWith('/api/admin/coupons/') || pathname.startsWith('/api/coupons/')) {
    const parts = pathname.split('/');
    const couponId = parts[parts.length - 1];

    if (!Array.isArray(store.coupons)) {
      store.coupons = [];
    }

    if (couponId && couponId !== 'validate') {
      const idx = store.coupons.findIndex(c => c.id === couponId || c.code.toUpperCase() === couponId.toUpperCase());
      
      if (method === 'PUT' || method === 'PATCH') {
        if (idx === -1) return sendJson(res, 404, { error: 'Coupon not found' });
        const updates = await parseJsonBody(req);
        if (updates.code) updates.code = updates.code.trim().toUpperCase();
        if (updates.discountValue !== undefined) updates.discountValue = Number(updates.discountValue);
        if (updates.minOrderValue !== undefined) updates.minOrderValue = Number(updates.minOrderValue);
        if (updates.maxDiscount !== undefined) updates.maxDiscount = Number(updates.maxDiscount);

        store.coupons[idx] = { ...store.coupons[idx], ...updates };
        writeStore(store);
        return sendJson(res, 200, store.coupons[idx]);
      }

      if (method === 'DELETE') {
        if (idx === -1) return sendJson(res, 404, { error: 'Coupon not found' });
        const removed = store.coupons.splice(idx, 1)[0];
        writeStore(store);
        return sendJson(res, 200, { success: true, removed });
      }
    }
  }

  // Validate coupon at checkout: POST /api/coupons/validate
  if (pathname === '/api/coupons/validate' && method === 'POST') {
    const { code, subtotal } = await parseJsonBody(req);
    if (!code) {
      return sendJson(res, 400, { valid: false, message: 'Please enter a coupon code' });
    }
    const cleanCode = code.trim().toUpperCase();
    if (!Array.isArray(store.coupons)) store.coupons = [];
    const coupon = store.coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return sendJson(res, 404, { valid: false, message: `Promo code '${cleanCode}' is invalid` });
    }
    if (coupon.isActive === false) {
      return sendJson(res, 400, { valid: false, message: `Promo code '${cleanCode}' is currently inactive` });
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date(new Date().toDateString())) {
      return sendJson(res, 400, { valid: false, message: `Promo code '${cleanCode}' has expired` });
    }
    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.minOrderValue && orderSubtotal < coupon.minOrderValue) {
      return sendJson(res, 400, { 
        valid: false, 
        message: `Cart total must be at least ₹${coupon.minOrderValue} to use this coupon (Current: ₹${orderSubtotal})` 
      });
    }

    let discount = 0;
    if (coupon.discountType === 'flat') {
      discount = coupon.discountValue;
    } else {
      discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }
    discount = Math.min(discount, orderSubtotal);

    return sendJson(res, 200, {
      valid: true,
      discountAmount: discount,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      message: `Coupon '${coupon.code}' applied! ₹${discount} savings added.`
    });
  }

  // 4. Products List
  if (pathname === '/api/products' && method === 'GET') {
    let result = [...store.products];
    const category = urlObj.searchParams.get('category');
    const search = urlObj.searchParams.get('search');
    const sort = urlObj.searchParams.get('sort');
    const tag = urlObj.searchParams.get('tag');
    const inStock = urlObj.searchParams.get('inStock');
    const minPrice = Number(urlObj.searchParams.get('minPrice'));
    const maxPrice = Number(urlObj.searchParams.get('maxPrice'));

    if (category && category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase() || p.categoryId === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (tag) {
      result = result.filter(p => p.tags && p.tags.includes(tag));
    }

    if (inStock === 'true') {
      result = result.filter(p => p.inStock && p.stock > 0);
    }

    if (minPrice && !isNaN(minPrice)) {
      result = result.filter(p => p.price >= minPrice);
    }
    if (maxPrice && !isNaN(maxPrice)) {
      result = result.filter(p => p.price <= maxPrice);
    }

    if (sort) {
      switch (sort) {
        case 'price-low':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
          result.reverse();
          break;
        default:
          // Popularity: bestsellers first
          result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
      }
    }

    return sendJson(res, 200, result);
  }

  // 5. Products by ID
  const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch) {
    const id = productMatch[1];
    if (method === 'GET') {
      const prod = store.products.find(p => p.id === id);
      if (!prod) return sendJson(res, 404, { error: 'Product not found' });
      // Fetch related products
      const related = store.products
        .filter(p => p.category === prod.category && p.id !== prod.id)
        .slice(0, 4);
      return sendJson(res, 200, { ...prod, related });
    }
    if (method === 'PUT') {
      const updates = await parseJsonBody(req);
      const idx = store.products.findIndex(p => p.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Product not found' });
      store.products[idx] = { ...store.products[idx], ...updates };
      writeStore(store);
      return sendJson(res, 200, store.products[idx]);
    }
    if (method === 'DELETE') {
      const idx = store.products.findIndex(p => p.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Product not found' });
      const removed = store.products.splice(idx, 1)[0];
      writeStore(store);
      return sendJson(res, 200, { success: true, removed });
    }
  }

  // 5b. Direct Product Image Upload
  if (pathname === '/api/admin/upload-image' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { dataUrl, filename } = body;
      if (!dataUrl) {
        return sendJson(res, 400, { error: 'dataUrl is required' });
      }

      // Check format data:image/...;base64,...
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      let ext = 'jpg';
      let base64Data = dataUrl;

      if (matches) {
        ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        if (ext === 'svg+xml') ext = 'svg';
        base64Data = matches[2];
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase().substring(0, 30) : 'product_photo';
      const safeFilename = `upload_${Date.now()}_${cleanName}.${ext}`;
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const targetPath = path.join(uploadDir, safeFilename);
      fs.writeFileSync(targetPath, buffer);

      const publicUrl = `/images/products/${safeFilename}`;
      return sendJson(res, 200, { success: true, url: publicUrl, filename: safeFilename });
    } catch (err) {
      console.error('Image upload failed:', err);
      return sendJson(res, 500, { error: 'Failed to upload image' });
    }
  }

  // 6. Admin Add Product
  if (pathname === '/api/products' && method === 'POST') {
    const body = await parseJsonBody(req);
    const newProduct = {
      id: `p-${Date.now()}`,
      name: body.name || 'Untitled Product',
      brand: body.brand || 'KD Supermarket',
      category: body.category || 'Other General Store Products',
      categoryId: body.categoryId || 'cat-20',
      subcategory: body.subcategory || 'General',
      packSize: body.packSize || '1 Unit',
      variants: body.variants || [{ id: `v-${Date.now()}`, size: body.packSize || '1 Unit', price: Number(body.price) || 100, mrp: Number(body.mrp) || 120, stock: Number(body.stock) || 50, inStock: true }],
      price: Number(body.price) || 100,
      mrp: Number(body.mrp) || 120,
      discount: Math.round(((Number(body.mrp) - Number(body.price)) / Number(body.mrp)) * 100) || 0,
      stock: Number(body.stock) || 50,
      inStock: (Number(body.stock) || 50) > 0,
      rating: 4.8,
      reviewsCount: 1,
      sku: body.sku || `KD-GEN-${Math.floor(100 + Math.random() * 900)}`,
      description: body.description || 'Fresh quality grocery item from KD Supermarket Madhubani.',
      details: body.details || 'Standard supermarket storage and guarantee.',
      image: body.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      tags: body.tags || ['daily-essentials']
    };
    store.products.unshift(newProduct);
    writeStore(store);
    return sendJson(res, 201, newProduct);
  }

  // 7. Orders List & Creation
  if (pathname === '/api/orders') {
    if (method === 'GET') {
      const email = urlObj.searchParams.get('email');
      const phone = urlObj.searchParams.get('phone');
      let orders = [...store.orders];
      if (email) {
        orders = orders.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
      } else if (phone) {
        orders = orders.filter(o => o.customerPhone?.includes(phone));
      }
      return sendJson(res, 200, orders);
    }

    if (method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.items || body.items.length === 0) {
        return sendJson(res, 400, { error: 'Order must contain items' });
      }

      // Calculate server-side totals and verify stock
      let calculatedSubtotal = 0;
      const orderItems = [];

      for (const item of body.items) {
        const prod = store.products.find(p => p.id === item.productId);
        const itemPrice = prod ? prod.price : item.price;
        const itemName = prod ? prod.name : item.name;
        const itemImage = prod ? prod.image : item.image;
        const qty = Math.max(1, Number(item.quantity) || 1);

        calculatedSubtotal += itemPrice * qty;

        // Deduct inventory
        if (prod) {
          prod.stock = Math.max(0, (prod.stock || 10) - qty);
          if (prod.stock === 0) prod.inStock = false;
        }

        orderItems.push({
          productId: item.productId,
          name: itemName,
          packSize: item.packSize || (prod ? prod.packSize : '1 Unit'),
          price: itemPrice,
          quantity: qty,
          image: itemImage
        });
      }

      const freeThreshold = store.settings.freeDeliveryThreshold || 499;
      const standardDeliveryFee = store.settings.deliveryFee || 30;
      const deliveryFee = calculatedSubtotal >= freeThreshold ? 0 : standardDeliveryFee;
      const discountAmount = Number(body.discountAmount) || 0;
      const grandTotal = Math.max(0, calculatedSubtotal + deliveryFee - discountAmount);

      const orderNumber = Math.floor(1000 + Math.random() * 9000);
      const newOrder = {
        id: `KD-847211-${orderNumber}`,
        customerName: body.customerName || 'Valued Customer',
        customerPhone: body.customerPhone || '+91 98113 40853',
        customerEmail: body.customerEmail || '',
        address: body.address || {
          fullName: body.customerName,
          phone: body.customerPhone,
          street: 'State Bank More',
          locality: 'Tirhut Colony',
          city: 'Madhubani',
          state: 'Bihar',
          pinCode: '847211',
          landmark: 'Watson High School'
        },
        items: orderItems,
        subtotal: calculatedSubtotal,
        deliveryFee,
        discountAmount,
        total: grandTotal,
        paymentMethod: body.paymentMethod || 'Cash on Delivery',
        paymentStatus: body.paymentStatus || (body.paymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID'),
        orderStatus: 'Order Placed',
        deliverySlot: body.deliverySlot || 'Today: Standard Slot (within 2-3 hours)',
        instructions: body.instructions || '',
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'Order Placed',
            timestamp: new Date().toISOString(),
            note: `Order placed successfully via ${body.paymentMethod || 'Cash on Delivery'}`
          }
        ]
      };

      store.orders.unshift(newOrder);
      writeStore(store);
      return sendJson(res, 201, newOrder);
    }
  }

  // 8. Order by ID
  const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch) {
    const id = orderMatch[1];
    if (method === 'GET') {
      const ord = store.orders.find(o => o.id === id);
      if (!ord) return sendJson(res, 404, { error: 'Order not found' });
      return sendJson(res, 200, ord);
    }
  }

  // 9. Update Order Status
  const statusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (statusMatch && (method === 'PATCH' || method === 'PUT')) {
    const id = statusMatch[1];
    const body = await parseJsonBody(req);
    const ord = store.orders.find(o => o.id === id);
    if (!ord) return sendJson(res, 404, { error: 'Order not found' });

    const newStatus = body.status;
    const note = body.note || `Status updated to ${newStatus}`;
    ord.orderStatus = newStatus;
    if (body.paymentStatus) {
      ord.paymentStatus = body.paymentStatus;
    }

    if (!ord.statusHistory) ord.statusHistory = [];
    ord.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note
    });

    writeStore(store);
    return sendJson(res, 200, ord);
  }

  // 10. Admin Stats
  if (pathname === '/api/admin/stats') {
    const orders = store.orders || [];
    const totalOrders = orders.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(today)).length;
    
    // Revenue from paid / confirmed / delivered orders
    const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'FAILED');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingCount = orders.filter(o => o.orderStatus === 'Order Placed').length;
    const preparingCount = orders.filter(o => o.orderStatus === 'Preparing Your Order' || o.orderStatus === 'Order Confirmed').length;
    const outForDeliveryCount = orders.filter(o => o.orderStatus === 'Out for Delivery' || o.orderStatus === 'Ready for Dispatch').length;
    const deliveredCount = orders.filter(o => o.orderStatus === 'Delivered').length;
    const lowStockCount = store.products.filter(p => (p.stock || 0) <= 15).length;

    return sendJson(res, 200, {
      totalOrders,
      todayOrders,
      totalRevenue,
      pendingCount,
      preparingCount,
      outForDeliveryCount,
      deliveredCount,
      lowStockCount,
      totalProducts: store.products.length,
      totalCategories: store.categories.length
    });
  }

  // 11. Auth endpoints
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = await parseJsonBody(req);
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (normalizedEmail === 'siddhukumar2006@gmail.com' || (normalizedEmail === 'admin@kdsupermarket.com' && password === 'kdadmin123')) {
      return sendJson(res, 200, {
        token: 'admin-token-siddhu',
        user: {
          id: 'admin-siddhu',
          name: normalizedEmail === 'siddhukumar2006@gmail.com' ? 'Siddhu Kumar (Store Admin)' : 'KD Supermarket Store Admin',
          email: normalizedEmail,
          role: 'admin',
          phone: '+91 98113 40853'
        }
      });
    }

    if (email) {
      // Find customer or provide standard login
      const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      const user = existing || {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: 'customer',
        phone: '+91 98350 21980'
      };
      return sendJson(res, 200, {
        token: `cust-token-${user.id}`,
        user
      });
    }

    return sendJson(res, 400, { error: 'Email and password required' });
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const { name, email, phone } = await parseJsonBody(req);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || 'Customer',
      email: email,
      role: 'customer',
      phone: phone || '+91 98113 40853',
      savedAddresses: []
    };
    store.users.push(newUser);
    writeStore(store);
    return sendJson(res, 201, {
      token: `cust-token-${newUser.id}`,
      user: newUser
    });
  }

  // Google Authentication endpoint
  if (pathname === '/api/auth/google' && method === 'POST') {
    const body = await parseJsonBody(req);
    let { email, name, avatar, googleId, credential } = body;

    // Decode Google JWT credential if passed from Google Identity Services
    if (credential && !email) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          email = payload.email;
          name = payload.name;
          avatar = payload.picture;
          googleId = payload.sub;
        }
      } catch (err) {
        console.warn('Failed to parse Google JWT payload:', err);
      }
    }

    if (!email) {
      return sendJson(res, 400, { error: 'Valid Google account email is required' });
    }

    if (!Array.isArray(store.users)) {
      store.users = [];
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = normalizedEmail === 'siddhukumar2006@gmail.com';

    let user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (user) {
      if (!user.avatar && avatar) user.avatar = avatar;
      user.provider = 'google';
      if (isAdmin) {
        user.role = 'admin';
        if (!user.name || user.name.includes('@')) {
          user.name = 'Siddhu Kumar (Admin)';
        }
      }
      writeStore(store);
    } else {
      user = {
        id: isAdmin ? 'admin-siddhu' : `usr-g-${Date.now()}`,
        name: isAdmin ? (name || 'Siddhu Kumar (Admin)') : (name || email.split('@')[0]),
        email: normalizedEmail,
        role: isAdmin ? 'admin' : 'customer',
        phone: '+91 98113 40853',
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        provider: 'google',
        savedAddresses: []
      };
      store.users.push(user);
      writeStore(store);
    }

    return sendJson(res, 200, {
      token: `google-token-${user.id}`,
      user
    });
  }

  // 12. Razorpay Test Order Simulation
  if (pathname === '/api/payments/create-razorpay-order' && method === 'POST') {
    const { amount, currency = 'INR', receipt } = await parseJsonBody(req);
    const rzpOrderId = `order_rzp_${Math.random().toString(36).substring(2, 11)}`;
    return sendJson(res, 200, {
      id: rzpOrderId,
      amount: amount * 100, // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      keyId: store.settings.razorpayKeyId || 'rzp_test_KDSupermarket847211',
      status: 'created'
    });
  }

  if (pathname === '/api/payments/verify' && method === 'POST') {
    const { razorpay_order_id, razorpay_payment_id } = await parseJsonBody(req);
    return sendJson(res, 200, {
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      verified: true
    });
  }

  // 404 for unhandled API route
  sendJson(res, 404, { error: 'API route not found', path: pathname });
}
