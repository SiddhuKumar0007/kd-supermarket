import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  Percent, 
  MapPin, 
  Star, 
  Truck, 
  ShieldCheck, 
  HeartHandshake, 
  BadgePercent,
  Clock,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../services/api';
import { Product, Category } from '../types';

export const HomePage: React.FC = () => {
  const { setCurrentView, setSelectedCategory, settings, selectedLocation } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hero Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
      badge: "🌿 100% FARM FRESH & DAILY SPECIALS",
      title: "Fresh Groceries at Fair Store Rates",
      highlight: "Save up to 20% on Atta, Rice & Dals",
      subtitle: "Aashirvaad Atta, Fortune Mustard Oil, Tata Salt, Pulses & Spices delivered fast to your doorstep in Madhubani.",
      tag: "Fresh Groceries",
      promo: "Free Delivery Above ₹999",
      coupon: "Code: KD10 (10% OFF)",
      ctaText: "Shop Groceries",
      ctaCategory: "Rice, Atta & Grains",
      themeGradient: "from-black/90 via-[#044E32]/85 to-black/40"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1600&q=80",
      badge: "🌾 REGIONAL MADHUBANI SPECIAL",
      title: "Aromatic Katarni Chawal & Chakki Fresh Atta",
      highlight: "Direct Mill-Fresh Authentic Grains",
      subtitle: "Authentic Mithila fragrant Katarni chawal, cold-pressed Kachi Ghani mustard oil & premium dry-fruits.",
      tag: "Regional Staples",
      promo: "⚡ Express 2-Hour Delivery",
      coupon: "Code: KD50 (₹50 OFF)",
      ctaText: "Order Mithila Staples",
      ctaCategory: "Rice, Atta & Grains",
      themeGradient: "from-black/90 via-[#78350F]/85 to-black/40"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80",
      badge: "🛒 COMPREHENSIVE SUPERMARKET AISLE",
      title: "Snacks, Dairy, Beverages & Cleaning",
      highlight: "Amul, Britannia, Maggi & Surf Excel",
      subtitle: "All your favourite brands under one roof at genuine local supermarket prices. 100% Cash On Delivery.",
      tag: "Supermarket Aisles",
      promo: "💵 Cash on Delivery (COD)",
      coupon: "Store Rates Guaranteed",
      ctaText: "Explore Supermarket",
      ctaCategory: "Chips, Namkeen & Snacks",
      themeGradient: "from-black/90 via-[#07504C]/85 to-black/40"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1600&q=80",
      badge: "🎁 SPECIAL DISCOUNT OFFERS",
      title: "Big Savings on Monthly Rations & Kitchen Combos",
      highlight: "Flat ₹50 OFF On Orders Above ₹500",
      subtitle: "Special bundles on cooking oils, spices, tea & household cleaners. Order online or on WhatsApp!",
      tag: "Discount Offers",
      promo: "Free Delivery Above ₹999",
      coupon: "Coupon: KD50",
      ctaText: "View Special Offers",
      ctaView: "offers",
      themeGradient: "from-black/90 via-[#881337]/85 to-black/40"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1600&q=80",
      badge: "⚡ QUICK WHATSAPP ORDERING",
      title: "Send Your Grocery List Directly on WhatsApp",
      highlight: "Photo or Handwritten List Accepted",
      subtitle: "No app typing required! Just WhatsApp your list to +91 98113 40853. We pack, verify and deliver instantly.",
      tag: "WhatsApp Order",
      promo: "State Bank More, Madhubani",
      coupon: "Fastest Home Dispatch",
      ctaText: "Order on WhatsApp",
      ctaAction: "whatsapp",
      themeGradient: "from-black/90 via-[#0A6847]/85 to-black/40"
    }
  ];

  // Auto slide timer: moves every 3.5 seconds
  useEffect(() => {
    if (isPaused || isVideoModalOpen) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, isVideoModalOpen, heroSlides.length]);

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % heroSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 40) {
        nextSlide();
      } else if (diff < -40) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const bestSellers = products.filter(p => p.tags?.includes('bestseller')).slice(0, 8);
  const dailyEssentials = products.filter(p => p.tags?.includes('daily-essentials')).slice(0, 8);
  const popularMadhubani = products.filter(p => p.tags?.includes('popular-madhubani')).slice(0, 8);
  const specialOffers = products.filter(p => p.tags?.includes('special-offers') || p.discount >= 15).slice(0, 8);
  const latestArrivals = products.slice(0, 8);

  const trustHighlights = [
    {
      title: "Quality Everyday Essentials",
      desc: "Top branded & locally verified staples",
      icon: ShieldCheck,
    },
    {
      title: "Reasonable Prices",
      desc: "Fair local pricing with genuine savings",
      icon: BadgePercent,
    },
    {
      title: "Exciting Store Offers",
      desc: "Regular discounts on household bundles",
      icon: Percent,
    },
    {
      title: "Easy Online Ordering",
      desc: "Smooth checkout & live order tracking",
      icon: Truck,
    },
    {
      title: "Convenient Local Shopping",
      desc: "State Bank More store with WhatsApp chat",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-12 md:space-y-16 pb-8 sm:pb-12 w-full max-w-full overflow-hidden">
      {/* Store Paused Notice if Admin has toggled OFF */}
      {settings.acceptingOrders === false && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0" />
          <span>Notice: Store is temporarily not accepting new online orders. Orders will resume shortly!</span>
        </div>
      )}

      {/* 1. Dynamic Moving Banner Carousel */}
      <section 
        className="relative w-full max-w-full overflow-hidden shadow-lg bg-forest-dark group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all shadow-lg active:scale-90 opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Previous Banner Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all shadow-lg active:scale-90 opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Next Banner Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Sliding Track */}
        <div 
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {heroSlides.map((slide, idx) => (
            <div 
              key={slide.id} 
              className="w-full flex-shrink-0 relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center text-white overflow-hidden"
            >
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                loading={idx === 0 ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-transform duration-1000 ease-out"
              />

              {/* Dark Gradient Overlay for Maximum Readability */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.themeGradient} backdrop-brightness-90`} />
              
              {/* Radial ambient glow */}
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-warmYellow/15 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-3 sm:space-y-4 text-center lg:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-xs font-bold text-warmYellow border border-white/25 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-warmYellow animate-spin-slow" />
                      <span>{slide.badge}</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-snug sm:leading-tight text-white drop-shadow-md">
                      {slide.title}
                    </h1>

                    {/* Highlight Offer Line */}
                    <p className="text-xs sm:text-base font-extrabold text-warmYellow drop-shadow flex items-center justify-center lg:justify-start gap-1.5">
                      <BadgePercent className="w-4 h-4 text-warmYellow flex-shrink-0" />
                      <span>{slide.highlight}</span>
                    </p>

                    {/* Subtitle Description */}
                    <p className="text-xs sm:text-sm text-ivory-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>

                    {/* Action CTA Buttons */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (slide.ctaAction === 'whatsapp') {
                            window.open(`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20SUPERMARKET,%20I%20would%20like%20to%20order%20groceries.`, '_blank');
                          } else if (slide.ctaView) {
                            setCurrentView(slide.ctaView as any);
                          } else if (slide.ctaCategory) {
                            setSelectedCategory(slide.ctaCategory);
                            setCurrentView('catalog');
                          } else {
                            setCurrentView('catalog');
                          }
                        }}
                        className="px-5 py-2.5 sm:px-7 sm:py-3.5 bg-warmYellow hover:bg-warmYellow-dark text-charcoal font-black rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 group active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4 text-charcoal" />
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <a
                        href={`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20SUPERMARKET,%20I%20would%20like%20to%20order%20groceries.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>WhatsApp Order</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setIsVideoModalOpen(true);
                          setTimeout(() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = 0;
                              videoRef.current.play().catch(() => {});
                            }
                          }, 100);
                        }}
                        className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/25 flex items-center gap-1.5 backdrop-blur-md active:scale-95 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 text-warmYellow fill-warmYellow" />
                        <span>Watch Store Tour</span>
                      </button>
                    </div>

                    {/* Bottom Store Verification Metrics */}
                    <div className="pt-3 hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-ivory-100/90 border-t border-white/15">
                      <div className="flex items-center gap-1 font-semibold">
                        <Star className="w-3.5 h-3.5 text-warmYellow fill-warmYellow" />
                        <span className="font-bold text-white">4.8 / 5</span>
                        <span className="text-white/70">(Google Reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-warmYellow" />
                        <span>State Bank More, Madhubani</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-warmYellow" />
                        <span>7:30 AM – 9:30 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Visual Promo Card */}
                  <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center">
                    <div className="w-full max-w-xs bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 shadow-2xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-warmYellow text-charcoal flex items-center justify-center mx-auto shadow-md">
                        <BadgePercent className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-forest uppercase tracking-wider mb-1">
                          {slide.coupon}
                        </span>
                        <h4 className="text-base font-extrabold text-white">{slide.promo}</h4>
                        <p className="text-[11px] text-ivory-200 mt-1">Cash on Delivery & Instant Dispatch in Madhubani Town</p>
                      </div>
                      <div className="pt-2 border-t border-white/20 flex items-center justify-center gap-2 text-xs font-bold text-warmYellow">
                        <Truck className="w-4 h-4" />
                        <span>Doorstep Delivery Guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Bottom Control Strip */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none">
          {/* Quick jump slide pills */}
          <div className="hidden sm:flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition-all whitespace-nowrap ${
                  activeSlide === idx
                    ? 'bg-warmYellow text-charcoal shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {slide.tag}
              </button>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === i 
                    ? 'w-7 sm:w-9 bg-warmYellow shadow-sm' 
                    : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Moving Announcement Ticker / Continuous Marquee */}
      <div className="bg-forest-dark border-y border-forest-light/30 py-2.5 overflow-hidden text-white shadow-inner -mt-6 sm:-mt-12 md:-mt-16 relative z-10">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-[11px] sm:text-xs font-bold tracking-wide">
          {/* Loop Set 1 */}
          <span className="flex items-center gap-1.5 text-warmYellow"><Truck className="w-3.5 h-3.5" /> FREE Delivery on Orders Above ₹999</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-fresh-light" /> 100% Farm Fresh Produce & Staples</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5 text-warmYellow"><Clock className="w-3.5 h-3.5" /> ⚡ Express 2-Hour Delivery in Madhubani</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><BadgePercent className="w-3.5 h-3.5 text-warmYellow" /> Code: KD10 (10% OFF) & KD50 (₹50 OFF)</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-fresh-light" /> 100% Cash On Delivery (COD) Verified</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5 text-[#25D366]"><MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" /> WhatsApp Order: +91 98113 40853</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-warmYellow" /> State Bank More, Madhubani (847211)</span>
          <span className="text-white/40">•</span>

          {/* Loop Set 2 (for seamless loop) */}
          <span className="flex items-center gap-1.5 text-warmYellow"><Truck className="w-3.5 h-3.5" /> FREE Delivery on Orders Above ₹999</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-fresh-light" /> 100% Farm Fresh Produce & Staples</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5 text-warmYellow"><Clock className="w-3.5 h-3.5" /> ⚡ Express 2-Hour Delivery in Madhubani</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><BadgePercent className="w-3.5 h-3.5 text-warmYellow" /> Code: KD10 (10% OFF) & KD50 (₹50 OFF)</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-fresh-light" /> 100% Cash On Delivery (COD) Verified</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5 text-[#25D366]"><MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" /> WhatsApp Order: +91 98113 40853</span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-warmYellow" /> State Bank More, Madhubani (847211)</span>
          <span className="text-white/40">•</span>
        </div>
      </div>

      {/* Store Tour Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative bg-black rounded-2xl overflow-hidden max-w-3xl w-full border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-3 bg-forest text-white">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-warmYellow" />
                <span className="font-bold text-xs sm:text-sm">KD SUPERMARKET • Madhubani Store Tour</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVideoModalOpen(false);
                  if (videoRef.current) videoRef.current.pause();
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src="/videos/kd-store-intro.mp4"
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Trust Highlights */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {trustHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-card flex flex-col items-center text-center space-y-1.5 sm:space-y-2 hover:border-forest/20 transition-all hover:scale-[1.02]"
              >
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-ivory-100 text-forest flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-forest" />
                </div>
                <h4 className="font-bold text-[11px] sm:text-xs text-charcoal">{item.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-charcoal-muted leading-tight">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Shop by Category (All 20 Categories) */}
      <section className="max-w-7xl mx-auto px-4 space-y-3 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-1 sm:gap-2 border-b border-gray-200 pb-2 sm:pb-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-forest uppercase tracking-wider">
              Browse Supermarket Aisle
            </span>
            <h2 className="font-heading font-extrabold text-lg sm:text-2xl md:text-3xl text-charcoal">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('catalog')}
            className="text-[11px] sm:text-xs font-bold text-forest hover:text-forest-dark flex items-center gap-1 group self-start md:self-auto"
          >
            <span>View All 20 Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Grid - 3 cols on mobile, 4 on sm, 5 on lg */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setCurrentView('catalog');
              }}
              className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-2 sm:p-3 hover:border-forest/30 shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer flex flex-col items-center text-center overflow-hidden"
            >
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2.5 bg-ivory-50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e: any) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"; }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-[11px] sm:text-xs text-charcoal group-hover:text-forest transition-colors line-clamp-1 leading-snug">
                {cat.name}
              </h3>
              <p className="text-[9px] sm:text-[10px] text-charcoal-muted mt-0.5">
                {cat.itemCount} items
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 space-y-3 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 sm:pb-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-forest uppercase tracking-wider">
              Customer Favorites
            </span>
            <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-charcoal">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('catalog')}
            className="text-[11px] sm:text-xs font-bold text-forest hover:underline"
          >
            See All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3.5">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 5. Special Promotional Offers Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-forest to-[#1A6340] text-white p-4 sm:p-6 md:p-10 shadow-hover overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
            <div className="md:col-span-8 space-y-2 sm:space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-warmYellow text-charcoal text-[10px] sm:text-xs font-black uppercase tracking-wider">
                SUPERMARKET DEALS
              </span>
              <h3 className="font-heading font-black text-lg sm:text-2xl md:text-3xl text-white leading-snug">
                Save Big on Monthly Rations & Kitchen Staples
              </h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-ivory-100 max-w-xl leading-relaxed">
                Genuine discounts on Aashirvaad Atta, Fortune Mustard Oil, Tata Salt & pulses. Place orders online or send your shopping list directly over WhatsApp!
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button
                  onClick={() => setCurrentView('offers')}
                  className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-warmYellow hover:bg-warmYellow-dark text-charcoal font-bold rounded-xl text-[11px] sm:text-xs transition-colors shadow"
                >
                  View Special Offers
                </button>
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-[11px] sm:text-xs transition-colors border border-white/20"
                >
                  Explore All Products
                </button>
              </div>
            </div>
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 text-center w-full max-w-xs space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-[11px] text-warmYellow font-bold uppercase">Free Home Delivery</p>
                <p className="text-base sm:text-xl font-black text-white">Orders Above ₹999</p>
                <p className="text-[9px] sm:text-[10px] text-ivory-200">Across Madhubani Town (PIN 847211)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Popular in Madhubani */}
      <section className="max-w-7xl mx-auto px-4 space-y-3 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 sm:pb-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-forest uppercase tracking-wider">
              Local Demand
            </span>
            <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-charcoal">
              Popular in Madhubani
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('catalog')}
            className="text-[11px] sm:text-xs font-bold text-forest hover:underline"
          >
            See All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3.5">
          {popularMadhubani.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 7. Daily Essentials & Special Offers */}
      <section className="max-w-7xl mx-auto px-4 space-y-3 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 sm:pb-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-forest uppercase tracking-wider">
              Everyday Pantry
            </span>
            <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-charcoal">
              Daily Essentials
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('catalog')}
            className="text-[11px] sm:text-xs font-bold text-forest hover:underline"
          >
            See All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3.5">
          {dailyEssentials.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 8. Why Shop With Us? */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-ivory-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-12 border border-gray-200 space-y-5 sm:space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-forest uppercase tracking-wider">
              Neighbourhood Convenience
            </span>
            <h2 className="font-heading font-black text-lg sm:text-2xl md:text-3xl text-charcoal">
              Why Choose KD SUPERMARKET?
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-charcoal-muted leading-relaxed">
              We bring modern e-commerce convenience together with the warmth and personal trust of your local grocery store.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-card border border-gray-100 space-y-1.5 sm:space-y-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-forest" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-charcoal">Browse Online & Check Prices</h3>
              <p className="text-[11px] sm:text-xs text-charcoal-muted leading-relaxed">
                Check transparent prices and stock availability from home anytime before stepping out or placing an order.
              </p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-card border border-gray-100 space-y-1.5 sm:space-y-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-fresh/10 flex items-center justify-center text-fresh">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-fresh fill-fresh/20" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-charcoal">Order via WhatsApp or Online</h3>
              <p className="text-[11px] sm:text-xs text-charcoal-muted leading-relaxed">
                Seamless online checkout with UPI, Card, or Cash on Delivery, plus 1-click cart sharing to store WhatsApp (+91 98113 40853).
              </p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-card border border-gray-100 space-y-1.5 sm:space-y-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-warmYellow/20 flex items-center justify-center text-charcoal">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-forest" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-charcoal">Track Your Order Live</h3>
              <p className="text-[11px] sm:text-xs text-charcoal-muted leading-relaxed">
                Follow your order from packed, dispatch to out-for-delivery with clear database status updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Verified Customer Reviews & Google Rating */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 border border-gray-200 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-5 space-y-2 sm:space-y-3 text-center lg:text-left">
              <span className="text-[10px] sm:text-xs font-bold text-forest uppercase tracking-wider">
                Store Reputation
              </span>
              <h2 className="font-heading font-extrabold text-lg sm:text-2xl md:text-3xl text-charcoal">
                Customer Feedback
              </h2>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <div className="text-2xl sm:text-3xl font-black text-forest">4.8</div>
                <div>
                  <div className="flex items-center text-warmYellow">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-warmYellow" />
                    ))}
                  </div>
                  <p className="text-[11px] sm:text-xs text-charcoal-muted">Google verified rating • 31 reviews</p>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-charcoal-muted leading-relaxed">
                Real feedback from Madhubani residents visiting our store at State Bank More, Tirhut Colony.
              </p>
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ivory-100 hover:bg-ivory-200 border border-gray-200 rounded-xl text-[11px] sm:text-xs font-bold text-charcoal transition-colors"
              >
                <span>Read Verified Google Reviews</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Customer Testimonial Quotes as supplied in the prompt */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-ivory-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-1 text-warmYellow">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warmYellow" />
                  ))}
                </div>
                <p className="text-xs text-charcoal font-medium leading-relaxed italic">
                  "Fresh groceries at reasonable rates, good discounts, and convenient shopping in Madhubani."
                </p>
                <p className="text-[11px] font-bold text-forest">— Verified Local Customer</p>
              </div>

              <div className="p-4 rounded-2xl bg-ivory-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-1 text-warmYellow">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warmYellow" />
                  ))}
                </div>
                <p className="text-xs text-charcoal font-medium leading-relaxed italic">
                  "Great variety of grocery staples, courteous staff, and very convenient home delivery service."
                </p>
                <p className="text-[11px] font-bold text-forest">— Madhubani Resident</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Store Location & Directions Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-forest rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-warmYellow text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Visit In-Store</span>
            </div>
            <h3 className="font-heading font-black text-xl md:text-2xl">
              KD SUPERMARKET, STATE BANK MORE
            </h3>
            <p className="text-xs text-ivory-100 max-w-xl">
              Watson High School, Tirhut Colony, Madhubani, Bihar 847211. Open daily 7:30 AM – 9:30 PM.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-warmYellow hover:bg-warmYellow-dark text-charcoal font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow"
            >
              <MapPin className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
            <a
              href="tel:+919811340853"
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs transition-colors border border-white/20"
            >
              Call Store: +91 98113 40853
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
