import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Copy, 
  ChevronRight,
  ArrowRight,
  BadgePercent
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../services/api';
import { Product, PromoCode } from '../types';

export const OffersPage: React.FC = () => {
  const { setCurrentView, showToast } = useStore();
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [prods, couponList] = await Promise.all([
          api.getProducts(),
          api.getCoupons()
        ]);
        setDiscountProducts(prods.filter(p => p.discount >= 10));
        setCoupons(couponList);
      } catch (e) {
        console.error('Error fetching offer products', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
        <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-charcoal font-bold">Special Offers & Deals</span>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-forest via-[#1E774E] to-[#125837] text-white p-8 md:p-12 shadow-card space-y-3">
        <span className="px-3 py-1 rounded-full bg-warmYellow text-charcoal text-xs font-black uppercase tracking-wider">
          GENUINE STORE DISCOUNTS
        </span>
        <h1 className="font-heading font-black text-3xl md:text-4xl text-white">
          KD Supermarket Deals & Coupons
        </h1>
        <p className="text-xs md:text-sm text-ivory-100 max-w-xl leading-relaxed">
          Enjoy genuine discounts on flour, cooking oils, lentils, tea, and cleaning essentials. Apply coupons at checkout for direct savings.
        </p>
      </div>

      {/* Active Coupon Codes */}
      <div className="space-y-4">
        <h3 className="font-heading font-extrabold text-lg text-charcoal flex items-center gap-2">
          <BadgePercent className="w-5 h-5 text-forest" />
          <span>Active Store Coupons</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div key={c.code} className="bg-white p-5 rounded-2xl border-2 border-dashed border-forest/30 shadow-card flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-forest/10 text-forest border border-forest/20 inline-block">
                  {c.code}
                </span>
                <h4 className="font-bold text-sm text-charcoal">{c.title}</h4>
                <p className="text-xs text-charcoal-muted">
                  {c.description || (c.minOrderValue ? `Applicable on orders above ₹${c.minOrderValue}` : 'Storewide discount')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyCode(c.code)}
                className="px-4 py-2 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Discounted Products Grid */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-xl text-charcoal">
            Items with Direct Price Cuts ({discountProducts.length})
          </h3>
          <button
            onClick={() => setCurrentView('catalog')}
            className="text-xs font-bold text-forest hover:underline"
          >
            Browse Full Catalogue →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-charcoal-muted">Loading deals...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {discountProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
