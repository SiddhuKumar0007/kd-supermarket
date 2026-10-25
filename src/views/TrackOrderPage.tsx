import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order } from '../types';

export const TrackOrderPage: React.FC = () => {
  const { viewParam, settings, showToast } = useStore();
  
  const getInitialId = () => {
    if (typeof viewParam === 'string' && viewParam.trim()) return viewParam.trim();
    if (viewParam?.id) return viewParam.id;
    try {
      const saved = localStorage.getItem('kd_latest_order_id');
      if (saved) return saved;
    } catch (e) {}
    return '';
  };

  const [searchId, setSearchId] = useState<string>(getInitialId());
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = async (id: string, silent = false) => {
    if (!id.trim()) return;
    try {
      if (!silent) setLoading(true);
      setErrorMsg('');
      const data = await api.getOrderById(id.trim());
      if (data) {
        setOrder(data);
      } else {
        if (!silent) {
          setOrder(null);
          setErrorMsg(`No order found matching "${id}". Please check your Order ID (e.g. KD-847211-xxxx) or 10-digit mobile number.`);
        }
      }
    } catch (err) {
      if (!silent) setErrorMsg('Failed to fetch order status. Please check your connection.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (searchId) {
      fetchOrder(searchId);
    }
  }, []);

  // Live Auto-Sync: Polls every 4 seconds so customer sees admin updates in real-time
  useEffect(() => {
    if (!order || order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') return;
    const interval = setInterval(() => {
      fetchOrder(order.id, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [order?.id, order?.orderStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchId);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        setIsCancelling(true);
        const updated = await api.updateOrderStatus(order.id, 'Cancelled', 'Cancelled by customer online');
        setOrder(updated);
        showToast('Your order has been cancelled', 'info');
      } catch (e) {
        showToast('Could not cancel order. Please contact store on WhatsApp.', 'error');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const statusSteps = [
    { label: 'Order Placed', desc: 'Received online by KD Supermarket' },
    { label: 'Order Confirmed', desc: 'Accepted by store desk' },
    { label: 'Preparing Your Order', desc: 'Stock packed from shelves' },
    { label: 'Ready for Dispatch', desc: 'Bags sealed and verified' },
    { label: 'Out for Delivery', desc: 'Store delivery associate en route' },
    { label: 'Delivered', desc: 'Delivered to your address' }
  ];

  const getStepIndex = (status: string) => {
    return statusSteps.findIndex(s => s.label === status);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Title & Search Bar */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest/10 text-forest uppercase tracking-wider">
          LIVE ORDER TRACKER
        </span>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-charcoal">
          Live Order Tracking
        </h1>
        <p className="text-xs text-charcoal-muted max-w-md mx-auto">
          Apna Order ID (e.g. <strong>KD-847211-xxxx</strong>) ya 10-digit Mobile Number daalkar live tracking dekhein.
        </p>

        {/* Search input */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Enter Order ID or Mobile Number"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-charcoal focus:outline-none focus:border-forest shadow-sm"
            />
            <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Track Order</span>}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-charcoal-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time status synced directly with KD Supermarket desk</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 text-center">
          {errorMsg}
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-card overflow-hidden space-y-6 p-6 md:p-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-charcoal">{order.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isCancelled 
                    ? 'bg-red-100 text-red-700' 
                    : order.orderStatus === 'Delivered' 
                    ? 'bg-fresh/15 text-fresh-dark' 
                    : 'bg-warmYellow/30 text-charcoal'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-charcoal-muted mt-1">
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchOrder(order.id)}
                className="p-2 text-charcoal-muted hover:text-forest border border-gray-200 rounded-xl hover:bg-ivory transition-colors text-xs flex items-center gap-1 font-semibold"
                title="Refresh order status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>

              <a
                href={`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20Supermarket,%20inquiry%20regarding%20Order%20${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-fresh text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Contact Store</span>
              </a>
            </div>
          </div>

          {/* Delivered Banner */}
          {order.orderStatus === 'Delivered' && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white shadow-lg flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 text-white animate-bounce" />
              <div>
                <p className="font-heading font-black text-sm sm:text-base">Order Delivered Successfully! 🎉</p>
                <p className="text-xs text-white/90 mt-0.5">
                  Aapka order poora ho chuka hai aur aapke pate par deliver ho gaya hai. KD Supermarket Madhubani se shopping karne ke liye shukriya!
                </p>
              </div>
            </div>
          )}

          {/* Visual Progress Timeline */}
          {isCancelled ? (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-3 text-red-800 text-xs">
              <XCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
              <div>
                <p className="font-bold">This order has been cancelled.</p>
                <p className="text-[11px]">If you require a replacement or assistance, please message store desk on WhatsApp.</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="relative">
                {/* Timeline bar */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
                  {statusSteps.map((step, idx) => {
                    const isDone = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={idx} className="flex flex-col items-center text-center space-y-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isCurrent
                            ? 'bg-forest text-white ring-4 ring-forest/20 scale-110'
                            : isDone
                            ? 'bg-fresh text-white'
                            : 'bg-gray-100 text-charcoal-muted border border-gray-200'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isDone ? 'text-charcoal' : 'text-charcoal-muted'}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-charcoal-muted hidden sm:block mt-0.5 leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Status Updates Log */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-ivory-50 p-4 rounded-2xl border border-gray-100 space-y-2">
              <p className="text-xs font-bold text-charcoal uppercase tracking-wider">
                Store Timeline Updates:
              </p>
              <div className="space-y-1.5 text-xs text-charcoal">
                {order.statusHistory.map((sh, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-forest">{sh.status}</span>
                      <span className="text-charcoal-muted text-[11px] ml-2">
                        ({new Date(sh.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                      {sh.note && <p className="text-[11px] text-charcoal-muted">{sh.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Order Items Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100 text-xs">
            {/* Delivery address */}
            <div className="space-y-2">
              <h4 className="font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>Delivery Destination</span>
              </h4>
              <div className="p-3.5 bg-ivory-50 rounded-2xl border border-gray-100 text-charcoal space-y-1.5">
                <p className="font-bold text-sm text-charcoal">{order.address.fullName || order.customerName}</p>
                <p className="text-charcoal-muted flex items-center gap-2">
                  <span>📞 {order.customerPhone}</span>
                  {order.address?.alternatePhone && <span>| Alt: {order.address.alternatePhone}</span>}
                </p>
                <p className="text-charcoal font-medium leading-relaxed">
                  {order.address.fullAddressText || [
                    order.address.houseNo ? `House/Flat: ${order.address.houseNo}` : null,
                    order.address.street,
                    order.address.locality,
                    `Madhubani, Bihar - ${order.address.pinCode || '847211'}`
                  ].filter(Boolean).join(', ')}
                </p>
                {order.address.landmark && (
                  <p className="text-charcoal-muted text-[11px]">
                    <strong className="text-charcoal">Landmark:</strong> {order.address.landmark}
                  </p>
                )}
                {order.deliverySlot && (
                  <p className="text-forest font-semibold mt-1">🕒 Slot: {order.deliverySlot}</p>
                )}
                {order.instructions && (
                  <p className="text-amber-800 bg-amber-50 p-1.5 rounded-lg text-[10px] italic border border-amber-200">
                    📝 Note: {order.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Ordered products */}
            <div className="space-y-2">
              <h4 className="font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-forest" />
                <span>Order Summary ({order.items.length} items)</span>
              </h4>
              <div className="p-3 bg-ivory-50 rounded-xl border border-gray-100 space-y-2">
                <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 pr-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <span className="font-bold text-charcoal">{it.name}</span>
                        <span className="text-[10px] text-charcoal-muted block">{it.packSize} × {it.quantity}</span>
                      </div>
                      <span className="font-bold text-forest whitespace-nowrap">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-charcoal">
                  <span>Grand Total ({order.paymentMethod})</span>
                  <span className="text-forest font-black">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Option (Allowed if status is Placed or Confirmed) */}
          {(order.orderStatus === 'Order Placed' || order.orderStatus === 'Order Confirmed') && (
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-[11px] text-charcoal-muted">
                Need to modify or cancel? You can cancel while the order is not yet packed.
              </p>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
