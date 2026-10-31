import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Heart, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  MessageCircle, 
  Check, 
  Star,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../services/api';
import { Product } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { 
    viewParam, 
    setCurrentView, 
    addToCart, 
    toggleWishlist, 
    isWishlisted, 
    cart, 
    updateQuantity, 
    settings,
    selectedLocation
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!viewParam) return;
      try {
        setLoading(true);
        const data = await api.getProductById(viewParam);
        setProduct(data);
        if (data?.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
      } catch (e) {
        console.error('Error fetching product details', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [viewParam]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-charcoal-muted">
        <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading product details from KD Supermarket...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-charcoal">Product not found</h2>
        <button
          onClick={() => setCurrentView('catalog')}
          className="px-5 py-2.5 bg-forest text-white rounded-xl text-xs font-bold"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const activeVariant = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];
  const price = activeVariant ? activeVariant.price : product.price;
  const mrp = activeVariant ? activeVariant.mrp : product.mrp;
  const packSize = activeVariant ? activeVariant.size : product.packSize;
  const stock = activeVariant ? activeVariant.stock : product.stock;
  const inStock = activeVariant ? activeVariant.inStock : product.inStock;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const wishlisted = isWishlisted(product.id);

  // Check cart status
  const cartItem = cart.find(
    item => item.productId === product.id && (selectedVariantId ? item.variantId === selectedVariantId : true)
  );
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariantId);
    setCurrentView('checkout');
  };

  const handleWhatsAppAsk = () => {
    const text = `Hello KD Supermarket, is "${product.name}" (${packSize}) at ₹${price} available for delivery in Madhubani?`;
    window.open(`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
        <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <button onClick={() => setCurrentView('catalog')} className="hover:text-forest">Catalogue</button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-charcoal-muted truncate max-w-[150px]">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-charcoal font-bold truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-card">
        {/* Left: Product Image & Badges */}
        <div className="md:col-span-5 relative">
          <div className="relative pt-[90%] rounded-2xl overflow-hidden bg-ivory-50 border border-gray-100 shadow-inner">
            <img
              src={product.image}
              alt={product.name}
              onError={(e: any) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"; }}
              className="absolute inset-0 w-full h-full object-contain p-4"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black bg-warmYellow text-charcoal shadow-md">
                {discount}% DISCOUNT
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-charcoal hover:text-red-500 shadow-md transition-transform active:scale-90"
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-ivory-100 flex items-center justify-between text-xs text-charcoal-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-forest" />
              <span>Available in Madhubani Store</span>
            </span>
            <span className="font-semibold text-forest">SKU: {product.sku}</span>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-forest">
              <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-forest/10 font-bold">{product.brand}</span>
              <span>•</span>
              <span className="text-charcoal-muted">{product.subcategory || product.category}</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-charcoal leading-snug">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-forest text-white text-xs font-bold">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-xs text-charcoal-muted">
                {product.reviewsCount} customer ratings
              </span>
              <span className="text-xs text-fresh font-bold">
                ✓ Verified Supermarket Quality
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-ivory-50 border border-gray-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-forest">₹{price}</span>
            {mrp > price && (
              <>
                <span className="text-base text-charcoal-light line-through">₹{mrp}</span>
                <span className="text-xs font-bold text-fresh bg-fresh/10 px-2 py-0.5 rounded-full">
                  You Save ₹{mrp - price} ({discount}%)
                </span>
              </>
            )}
            <span className="text-[10px] text-charcoal-muted ml-auto">(Inclusive of all taxes)</span>
          </div>

          {/* Pack Size Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Select Pack Size / Weight:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-forest bg-forest text-white shadow-sm'
                          : 'border-gray-200 bg-white text-charcoal hover:border-forest/40'
                      }`}
                    >
                      <span>{v.size}</span>
                      <span className={`text-[11px] ${isSelected ? 'text-warmYellow' : 'text-charcoal-muted'}`}>
                        ₹{v.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock availability */}
          <div className="flex items-center gap-2 text-xs">
            {inStock ? (
              <span className="flex items-center gap-1.5 font-bold text-fresh-dark">
                <Check className="w-4 h-4 text-fresh" />
                <span>In Stock ({stock} units ready in store)</span>
              </span>
            ) : (
              <span className="font-bold text-red-600">Currently Out of Stock</span>
            )}
          </div>

          {/* Add to Cart & Buy Now Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              {cartQty > 0 ? (
                <div className="flex-1 flex items-center justify-between border-2 border-forest rounded-xl bg-forest/5 p-2">
                  <span className="text-xs font-bold text-forest ml-2">In Your Basket:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(product.id, cartQty - 1, selectedVariantId)}
                      className="p-1.5 bg-white rounded-lg shadow-sm text-forest"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black text-forest">{cartQty}</span>
                    <button
                      onClick={() => updateQuantity(product.id, cartQty + 1, selectedVariantId)}
                      className="p-1.5 bg-white rounded-lg shadow-sm text-forest"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => addToCart(product, quantity, selectedVariantId)}
                  className="flex-1 py-3.5 px-6 bg-forest hover:bg-forest-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Basket</span>
                </button>
              )}

              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="py-3.5 px-6 bg-warmYellow hover:bg-warmYellow-dark disabled:opacity-50 text-charcoal font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp Store Inquiry Button */}
            <button
              type="button"
              onClick={handleWhatsAppAsk}
              className="w-full py-2.5 px-4 bg-fresh/10 hover:bg-fresh/20 text-fresh-dark border border-fresh/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-fresh text-white" />
              <span>Ask Store about this product on WhatsApp (+91 98113 40853)</span>
            </button>
          </div>

          {/* Delivery & Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2 text-charcoal-muted">
              <Truck className="w-4 h-4 text-forest flex-shrink-0" />
              <span>Free Delivery above ₹999</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-muted">
              <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0" />
              <span>100% Original Brand</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-muted">
              <RotateCcw className="w-4 h-4 text-forest flex-shrink-0" />
              <span>Easy In-Store Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Product Details Tabs */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-card space-y-6">
        <h3 className="font-heading font-extrabold text-xl text-charcoal border-b border-gray-100 pb-3">
          Product Details & Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-charcoal">
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-forest uppercase tracking-wider">About This Item</h4>
            <p className="text-charcoal-muted">{product.description}</p>
            <p className="text-charcoal-muted">{product.details}</p>
          </div>

          <div className="space-y-3 bg-ivory-50 p-4 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-sm text-forest uppercase tracking-wider">Quick Highlights</h4>
            <ul className="space-y-2 text-charcoal-muted">
              <li>• <strong>Brand:</strong> {product.brand}</li>
              <li>• <strong>Pack Size:</strong> {packSize}</li>
              <li>• <strong>Category:</strong> {product.category}</li>
              <li>• <strong>Product Code / SKU:</strong> {product.sku}</li>
              <li>• <strong>Country of Origin:</strong> India</li>
              <li>• <strong>Store Location:</strong> State Bank More, Madhubani</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <span className="text-xs font-bold text-forest uppercase tracking-wider">Similar Items</span>
            <h3 className="font-heading font-extrabold text-2xl text-charcoal">
              Frequently Bought Together
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {product.related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
