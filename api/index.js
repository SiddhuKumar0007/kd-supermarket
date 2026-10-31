import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../server/db.js';

const ADMIN_EMAILS = ['siddhukumar2006@gmail.com', 'vyapaarwebs@gmail.com', 'kdsuperm@gmail.com'];
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '976550764058-rjdm7lbg89d2aemkjlsaaegsi3at7ngb.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'kdsm_jwt_secret_847211_secure_key';
  return secret.trim();
}

// --- Security Helper: Base64URL & JWT ---
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

function createJwt(payload, expiresInMs = 7 * 24 * 60 * 60 * 1000) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor((Date.now() + expiresInMs) / 1000);
  const fullPayload = { ...payload, exp };
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [headerB64, payloadB64, signatureB64] = parts;
  let expectedSig;
  try {
    expectedSig = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch {
    return null;
  }
  
  const sigBuf = Buffer.from(signatureB64);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  
  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function getAuthUser(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return verifyJwt(token);
}

function requireAdmin(req, res) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    sendJson(res, 401, { error: 'Unauthorized: Admin privileges required.' });
    return null;
  }
  return user;
}

// --- Rate Limiting (In-Memory IP Bucket) ---
const ipRequestLogs = new Map();
function isRateLimited(ip, maxPerMinute = 40) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  let timestamps = ipRequestLogs.get(ip) || [];
  timestamps = timestamps.filter(t => now - t < windowMs);
  if (timestamps.length >= maxPerMinute) {
    ipRequestLogs.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  ipRequestLogs.set(ip, timestamps);
  return false;
}

// --- Regex Sanitizer ---
function escapeRegex(str) {
  return typeof str === 'string' ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}

// --- CORS & Security Headers ---
function applyCorsAndHeaders(req, res) {
  const origin = req.headers?.origin || '';
  const allowedOrigins = [
    'https://kdsm.in',
    'https://www.kdsm.in',
    'https://kd-supermarket.vercel.app',
    'https://kd-supermarket-8rtd.vercel.app'
  ];
  
  const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
  if (allowedOrigins.includes(origin) || isLocalhost) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://kdsm.in');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
}

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function') {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }
  res.setHeader('Content-Type', 'application/json');
  applyCorsAndHeaders({ headers: {} }, res);

  if (typeof res.json === 'function') {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  applyCorsAndHeaders(req, res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(204).end();
    }
    res.statusCode = 204;
    return res.end();
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // 1. Health check (No DB connection required)
  if (pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'online',
      storeName: 'KD SUPERMARKET',
      location: 'Madhubani, Bihar 847211',
      timestamp: new Date().toISOString()
    });
  }

  // Early route authorization gates
  if ((pathname === '/api/settings' || pathname === '/api/admin/settings') && (method === 'PUT' || method === 'POST')) {
    if (!requireAdmin(req, res)) return;
  }
  if (pathname === '/api/products' && method === 'POST') {
    if (!requireAdmin(req, res)) return;
  }
  if (pathname === '/api/admin/stats') {
    if (!requireAdmin(req, res)) return;
  }

  try {
    const db = await getDb();

    // 2. Settings (GET: Public, PUT/POST: Admin Only)
    if (pathname === '/api/settings' || pathname === '/api/admin/settings') {
      const col = db.collection('settings');
      if (method === 'GET') {
        const doc = await col.findOne({ _id: 'global_settings' });
        return sendJson(res, 200, doc || {});
      }
      if (method === 'PUT' || method === 'POST') {
        if (!requireAdmin(req, res)) return;
        const updates = await parseBody(req);
        delete updates._id;
        await col.updateOne(
          { _id: 'global_settings' },
          { $set: updates },
          { upsert: true }
        );
        const updated = await col.findOne({ _id: 'global_settings' });
        return sendJson(res, 200, { success: true, settings: updated });
      }
    }

    // 3. Categories (GET: Public, POST: Admin Only)
    if (pathname === '/api/categories') {
      const col = db.collection('categories');
      if (method === 'GET') {
        const items = await col.find({}).toArray();
        return sendJson(res, 200, items);
      }
      if (method === 'POST') {
        if (!requireAdmin(req, res)) return;
        const body = await parseBody(req);
        const newCat = {
          ...body,
          id: body.id || `cat-${Date.now()}`,
          itemCount: 0
        };
        await col.insertOne(newCat);
        return sendJson(res, 201, newCat);
      }
    }

    // 4. Coupons (GET: Public active only, or Admin all)
    if (pathname === '/api/coupons' || pathname === '/api/admin/coupons') {
      const col = db.collection('coupons');
      if (method === 'GET') {
        const all = urlObj.searchParams.get('all') === 'true';
        const authUser = getAuthUser(req);
        const isAdmin = authUser && authUser.role === 'admin';
        // Admin gets all coupons; Public gets only active AND public coupons (isPublic !== false)
        const query = (all && isAdmin) ? {} : { isActive: { $ne: false }, isPublic: { $ne: false } };
        const coupons = await col.find(query).toArray();
        return sendJson(res, 200, coupons);
      }
      if (method === 'POST') {
        if (!requireAdmin(req, res)) return;
        const body = await parseBody(req);
        if (!body.code) return sendJson(res, 400, { error: 'Coupon code is required' });
        const cleanCode = body.code.trim().toUpperCase();
        const existing = await col.findOne({ code: cleanCode });
        if (existing) return sendJson(res, 409, { error: `Coupon ${cleanCode} already exists` });
        const isFreeDelivery = body.discountType === 'free_delivery';
        const newCoupon = {
          id: `cpn-${Date.now()}`,
          code: cleanCode,
          title: body.title || (isFreeDelivery ? 'Free Delivery Offer' : `${cleanCode} Special Offer`),
          description: body.description || (isFreeDelivery ? 'Free home delivery on your order' : ''),
          discountType: body.discountType || 'percentage',
          discountValue: isFreeDelivery ? 0 : (Number(body.discountValue) || 10),
          minOrderValue: Number(body.minOrderValue) || 0,
          maxDiscount: isFreeDelivery ? 0 : (Number(body.maxDiscount) || 100),
          isActive: body.isActive !== false,
          isPublic: body.isPublic !== false, // Yes: Show in list; No: Secret / manual only
          expiryDate: body.expiryDate || '2027-12-31',
          usageCount: 0
        };
        await col.insertOne(newCoupon);
        return sendJson(res, 201, newCoupon);
      }
    }

    // 4b. Single Coupon Edit / Delete (Admin Only)
    const couponMatch = pathname.match(/^\/api\/(?:admin\/)?coupons\/([^/]+)$/);
    if (couponMatch && couponMatch[1] !== 'validate') {
      const col = db.collection('coupons');
      const couponId = couponMatch[1];
      const query = { $or: [{ id: couponId }, { code: couponId.toUpperCase() }] };

      if (method === 'PUT' || method === 'PATCH') {
        if (!requireAdmin(req, res)) return;
        const updates = await parseBody(req);
        delete updates._id;
        if (updates.code) updates.code = updates.code.trim().toUpperCase();
        await col.updateOne(query, { $set: updates });
        const updated = await col.findOne(query);
        return sendJson(res, 200, updated);
      }
      if (method === 'DELETE') {
        if (!requireAdmin(req, res)) return;
        const doc = await col.findOne(query);
        if (!doc) return sendJson(res, 404, { error: 'Coupon not found' });
        await col.deleteOne(query);
        return sendJson(res, 200, { success: true, removed: doc });
      }
    }

    // 4c. Validate coupon (Public)
    if (pathname === '/api/coupons/validate' && method === 'POST') {
      const col = db.collection('coupons');
      const { code, subtotal } = await parseBody(req);
      if (!code) return sendJson(res, 400, { valid: false, message: 'Please enter a coupon code' });
      const cleanCode = code.trim().toUpperCase();
      const coupon = await col.findOne({ code: cleanCode });
      if (!coupon) return sendJson(res, 404, { valid: false, message: `Promo code '${cleanCode}' is invalid` });
      if (coupon.isActive === false) return sendJson(res, 400, { valid: false, message: `Promo code '${cleanCode}' is inactive` });
      
      const orderSubtotal = Number(subtotal) || 0;
      const minRequired = Number(coupon.minOrderValue || coupon.minOrderAmount || 0);
      if (minRequired > 0 && orderSubtotal < minRequired) {
        return sendJson(res, 400, { valid: false, message: `Cart total must be at least ₹${minRequired} (Current: ₹${orderSubtotal})` });
      }

      const isFreeDelivery = coupon.discountType === 'free_delivery';
      let discount = 0;
      if (isFreeDelivery) {
        discount = 0; // Delivery fee is waived to 0
      } else if (coupon.discountType === 'fixed' || coupon.discountType === 'flat') {
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
        coupon,
        isFreeDelivery,
        message: isFreeDelivery 
          ? `Coupon '${coupon.code}' applied! Free Delivery unlocked.`
          : `Coupon '${coupon.code}' applied! ₹${discount} savings added.`
      });
    }

    // 5. Products List (Public with safe regex escaping)
    if (pathname === '/api/products' && method === 'GET') {
      const col = db.collection('products');
      const category = urlObj.searchParams.get('category');
      const search = urlObj.searchParams.get('search');
      const filter = {};

      if (category && category !== 'All') {
        filter.$or = [{ category }, { categoryId: category }];
      }
      if (search && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        filter.$or = [
          { name: { $regex: safeSearch, $options: 'i' } },
          { brand: { $regex: safeSearch, $options: 'i' } },
          { description: { $regex: safeSearch, $options: 'i' } }
        ];
      }

      const sortParam = urlObj.searchParams.get('sort');
      let sort = { _id: -1 };
      if (sortParam === 'price_asc') sort = { price: 1 };
      if (sortParam === 'price_desc') sort = { price: -1 };
      if (sortParam === 'name_asc') sort = { name: 1 };

      const products = await col.find(filter).sort(sort).toArray();
      return sendJson(res, 200, products);
    }

    // 6. Single Product (GET: Public, PUT/DELETE: Admin Only)
    const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (productMatch) {
      const col = db.collection('products');
      const id = productMatch[1];

      if (method === 'GET') {
        const prod = await col.findOne({ id });
        if (!prod) return sendJson(res, 404, { error: 'Product not found' });
        const related = await col.find({ category: prod.category, id: { $ne: prod.id } }).limit(4).toArray();
        return sendJson(res, 200, { ...prod, related });
      }

      if (method === 'PUT') {
        if (!requireAdmin(req, res)) return;
        const updates = await parseBody(req);
        delete updates._id;
        await col.updateOne({ id }, { $set: updates });
        const updated = await col.findOne({ id });
        return sendJson(res, 200, updated);
      }

      if (method === 'DELETE') {
        if (!requireAdmin(req, res)) return;
        const doc = await col.findOne({ id });
        if (!doc) return sendJson(res, 404, { error: 'Product not found' });
        await col.deleteOne({ id });
        return sendJson(res, 200, { success: true, removed: doc });
      }
    }

    // 7. Add Product (Admin Only)
    if (pathname === '/api/products' && method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const col = db.collection('products');
      const body = await parseBody(req);
      const newProduct = {
        id: body.id || `p-${Date.now()}`,
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
        tags: body.tags || ['daily-essentials'],
        createdAt: new Date().toISOString()
      };
      await col.insertOne(newProduct);
      return sendJson(res, 201, newProduct);
    }

    // 8. Orders (GET: Authenticated Only; POST: Rate-limited with Server-side pricing)
    if (pathname === '/api/orders') {
      const col = db.collection('orders');

      if (method === 'GET') {
        const authUser = getAuthUser(req);
        if (!authUser) {
          return sendJson(res, 401, { error: 'Authentication required to view orders.' });
        }

        const email = urlObj.searchParams.get('email');
        const phone = urlObj.searchParams.get('phone');
        const query = {};

        if (authUser.role === 'admin') {
          // Admin can filter by any customer or view all
          if (email) query.customerEmail = { $regex: `^${escapeRegex(email)}$`, $options: 'i' };
          if (phone) query.customerPhone = { $regex: escapeRegex(phone.replace(/[^\d+]/g, '')) };
        } else {
          // Normal customer can ONLY see their own orders
          query.$or = [
            { customerEmail: authUser.email },
            { customerPhone: authUser.phone || '__none__' }
          ];
        }

        const orders = await col.find(query).sort({ _id: -1 }).toArray();
        return sendJson(res, 200, orders);
      }

      if (method === 'POST') {
        if (isRateLimited(clientIp, 10)) {
          return sendJson(res, 429, { error: 'Too many order requests. Please wait a few moments before trying again.' });
        }

        const settingsCol = db.collection('settings');
        const currentSettings = await settingsCol.findOne({ _id: 'global_settings' });
        if (currentSettings && currentSettings.acceptingOrders === false) {
          return sendJson(res, 403, { error: 'Store is currently not accepting new orders. Please contact store directly on WhatsApp or call +91 98113 40853.' });
        }

        const body = await parseBody(req);

        // Strict PIN Code Restriction: 847211 Only
        const submittedPin = String(body.address?.pinCode || '').trim();
        if (submittedPin && submittedPin !== '847211') {
          return sendJson(res, 400, { 
            error: 'Delivery is currently only available for PIN code 847211 (Madhubani Town).' 
          });
        }

        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
          return sendJson(res, 400, { error: 'Order must contain items' });
        }

        const productsCol = db.collection('products');
        const couponsCol = db.collection('coupons');
        
        let calculatedSubtotal = 0;
        const verifiedItems = [];

        // Server-side Price & Stock Calculation
        for (const item of body.items) {
          const qty = Math.max(1, Math.min(99, parseInt(item.quantity, 10) || 1));
          const prodId = String(item.id || item.productId || "").trim();
          const prod = await productsCol.findOne({ id: prodId });
          if (!prod) {
            return sendJson(res, 400, { error: `Product "${item.name || prodId}" is no longer available in the store catalog.` });
          }

          let itemPrice = Number(prod.price) || 0;
          let variantName = prod.packSize || '1 Unit';
          if (item.variantId && Array.isArray(prod.variants)) {
            const v = prod.variants.find(vr => vr.id === item.variantId);
            if (v && v.price) {
              itemPrice = Number(v.price);
              variantName = v.size || variantName;
            }
          }

          const currentStock = Number(prod.stock) || 0;
          if (currentStock < qty) {
            return sendJson(res, 400, { 
              error: `Insufficient stock for "${prod.name}". Available: ${currentStock}, Requested: ${qty}` 
            });
          }

          const lineTotal = itemPrice * qty;
          calculatedSubtotal += lineTotal;

          verifiedItems.push({
            id: prod.id,
            name: prod.name,
            brand: prod.brand || '',
            category: prod.category || '',
            image: prod.image || '',
            variantId: item.variantId || null,
            packSize: variantName,
            price: itemPrice,
            quantity: qty,
            total: lineTotal
          });
        }

        // Server-side Coupon validation
        let verifiedDiscount = 0;
        let appliedCouponCode = null;
        let isFreeDeliveryCoupon = false;
        const requestedCode = (body.couponCode || body.appliedCoupon?.code || '').trim().toUpperCase();
        if (requestedCode) {
          const coupon = await couponsCol.findOne({ code: requestedCode, isActive: true });
          const minRequired = Number(coupon.minOrderValue || coupon.minOrderAmount || 0);
          if (coupon && (minRequired === 0 || calculatedSubtotal >= minRequired)) {
            if (coupon.discountType === 'free_delivery') {
              isFreeDeliveryCoupon = true;
              verifiedDiscount = 0;
            } else if (coupon.discountType === 'percentage') {
              verifiedDiscount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
              if (coupon.maxDiscount && verifiedDiscount > coupon.maxDiscount) {
                verifiedDiscount = coupon.maxDiscount;
              }
            } else {
              verifiedDiscount = Number(coupon.discountValue) || 0;
            }
            verifiedDiscount = Math.min(verifiedDiscount, calculatedSubtotal);
            appliedCouponCode = coupon.code;
          }
        }

        // Server-side Delivery fee calculation
        const freeThreshold = Number(currentSettings?.freeDeliveryThreshold) || 999;
        const defaultFee = Number(currentSettings?.deliveryFee) || 30;
        let calculatedDeliveryFee = calculatedSubtotal >= freeThreshold ? 0 : defaultFee;
        if (isFreeDeliveryCoupon) {
          calculatedDeliveryFee = 0; // Waived by coupon!
        }
        const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedDeliveryFee - verifiedDiscount);

        const orderNumber = Math.floor(1000 + Math.random() * 9000);
        const orderId = body.id || `KD-847211-${orderNumber}`;
        const newOrder = {
          id: orderId,
          createdAt: new Date().toISOString(),
          customerName: String(body.customerName || body.address?.fullName || 'Customer').slice(0, 100),
          customerPhone: String(body.customerPhone || body.address?.phone || '').replace(/[^\d+]/g, '').slice(0, 15),
          customerEmail: String(body.customerEmail || '').trim().toLowerCase().slice(0, 100),
          address: body.address || {},
          deliverySlot: body.deliverySlot || 'Today: 4:00 PM – 8:00 PM',
          instructions: String(body.instructions || body.deliveryInstructions || '').slice(0, 300),
          items: verifiedItems,
          subtotal: calculatedSubtotal,
          deliveryFee: calculatedDeliveryFee,
          discountAmount: verifiedDiscount,
          couponCode: appliedCouponCode,
          total: calculatedTotal,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'PENDING',
          orderStatus: 'Order Placed',
          statusHistory: [
            {
              status: 'Order Placed',
              timestamp: new Date().toISOString(),
              note: 'Order placed successfully via Cash on Delivery'
            }
          ]
        };

        const idempotencyKey = String(
          body.idempotencyKey || 
          req.headers['x-idempotency-key'] || 
          orderId
        ).trim();
        newOrder.idempotencyKey = idempotencyKey;

        // 1. Idempotency Check: Return existing order if same idempotencyKey or ID was already processed
        const existingOrder = await col.findOne({
          $or: [
            { idempotencyKey },
            { id: orderId }
          ]
        });
        if (existingOrder) {
          return sendJson(res, 200, existingOrder);
        }

        // Also prevent rapid duplicate double-clicks from same phone and exact total within 45s
        const recentDuplicate = await col.findOne({
          customerPhone: newOrder.customerPhone,
          total: calculatedTotal,
          createdAt: { $gte: new Date(Date.now() - 45000).toISOString() }
        });
        if (recentDuplicate) {
          return sendJson(res, 200, recentDuplicate);
        }

        // 2. High-Performance Serverless Atomic Stock Deduction with Compensation Rollback
        const decrementedItems = [];
        try {
          for (const item of verifiedItems) {
            const stockResult = await productsCol.updateOne(
              { id: item.id, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity } }
            );

            if (stockResult.modifiedCount === 0) {
              // Rollback any items decremented so far
              for (const d of decrementedItems) {
                await productsCol.updateOne({ id: d.id }, { $inc: { stock: d.quantity } });
              }
              return sendJson(res, 400, {
                error: `Inventory for "${item.name}" was just reserved by another order. Please adjust your quantity.`
              });
            }
            decrementedItems.push(item);
          }

          await col.insertOne(newOrder);
          return sendJson(res, 201, newOrder);
        } catch (txErr) {
          for (const d of decrementedItems) {
            await productsCol.updateOne({ id: d.id }, { $inc: { stock: d.quantity } });
          }
          if (txErr.code === 11000) {
            const existing = await col.findOne({
              $or: [{ idempotencyKey }, { id: orderId }]
            });
            if (existing) return sendJson(res, 200, existing);
          }
          console.error('Order processing error:', txErr.message);
          return sendJson(res, 500, { error: 'Order placement failed. Please try again.' });
        }
      }
    }

    // 8.1 Single Order by ID or Phone (Safe lookup & PII protection)
    const singleOrderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (singleOrderMatch && method === 'GET') {
      const col = db.collection('orders');
      const param = decodeURIComponent(singleOrderMatch[1]).trim();
      const safeParam = escapeRegex(param);
      
      const ord = await col.findOne({
        $or: [
          { id: { $regex: `^${safeParam}$`, $options: 'i' } },
          { customerPhone: safeParam }
        ]
      });

      if (!ord) return sendJson(res, 404, { error: 'Order not found' });

      // Check if caller is admin or provides matching phone verification
      const authUser = getAuthUser(req);
      const queryPhone = (urlObj.searchParams.get('phone') || '').replace(/[^\d]/g, '');
      const orderPhoneDigits = (ord.customerPhone || '').replace(/[^\d]/g, '');
      const isOwner = queryPhone && orderPhoneDigits && (queryPhone === orderPhoneDigits || orderPhoneDigits.endsWith(queryPhone));
      const isAdmin = authUser && authUser.role === 'admin';

      if (isAdmin || isOwner) {
        return sendJson(res, 200, ord);
      }

      // Return tracking view with complete items and safe address details
      const sanitizedOrder = {
        id: ord.id,
        orderStatus: ord.orderStatus,
        paymentStatus: ord.paymentStatus,
        paymentMethod: ord.paymentMethod,
        createdAt: ord.createdAt,
        statusHistory: ord.statusHistory || [],
        customerName: ord.customerName || 'Customer',
        customerPhone: ord.customerPhone || '',
        items: (ord.items || []).map(i => ({
          id: i.id || i.productId,
          productId: i.productId || i.id,
          name: i.name,
          packSize: i.packSize || '1 Unit',
          quantity: Number(i.quantity) || 1,
          price: Number(i.price) || 0,
          image: i.image || ''
        })),
        subtotal: ord.subtotal || ord.total,
        deliveryFee: ord.deliveryFee || 0,
        discountAmount: ord.discountAmount || 0,
        couponCode: ord.couponCode || null,
        total: ord.total,
        deliverySlot: ord.deliverySlot || 'Today: 4:00 PM – 8:00 PM',
        instructions: ord.instructions || '',
        address: {
          fullName: ord.address?.fullName || ord.customerName || 'Customer',
          phone: ord.address?.phone || ord.customerPhone || '',
          alternatePhone: ord.address?.alternatePhone || '',
          street: ord.address?.street || '',
          locality: ord.address?.locality || 'Madhubani',
          landmark: ord.address?.landmark || '',
          city: ord.address?.city || 'Madhubani',
          pinCode: ord.address?.pinCode || '847211',
          fullAddressText: ord.address?.fullAddressText || (ord.address?.locality ? `${ord.address.locality}, Madhubani, Bihar - 847211` : 'Madhubani, Bihar - 847211')
        }
      };

      return sendJson(res, 200, sanitizedOrder);
    }

    // 9. Order Status Update (Admin Only, or Customer Cancelling their placed order)
    const orderStatusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (orderStatusMatch && (method === 'PATCH' || method === 'PUT')) {
      const authUser = getAuthUser(req);
      const isAdmin = authUser && authUser.role === 'admin';
      const col = db.collection('orders');
      const id = orderStatusMatch[1];
      const body = await parseBody(req);

      if (!isAdmin) {
        if (body.status !== 'Cancelled') {
          return sendJson(res, 401, { error: 'Unauthorized: Admin privileges required.' });
        }
        const existingOrd = await col.findOne({ id });
        if (!existingOrd || (existingOrd.orderStatus !== 'Order Placed' && existingOrd.orderStatus !== 'Order Confirmed')) {
          return sendJson(res, 400, { error: 'Order cannot be cancelled at this stage. Please contact store on WhatsApp.' });
        }
      }
      const updateData = {
        orderStatus: body.status,
        ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {})
      };
      const note = body.note || `Status updated to ${body.status}`;
      await col.updateOne(
        { id },
        {
          $set: updateData,
          $push: {
            statusHistory: {
              status: body.status,
              timestamp: new Date().toISOString(),
              note
            }
          }
        }
      );
      const updated = await col.findOne({ id });
      return sendJson(res, 200, updated);
    }

    // 10. Admin Stats (Admin Only)
    if (pathname === '/api/admin/stats') {
      if (!requireAdmin(req, res)) return;
      const ordersCol = db.collection('orders');
      const productsCol = db.collection('products');
      const categoriesCol = db.collection('categories');

      const orders = await ordersCol.find({}).toArray();
      const totalProducts = await productsCol.countDocuments({});
      const totalCategories = await categoriesCol.countDocuments({});

      const totalOrders = orders.length;
      const today = new Date().toISOString().slice(0, 10);
      const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(today)).length;
      const validOrders = orders.filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'FAILED');
      const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      const pendingCount = orders.filter(o => o.orderStatus === 'Order Placed').length;
      const preparingCount = orders.filter(o => o.orderStatus === 'Preparing Your Order' || o.orderStatus === 'Order Confirmed').length;
      const outForDeliveryCount = orders.filter(o => o.orderStatus === 'Out for Delivery' || o.orderStatus === 'Ready for Dispatch').length;
      const deliveredCount = orders.filter(o => o.orderStatus === 'Delivered').length;
      const lowStockCount = await productsCol.countDocuments({ stock: { $lte: 15 } });

      return sendJson(res, 200, {
        totalOrders,
        todayOrders,
        totalRevenue,
        pendingCount,
        preparingCount,
        outForDeliveryCount,
        deliveredCount,
        lowStockCount,
        totalProducts,
        totalCategories
      });
    }

    // 11. Auth (Login & Google)
    if (pathname === '/api/auth/login' && method === 'POST') {
      if (isRateLimited(clientIp, 15)) {
        return sendJson(res, 429, { error: 'Too many login attempts. Please wait.' });
      }
      const { email } = await parseBody(req);
      const normalizedEmail = (email || '').toLowerCase().trim();

      // Manual email/password login NEVER grants admin privileges.
      // Admin access is exclusively reserved for verified Google accounts.
      const custUser = {
        id: `usr-${Date.now()}`,
        name: (email || 'Customer').split('@')[0],
        email: normalizedEmail,
        role: 'customer',
        phone: '+91 98350 21980'
      };
      const token = createJwt(custUser);
      return sendJson(res, 200, { token, user: custUser });
    }

    if (pathname === '/api/auth/google' && method === 'POST') {
      const body = await parseBody(req);
      const { credential } = body;

      if (!credential || typeof credential !== 'string') {
        return sendJson(res, 400, { error: 'Valid Google credential token is required' });
      }

      let googlePayload;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID
        });
        googlePayload = ticket.getPayload();
      } catch (authErr) {
        return sendJson(res, 401, { error: 'Cryptographic Google token verification failed.', details: authErr.message });
      }

      if (!googlePayload || !googlePayload.email || googlePayload.email_verified === false) {
        return sendJson(res, 401, { error: 'Google account email is unverified.' });
      }

      const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
      if (!validIssuers.includes(googlePayload.iss)) {
        return sendJson(res, 401, { error: 'Invalid Google token issuer.' });
      }

      const normalizedEmail = googlePayload.email.toLowerCase().trim();
      const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
      const displayName = isAdmin 
        ? (normalizedEmail === 'kdsuperm@gmail.com' ? 'KD Supermarket Desk (Admin)' : (normalizedEmail === 'vyapaarwebs@gmail.com' ? 'Vyapaar Webs (Admin)' : 'Siddhu Kumar (Admin)'))
        : (googlePayload.name || normalizedEmail.split('@')[0]);

      const user = {
        id: isAdmin ? `admin-${normalizedEmail.split('@')[0]}` : `usr-g-${Date.now()}`,
        name: displayName,
        email: normalizedEmail,
        role: isAdmin ? 'admin' : 'customer',
        phone: '+91 98113 40853',
        avatar: googlePayload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
        provider: 'google'
      };

      const usersCol = db.collection('users');
      await usersCol.updateOne({ email: normalizedEmail }, { $set: user }, { upsert: true });

      const token = createJwt(user);
      return sendJson(res, 200, { token, user });
    }

    // 404 for unhandled route
    return sendJson(res, 404, { error: 'API route not found', path: pathname });

  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  }
}
