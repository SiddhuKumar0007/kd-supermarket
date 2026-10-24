import fs from 'fs';
import path from 'path';

let storeCache = null;

function getStore() {
  if (storeCache) return storeCache;
  try {
    const storePath = path.join(process.cwd(), 'server', 'data', 'store.json');
    if (fs.existsSync(storePath)) {
      storeCache = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
      return storeCache;
    }
  } catch (err) {
    console.error('Error reading store.json in Vercel function:', err);
  }
  return { categories: [], products: [], orders: [], settings: {}, users: [], promoCodes: [] };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const store = getStore();

  // Health
  if (url.includes('/api/health')) {
    return res.status(200).json({ status: 'online', store: 'KD SUPERMARKET' });
  }

  // Categories
  if (url.includes('/api/categories')) {
    return res.status(200).json(store.categories || []);
  }

  // Products
  if (url.includes('/api/products')) {
    return res.status(200).json(store.products || []);
  }

  // Settings
  if (url.includes('/api/settings')) {
    return res.status(200).json(store.settings || {});
  }

  // Promo codes / coupons
  if (url.includes('/api/coupons/validate') && req.method === 'POST') {
    const { code, subtotal } = req.body || {};
    const coupons = store.promoCodes || [];
    const found = coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase().trim());
    if (!found) {
      return res.status(200).json({ valid: false, discountAmount: 0, message: 'Invalid promo code' });
    }
    const discount = found.discountType === 'percentage' 
      ? Math.round(((subtotal || 0) * found.discountValue) / 100)
      : found.discountValue;
    return res.status(200).json({ valid: true, discountAmount: discount, coupon: found, message: `Coupon ${found.code} applied successfully!` });
  }

  if (url.includes('/api/admin/coupons')) {
    return res.status(200).json(store.promoCodes || []);
  }

  return res.status(200).json({ status: 'online', endpoint: url });
}
