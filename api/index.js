import { getDb } from '../server/db.js';

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function') {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (typeof res.status === 'function') {
      return res.status(204).end();
    }
    res.statusCode = 204;
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  try {
    const db = await getDb();

    // 1. Health check
    if (pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'online',
        database: 'MongoDB Atlas',
        storeName: 'KD SUPERMARKET',
        location: 'Madhubani, Bihar 847211',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Settings
    if (pathname === '/api/settings' || pathname === '/api/admin/settings') {
      const col = db.collection('settings');
      if (method === 'GET') {
        const doc = await col.findOne({ _id: 'global_settings' });
        return sendJson(res, 200, doc || {});
      }
      if (method === 'PUT' || method === 'POST') {
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

    // 3. Categories
    if (pathname === '/api/categories') {
      const col = db.collection('categories');
      if (method === 'GET') {
        const items = await col.find({}).toArray();
        return sendJson(res, 200, items);
      }
      if (method === 'POST') {
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

    // 4. Coupons
    if (pathname === '/api/coupons' || pathname === '/api/admin/coupons') {
      const col = db.collection('coupons');
      if (method === 'GET') {
        const all = urlObj.searchParams.get('all') === 'true';
        const query = all ? {} : { isActive: { $ne: false } };
        const coupons = await col.find(query).toArray();
        return sendJson(res, 200, coupons);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.code) return sendJson(res, 400, { error: 'Coupon code is required' });
        const cleanCode = body.code.trim().toUpperCase();
        const existing = await col.findOne({ code: cleanCode });
        if (existing) return sendJson(res, 409, { error: `Coupon ${cleanCode} already exists` });
        const newCoupon = {
          id: `cpn-${Date.now()}`,
          code: cleanCode,
          title: body.title || `${cleanCode} Special Offer`,
          description: body.description || '',
          discountType: body.discountType || 'percentage',
          discountValue: Number(body.discountValue) || 10,
          minOrderValue: Number(body.minOrderValue) || 0,
          maxDiscount: Number(body.maxDiscount) || 100,
          isActive: body.isActive !== false,
          expiryDate: body.expiryDate || '2027-12-31',
          usageCount: 0
        };
        await col.insertOne(newCoupon);
        return sendJson(res, 201, newCoupon);
      }
    }

    // 4b. Single Coupon Edit / Delete
    const couponMatch = pathname.match(/^\/api\/(?:admin\/)?coupons\/([^/]+)$/);
    if (couponMatch && couponMatch[1] !== 'validate') {
      const col = db.collection('coupons');
      const couponId = couponMatch[1];
      const query = { $or: [{ id: couponId }, { code: couponId.toUpperCase() }] };

      if (method === 'PUT' || method === 'PATCH') {
        const updates = await parseBody(req);
        delete updates._id;
        if (updates.code) updates.code = updates.code.trim().toUpperCase();
        await col.updateOne(query, { $set: updates });
        const updated = await col.findOne(query);
        return sendJson(res, 200, updated);
      }
      if (method === 'DELETE') {
        const doc = await col.findOne(query);
        if (!doc) return sendJson(res, 404, { error: 'Coupon not found' });
        await col.deleteOne(query);
        return sendJson(res, 200, { success: true, removed: doc });
      }
    }

    // 4c. Validate coupon
    if (pathname === '/api/coupons/validate' && method === 'POST') {
      const col = db.collection('coupons');
      const { code, subtotal } = await parseBody(req);
      if (!code) return sendJson(res, 400, { valid: false, message: 'Please enter a coupon code' });
      const cleanCode = code.trim().toUpperCase();
      const coupon = await col.findOne({ code: cleanCode });
      if (!coupon) return sendJson(res, 404, { valid: false, message: `Promo code '${cleanCode}' is invalid` });
      if (coupon.isActive === false) return sendJson(res, 400, { valid: false, message: `Promo code '${cleanCode}' is inactive` });
      
      const orderSubtotal = Number(subtotal) || 0;
      if (coupon.minOrderValue && orderSubtotal < coupon.minOrderValue) {
        return sendJson(res, 400, { valid: false, message: `Cart total must be at least ₹${coupon.minOrderValue} (Current: ₹${orderSubtotal})` });
      }

      let discount = 0;
      if (coupon.discountType === 'fixed' || coupon.discountType === 'flat') {
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
        message: `Coupon '${coupon.code}' applied! ₹${discount} savings added.`
      });
    }

    // 5. Products List
    if (pathname === '/api/products' && method === 'GET') {
      const col = db.collection('products');
      const category = urlObj.searchParams.get('category');
      const search = urlObj.searchParams.get('search');
      const filter = {};

      if (category && category !== 'All') {
        filter.$or = [{ category }, { categoryId: category }];
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
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

    // 6. Single Product (GET, PUT, DELETE)
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
        const updates = await parseBody(req);
        delete updates._id;
        await col.updateOne({ id }, { $set: updates });
        const updated = await col.findOne({ id });
        return sendJson(res, 200, updated);
      }

      if (method === 'DELETE') {
        const doc = await col.findOne({ id });
        if (!doc) return sendJson(res, 404, { error: 'Product not found' });
        await col.deleteOne({ id });
        return sendJson(res, 200, { success: true, removed: doc });
      }
    }

    // 7. Add Product
    if (pathname === '/api/products' && method === 'POST') {
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

    // 8. Orders (GET, POST)
    if (pathname === '/api/orders') {
      const col = db.collection('orders');
      if (method === 'GET') {
        const email = urlObj.searchParams.get('email');
        const phone = urlObj.searchParams.get('phone');
        const query = {};
        if (email) query.customerEmail = { $regex: `^${email}$`, $options: 'i' };
        if (phone) query.customerPhone = { $regex: phone };
        const orders = await col.find(query).sort({ _id: -1 }).toArray();
        return sendJson(res, 200, orders);
      }

      if (method === 'POST') {
        const settingsCol = db.collection('settings');
        const currentSettings = await settingsCol.findOne({ _id: 'global_settings' });
        if (currentSettings && currentSettings.acceptingOrders === false) {
          return sendJson(res, 403, { error: 'Store is currently not accepting new orders. Please contact store directly on WhatsApp or call +91 98113 40853.' });
        }

        const body = await parseBody(req);
        if (!body.items || body.items.length === 0) {
          return sendJson(res, 400, { error: 'Order must contain items' });
        }

        const orderNumber = Math.floor(1000 + Math.random() * 9000);
        const newOrder = {
          ...body,
          id: body.id || `KD-847211-${orderNumber}`,
          createdAt: new Date().toISOString(),
          orderStatus: body.orderStatus || 'Order Placed',
          paymentStatus: body.paymentStatus || (body.paymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID'),
          statusHistory: [
            {
              status: 'Order Placed',
              timestamp: new Date().toISOString(),
              note: `Order placed successfully via ${body.paymentMethod || 'Cash on Delivery'}`
            }
          ]
        };
        await col.insertOne(newOrder);
        return sendJson(res, 201, newOrder);
      }
    }

    // 8.1 Single Order by ID or Phone (GET)
    const singleOrderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (singleOrderMatch && method === 'GET') {
      const col = db.collection('orders');
      const param = decodeURIComponent(singleOrderMatch[1]).trim();
      const ord = await col.findOne({
        $or: [
          { id: { $regex: `^${param}$`, $options: 'i' } },
          { customerPhone: { $regex: param } }
        ]
      });
      if (!ord) return sendJson(res, 404, { error: 'Order not found' });
      return sendJson(res, 200, ord);
    }

    // 9. Order Status Update
    const orderStatusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (orderStatusMatch && (method === 'PATCH' || method === 'PUT')) {
      const col = db.collection('orders');
      const id = orderStatusMatch[1];
      const body = await parseBody(req);
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

    // 10. Admin Stats
    if (pathname === '/api/admin/stats') {
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

    // 11. Auth
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await parseBody(req);
      const normalizedEmail = (email || '').toLowerCase().trim();
      const ADMIN_EMAILS = ['siddhukumar2006@gmail.com', 'vyapaarwebs@gmail.com', 'kdsuperm@gmail.com'];
      if (ADMIN_EMAILS.includes(normalizedEmail) || (normalizedEmail === 'admin@kdsupermarket.com' && password === 'kdadmin123')) {
        const adminDisplayName = normalizedEmail === 'kdsuperm@gmail.com'
          ? 'KD Supermarket Desk (Admin)'
          : (normalizedEmail === 'vyapaarwebs@gmail.com' ? 'Vyapaar Webs (Admin)' : 'Siddhu Kumar (Admin)');
        return sendJson(res, 200, {
          token: `admin-token-${normalizedEmail.split('@')[0]}`,
          user: {
            id: `admin-${normalizedEmail.split('@')[0]}`,
            name: adminDisplayName,
            email: normalizedEmail,
            role: 'admin',
            phone: '+91 98113 40853'
          }
        });
      }

      return sendJson(res, 200, {
        token: `cust-token-${Date.now()}`,
        user: {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'customer',
          phone: '+91 98350 21980'
        }
      });
    }

    if (pathname === '/api/auth/google' && method === 'POST') {
      const body = await parseBody(req);
      let { email, name, avatar, credential } = body;

      if (credential && !email) {
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            email = payload.email;
            name = payload.name;
            avatar = payload.picture;
          }
        } catch {}
      }

      if (!email) return sendJson(res, 400, { error: 'Valid Google account email is required' });

      const normalizedEmail = email.toLowerCase().trim();
      const ADMIN_EMAILS = ['siddhukumar2006@gmail.com', 'vyapaarwebs@gmail.com', 'kdsuperm@gmail.com'];
      const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
      const displayName = isAdmin 
        ? (normalizedEmail === 'kdsuperm@gmail.com' ? 'KD Supermarket Desk (Admin)' : (normalizedEmail === 'vyapaarwebs@gmail.com' ? 'Vyapaar Webs (Admin)' : 'Siddhu Kumar (Admin)'))
        : (name || email.split('@')[0]);

      const user = {
        id: isAdmin ? `admin-${normalizedEmail.split('@')[0]}` : `usr-g-${Date.now()}`,
        name: displayName,
        email: normalizedEmail,
        role: isAdmin ? 'admin' : 'customer',
        phone: '+91 98113 40853',
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
        provider: 'google'
      };

      const usersCol = db.collection('users');
      await usersCol.updateOne({ email: normalizedEmail }, { $set: user }, { upsert: true });

      return sendJson(res, 200, {
        token: `google-token-${user.id}`,
        user
      });
    }

    // 404 for unhandled route
    return sendJson(res, 404, { error: 'API route not found', path: pathname });

  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  }
}
