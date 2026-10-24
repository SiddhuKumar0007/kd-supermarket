import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order } from '../types';

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

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 ');
  const [email, setEmail] = useState(user?.email || '');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState(selectedLocation.replace(', Madhubani (847211)', ''));
  const [pinCode, setPinCode] = useState('847211');
  const [landmark, setLandmark] = useState('Near State Bank More');
  const [deliverySlot, setDeliverySlot] = useState('Today: 4:00 PM – 8:00 PM (Evening)');
  const [instructions, setInstructions] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card/NetBanking' | 'Cash on Delivery' | 'WhatsApp'>('UPI');
  const [upiOption, setUpiOption] = useState<'qr' | 'id'>('qr');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

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

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }
    setIsApplyingCoupon(true);
    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      if (res.valid) {
        setDiscountAmount(res.discountAmount);
        setAppliedCoupon(res.coupon);
        showToast(res.message, 'success');
      } else {
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

  const removeCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed', 'info');
  };

  const grandTotal = Math.max(0, total - discountAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      showToast('Please provide your name, mobile number, and full address.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If Razorpay Cards/Netbanking was selected, trigger test flow
      let paymentStatus: 'PENDING' | 'PAID' = paymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID';
      
      if (paymentMethod === 'Card/NetBanking') {
        const rzpOrder = await api.createRazorpayOrder(grandTotal, `rec_${Date.now()}`);
        // Simulate immediate test completion in sandbox
        await api.verifyPayment(rzpOrder.id, `pay_test_${Date.now()}`);
        paymentStatus = 'PAID';
      }

      // 2. Create the real server order via backend API
      const orderPayload = {
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        address: {
          fullName,
          phone,
          street,
          locality,
          city: 'Madhubani',
          state: 'Bihar',
          pinCode,
          landmark
        },
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          packSize: item.packSize,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        deliveryFee,
        discountAmount,
        total: grandTotal,
        paymentMethod: paymentMethod === 'WhatsApp' ? 'WhatsApp Order Assistance' : paymentMethod,
        paymentStatus,
        deliverySlot,
        instructions
      };

      const createdOrder = await api.createOrder(orderPayload);

      // If WhatsApp option, also open chat
      if (paymentMethod === 'WhatsApp') {
        const msg = `Hello KD Supermarket! I placed order #${createdOrder.id} for ₹${grandTotal} on your website. Please confirm delivery to ${locality}, Madhubani.`;
        window.open(`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=${encodeURIComponent(msg)}`, '_blank');
      }

      clearCart();
      showToast(`Order ${createdOrder.id} created successfully!`, 'success');
      setCurrentView('order-confirmation', createdOrder);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="border-b border-gray-200 pb-3">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-charcoal">
          Supermarket Checkout
        </h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Review items, enter your Madhubani delivery address, and choose your payment method.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Details & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact & Customer Details */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-card space-y-4">
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
                    placeholder="e.g. Rameshwar Prasad Jha"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98350 21980"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-charcoal mb-1">Email Address (Optional for receipt)</label>
                  <input
                    type="email"
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
              <h3 className="font-heading font-bold text-base text-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Delivery Address (Madhubani, Bihar)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-charcoal mb-1">Street Address / House No. / Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House No. 12, Behind Watson High School"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Locality / Colony in Madhubani *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tirhut Colony / State Bank More"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal mb-1">Prominent Landmark *</label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Durga Mandir / Near SBI Branch"
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
                  <label className="block font-bold text-charcoal mb-1">Postal PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
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

            {/* 3. Payment Method Selection */}
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-card space-y-4">
              <h3 className="font-heading font-bold text-base text-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Select Payment Method</span>
              </h3>

              <div className="space-y-3">
                {/* UPI Option */}
                <div 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI' 
                      ? 'border-forest bg-forest/5 shadow-sm' 
                      : 'border-gray-200 hover:border-forest/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                        <QrCode className="w-5 h-5 text-forest" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-charcoal">UPI (Google Pay, PhonePe, Paytm, BHIM)</p>
                        <p className="text-[11px] text-charcoal-muted">Instant zero-fee payment with QR or UPI ID</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'UPI'} 
                      onChange={() => setPaymentMethod('UPI')} 
                      className="accent-forest"
                    />
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pt-3 border-t border-forest/10 space-y-3 text-xs">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setUpiOption('qr')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${upiOption === 'qr' ? 'bg-forest text-white' : 'bg-gray-100 text-charcoal'}`}
                        >
                          Scan Store QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiOption('id')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${upiOption === 'id' ? 'bg-forest text-white' : 'bg-gray-100 text-charcoal'}`}
                        >
                          Enter UPI ID
                        </button>
                      </div>

                      {upiOption === 'qr' ? (
                        <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                          {/* Demo Store QR visual */}
                          <div className="w-24 h-24 bg-forest/10 p-2 rounded-xl flex items-center justify-center border border-forest/20 text-center">
                            <QrCode className="w-16 h-16 text-forest" />
                          </div>
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-charcoal">KD SUPERMARKET STORE UPI</p>
                            <p className="text-[11px] text-charcoal-muted font-mono">kdsupermarket@upi</p>
                            <p className="text-[11px] text-fresh-dark font-medium">✓ Verified Merchant in Madhubani</p>
                            <p className="text-[10px] text-charcoal-light">Amount to be paid: ₹{grandTotal}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-forest"
                          />
                          <button
                            type="button"
                            onClick={() => showToast('UPI ID Verified', 'success')}
                            className="px-3 py-2 bg-fresh text-white rounded-xl text-xs font-bold"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card / Netbanking (Razorpay Test Mode) */}
                <div 
                  onClick={() => setPaymentMethod('Card/NetBanking')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Card/NetBanking' 
                      ? 'border-forest bg-forest/5 shadow-sm' 
                      : 'border-gray-200 hover:border-forest/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                        <CreditCard className="w-5 h-5 text-forest" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-charcoal">Cards, Net Banking & Wallets (Razorpay)</p>
                        <p className="text-[11px] text-charcoal-muted">Visa, Mastercard, RuPay, SBI, HDFC, ICICI Netbanking</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'Card/NetBanking'} 
                      onChange={() => setPaymentMethod('Card/NetBanking')} 
                      className="accent-forest"
                    />
                  </div>

                  {paymentMethod === 'Card/NetBanking' && (
                    <div className="mt-3 pt-3 border-t border-forest/10 text-xs text-charcoal-muted space-y-1">
                      <p className="flex items-center gap-1.5 text-forest font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Secure 256-bit encrypted checkout via Razorpay ({settings.isRazorpayTestMode ? 'Test Mode Enabled' : 'Live'})</span>
                      </p>
                      <p className="text-[11px]">
                        Payment will be verified and authenticated via server-side verification before confirming your supermarket order.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div 
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery' 
                      ? 'border-forest bg-forest/5 shadow-sm' 
                      : 'border-gray-200 hover:border-forest/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-fresh/10 flex items-center justify-center text-fresh">
                        <Truck className="w-5 h-5 text-fresh" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-charcoal">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-charcoal-muted">Pay in cash or UPI to delivery agent at your doorstep</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'Cash on Delivery'} 
                      onChange={() => setPaymentMethod('Cash on Delivery')} 
                      className="accent-forest"
                    />
                  </div>
                </div>

                {/* WhatsApp Assisted Ordering */}
                <div 
                  onClick={() => setPaymentMethod('WhatsApp')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'WhatsApp' 
                      ? 'border-forest bg-forest/5 shadow-sm' 
                      : 'border-gray-200 hover:border-forest/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-fresh/15 flex items-center justify-center text-fresh-dark">
                        <MessageCircle className="w-5 h-5 fill-fresh text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-charcoal">Order via WhatsApp Assistance</p>
                        <p className="text-[11px] text-charcoal-muted">Directly book and chat with KD Supermarket desk on WhatsApp</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'WhatsApp'} 
                      onChange={() => setPaymentMethod('WhatsApp')} 
                      className="accent-forest"
                    />
                  </div>
                </div>
              </div>
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
                        <span className="text-[11px] font-bold text-forest">Applied (-₹{discountAmount})</span>
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
                        placeholder="Enter Promo Code (e.g. KD50)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-ivory-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-forest"
                      />
                      <button
                        type="button"
                        disabled={isApplyingCoupon}
                        onClick={applyCoupon}
                        className="px-3.5 py-2 bg-forest hover:bg-forest-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        {isApplyingCoupon ? 'Verifying...' : 'Apply'}
                      </button>
                    </div>
                    <p className="text-[10px] text-charcoal-muted mt-1">
                      Check <strong>Special Offers</strong> page for active supermarket promo codes.
                    </p>
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
                    {deliveryFee === 0 ? (
                      <span className="text-fresh font-bold uppercase">FREE (Over ₹499)</span>
                    ) : (
                      `₹${deliveryFee}`
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
                disabled={isSubmitting}
                className="w-full py-3.5 bg-forest hover:bg-forest-dark disabled:opacity-50 text-white rounded-xl text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 group active:scale-95"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order (₹{grandTotal})</span>
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
