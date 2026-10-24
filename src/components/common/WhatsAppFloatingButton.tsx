import React, { useState } from 'react';
import { MessageCircle, X, ShoppingBag, MapPin, Send } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings, cartCount, shareCartOnWhatsApp, selectedLocation } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const rawPhone = settings.whatsappRaw || '919811340853';

  const quickMessages = [
    { title: "Check Home Delivery", text: `Hello KD Supermarket, do you deliver to ${selectedLocation}?` },
    { title: "Ask Product Availability", text: "Hello KD Supermarket, is fresh flour / mustard oil currently in stock?" },
    { title: "Daily Store Timings", text: "Hello KD Supermarket, what are today's store timings at State Bank More?" }
  ];

  const handleSend = (text: string) => {
    const url = `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
      {/* Floating Popup Window */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-hover border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-forest text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-fresh flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="font-bold text-xs">KD SUPERMARKET</p>
                <p className="text-[10px] text-ivory-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-warmYellow animate-ping"></span>
                  Online • Madhubani Store
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg"
              aria-label="Close WhatsApp options"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-3 bg-ivory-50 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-charcoal">
              <p className="text-[11px] text-charcoal-muted leading-relaxed">
                Namaste! Welcome to KD Supermarket. How can our store team help you today in Madhubani?
              </p>
            </div>

            {/* Share Cart on WhatsApp Quick Option */}
            {cartCount > 0 && (
              <button
                onClick={() => {
                  shareCartOnWhatsApp();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 bg-fresh/15 border border-fresh/30 text-fresh-dark rounded-xl font-bold hover:bg-fresh/25 transition-all text-xs"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-fresh" />
                  <span>Share My Cart ({cartCount} items)</span>
                </span>
                <span className="text-[10px] bg-fresh text-white px-1.5 py-0.5 rounded">Send</span>
              </button>
            )}

            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider">Quick questions:</p>
              {quickMessages.map((qm, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qm.text)}
                  className="w-full text-left p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-100 text-[11px] text-charcoal font-medium transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{qm.title}</span>
                  <Send className="w-3 h-3 text-fresh flex-shrink-0" />
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSend("Hello KD Supermarket, I would like to place an order.")}
              className="w-full py-2 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              Open Direct WhatsApp Chat
            </button>
          </div>
        </div>
      )}

      {/* Main WhatsApp Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 md:px-4 md:py-3 rounded-full shadow-hover hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Contact KD Supermarket on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white text-white" />
        <span className="hidden md:inline font-bold text-xs tracking-wide">
          {isOpen ? 'Close' : 'Chat on WhatsApp'}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warmYellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-warmYellow"></span>
          </span>
        )}
      </button>
    </div>
  );
};
