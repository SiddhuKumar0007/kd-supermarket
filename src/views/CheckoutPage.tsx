import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  QrCode,
  Lock,
  ChevronRight,
  Tag,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order, PromoCode } from '../types';

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    subtotal, 
    deliveryFee, 
    total, 
    clearCart, 
    setCurrentView, 
    user, 
    selectedLocation, 
    settings,
    showToast 
  } = useStore();

  // Helper to get saved customer delivery details from local storage
  const savedDetails = useMemo(() => {
    try {
      const raw = localStorage.getItem('kd_saved_customer_details');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }, []);

  // Form Fields with automatic autofill from saved details or logged-in user profile
  const [fullName, setFullName] = useState(savedDetails?.fullName || user?.name || '');
  const [phone, setPhone] = useState(savedDetails?.phone || user?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState(savedDetails?.alternatePhone || '');
  const [email, setEmail] = useState(savedDetails?.email || user?.email || '');
  const [houseNo, setHouseNo] = useState(savedDetails?.houseNo || '');
  const [street, setStreet] = useState(savedDetails?.street || '');
  const [locality, setLocality] = useState(savedDetails?.locality || (selectedLocation ? selectedLocation.replace(', Madhubani (847211)', '') : ''));
  const [landmark, setLandmark] = useState(savedDetails?.landmark || '');
  const [pinCode, setPinCode] = useState(savedDetails?.pinCode || '847211');
  const [deliverySlot, setDeliverySlot] = useState('Today: 4:00 PM – 8:00 PM (Evening)');
  const [instructions, setInstructions] = useState('');

  // Auto-populate when user signs in with Google
  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Payment State (Locked to Cash on Delivery)
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery'>('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isFreeDeliveryUnlocked, setIsFreeDeliveryUnlocked] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<PromoCode[]>([]);

  useEffect(() => {
    async function loadPublicCoupons() {
      try {
        const list = await api.getCoupons();
        setAvailableCoupons(list.filter(c => c.isActive && c.isPublic !== false));
      } catch (e) {
        console.warn('Could not load public coupons', e);
      }
    }
    loadPublicCoupons();
  }, []);

  const executeApplyCoupon = async (codeToApply: string) => {
    if (!codeToApply.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }
    setIsApplyingCoupon(true);
    try {
      const res = await api.validateCoupon(codeToApply, subtotal);
      if (res.valid) {
        const isFree = res.isFreeDelivery || res.coupon?.discountType === 'free_delivery';
        setIsFreeDeliveryUnlocked(isFree);
        setDiscountAmount(res.discountAmount || 0);
        setAppliedCoupon(res.coupon);
        setCouponCode(res.coupon?.code || codeToApply);
        showToast(res.message, 'success');
      } else {
        setIsFreeDeliveryUnlocked(false);
        setDiscountAmount(0);
        setAppliedCoupon(null);
        showToast(res.message || 'Invalid coupon', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to apply coupon', 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeApplyCoupon(couponCode);
  };

  const removeCoupon = () => {
    setIsFreeDeliveryUnlocked(false);
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed', 'info');
  };

  const effectiveDeliveryFee = isFreeDeliveryUnlocked ? 0 : deliveryFee;
  const grandTotal = Math.max(0, subtotal + effectiveDeliveryFee - discountAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (settings.acceptingOrders === false) {
      showToast('Store is currently paused for new orders. Please check back shortly or call us.', 'error');
      return;
    }

        if (!fullName.trim() || !phone.trim() || !houseNo.trim() || !street.trim() || !locality.trim()) {
      showToast('Kripya apna poora pata (House No., Gali/Road, Locality, Name aur Mobile) bharein.', 'error');
      return;
    }

    if (pinCode.trim() !== '847211') {
      showToast('KD Supermarket delivery currently sirf PIN code 847211 (Madhubani Town) ke liye available hai.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Cash on Delivery Order Creation
      const paymentStatus: 'PENDING' = 'PENDING';

      // Build structured full address text for delivery boys and invoice
      const fullAddressText = [
        houseNo.trim() ? `House/Flat No: ${houseNo.trim()}` : '',
        street.trim() ? `Street/Gali: ${street.trim()}` : '',
        landmark.trim() ? `Landmark: ${landmark.trim()}` : '',
        locality.trim() ? `Locality: ${locality.trim()}` : '',
        `Madhubani, Bihar - ${pinCode.trim() || '847211'}`
      ].filter(Boolean).join(', ');

      // 2. Generate a client-side idempotency key for this order attempt
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `kd_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 3. Create the real server order via backend API
      const orderPayload = {
        idempotencyKey,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        address: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          alternatePhone: alternatePhone.trim() || undefined,
          houseNo: houseNo.trim(),
          street: street.trim(),
          locality: locality.trim(),
          landmark: landmark.trim(),
          city: 'Madhubani',
          state: 'Bihar',
          pinCode: pinCode.trim() || '847211',
          fullAddressText
        },
        items: cart.map(item => ({
          id: item.productId,
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          packSize: item.packSize,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        couponCode: appliedCoupon?.code,
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        discountAmount,
        total: grandTotal,
        paymentMethod: 'Cash on Delivery',
        paymentStatus,
        deliverySlot,
        instructions
      };

      const createdOrder = await api.createOrder(orderPayload);
      try {
        localStorage.setItem('kd_latest_order_id', createdOrder.id);
        localStorage.setItem('kd_latest_order_phone', createdOrder.customerPhone);
        localStorage.setItem('kd_saved_customer_details', JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          alternatePhone: alternatePhone.trim(),
          email: email.trim(),
          houseNo: houseNo.trim(),
          street: street.trim(),
          locality: locality.trim(),
          landmark: landmark.trim(),
          pinCode: pinCode.trim()
        }));
      } catch (e) {}

      clearCart();
      showToast(`Order ${createdOrder.id} created successfully!`, 'success');
      setCurrentView('order-confirmation', createdOrder);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };



  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-ivory-100 text-forest flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-charcoal">Your cart is empty</h2>
        <p className="text-xs text-charcoal-muted">Add some groceries before heading to checkout.</p>
        <button
          onClick={() => setCurrentView('catalog')}
          className="px-6 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow"
        >
          Browse Catalogue →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-muted">
        <button
          onClick={() => setCurrentView('catalog')}
          className="flex items-center gap-1 hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="border-b border-gray-200 pb-2.5 sm:pb-3">
        <h1 className="font-heading font-extrabold text-lg sm:text-2xl md:text-3xl text-charcoal">
          Supermarket Checkout
        </h1>
        <p className="text-[11px] sm:text-xs text-charcoal-muted mt-0.5 sm:mt-1">
          Review items, enter your Madhubani delivery address, and choose your payment method.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Left Column: Delivery Details & Payment */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Store Paused Alert */}
            {settings.acceptingOrders === false && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 space-y-1 shadow-sm">
                <div className="flex items-center gap-2 font-black text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>Store is Currently Not Accepting Orders</span>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  KD Supermarket manager has temporarily paused accepting new orders. Please check back shortly or call us directly at +91 98113 40853.
                </p>
              </div>
            )}

            {/* 1. Contact & Customer Details */}
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-card space-y-3 sm:space-y-4">
              <h3 className="font-heading font-bold text-base text-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Customer Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    autoComplete="name"
                    placeholder="e.g. Rameshwar Prasad Jha"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Primary Mobile (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    name="tel"
                    autoComplete="tel"
                    placeholder="e.g. 9835021980"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Alternate Phone (Calling - Optional)</label>
                  <input
                    type="tel"
                    name="tel-national"
                    autoComplete="tel"
                    placeholder="e.g. 9811340853"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Email Address (Optional for invoice)</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="rameshwar.jha@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            </div>

                        {/* 2. Madhubani Delivery Address */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <h3 className="font-heading font-bold text-base text-charcoal flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Delivery Address (Madhubani, Bihar)</span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-forest bg-forest/10 px-2.5 py-1 rounded-full w-fit">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  <span>Only PIN Code 847211 Serviceable</span>
                </span>
              </div>

              {/* Serviceable Pincode Info Banner */}
              <div className="bg-emerald-50 border border-emerald-200 text-forest-dark p-3 rounded-2xl text-xs flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-forest flex-shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-extrabold text-forest">Exclusive Delivery Service:</span> Currently available <strong>ONLY for PIN code 847211</strong> (All neighbourhoods across Madhubani town).
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Flat / House No. / Building / Floor *</label>
                  <input
                    type="text"
                    required
                    name="address-line1"
                    autoComplete="address-line1"
                    placeholder="e.g. House No. 24, 2nd Floor, Jha Niwas"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Street / Gali / Road / Mohalla *</label>
                  <input
                    type="text"
                    required
                    name="address-line2"
                    autoComplete="address-line2"
                    placeholder="e.g. Gali No. 3, Near Old Water Tank Road"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Colony / Locality / Ward in Madhubani *</label>
                  <input
                    type="text"
                    required
                    name="address-level2"
                    autoComplete="address-level2"
                    placeholder="e.g. Tirhut Colony / State Bank More / Suratganj"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Prominent Landmark *</label>
                  <input
                    type="text"
                    required
                    name="landmark"
                    autoComplete="off"
                    placeholder="e.g. Near Watson High School / Opposite Durga Mandir"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">City & State</label>
                  <input
                    type="text"
                    disabled
                    value="Madhubani, Bihar"
                    className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-charcoal-muted cursor-not-allowed"
                  />
                </div>

                                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-charcoal">Postal PIN Code *</label>
                    <span className="text-[10px] font-black text-forest bg-forest/15 px-1.5 py-0.5 rounded-md">
                      Serviceable: 847211 Only
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      name="postal-code"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPinCode(clean);
                      }}
                      placeholder="847211"
                      className={`w-full px-3 py-2.5 bg-ivory-50 border rounded-xl text-xs font-bold focus:outline-none transition-colors ${
                        pinCode.trim() === '847211'
                          ? 'border-emerald-300 text-charcoal focus:border-forest'
                          : 'border-red-400 text-red-600 focus:border-red-500 bg-red-50/50'
                      }`}
                    />
                    {pinCode.trim() === '847211' && (
                      <span className="absolute right-3 top-2.5 text-[11px] font-black text-fresh flex items-center gap-0.5">
                        ✓ Serviceable
                      </span>
                    )}
                  </div>
                  {pinCode.trim() && pinCode.trim() !== '847211' && (
                    <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200">
                      <span>⚠️ Delivery currently sirf PIN code <strong>847211</strong> (Madhubani Town) ke liye available hai. Kripya 847211 darj karein.</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Slot */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Preferred Delivery Slot:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    "Morning: 8:00 AM – 11:00 AM",
                    "Afternoon: 12:00 PM – 3:00 PM",
                    "Today: 4:00 PM – 8:00 PM (Evening)"
                  ].map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setDeliverySlot(slot)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        deliverySlot === slot
                          ? 'border-forest bg-forest text-white'
                          : 'border-gray-200 bg-ivory-50 text-charcoal hover:bg-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Delivery Instructions (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please call before reaching or leave at main gate"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            {/* 3. Payment Method: Cash on Delivery Exclusive */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-charcoal flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Payment Method</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-fresh/15 text-forest border border-fresh/30">
                  Cash on Delivery Active
                </span>
              </div>

              {/* Cash on Delivery Card (Sole Option) */}
              <div className="p-4 rounded-2xl border-2 border-forest bg-forest/5 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-xs text-charcoal">Cash on Delivery (COD)</p>
                      <span className="px-1.5 py-0.2 bg-warmYellow text-charcoal text-[9px] font-black rounded">100% Verified</span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">Pay in cash or UPI to delivery agent at your doorstep</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <p className="text-[10px] text-charcoal-muted flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                <span>Pay safely when you receive your fresh items in Madhubani town.</span>
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation CTA */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-card space-y-4">
              <h3 className="font-heading font-extrabold text-base text-charcoal border-b border-gray-100 pb-3">
                Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </h3>

              {/* Items preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 text-xs pr-1">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'base'}`} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-contain p-0.5 bg-white rounded-lg flex-shrink-0 border" />
                      <div className="truncate">
                        <p className="font-bold text-charcoal truncate">{item.name}</p>
                        <p className="text-[11px] text-charcoal-muted">{item.packSize} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-forest whitespace-nowrap">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Form */}
              <div className="pt-2 border-t border-gray-100">
                {appliedCoupon ? (
                  <div className="p-2.5 bg-forest/10 border border-forest/30 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                        <span className="font-mono font-black text-xs text-forest">{appliedCoupon.code}</span>
                        <span className="text-[11px] font-bold text-forest">
                          {isFreeDeliveryUnlocked ? 'Free Delivery Unlocked 🚚' : ('Applied (-₹' + discountAmount + ')')}
                        </span>
                      </div>
                      <p className="text-[10px] text-charcoal-muted mt-0.5">{appliedCoupon.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Promo Code (e.g. FREEDELIVERY)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-ivory-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-forest"
                      />
                      <button
                        type="button"
                        disabled={isApplyingCoupon}
                        onClick={applyCoupon}
                        className="px-3.5 py-2 bg-forest hover:bg-forest-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        {isApplyingCoupon ? 'Verifying...' : 'Apply'}
                      </button>
                    </div>

                    {/* Available Public Coupons for 1-Click Apply */}
                    {availableCoupons.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-forest mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-warmYellow" />
                          <span>Available Supermarket Offers ({availableCoupons.length}):</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {availableCoupons.map((c) => {
                            const minReq = Number(c.minOrderValue || (c as any).minOrderAmount || 0);
                            const isApplicable = minReq === 0 || subtotal >= minReq;
                            return (
                              <div
                                key={c.id || c.code}
                                className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                                  isApplicable 
                                    ? 'bg-emerald-50/70 border-emerald-200 hover:border-forest' 
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-black text-xs text-forest px-1.5 py-0.5 rounded bg-white border border-forest/20">
                                      {c.code}
                                    </span>
                                    <span className="text-[10px] font-bold text-charcoal truncate">
                                      {c.discountType === 'free_delivery' 
                                        ? '🚚 Free Delivery' 
                                        : c.discountType === 'flat' 
                                        ? `₹${c.discountValue} OFF` 
                                        : `${c.discountValue}% OFF`}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-charcoal-muted mt-0.5 truncate">
                                    {minReq > 0 ? `Min cart ₹${minReq}` : 'No minimum cart'}
                                    {c.description ? ` • ${c.description}` : ''}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  disabled={!isApplicable || isApplyingCoupon}
                                  onClick={() => executeApplyCoupon(c.code)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-xs flex-shrink-0 ${
                                    isApplicable 
                                      ? 'bg-forest text-white hover:bg-forest-dark cursor-pointer' 
                                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {isApplicable ? 'Apply Code' : `Add ₹${minReq - subtotal}`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-charcoal-muted">
                  <span>Subtotal</span>
                  <span className="font-bold text-charcoal">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-charcoal-muted">
                  <span>Delivery Charges</span>
                  <span>
                    {effectiveDeliveryFee === 0 ? (
                      <span className="text-fresh font-bold uppercase">
                        {isFreeDeliveryUnlocked ? 'FREE (Coupon Applied 🚚)' : 'FREE (Over ₹999)'}
                      </span>
                    ) : (
                      ('₹' + effectiveDeliveryFee)
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-fresh font-bold">
                    <span>Discount Savings</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-extrabold text-charcoal">
                  <span>Final Total</span>
                  <span className="text-xl text-forest font-black">₹{grandTotal}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || settings.acceptingOrders === false}
                className={`w-full py-3.5 rounded-xl text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 group ${
                  settings.acceptingOrders === false
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-80'
                    : 'bg-forest hover:bg-forest-dark disabled:opacity-50 text-white active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : settings.acceptingOrders === false ? (
                  <span>Store Paused — Orders Disabled</span>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-warmYellow" />
                    <span>Confirm Cash on Delivery Order (₹{grandTotal})</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-charcoal-muted flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                  <span>Verified local order handled directly by KD Supermarket desk</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
