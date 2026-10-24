import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  Mail, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactUsPage: React.FC = () => {
  const { settings, showToast, setCurrentView } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSubmitted(true);
    showToast('Your message has been sent to KD Supermarket desk!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
        <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-charcoal font-bold">Contact & Store Location</span>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-charcoal">
          Contact KD SUPERMARKET
        </h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Visit us at State Bank More, call our store desk, or chat instantly on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Store Details & Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-card space-y-6 text-xs text-charcoal">
            <h3 className="font-heading font-extrabold text-base text-charcoal border-b pb-3">
              Store Information & Timings
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest flex-shrink-0">
                  <MapPin className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <p className="font-bold text-sm text-charcoal">Store Address</p>
                  <p className="text-charcoal-muted leading-relaxed mt-0.5">
                    STATE BANK MORE, Watson High School, Tirhut Colony, Madhubani, Bihar 847211
                  </p>
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-forest hover:underline font-bold mt-1 text-[11px]"
                  >
                    Open in Google Maps Directions <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-fresh/15 flex items-center justify-center text-fresh flex-shrink-0">
                  <Phone className="w-5 h-5 text-fresh" />
                </div>
                <div>
                  <p className="font-bold text-sm text-charcoal">Direct Telephone & WhatsApp</p>
                  <a href="tel:+919811340853" className="text-forest font-bold hover:underline block mt-0.5">
                    +91 98113 40853
                  </a>
                  <p className="text-[11px] text-charcoal-muted">Available during store business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-warmYellow/25 flex items-center justify-center text-forest flex-shrink-0">
                  <Clock className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <p className="font-bold text-sm text-charcoal">Operating Hours</p>
                  <p className="text-charcoal-muted mt-0.5">
                    Open All 7 Days a Week: <strong>7:30 AM – 9:30 PM</strong>
                  </p>
                  <p className="text-[11px] text-fresh-dark font-medium">Same-Day Home Delivery across Madhubani</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20SUPERMARKET,%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white text-white" />
                <span>Chat Directly on WhatsApp (+91 98113 40853)</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Map iframe representation */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-card space-y-2">
            <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider">
              Google Maps Location (State Bank More)
            </h4>
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100 flex items-center justify-center text-center p-4">
              <iframe
                title="KD Supermarket Madhubani Map"
                src="https://maps.google.com/maps?q=State+Bank+More+Watson+High+School+Madhubani+Bihar+847211&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Customer Inquiry Form */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-card space-y-5 text-xs">
          <div>
            <h3 className="font-heading font-extrabold text-base text-charcoal">
              Send an Inquiry to Store Desk
            </h3>
            <p className="text-charcoal-muted mt-1">
              Have questions about wholesale bulks, product brands, or delivery slots? Send us a note.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-fresh/15 rounded-2xl border border-fresh/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-fresh mx-auto" />
              <h4 className="font-bold text-sm text-forest">Thank you for contacting us!</h4>
              <p className="text-charcoal-muted">
                Our store staff will call or reply to you on <strong>{phone}</strong> shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setPhone('');
                  setMessage('');
                }}
                className="px-4 py-2 bg-forest text-white rounded-xl font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-charcoal mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Jha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl focus:outline-none focus:border-forest"
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
                  className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Your Message or Item Request *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ask about brand availability, delivery to your colony, or wholesale orders..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-ivory-50 border border-gray-200 rounded-xl focus:outline-none focus:border-forest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to Store</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
