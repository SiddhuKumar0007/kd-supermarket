import React from 'react';
import { ShieldCheck, Truck, RotateCcw, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PolicyProps {
  type: 'shipping' | 'return' | 'privacy' | 'terms' | 'faqs';
}

export const PolicyPages: React.FC<PolicyProps> = ({ type }) => {
  const { setCurrentView, settings } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
        <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-charcoal font-bold capitalize">{type} Policy</span>
      </div>

      {type === 'shipping' && (
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-card space-y-6 text-xs text-charcoal leading-relaxed">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <Truck className="w-6 h-6 text-forest" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-charcoal">Shipping & Delivery Policy</h1>
              <p className="text-charcoal-muted">KD SUPERMARKET • Madhubani, Bihar</p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-forest">1. Local Delivery Areas in Madhubani</h3>
            <p>
              KD SUPERMARKET proudly services all residential and commercial neighbourhoods across Madhubani town (PIN 847211), including Tirhut Colony, State Bank More, Watson High School Road, Babu Saheb Colony, Suratganj, Station Road, Collectorate area, and Ganga Sagar.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-forest">2. Delivery Charges & Free Delivery</h3>
            <p>
              • <strong>Free Home Delivery:</strong> On all grocery orders totaling <strong>₹{settings.freeDeliveryThreshold || 499} and above</strong>.<br />
              • <strong>Standard Delivery Fee:</strong> For orders below ₹{settings.freeDeliveryThreshold || 499}, a modest convenience delivery fee of <strong>₹{settings.deliveryFee || 30}</strong> applies.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-forest">3. Delivery Windows & Timings</h3>
            <p>
              Orders placed before 6:00 PM are delivered same-day in your selected slot (Morning, Afternoon, or Evening). Orders placed later in the evening will be scheduled for the next morning slot between 8:00 AM – 11:00 AM.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-forest">4. Contacting Store Delivery Associate</h3>
            <p>
              Customers can track their order in real time via our Track My Order page or message the store directly on WhatsApp at <strong>+91 98113 40853</strong>.
            </p>
          </section>
        </div>
      )}

      {type === 'return' && (
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-card space-y-6 text-xs text-charcoal leading-relaxed">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-forest" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-charcoal">Return & Refund Policy</h1>
              <p className="text-charcoal-muted">Customer Peace of Mind Guarantee</p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-forest">1. At-Doorstep Inspection</h3>
            <p>
              We encourage you to inspect all packaged grocery items upon delivery. If any item is damaged, defective, or incorrect, you may hand it right back to our delivery associate with no questions asked.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-forest">2. Store Replacement Window</h3>
            <p>
              For packaged staples (Atta, Rice, Dal, Edible Oil, etc.), returns or exchanges are accepted within <strong>48 hours of delivery</strong> with the original receipt and packaging intact at our store desk at State Bank More, Madhubani.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-sm text-forest">3. Refunds</h3>
            <p>
              Online payments (UPI/Card) are refunded back to the original payment source within 24-48 business hours once the returned product is verified. Cash on Delivery orders are refunded in cash or instant UPI.
            </p>
          </section>
        </div>
      )}

      {type === 'faqs' && (
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-card space-y-6 text-xs text-charcoal leading-relaxed">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-forest" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-charcoal">Frequently Asked Questions (FAQs)</h1>
              <p className="text-charcoal-muted">Common queries regarding KD Supermarket</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-ivory-50 border border-gray-100 space-y-1">
              <h4 className="font-bold text-sm text-forest">Where is KD Supermarket physically located?</h4>
              <p className="text-charcoal-muted">
                Our supermarket is located at <strong>STATE BANK MORE, Watson High School, Tirhut Colony, Madhubani, Bihar 847211</strong>. We are open all 7 days from 7:30 AM to 9:30 PM.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-50 border border-gray-100 space-y-1">
              <h4 className="font-bold text-sm text-forest">Can I order groceries directly on WhatsApp?</h4>
              <p className="text-charcoal-muted">
                Yes! You can use the "Share Cart on WhatsApp" feature on our website or directly message your grocery list to <strong>+91 98113 40853</strong>. Our store desk will confirm the bill and arrange delivery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-50 border border-gray-100 space-y-1">
              <h4 className="font-bold text-sm text-forest">What are the delivery charges in Madhubani?</h4>
              <p className="text-charcoal-muted">
                Delivery is completely <strong>FREE on orders of ₹499 and above</strong>. For orders below ₹499, a flat delivery charge of ₹30 is applied.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-50 border border-gray-100 space-y-1">
              <h4 className="font-bold text-sm text-forest">What payment modes are accepted?</h4>
              <p className="text-charcoal-muted">
                We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, Net Banking, and Cash on Delivery (COD).
              </p>
            </div>
          </div>
        </div>
      )}

      {(type === 'privacy' || type === 'terms') && (
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-card space-y-6 text-xs text-charcoal leading-relaxed">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <FileText className="w-6 h-6 text-forest" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-charcoal">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
              </h1>
              <p className="text-charcoal-muted">KD SUPERMARKET • Madhubani</p>
            </div>
          </div>

          <p>
            KD SUPERMARKET values your privacy and customer trust. Customer contact numbers and addresses collected during online ordering are used strictly for order fulfillment, delivery coordination, and supermarket receipts in Madhubani, Bihar.
          </p>
          <p>
            We do not share your private contact information with unauthorized third parties. All online payments processed via verified payment gateway partners adhere to RBI and standard PCI security standards.
          </p>
        </div>
      )}
    </div>
  );
};
