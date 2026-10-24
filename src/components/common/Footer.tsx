import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  MessageCircle,
  ExternalLink,
  Heart
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedCategory, settings, user } = useStore();

  const categoriesColumn1 = [
    'Rice, Atta & Grains',
    'Dal & Pulses',
    'Cooking Oil & Ghee',
    'Spices & Masalas',
    'Salt, Sugar & Sweeteners',
    'Biscuits & Cookies',
    'Chips, Namkeen & Snacks',
  ];

  const categoriesColumn2 = [
    'Chocolates & Candies',
    'Tea, Coffee & Drinks',
    'Dairy & Packaged Foods',
    'Breakfast & Cereals',
    'Instant Noodles & Pasta',
    'Packaged Water & Juices',
    'Personal Care',
  ];

  const categoriesColumn3 = [
    'Soaps, Shampoo & Hygiene',
    'Home Cleaning Products',
    'Detergents & Dishwashing',
    'Kitchen & Household Essentials',
    'Baby Care Essentials',
    'Other General Store Products'
  ];

  return (
    <footer className="bg-[#05261B] text-[#D3E8DF] pt-14 pb-20 md:pb-12 border-t border-forest-dark/40">
      {/* Supermarket Trust Highlights Band */}
      <div className="max-w-7xl mx-auto px-4 pb-12 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forest/40 border border-fresh/30 flex items-center justify-center text-warmYellow">
              <Truck className="w-6 h-6 text-warmYellow" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Local Madhubani Delivery</h4>
              <p className="text-xs text-gray-400">Doorstep delivery within town hours</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forest/40 border border-fresh/30 flex items-center justify-center text-warmYellow">
              <ShieldCheck className="w-6 h-6 text-warmYellow" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Brands</h4>
              <p className="text-xs text-gray-400">Directly sourced trusted packaged items</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forest/40 border border-fresh/30 flex items-center justify-center text-warmYellow">
              <RotateCcw className="w-6 h-6 text-warmYellow" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Easy Store Exchange</h4>
              <p className="text-xs text-gray-400">Hassle-free local store return policy</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forest/40 border border-fresh/30 flex items-center justify-center text-warmYellow">
              <MessageCircle className="w-6 h-6 text-warmYellow" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">WhatsApp Assistance</h4>
              <p className="text-xs text-gray-400">Instant direct help on +91 98113 40853</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Store Bio & Google Rating */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center shadow-md text-white font-bold">
                <svg className="w-6 h-6 text-white" viewBox="0 0 48 48" fill="none">
                  <path d="M10 20h28l-3.5 20h-21z" fill="#FFC857" />
                  <path d="M18 20v-5a6 6 0 0 1 12 0v5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                KD <span className="text-warmYellow">SUPERMARKET</span>
              </span>
            </div>

            <p className="text-xs leading-relaxed text-gray-300">
              Madhubani's trusted neighbourhood supermarket for fresh grains, flours, edible oils, dals, spices, snacks, beverages, dairy, and household essentials. Experience fair local rates and dependable service right at State Bank More.
            </p>

            {/* Google Rating Verified Card */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 max-w-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Google Customer Rating</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-fresh/30 text-fresh-light">Verified</span>
                </div>
                <div className="flex items-center gap-1 text-warmYellow font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-warmYellow" />
                  <span>4.8 / 5</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Based on <strong>31 verified customer reviews</strong>: <em>"Fresh groceries at reasonable rates, good discounts, and convenient shopping."</em>
              </p>
              <a
                href="https://maps.google.com/?q=STATE+BANK+MORE+Watson+High+School+Tirhut+Colony+Madhubani+Bihar+847211"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-warmYellow hover:underline font-semibold mt-2"
              >
                View on Google Maps & Reviews <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-warmYellow flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  STATE BANK MORE, Watson High School, Tirhut Colony, Madhubani, Bihar 847211
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-warmYellow flex-shrink-0" />
                <a href="tel:+919811340853" className="text-white font-semibold hover:underline">
                  +91 98113 40853
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warmYellow flex-shrink-0" />
                <span className="text-gray-300">Timings: 7:30 AM – 9:30 PM (All 7 Days)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-white/10 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-warmYellow transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('catalog')} className="hover:text-warmYellow transition-colors">
                  All Supermarket Products
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('offers')} className="hover:text-warmYellow transition-colors">
                  Special Offers & Deals
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('track-order')} className="hover:text-warmYellow transition-colors">
                  Track My Order
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-warmYellow transition-colors">
                  About KD Supermarket
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-warmYellow transition-colors">
                  Contact & Store Location
                </button>
              </li>
              {user && (user.role === 'admin' || user.email?.toLowerCase() === 'siddhukumar2006@gmail.com') && (
                <li>
                  <button onClick={() => setCurrentView('admin')} className="text-fresh-light hover:underline font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Store Admin Dashboard
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3 & 4: Top Categories */}
          <div className="space-y-3 lg:col-span-1">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-white/10 pb-2">
              Grocery Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categoriesColumn1.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentView('catalog');
                    }}
                    className="hover:text-warmYellow transition-colors text-left truncate block max-w-full"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Store Policies & Help */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-white/10 pb-2">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentView('shipping-policy')} className="hover:text-warmYellow transition-colors">
                  Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('return-policy')} className="hover:text-warmYellow transition-colors">
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('faqs')} className="hover:text-warmYellow transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('privacy-policy')} className="hover:text-warmYellow transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('terms')} className="hover:text-warmYellow transition-colors">
                  Terms & Conditions
                </button>
              </li>
            </ul>

            <div className="pt-3">
              <a
                href={`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20SUPERMARKET,%20I%20need%20help%20with%20an%20order.`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-fresh text-white rounded-lg text-xs font-bold hover:bg-fresh-dark transition-colors shadow"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/10 text-xs text-gray-400 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <p>
          © {new Date().getFullYear()} KD SUPERMARKET, Madhubani. All rights reserved. Locally serving State Bank More & Tirhut Colony.
        </p>
        <p className="flex items-center gap-1 justify-center">
          <span>Fresh Groceries & Everyday Essentials for Madhubani</span>
        </p>
      </div>
    </footer>
  );
};
