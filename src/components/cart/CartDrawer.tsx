import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  MessageCircle, 
  Truck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    subtotal, 
    deliveryFee, 
    total, 
    freeDeliveryThreshold, 
    amountNeededForFreeDelivery,
    updateQuantity, 
    removeFromCart, 
    clearCart,
    shareCartOnWhatsApp,
    setCurrentView,
    user,
    setIsAuthModalOpen,
    setAuthModalMode
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-forest text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-warmYellow" />
              <h2 className="font-heading font-bold text-sm tracking-wide">
                Your Grocery Basket ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Goal Banner */}
          <div className="p-3 bg-ivory-100 border-b border-gray-200">
            {amountNeededForFreeDelivery > 0 ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal mb-1.5">
                  <span className="flex items-center gap-1.5 text-forest">
                    <Truck className="w-4 h-4 text-forest" />
                    <span>Add <strong>₹{amountNeededForFreeDelivery}</strong> more for <strong>FREE Delivery</strong></span>
                  </span>
                  <span className="text-[11px] text-charcoal-muted">{freeDeliveryPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fresh transition-all duration-300 rounded-full"
                    style={{ width: `${freeDeliveryPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-fresh-dark">
                <CheckCircle2 className="w-4 h-4 text-fresh" />
                <span>You have unlocked FREE Home Delivery in Madhubani! 🎉</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-ivory-200 flex items-center justify-center text-forest/40">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-charcoal">Your basket is empty</h3>
                  <p className="text-xs text-charcoal-muted mt-1 max-w-xs">
                    Explore daily essentials, fresh atta, cooking oil, spices, and snacks at KD Supermarket.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('catalog');
                  }}
                  className="px-6 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Start Shopping Now →
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'base'}`} className="pt-3 flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain p-1 bg-white rounded-xl border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-charcoal truncate">{item.name}</h4>
                    <p className="text-[11px] text-charcoal-muted">{item.brand} • {item.packSize}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-forest">₹{item.price}</span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] text-charcoal-light line-through">₹{item.mrp}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-lg bg-ivory-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="p-1.5 hover:bg-gray-200 text-charcoal transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-charcoal">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="p-1.5 hover:bg-gray-200 text-charcoal transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-gray-200 space-y-3">
              {/* Cost Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-charcoal-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-charcoal-muted">
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-fresh font-bold uppercase tracking-wide">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold text-charcoal">
                  <span>Estimated Total</span>
                  <span className="text-base text-forest font-black">₹{total}</span>
                </div>
              </div>

              {/* Share Cart on WhatsApp Button */}
              <button
                type="button"
                onClick={shareCartOnWhatsApp}
                className="w-full py-2 px-3 bg-fresh/10 hover:bg-fresh/20 text-fresh-dark border border-fresh/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-fresh text-white" />
                Share Cart on WhatsApp (+91 98113 40853)
              </button>

              {/* Proceed to Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
