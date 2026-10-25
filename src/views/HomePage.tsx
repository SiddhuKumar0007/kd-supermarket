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
  Image as ImageIcon
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [showVideo, setShowVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80",
      badge: "🌿 100% Farm Fresh & Daily Quality",
      title: "Fresh Groceries at Fair Store Rates",
      subtitle: "Atta, pulses, edible oils, spices & fresh pantry items",
      tag: "Fresh Produce & Staples",
      promo: "Free Delivery Above ₹499"
    },
    {
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
      badge: "🌾 Regional Madhubani Special",
      title: "Aromatic Katarni Chawal & Chakki Atta",
      subtitle: "Directly sourced whole grains & Kachi Ghani mustard oil",
      tag: "Regional Mithila Staples",
      promo: "Special Store Discounts"
    },
    {
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80",
      badge: "🛒 Comprehensive Supermarket Aisle",
      title: "Snacks, Dairy, Beverages & Cleaning",
      subtitle: "Amul dairy, Britannia biscuits, Maggi & Surf Excel",
      tag: "Top Branded Packaged Foods",
      promo: "WhatsApp Ordering Available"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

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
      {/* 1. Hero Banner */}
      <section className="relative bg-gradient-to-br from-forest-dark via-forest to-[#074D32] text-white overflow-hidden py-6 sm:py-14 md:py-20 shadow-md w-full max-w-full">
        {/* Ambient radial glows */}
        <div className="absolute top-0 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-warmYellow/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 md:w-80 h-60 md:h-80 bg-fresh/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] sm:text-xs font-bold text-warmYellow border border-white/20 shadow-xs">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-warmYellow" />
                <span>Madhubani's Premier Supermarket • State Bank More</span>
              </div>

              <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-snug sm:leading-tight text-white drop-shadow-sm">
                Your Everyday Essentials, <br className="hidden sm:inline" />
                <span className="text-warmYellow drop-shadow">Delivered with Ease!</span>
              </h1>

              <p className="text-xs sm:text-sm text-ivory-100 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Shop fresh farm produce, stoneground atta, golden mustard oils, wholesome dals, tea, snacks, and household staples from <strong>KD SUPERMARKET</strong> with fast home delivery in Madhubani.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1">
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="px-5 py-2.5 sm:px-7 sm:py-3.5 bg-warmYellow hover:bg-warmYellow-dark text-charcoal font-black rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 group active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setShowVideo(true);
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                        setIsPlaying(true);
                      }
                    }, 50);
                  }}
                  className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/25 flex items-center gap-1.5 backdrop-blur-md active:scale-95 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-warmYellow fill-warmYellow" />
                  <span>Watch Store Tour</span>
                </button>

                <button
                  onClick={() => setCurrentView('offers')}
                  className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors border border-white/20 flex items-center gap-1.5 backdrop-blur-xs"
                >
                  <BadgePercent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warmYellow" />
                  <span>Offers</span>
                </button>

                <a
                  href={`https://wa.me/${settings.whatsappRaw || '919811340853'}?text=Hello%20KD%20SUPERMARKET,%20I%20would%20like%20to%20order%20groceries.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Scene / Slide Category Pills */}
              <div className="pt-1 flex items-center justify-center lg:justify-start gap-1.5 text-xs overflow-x-auto no-scrollbar max-w-full pb-1 px-1">
                <span className="text-ivory-100/70 text-[10px] sm:text-[11px] font-semibold mr-1 flex-shrink-0">Featured:</span>
                {heroSlides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold text-[10px] sm:text-xs transition-all flex-shrink-0 whitespace-nowrap ${
                      activeSlide === idx
                        ? 'bg-white text-forest shadow-xs'
                        : 'bg-white/10 text-white/90 hover:bg-white/20'
                    }`}
                  >
                    {slide.tag}
                  </button>
                ))}
              </div>

              {/* Verified Store Metrics */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-[11px] sm:text-xs text-ivory-100 border-t border-white/15">
                <div className="flex items-center gap-1 font-semibold">
                  <Star className="w-3.5 h-3.5 text-warmYellow fill-warmYellow" />
                  <span className="font-bold text-white">4.8 / 5</span>
                  <span className="text-white/80">(31 Reviews)</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-warmYellow" />
                  <span>Madhubani 847211</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-warmYellow" />
                  <span>7:30 AM – 9:30 PM</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card with Live Video / Front Image & Floating Badges */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* Floating Top Badge */}
                <div className="absolute top-2 right-2 sm:-top-3.5 sm:right-4 z-30 bg-white/95 backdrop-blur-md text-charcoal px-2.5 py-1 rounded-full shadow-md border border-gray-100 flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-fresh animate-ping" />
                  <span className="text-forest">⚡ Express 2-Hour Delivery</span>
                </div>

                {/* Mode Switcher: Video vs Photos */}
                <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20">
                  <button
                    onClick={() => {
                      setShowVideo(true);
                      setTimeout(() => {
                        if (videoRef.current) {
                          videoRef.current.play().catch(() => {});
                          setIsPlaying(true);
                        }
                      }, 50);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                      showVideo ? 'bg-warmYellow text-charcoal shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <Video className="w-3 h-3" />
                    <span>Store Video</span>
                  </button>
                  <button
                    onClick={() => setShowVideo(false)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                      !showVideo ? 'bg-white text-forest shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Photos</span>
                  </button>
                </div>

                {/* Main Media Card */}
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/25 bg-black group aspect-[4/5] sm:aspect-[9/12] max-h-[440px] flex items-center justify-center">
                  {showVideo ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <video
                        ref={videoRef}
                        src="/videos/kd-store-intro.mp4"
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="w-full h-full object-cover"
                      />

                      {/* Video Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                      {/* Video Controls Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-white">
                        <div className="min-w-0 flex-1 mr-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-warmYellow text-charcoal uppercase tracking-wider mb-0.5">
                            KD SUPERMARKET • Madhubani
                          </span>
                          <p className="text-xs font-bold text-white drop-shadow truncate">
                            State Bank More • Tirhut Colony
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={togglePlay}
                            className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                            title={isPlaying ? "Pause Video" : "Play Video"}
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                            title={isMuted ? "Unmute Sound" : "Mute Sound"}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-warmYellow" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Image Slide Display */
                    <div className="relative w-full h-full">
                      <img
                        key={heroSlides[activeSlide].image}
                        src={heroSlides[activeSlide].image}
                        alt={heroSlides[activeSlide].title}
                        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Subtle Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-warmYellow text-charcoal uppercase tracking-wider mb-1 w-fit">
                          {heroSlides[activeSlide].badge}
                        </span>
                        <h3 className="font-heading font-black text-base sm:text-xl text-white drop-shadow">
                          {heroSlides[activeSlide].title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-ivory-100 mt-0.5 max-w-sm drop-shadow line-clamp-1 sm:line-clamp-none">
                          {heroSlides[activeSlide].subtitle}
                        </p>

                        {/* Slide Dots */}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                          {heroSlides.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveSlide(i)}
                              className={`h-1.5 rounded-full transition-all ${
                                activeSlide === i ? 'w-6 sm:w-8 bg-warmYellow' : 'w-2 bg-white/40 hover:bg-white/70'
                              }`}
                              aria-label={`Go to slide ${i + 1}`}
                            />
                          ))}
                          <span className="text-[9px] sm:text-[10px] text-white/70 ml-auto font-medium">
                            {heroSlides[activeSlide].promo}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Badges on Tablet/Desktop */}
                <div className="hidden sm:flex absolute -bottom-4 -left-2 z-20 bg-white text-charcoal p-2.5 rounded-xl shadow-md border border-gray-100 items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-forest text-white flex items-center justify-center font-black text-xs shadow">
                    4.8★
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-charcoal flex items-center gap-1 text-[11px]">
                      <span>Verified Supermarket</span>
                      <ShieldCheck className="w-3 h-3 text-fresh" />
                    </p>
                    <p className="text-[9px] text-charcoal-muted">Google Customer Reviews</p>
                  </div>
                </div>

                <div className="hidden sm:flex absolute -bottom-4 -right-2 z-20 bg-warmYellow text-charcoal px-3 py-1.5 rounded-xl shadow-md border border-amber-300 items-center gap-1.5 text-xs font-black">
                  <BadgePercent className="w-3.5 h-3.5 text-charcoal" />
                  <span>Code: KD50 (₹50 Off)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <p className="text-base sm:text-xl font-black text-white">Orders Above ₹499</p>
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
