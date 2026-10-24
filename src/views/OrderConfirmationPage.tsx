import React from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  MessageCircle, 
  ArrowRight, 
  Printer, 
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { viewParam, setCurrentView, settings } = useStore();
  const order: Order = viewParam;

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-charcoal">No order details found</h2>
        <button
          onClick={() => setCurrentView('home')}
          className="px-5 py-2.5 bg-forest text-white rounded-xl text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleTrack = () => {
    setCurrentView('track-order', order.id);
  };

  const handleWhatsAppChat = () => {
    const text = `Hello KD Supermarket, I just placed order #${order.id} for ₹${order.total}. Please confirm delivery status.`;
    window.open(`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Success Hero Header */}
      <div className="text-center space-y-3 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-card">
        <div className="w-16 h-16 rounded-full bg-fresh/15 text-fresh flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-fresh/10 text-fresh-dark">
          ORDER SUCCESSFULLY RECEIVED
        </span>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-charcoal">
          Thank You, {order.customerName}!
        </h1>
        <p className="text-xs md:text-sm text-charcoal-muted max-w-lg mx-auto leading-relaxed">
          Your grocery order has been forwarded directly to our store team at <strong>STATE BANK MORE, Madhubani</strong>. We are picking and preparing your items.
        </p>

        {/* Order ID Pill */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-ivory-100 border border-forest/20 rounded-2xl text-xs font-bold text-forest">
            <span>Order Reference ID:</span>
            <span className="font-mono text-sm text-charcoal">{order.id}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={handleTrack}
            className="px-6 py-3 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Progress Live</span>
          </button>

          <button
            onClick={handleWhatsAppChat}
            className="px-5 py-3 bg-fresh hover:bg-fresh-dark text-white rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp (+91 98113 40853)</span>
          </button>
        </div>
      </div>

      {/* Order Details Receipt Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-heading font-extrabold text-base text-charcoal">
            Order Receipt & Breakdown
          </h3>
          <span className="text-xs text-charcoal-muted">
            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        {/* Delivery Details info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-ivory-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <p className="font-bold text-charcoal mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>Delivering To:</span>
            </p>
            <p className="text-charcoal font-semibold">{order.address.fullName} ({order.customerPhone})</p>
            <p className="text-charcoal-muted">{order.address.street}, {order.address.locality}</p>
            <p className="text-charcoal-muted">Landmark: {order.address.landmark}</p>
            <p className="text-charcoal-muted">PIN: {order.address.pinCode}, Madhubani, Bihar</p>
          </div>

          <div>
            <p className="font-bold text-charcoal mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest" />
              <span>Delivery Slot & Payment:</span>
            </p>
            <p className="text-charcoal font-semibold">{order.deliverySlot}</p>
            <p className="text-charcoal-muted mt-1">
              Payment Method: <strong>{order.paymentMethod}</strong>
            </p>
            <p className="text-charcoal-muted">
              Payment Status:{' '}
              <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-fresh' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider">
            Items Ordered ({order.items.length})
          </h4>
          <div className="divide-y divide-gray-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-11 h-11 object-cover rounded-xl border flex-shrink-0" />
                  <div>
                    <p className="font-bold text-charcoal">{item.name}</p>
                    <p className="text-[11px] text-charcoal-muted">{item.packSize} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-forest">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs">
          <div className="flex justify-between text-charcoal-muted">
            <span>Subtotal</span>
            <span className="font-bold text-charcoal">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-charcoal-muted">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? <span className="text-fresh font-bold">FREE</span> : `₹${order.deliveryFee}`}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-fresh font-bold">
              <span>Discount</span>
              <span>-₹{order.discountAmount}</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-extrabold text-charcoal">
            <span>Grand Total</span>
            <span className="text-xl text-forest font-black">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center">
        <button
          onClick={() => setCurrentView('catalog')}
          className="text-xs font-bold text-forest hover:underline"
        >
          ← Continue Shopping at KD Supermarket
        </button>
      </div>
    </div>
  );
};
