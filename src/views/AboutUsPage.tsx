import React from 'react';
import { ShieldCheck, Heart, MapPin, Star, Award, Users, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AboutUsPage: React.FC = () => {
  const { setCurrentView, settings } = useStore();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
        <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-charcoal font-bold">About Us</span>
      </div>

      {/* Hero Intro */}
      <div className="relative rounded-3xl bg-forest text-white p-8 md:p-14 overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-warmYellow text-charcoal">
            SINCE OUR INCEPTION IN MADHUBANI
          </span>
          <h1 className="font-heading font-black text-3xl md:text-4xl leading-tight">
            Serving Madhubani with Quality, Freshness & Care
          </h1>
          <p className="text-xs md:text-sm text-ivory-100 leading-relaxed">
            Located right at <strong>State Bank More, Tirhut Colony</strong>, KD SUPERMARKET is Madhubani's dedicated local grocery store. We bridge the gap between traditional trusted Indian staples and modern, effortless digital shopping.
          </p>
        </div>
      </div>

      {/* Story & Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-charcoal">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
            <Award className="w-6 h-6 text-forest" />
          </div>
          <h3 className="font-heading font-bold text-base text-charcoal">Fair & Reasonable Rates</h3>
          <p className="text-charcoal-muted leading-relaxed">
            We believe everyday groceries shouldn't come with inflated markups. Our daily staples are priced fairly with transparent rates and verified manufacturer dates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-fresh/15 text-fresh flex items-center justify-center">
            <Heart className="w-6 h-6 text-fresh" />
          </div>
          <h3 className="font-heading font-bold text-base text-charcoal">Rooted in Madhubani</h3>
          <p className="text-charcoal-muted leading-relaxed">
            We understand the specific culinary traditions of Mithila — from aromatic Katarni chawal and pungent cold-pressed mustard oil to quality pooja camphor and everyday tea.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-warmYellow/25 text-forest flex items-center justify-center">
            <Users className="w-6 h-6 text-forest" />
          </div>
          <h3 className="font-heading font-bold text-base text-charcoal">Direct Customer Service</h3>
          <p className="text-charcoal-muted leading-relaxed">
            No robotic call centers. When you call or WhatsApp +91 98113 40853, you speak directly with our friendly store team ready to pack and dispatch your order.
          </p>
        </div>
      </div>

      {/* Google Rating Verification Box */}
      <div className="bg-ivory-100 rounded-3xl p-6 md:p-10 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1 text-warmYellow">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-warmYellow" />
            ))}
          </div>
          <h3 className="font-heading font-extrabold text-xl text-charcoal">
            Verified 4.8 / 5 Rating from 31 Local Reviews
          </h3>
          <p className="text-xs text-charcoal-muted max-w-xl">
            "Fresh groceries at reasonable rates, good discounts, and convenient shopping."
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('catalog')}
            className="px-6 py-3 bg-forest text-white rounded-xl text-xs font-bold shadow hover:bg-forest-dark transition-colors"
          >
            Shop Supermarket Now
          </button>
          <a
            href={settings.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 bg-white border border-gray-200 text-charcoal rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            Google Maps Location
          </a>
        </div>
      </div>
    </div>
  );
};
