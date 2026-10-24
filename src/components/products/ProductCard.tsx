import React, { useState } from 'react';
import { Heart, Plus, Minus, Check, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity, toggleWishlist, isWishlisted, setCurrentView } = useStore();
  
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id || ''
  );

  const activeVariant = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];
  const price = activeVariant ? activeVariant.price : product.price;
  const mrp = activeVariant ? activeVariant.mrp : product.mrp;
  const packSize = activeVariant ? activeVariant.size : product.packSize;
  const inStock = activeVariant ? activeVariant.inStock : product.inStock;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Check if this item/variant is currently in the cart
  const cartItem = cart.find(
    item => item.productId === product.id && (selectedVariantId ? item.variantId === selectedVariantId : true)
  );
  const cartQty = cartItem ? cartItem.quantity : 0;

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-forest/20 shadow-card hover:shadow-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Badges: Discount & Bestseller */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {discount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-warmYellow text-charcoal shadow-sm">
            {discount}% OFF
          </span>
        )}
        {product.tags?.includes('bestseller') && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest text-white shadow-sm">
            Top Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs text-charcoal hover:text-red-500 shadow-sm transition-transform active:scale-90"
        aria-label="Toggle wishlist"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      </button>

      {/* Product Image */}
      <div 
        onClick={() => setCurrentView('product-detail', product.id)}
        className="relative pt-[85%] bg-ivory-50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-charcoal-muted mb-1">
            <span className="font-semibold uppercase tracking-wider text-forest truncate max-w-[120px]">
              {product.brand}
            </span>
            <span className="truncate">{product.category.split('&')[0]}</span>
          </div>

          <h3 
            onClick={() => setCurrentView('product-detail', product.id)}
            className="font-bold text-xs md:text-sm text-charcoal line-clamp-2 hover:text-forest cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Variants Selection (if multi-pack sizes) */}
        {product.variants && product.variants.length > 1 ? (
          <div className="pt-1">
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full text-xs font-semibold py-1 px-2 rounded-lg bg-ivory-50 border border-gray-200 text-charcoal focus:outline-none focus:border-forest"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.size} — ₹{v.price} {v.mrp > v.price ? `(MRP ₹${v.mrp})` : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-[11px] font-medium text-charcoal-muted">
            Pack Size: <span className="font-semibold text-charcoal">{packSize}</span>
          </p>
        )}

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-forest">₹{price}</span>
              {mrp > price && (
                <span className="text-xs text-charcoal-light line-through font-normal">₹{mrp}</span>
              )}
            </div>
            {mrp > price && (
              <span className="text-[10px] text-fresh font-bold block">Save ₹{mrp - price}</span>
            )}
          </div>

          {/* Cart Stepper or Add Button */}
          {inStock ? (
            cartQty > 0 ? (
              <div className="flex items-center border border-forest rounded-xl bg-forest/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, cartQty - 1, selectedVariantId)}
                  className="p-1.5 hover:bg-forest/20 text-forest transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-black text-forest">{cartQty}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, cartQty + 1, selectedVariantId)}
                  className="p-1.5 hover:bg-forest/20 text-forest transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product, 1, selectedVariantId)}
                className="flex items-center gap-1 px-3 py-1.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )
          ) : (
            <span className="text-[11px] font-bold text-gray-400">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
};
