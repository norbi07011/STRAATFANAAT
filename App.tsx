
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Menu, X, Globe, User, ArrowRight, Instagram, Twitter, Facebook, 
  Sparkles, Check, Eye, LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Edit3, 
  TrendingUp, Users, DollarSign, BarChart3, Lock, Search, Zap, ShieldCheck, MapPin,
  Flame, HardHat, Compass, Layers, Play, Bell, Clock, Heart
} from 'lucide-react';
import { Language, Product, CartItem, Page, AdminTab } from './types';
import { TRANSLATIONS, PRODUCTS as INITIAL_PRODUCTS } from './constants';
import { getStylingAdvice } from './geminiService';
import { AdminPanel } from './components/AdminPanel';
import { Checkout } from './components/Checkout';

// --- Utility Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const base = "px-4 py-3 md:px-6 md:py-3 font-bold transition-all duration-500 uppercase tracking-tighter disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base";
  const variants: any = {
    primary: "bg-white text-black hover:bg-zinc-200",
    outline: "border-2 border-white text-white hover:bg-white hover:text-black",
    dark: "bg-zinc-900 text-white hover:bg-zinc-800",
    accent: "bg-[#00f2ff] text-black hover:bg-[#adff2f]",
    gradient: "bg-gradient-street text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,242,255,0.3)]",
    success: "bg-[#adff2f] text-black scale-105 shadow-[0_0_15px_rgba(173,255,47,0.5)]",
    danger: "bg-transparent border-2 border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff] hover:text-black"
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// --- Marquee Component ---

const Marquee = ({ text, speed = 'slow', className = '' }: { text: string, speed?: 'slow' | 'fast', className?: string }) => (
  <div className={`py-2 border-y-2 border-black overflow-hidden select-none ${className}`}>
    <div className={`animate-marquee whitespace-nowrap flex items-center gap-8 md:gap-12 font-black italic uppercase tracking-tighter text-xs md:text-xl`}>
      {[...Array(10)].map((_, i) => (
        <span key={i} className="flex items-center gap-4 md:gap-8">
          {text} <Zap className="w-3 h-3 md:w-4 md:h-4" />
        </span>
      ))}
    </div>
  </div>
);

// --- Video Gallery Component ---

const PROMO_VIDEOS = [
  { id: 1, title: 'STRAATFANAAT', subtitle: 'Street Culture', src: '/video/WhatsApp%20Video%202026-03-27%20at%2011.54.30%20PM.mp4', thumbnail: '/images/ok%C5%82adka%20home.png', productId: null },
  { id: 2, title: 'CZAPKA HOOLIGAN', subtitle: 'New Drop', src: '/video/czapka%20hooligan.mp4', thumbnail: '/images/czapka.jpeg', productId: '16' },
  { id: 3, title: 'SAVAGE', subtitle: 'Urban Style', src: '/video/savage%20.mp4', thumbnail: '/images/savage%20omerta.jpeg', productId: '8' },
];

const VideoGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  return (
    <>
      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {PROMO_VIDEOS.map((video, index) => (
          <div 
            key={video.id}
            onClick={() => setSelectedVideo(video.id)}
            className="group relative cursor-pointer"
          >
            {/* Outer Glow Frame */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-[#00f2ff] via-[#adff2f] to-[#00f2ff] rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500"></div>
            
            {/* Card Container */}
            <div className="relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 group-hover:border-transparent transition-all duration-500">
              {/* Cyber Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f2ff] rounded-tl-xl z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00f2ff] rounded-tr-xl z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#adff2f] rounded-bl-xl z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#adff2f] rounded-br-xl z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>

              {/* Video Thumbnail */}
              <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                <video 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                >
                  <source src={video.src} type="video/mp4" />
                </video>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00f2ff]/20 group-hover:border-[#00f2ff] transition-all duration-500 shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                    <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white group-hover:text-[#00f2ff] group-hover:fill-[#00f2ff] transition-colors ml-1" />
                  </div>
                </div>

                {/* Number Badge */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-street flex items-center justify-center font-black text-black text-sm">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4 md:p-6 relative">
                <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00f2ff]/50 to-transparent"></div>
                <span className="text-[10px] md:text-xs font-mono text-[#00f2ff] uppercase tracking-[0.3em]">{video.subtitle}</span>
                <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter mt-1 group-hover:text-gradient-street transition-all">{video.title}</h3>
                
                {/* Progress Bar Decoration */}
                <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-0 group-hover:w-full bg-gradient-street transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          onClick={() => setSelectedVideo(null)}
        >
          {/* Modal Glow Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.1)_0%,transparent_70%)]"></div>
          
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-white hover:bg-[#00f2ff] hover:text-black hover:border-[#00f2ff] transition-all duration-300 z-10"
            onClick={() => setSelectedVideo(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Video Container */}
          <div 
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Frame */}
            <div className="absolute -inset-4 md:-inset-6">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#00f2ff]"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#00f2ff]"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#adff2f]"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#adff2f]"></div>
            </div>

            {/* Video Player */}
            <div className="relative bg-zinc-950 rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,242,255,0.3)]">
              <video 
                className="w-full h-auto"
                controls
                autoPlay
                playsInline
              >
                <source src={PROMO_VIDEOS.find(v => v.id === selectedVideo)?.src} type="video/mp4" />
              </video>
            </div>

            {/* Video Title */}
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-gradient-street">
                {PROMO_VIDEOS.find(v => v.id === selectedVideo)?.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Waitlist Modal Component ---

const WaitlistModal = ({ 
  product, 
  isOpen, 
  onClose, 
  lang 
}: { 
  product: Product | null, 
  isOpen: boolean, 
  onClose: () => void, 
  lang: Language 
}) => {
  const [contactType, setContactType] = useState<'email' | 'whatsapp'>('email');
  const [contactValue, setContactValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localWaitlistCount, setLocalWaitlistCount] = useState(product?.waitlistCount || 0);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setLocalWaitlistCount(product.waitlistCount || 0);
      setIsSubmitted(false);
      setContactValue('');
    }
  }, [product]);

  const texts = {
    NL: {
      title: 'BINNENKORT BESCHIKBAAR',
      subtitle: 'Wees de eerste die het weet!',
      description: 'Laat je gegevens achter en wij nemen contact met je op zodra dit product beschikbaar is.',
      emailLabel: 'E-mail',
      whatsappLabel: 'WhatsApp',
      placeholder: contactType === 'email' ? 'jouw@email.nl' : '+31 6 12345678',
      submit: 'INFORMEER MIJ',
      waiting: 'mensen wachten al',
      success: 'BEDANKT!',
      successMsg: 'We nemen contact met je op zodra het product beschikbaar is.',
    },
    EN: {
      title: 'COMING SOON',
      subtitle: 'Be the first to know!',
      description: 'Leave your details and we will contact you as soon as this product is available.',
      emailLabel: 'Email',
      whatsappLabel: 'WhatsApp',
      placeholder: contactType === 'email' ? 'your@email.com' : '+31 6 12345678',
      submit: 'NOTIFY ME',
      waiting: 'people already waiting',
      success: 'THANK YOU!',
      successMsg: 'We will contact you when the product becomes available.',
    },
    PL: {
      title: 'WKRÓTCE DOSTĘPNE',
      subtitle: 'Bądź pierwszy!',
      description: 'Zostaw swoje dane, a skontaktujemy się z Tobą, gdy produkt będzie dostępny.',
      emailLabel: 'E-mail',
      whatsappLabel: 'WhatsApp',
      placeholder: contactType === 'email' ? 'twoj@email.pl' : '+48 123 456 789',
      submit: 'POWIADOM MNIE',
      waiting: 'osób już czeka',
      success: 'DZIĘKUJEMY!',
      successMsg: 'Skontaktujemy się z Tobą, gdy produkt będzie dostępny.',
    }
  };

  const t = texts[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactValue.trim()) {
      setIsSubmitted(true);
      setLocalWaitlistCount(prev => prev + 1);
      // Here you would normally send to backend
      console.log('Waitlist signup:', { product: product?.name, contactType, contactValue });
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#00f2ff]"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00f2ff]"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#adff2f]"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#adff2f]"></div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white hover:bg-[#00f2ff] hover:text-black hover:border-[#00f2ff] transition-all duration-300 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product image - grayscale */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={product.image} 
            className="w-full h-full object-cover grayscale opacity-50"
            alt={product.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
          
          {/* Coming Soon Badge */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-[#adff2f] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t.title}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {!isSubmitted ? (
            <>
              <div className="text-center space-y-2">
                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">{product.name}</h3>
                <p className="text-[#00f2ff] font-bold text-sm uppercase tracking-wider">{t.subtitle}</p>
                <p className="text-zinc-400 text-sm">{t.description}</p>
              </div>

              {/* Waitlist Counter */}
              <div className="flex items-center justify-center gap-3 py-4 border-y border-zinc-800">
                <div className="flex items-center gap-2 text-[#adff2f]">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-black">{localWaitlistCount}</span>
                </div>
                <span className="text-zinc-500 text-sm">{t.waiting}</span>
              </div>

              {/* Contact Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setContactType('email')}
                  className={`flex-1 py-3 font-bold uppercase text-sm tracking-wider transition-all duration-300 ${
                    contactType === 'email' 
                      ? 'bg-[#00f2ff] text-black' 
                      : 'bg-zinc-900 text-zinc-500 hover:text-white'
                  }`}
                >
                  {t.emailLabel}
                </button>
                <button
                  onClick={() => setContactType('whatsapp')}
                  className={`flex-1 py-3 font-bold uppercase text-sm tracking-wider transition-all duration-300 ${
                    contactType === 'whatsapp' 
                      ? 'bg-[#25D366] text-black' 
                      : 'bg-zinc-900 text-zinc-500 hover:text-white'
                  }`}
                >
                  {t.whatsappLabel}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type={contactType === 'email' ? 'email' : 'tel'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:border-[#00f2ff] focus:outline-none transition-colors font-mono"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-street text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all duration-500 flex items-center justify-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  {t.submit}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 mx-auto bg-[#adff2f] rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-[#adff2f]">{t.success}</h3>
              <p className="text-zinc-400">{t.successMsg}</p>
              <div className="pt-4 flex items-center justify-center gap-2 text-zinc-500 text-sm">
                <Users className="w-4 h-4" />
                <span>{localWaitlistCount} {t.waiting}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Home Component ---

const Home = ({ lang, onNavigate, products }: { lang: Language, onNavigate: (page: Page, id?: string) => void, products: Product[] }) => {
  const t = TRANSLATIONS[lang];
  
  return (
    <div className="flex flex-col bg-black">
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/ok%C5%82adka%20home.png" 
            className="w-full h-full object-cover object-center"
            alt="STRAATFANAAT Hero"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
        </div>

        <div className="relative z-10 text-center px-4 space-y-4 md:space-y-6">
          <div className="inline-block px-3 py-1 border border-[#00f2ff] text-[#00f2ff] text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2 md:mb-4 animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]">
            {t.est_drop}
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[11rem] font-black italic tracking-tighter leading-none glitch select-none uppercase px-2" data-text={t.hero_title}>{t.hero_title}</h1>
          <p className="text-xs sm:text-base md:text-2xl font-light tracking-[0.15em] md:tracking-[0.3em] text-zinc-400 uppercase max-w-2xl mx-auto italic px-4">{t.hero_subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-6 md:pt-10 px-4">
            <button onClick={() => onNavigate('shop')} className="group relative px-8 py-4 md:px-12 md:py-5 bg-white text-black font-black italic uppercase tracking-tighter text-lg md:text-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.4)]">
              <span className="relative z-10 flex items-center justify-center gap-3">{t.shop_now} <ArrowRight className="group-hover:translate-x-2 transition-transform" /></span>
              <div className="absolute inset-0 bg-gradient-street translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
            </button>
            <button onClick={() => onNavigate('lookbook')} className="px-8 py-4 md:px-12 md:py-5 border-2 border-white text-white font-black italic uppercase tracking-tighter text-lg md:text-xl hover:bg-white hover:text-black transition-all duration-500">{t.nav_lookbook}</button>
          </div>
        </div>
      </section>

      <Marquee text={`${t.hero_title} • ${t.trending_now.toUpperCase()} • ROTTERDAM • WARSAW • LONDON •`} className="bg-gradient-street text-black border-none" />

      <section className="py-16 md:py-32 px-4 md:px-12 bg-black">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4">
          <div className="space-y-2 md:space-y-4">
            <div className="w-12 md:w-20 h-1 bg-gradient-street"></div>
            <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter px-1">{t.trending_now}</h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="group text-zinc-500 hover:text-[#00f2ff] font-black italic uppercase tracking-widest text-xs md:text-sm flex items-center gap-2 transition-colors">
            {t.view_all} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <VideoGallery />
      </section>

      <section className="relative py-24 md:py-48 px-4 overflow-hidden border-y border-zinc-900 bg-zinc-950 text-center">
         <div className="relative z-10 max-w-5xl mx-auto space-y-8 md:space-y-12">
            <h2 className="text-3xl md:text-8xl font-black italic tracking-tighter leading-none uppercase px-2">{t.culture_manifesto_head}<br/><span className="text-gradient-street">{t.culture_manifesto_sub}</span></h2>
            <p className="text-base md:text-3xl text-zinc-400 font-light max-w-3xl mx-auto leading-relaxed italic px-4">Born in the shadows of the port cities, where the wind is cold and the mentality is hard. STRAATFANAAT is the uniform for those who refuse to conform.</p>
            <div className="pt-4 md:pt-8"><Button onClick={() => onNavigate('about')} variant="gradient" className="px-10 py-4 md:px-16 md:py-6 text-base md:text-xl">{t.explore_story}</Button></div>
         </div>
      </section>
    </div>
  );
};

// --- About Component ---

const About = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="flex flex-col bg-black">
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-mesh">
        <div className="absolute inset-0 z-0"><img src="https://images.unsplash.com/photo-1544006659-f0b21884cb1d?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover grayscale brightness-[0.3]" alt="About Hero"/><div className="scanline opacity-20"></div></div>
        <div className="relative z-10 text-center px-4"><div className="glitch text-4xl sm:text-6xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-none" data-text={t.brand_story}>{t.brand_story}</div></div>
      </section>

      <section className="py-16 md:py-32 px-4 md:px-12 bg-white text-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-16 items-center">
          <div className="flex-1 space-y-4 md:space-y-8">
            <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-[1] md:leading-[0.9]">{t.manifesto_title}</h2>
            <div className="w-16 md:w-24 h-1.5 md:h-2 bg-gradient-street"></div>
            <p className="text-lg md:text-2xl font-light leading-relaxed">{t.manifesto_desc}</p>
          </div>
          <div className="flex-1 w-full relative group">
            {/* Premium nowoczesna ramka */}
            <div className="relative p-1 bg-gradient-to-br from-[#00f2ff] via-[#adff2f] to-[#00f2ff] rounded-sm">
              <div className="relative bg-black p-2 md:p-3">
                <img 
                  src="/images/logo.jpeg" 
                  className="w-full h-auto object-contain" 
                  alt="STRAATFANAAT Logo" 
                />
                {/* Narożne akcenty */}
                <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 border-[#00f2ff]"></div>
                <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 border-[#adff2f]"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 border-[#adff2f]"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 border-[#00f2ff]"></div>
              </div>
            </div>
            {/* Etykieta SINCE */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 md:px-8 md:py-3 bg-black border border-[#00f2ff] text-[#00f2ff] font-mono font-black text-sm md:text-lg tracking-[0.3em] shadow-[0_0_20px_rgba(0,242,255,0.4)]">
              SINCE_2026
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/10 via-transparent to-[#adff2f]/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 px-4 md:px-12 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-1 bg-zinc-900 border border-zinc-900">
          {[{ title: t.pillar_auth_title, desc: t.pillar_auth_desc, icon: <Compass className="w-8 h-8 md:w-12 md:h-12 text-black" /> }, { title: t.pillar_innov_title, desc: t.pillar_innov_desc, icon: <Zap className="w-8 h-8 md:w-12 md:h-12 text-black" /> }, { title: t.pillar_comm_title, desc: t.pillar_comm_desc, icon: <Users className="w-8 h-8 md:w-12 md:h-12 text-black" /> }].map((pillar, i) => (
            <div key={i} className="bg-black p-8 md:p-12 space-y-4 md:space-y-6 group hover:bg-zinc-950 transition-all duration-500">
              <div className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 bg-gradient-street p-3 rounded-full inline-block shadow-[0_0_15px_rgba(0,242,255,0.4)]">{pillar.icon}</div>
              <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-gradient-street transition-colors">{pillar.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-base md:text-lg font-light">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-32 px-4 md:px-12 flex flex-col items-center text-center space-y-8 md:space-y-12 bg-black">
        <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight">{t.born_in}</h2>
        <Button onClick={() => window.dispatchEvent(new CustomEvent('navigate-shop'))} variant="gradient" className="px-10 py-4 md:px-12 md:py-5 text-lg md:text-xl">{t.join_family}</Button>
      </section>
    </div>
  );
};

// --- Lookbook Component ---

const Lookbook = ({ lang, onNavigate }: { lang: Language, onNavigate: (page: Page, id?: string) => void }) => {
  const t = TRANSLATIONS[lang];
  
  // Koszulki męskie i damskie - kolekcja STRAATFANAAT
  const lookbookItems = [
    {
      id: 1,
      title: 'STRAATFANAAT CLASSIC',
      subtitle: 'SIGNATURE COLLECTION',
      image: '/images/straatfanaat.jpg',
      category: 'CLASSIC',
      description: 'Kultowa koszulka STRAATFANAAT - esencja ulicznego stylu',
      productId: '1'
    },
    {
      id: 2,
      title: 'OMERTA BLACK',
      subtitle: 'CODE OF SILENCE',
      image: '/images/omerta%20(1).jpg',
      category: 'GRAPHIC',
      description: 'Kodeks milczenia ulicy - ciemna strona streetwearu',
      productId: '2'
    },
    {
      id: 3,
      title: 'OMERTA WHITE',
      subtitle: 'CONTRAST EDITION',
      image: '/images/bia%C5%82a%20omerta.jpg',
      category: 'GRAPHIC',
      description: 'Cisza mówi głośniej niż słowa - biała edycja',
      productId: '3'
    },
    {
      id: 4,
      title: 'FCDH BLACK',
      subtitle: 'FROM CITY, DIE HARD',
      image: '/images/fcdh%20blak%20(1).jpg',
      category: 'CLASSIC',
      description: 'Graficzne arcydzieło z ulicznym klimatem',
      productId: '4'
    },
    {
      id: 5,
      title: 'FCDH WHITE',
      subtitle: 'PURE ENERGY',
      image: '/images/bia%C5%82a%20fcdh%20(1).jpg',
      category: 'CLASSIC',
      description: 'Czysta energia miasta w jasnej edycji',
      productId: '5'
    },
    {
      id: 6,
      title: 'BOCIAN LIMITED',
      subtitle: 'POLISH HERITAGE',
      image: '/images/bocian%20(1).jpg',
      category: 'GRAPHIC',
      description: 'Polska kultura uliczna - limitowana edycja',
      productId: '6'
    },
    {
      id: 7,
      title: 'CHAMPION STREET',
      subtitle: 'WINNER MENTALITY',
      image: '/images/champion.jpg',
      category: 'CLASSIC',
      description: 'Dla mistrzów ulicy - mentalność zwycięzcy',
      productId: '7'
    },
    {
      id: 8,
      title: 'SAVAGE OMERTA',
      subtitle: 'DEADLY SILENCE',
      image: '/images/savage%20omerta.jpeg',
      category: 'GRAPHIC',
      description: 'Kiedy cisza staje się śmiertelna - najbardziej agresywna edycja',
      productId: '8'
    },
    {
      id: 9,
      title: 'STRAATFANAAT MUZEUM',
      subtitle: 'WHERE ART MEETS STREET',
      image: '/images/straatfanaat%20muzeum2.jpeg',
      category: 'GRAPHIC',
      description: 'Streetwear staje się sztuką - muzealny hołd',
      productId: '9'
    },
    {
      id: 10,
      title: 'STRAATFANAAT STRIT',
      subtitle: 'PURE STREET LIFE',
      image: '/images/straatfanaat%20strit1.jpeg',
      category: 'CLASSIC',
      description: 'Czysta esencja życia ulicznego',
      productId: '10'
    },
    {
      id: 11,
      title: 'HERB STREET',
      subtitle: 'NATURE MEETS CITY',
      image: '/images/herb1.jpeg',
      category: 'GRAPHIC',
      description: 'Natura spotyka miasto - organiczne wibracje',
      productId: '11'
    },
    {
      id: 12,
      title: 'DH MIASTO',
      subtitle: 'DIE HARD URBAN',
      image: '/images/DH%20miasto%20podglad.jpeg',
      category: 'GRAPHIC',
      description: 'Die Hard miejska guerilla z polskimi korzeniami',
      productId: '12'
    },
    {
      id: 13,
      title: 'FCDH PINK DAMSKA',
      subtitle: 'FOR HER',
      image: '/images/damska%20fcdh%20r%C3%B3zowy%201.jpeg',
      category: 'DAMSKIE',
      description: 'Różowa siła spotyka uliczną mentalność',
      productId: '13'
    },
    {
      id: 14,
      title: 'KOLEKCJA DLA NIEJ',
      subtitle: 'EXCLUSIVE WOMEN',
      image: '/images/kolekcja%20dla%20niej%20dla%20niego%20damska%20.jpeg',
      category: 'DAMSKIE',
      description: 'Streetwear dla silnej kobiety - ekskluzywna linia',
      productId: '14'
    },
    {
      id: 15,
      title: 'KOLEKCJA DLA NIEGO',
      subtitle: 'EXCLUSIVE MEN',
      image: '/images/kolekcja%20dla%20niego%20dla%20niej%20sesia%20.jpeg',
      category: 'CLASSIC',
      description: 'Męski odpowiednik kolekcji duo',
      productId: '15'
    },
  ];

  const [activeFilter, setActiveFilter] = useState('ALL');
  const filters = ['ALL', 'CLASSIC', 'GRAPHIC', 'DAMSKIE'];
  
  const filteredItems = activeFilter === 'ALL' 
    ? lookbookItems 
    : lookbookItems.filter(item => item.category === activeFilter);

  return (
    <div className="flex flex-col bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
          <img 
            src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia2.jpeg" 
            className="w-full h-full object-contain"
            alt="STRAATFANAAT Lookbook"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
          <div className="scanline opacity-20"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 space-y-4 md:space-y-8">
          <div className="inline-block px-4 py-2 border border-[#adff2f] text-[#adff2f] text-[10px] md:text-xs font-black tracking-[0.3em] uppercase animate-pulse">
            DLA NIEGO • DLA NIEJ • FOR HIM • FOR HER
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-black italic tracking-tighter leading-none glitch uppercase px-2" data-text="LOOKBOOK">
            LOOKBOOK
          </h1>
          <p className="text-sm md:text-xl text-zinc-400 font-light tracking-widest uppercase max-w-2xl mx-auto">
            Kolekcja męska i damska • Premium streetwear • Uliczny styl dla każdego
          </p>
        </div>
      </section>

      {/* Marquee */}
      <Marquee text="MĘSKIE • DAMSKIE • UNISEX • FOR HIM • FOR HER • STREETWEAR • OVERSIZED • GRAPHIC • PREMIUM COTTON •" className="bg-gradient-street text-black border-none" />

      {/* Filter Section */}
      <section className="pt-12 md:pt-24 px-4 md:px-12">
        <div className="flex flex-wrap gap-3 md:gap-6 justify-center border-b border-zinc-900 pb-8 md:pb-12">
          {filters.map(filter => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)} 
              className={`px-4 py-2 md:px-8 md:py-3 font-black italic uppercase text-[10px] md:text-sm tracking-widest transition-all duration-500 ${activeFilter === filter ? 'bg-gradient-street text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]' : 'text-zinc-500 hover:text-white border border-zinc-800 hover:border-[#00f2ff]'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Lookbook Grid */}
      <section className="py-12 md:py-24 px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => onNavigate('product', item.productId)}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-700 hover:z-10 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
            >
              <div className={`relative overflow-hidden bg-zinc-950 border border-zinc-900 group-hover:border-[#00f2ff]/50`}>
                <div className={`${index === 0 ? 'aspect-square md:aspect-[4/3]' : 'aspect-square'}`}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-contain bg-zinc-900 group-hover:scale-105 transition-all duration-1000"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6">
                  <span className="px-3 py-1 bg-[#00f2ff] text-black text-[8px] md:text-[10px] font-black tracking-widest uppercase">
                    {item.category}
                  </span>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[#adff2f] font-mono text-[10px] md:text-xs uppercase font-black tracking-widest">
                    {item.subtitle}
                  </span>
                  <h3 className={`font-black italic uppercase tracking-tighter mt-2 ${index === 0 ? 'text-3xl md:text-6xl' : 'text-2xl md:text-4xl'}`}>
                    {item.title}
                  </h3>
                  
                  {/* View Button */}
                  <div className="mt-4 md:mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <button className="flex items-center gap-3 text-white hover:text-[#00f2ff] font-black italic uppercase text-xs tracking-widest transition-colors">
                      {t.shop_now}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
                
                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-4 right-4 w-8 h-8 md:w-12 md:h-12 border-t-2 border-r-2 border-[#00f2ff]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="py-16 md:py-32 px-4 md:px-12 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <div className="flex-1 space-y-6 md:space-y-8">
              <div className="w-16 md:w-24 h-1 bg-gradient-street"></div>
              <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                DLA NIEGO<br/>
                <span className="text-gradient-street">DLA NIEJ</span>
              </h2>
              <p className="text-lg md:text-2xl text-zinc-400 font-light italic leading-relaxed">
                Nasza kolekcja to streetwear bez granic płci. Premium bawełna 300gsm, oversize i dopasowane kroje, unikalne grafiki inspirowane kulturą uliczną. Koszulki dla niego i dla niej - razem lub osobno.
              </p>
              <div className="space-y-4 text-zinc-500">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#adff2f]" />
                  <span className="font-bold uppercase tracking-wide text-sm">100% Premium Bawełna 300gsm</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#adff2f]" />
                  <span className="font-bold uppercase tracking-wide text-sm">Kolekcja Męska & Damska</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#adff2f]" />
                  <span className="font-bold uppercase tracking-wide text-sm">Rozmiary XS - XXL</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button onClick={() => onNavigate('shop')} variant="gradient" className="px-8 py-4 md:px-12 md:py-5 text-base md:text-lg">
                  {t.shop_now}
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative group">
                <img 
                  src="/images/kolekcja%20dla%20niego%20dla%20niej%20sesia1.jpeg" 
                  className="w-full transition-all duration-700 shadow-2xl"
                  alt="STRAATFANAAT Collection"
                />
                <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 bg-gradient-street p-4 md:p-8 text-black font-black italic text-xl md:text-3xl shadow-[0_0_30px_rgba(173,255,47,0.4)]">
                  DUO
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-24 px-4 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
          {[
            { number: '15', label: 'MODELI' },
            { number: '4', label: 'KOLEKCJE' },
            { number: '7', label: 'ROZMIARÓW' },
            { number: '100%', label: 'BAWEŁNA' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 md:p-10 border border-zinc-900 bg-zinc-950 group hover:border-[#00f2ff]/50 transition-all duration-500">
              <div className="text-3xl md:text-6xl font-black italic text-gradient-street group-hover:scale-110 transition-transform duration-500">
                {stat.number}
              </div>
              <div className="text-[10px] md:text-xs font-black tracking-widest text-zinc-500 mt-2 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-32 px-4 text-center bg-gradient-mesh relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        <div className="relative z-10 space-y-6 md:space-y-8 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter">
            ZNAJDŹ SWÓJ<br/>
            <span className="text-gradient-street">ULICZNY STYL</span>
          </h2>
          <p className="text-base md:text-xl text-zinc-400 font-light italic max-w-2xl mx-auto">
            Premium jakość, unikalne wzory, uliczny styl. Kolekcja dla niego i dla niej - streetwear bez kompromisów.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => onNavigate('shop')} variant="gradient" className="px-10 py-4 md:px-16 md:py-6 text-base md:text-xl">
              {t.shop_now}
            </Button>
          </div>
          <div className="flex justify-center gap-6 pt-6">
            <a href="#" className="p-4 border border-zinc-800 hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all duration-500">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="p-4 border border-zinc-800 hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all duration-500">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="p-4 border border-zinc-800 hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all duration-500">
              <Facebook className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Shop Component ---

const Shop = ({ lang, onNavigate, onQuickView, products }: { lang: Language, onNavigate: (page: Page, id?: string) => void, onQuickView: (p: Product) => void, products: Product[] }) => {
  const t = TRANSLATIONS[lang];
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Tees', 'Damskie', 'Hoodies', 'Pants', 'Accessories'];
  const filteredProducts = (activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory))
    .sort((a, b) => (b.available === true ? 1 : 0) - (a.available === true ? 1 : 0));

  const waitlistTexts = {
    NL: { comingSoon: 'BINNENKORT', cantWait: 'IK KAN NIET WACHTEN', waiting: 'wachten' },
    EN: { comingSoon: 'COMING SOON', cantWait: "CAN'T WAIT", waiting: 'waiting' },
    PL: { comingSoon: 'WKRÓTCE', cantWait: 'NIE MOGĘ SIĘ DOCZEKAĆ', waiting: 'czeka' }
  };
  const wt = waitlistTexts[lang];

  const handleProductClick = (product: Product) => {
    // Zawsze przechodź do strony produktu - klient może obejrzeć zdjęcia
    onNavigate('product', product.id);
  };

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-24 px-4 md:px-12 bg-black min-h-screen overflow-x-clip">
      <div className="space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 border-b border-zinc-900 pb-8 md:pb-12">
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-gradient-street pl-1 pr-4">{t.the_drop}</h1>
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 md:px-6 md:py-2 font-black italic uppercase text-[10px] md:text-sm tracking-widest transition-all duration-500 ${activeCategory === cat ? 'bg-gradient-street text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'text-zinc-500 hover:text-white'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map(product => {
            const isAvailable = product.available !== false;
            
            return (
              <div 
                key={product.id} 
                className={`group bg-zinc-950 border overflow-hidden cursor-pointer transition-all duration-500 ${
                  isAvailable 
                    ? 'border-zinc-900 hover:border-[#00f2ff]/50' 
                    : 'border-zinc-900 hover:border-[#adff2f]/50'
                }`} 
                onClick={() => handleProductClick(product)}
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <img 
                    src={product.image} 
                    className={`w-full h-full object-contain transition-all duration-700 ${
                      isAvailable 
                        ? 'md:group-hover:scale-105' 
                        : 'grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 md:group-hover:scale-105'
                    }`} 
                    alt={product.name} 
                  />
                  
                  {/* Coming Soon Badge */}
                  {!isAvailable && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#adff2f] text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {wt.comingSoon}
                    </div>
                  )}
                  
                  {/* Quick View - only for available */}
                  {isAvailable && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onQuickView(product); }} 
                      className="absolute top-4 right-4 p-2.5 md:p-3 bg-white text-black hover:bg-gradient-street hover:text-black transition-all duration-500 shadow-xl rounded-sm" 
                      title="Quick View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* Waitlist Counter Badge - for coming soon */}
                  {!isAvailable && product.waitlistCount && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-zinc-900/90 border border-zinc-700 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-[#adff2f]" />
                      {product.waitlistCount} {wt.waiting}
                    </div>
                  )}
                </div>
                
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className={`font-mono text-[8px] md:text-[10px] uppercase font-black ${isAvailable ? 'text-[#00f2ff]' : 'text-[#adff2f]'}`}>
                        {product.category}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">{product.name}</h3>
                    </div>
                    <div className="text-right">
                      {product.originalPrice && (
                        <span className="text-sm md:text-base font-mono text-zinc-500 line-through block">€{product.originalPrice}</span>
                      )}
                      <span className="text-lg md:text-xl font-mono font-black text-gradient-street">€{product.price}</span>
                    </div>
                  </div>
                  
                  {/* Can't Wait Button for coming soon products */}
                  {!isAvailable && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setWaitlistProduct(product); }}
                      className="mt-4 w-full py-3 bg-zinc-900 border border-[#adff2f]/50 text-[#adff2f] font-black text-xs uppercase tracking-wider hover:bg-[#adff2f] hover:text-black transition-all duration-500 flex items-center justify-center gap-2 group-hover:border-[#adff2f]"
                    >
                      <Heart className="w-4 h-4" />
                      {wt.cantWait}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- ProductDetail Component ---

const ProductDetail = ({ productId, lang, addToCart, products }: { productId: string, lang: Language, addToCart: (p: Product, s: string) => void, products: Product[] }) => {
  const t = TRANSLATIONS[lang];
  const product = products.find(p => p.id === productId) || products[0];
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  
  const isAvailable = product.available !== false;
  
  // Użyj tablicy images jeśli dostępna, w przeciwnym razie użyj pojedynczego image
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  
  // Zdjęcia podglądu (z lupą) - szczegóły produktu
  const previewImages = (product as any).previewImages || [];
  const hasPreviewImages = previewImages.length > 0;

  const waitlistTexts = {
    NL: { comingSoon: 'BINNENKORT BESCHIKBAAR', cantWait: 'IK KAN NIET WACHTEN', waiting: 'mensen wachten al' },
    EN: { comingSoon: 'COMING SOON', cantWait: "CAN'T WAIT", waiting: 'people already waiting' },
    PL: { comingSoon: 'WKRÓTCE DOSTĘPNE', cantWait: 'NIE MOGĘ SIĘ DOCZEKAĆ', waiting: 'osób już czeka' }
  };
  const wt = waitlistTexts[lang];

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getStylingAdvice(product.name, lang);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  const openZoom = (index: number) => {
    setZoomImageIndex(index);
    setIsZoomOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-24 px-4 md:px-12 bg-black min-h-screen">
      {/* Waitlist Modal */}
      <WaitlistModal 
        product={product} 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
        lang={lang} 
      />
      
      {/* Zoom Modal */}
      {isZoomOpen && hasPreviewImages && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button 
            onClick={() => setIsZoomOpen(false)} 
            className="absolute top-6 right-6 z-10 p-3 bg-zinc-900 border border-zinc-700 hover:border-[#00f2ff] text-white hover:text-[#00f2ff] transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-6">
            {/* Główne zdjęcie zoom z efektem lupy */}
            <div 
              className="relative w-full max-h-[70vh] overflow-hidden cursor-zoom-in group"
              onMouseMove={handleMouseMove}
            >
              <img 
                src={previewImages[zoomImageIndex]} 
                className="w-full h-full object-contain transition-transform duration-100"
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: 'scale(1)',
                }}
                alt={`${product.name} - Detail ${zoomImageIndex + 1}`}
              />
              
              {/* Lupa overlay */}
              <div 
                className="absolute w-40 h-40 md:w-64 md:h-64 border-2 border-[#00f2ff] rounded-full overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_30px_rgba(0,242,255,0.5)]"
                style={{
                  left: `calc(${zoomPosition.x}% - 5rem)`,
                  top: `calc(${zoomPosition.y}% - 5rem)`,
                  backgroundImage: `url(${previewImages[zoomImageIndex]})`,
                  backgroundSize: '400%',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            </div>
            
            {/* Miniaturki podglądu */}
            {previewImages.length > 1 && (
              <div className="flex gap-3 justify-center">
                {previewImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setZoomImageIndex(index)}
                    className={`w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-all ${
                      zoomImageIndex === index 
                        ? 'border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.5)]' 
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Detail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
            
            <div className="text-center">
              <p className="text-[#00f2ff] font-mono text-xs uppercase tracking-widest animate-pulse">
                🔍 Najedź myszką na zdjęcie aby powiększyć szczegóły
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        <div className="space-y-4">
          {/* Główne zdjęcie */}
          <div className="bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
            <img 
              src={productImages[selectedImageIndex]} 
              className={`w-full h-auto object-contain max-h-[70vh] transition-all duration-500 ${!isAvailable ? 'grayscale group-hover:grayscale-0' : ''}`}
              alt={`${product.name} - ${selectedImageIndex === 0 ? 'Przód' : 'Tył'}`}
            />
            {/* Etykieta przód/tył */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 border border-zinc-700 text-[#00f2ff] text-xs font-black uppercase tracking-wider">
              {selectedImageIndex === 0 ? 'FRONT' : selectedImageIndex === 1 ? 'BACK' : `VIEW ${selectedImageIndex + 1}`}
            </div>
            {/* Coming Soon Badge */}
            {!isAvailable && (
              <div className="absolute top-4 right-4 px-4 py-2 bg-[#adff2f] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {wt.comingSoon}
              </div>
            )}
          </div>
          
          {/* Miniaturki - przód i tył */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-24 md:w-24 md:h-28 overflow-hidden border-2 transition-all duration-300 ${
                    selectedImageIndex === index 
                      ? 'border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.4)]' 
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <img 
                    src={img} 
                    className="w-full h-full object-cover" 
                    alt={`${product.name} - ${index === 0 ? 'Przód' : index === 1 ? 'Tył' : `Widok ${index + 1}`}`}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 py-1 text-center text-[8px] font-bold uppercase tracking-wider text-zinc-400">
                    {index === 0 ? 'FRONT' : index === 1 ? 'BACK' : `#${index + 1}`}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Zdjęcia podglądu ze szczegółami (z lupą) */}
          {hasPreviewImages && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#00f2ff]" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  {lang === 'PL' ? 'PODGLĄD SZCZEGÓŁÓW' : lang === 'NL' ? 'DETAILS BEKIJKEN' : 'VIEW DETAILS'}
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previewImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => openZoom(index)}
                    className="relative flex-shrink-0 w-24 h-28 md:w-28 md:h-32 overflow-hidden border-2 border-dashed border-[#00f2ff]/50 hover:border-[#00f2ff] transition-all duration-300 group/preview"
                  >
                    <img 
                      src={img} 
                      className="w-full h-full object-cover group-hover/preview:scale-110 transition-transform duration-500" 
                      alt={`${product.name} - Detail ${index + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                      <div className="bg-[#00f2ff] p-2 rounded-full">
                        <Search className="w-5 h-5 text-black" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-street py-1 text-center text-[8px] font-bold uppercase tracking-wider text-black">
                      🔍 ZOOM
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Film reklamowy produktu */}
          {product.promoVideo && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#adff2f]" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  {lang === 'PL' ? 'FILM PROMOCYJNY' : lang === 'NL' ? 'PROMO VIDEO' : 'PROMO VIDEO'}
                </span>
              </div>
              <div className="relative overflow-hidden border-2 border-[#adff2f]/50 rounded-lg shadow-[0_0_20px_rgba(173,255,47,0.2)]">
                <video 
                  className="w-full h-auto"
                  controls
                  playsInline
                  poster={product.image}
                >
                  <source src={product.promoVideo} type="video/mp4" />
                </video>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6 md:space-y-12">
          <div className="space-y-2 md:space-y-4">
            <span className="text-gradient-street font-mono text-xs md:text-sm uppercase font-black tracking-widest">{product.category}</span>
            <h1 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">{product.name}</h1>
            <div className="flex items-center gap-4">
              {product.originalPrice && (
                <span className="text-xl md:text-2xl font-mono text-zinc-500 line-through">€{product.originalPrice}</span>
              )}
              <p className="text-2xl md:text-4xl font-mono font-black text-white">€{product.price}</p>
              {product.originalPrice && (
                <span className="px-2 py-1 bg-[#adff2f] text-black text-xs md:text-sm font-black uppercase">SALE</span>
              )}
            </div>
          </div>
          <p className="text-lg md:text-xl text-zinc-400 font-light italic leading-relaxed">{product.description[lang]}</p>
          
          {/* Coming Soon Banner for unavailable products */}
          {!isAvailable && (
            <div className="bg-zinc-900 border border-[#adff2f]/50 p-4 md:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#adff2f]" />
                <div>
                  <span className="text-[#adff2f] font-black uppercase text-sm">{wt.comingSoon}</span>
                  {product.waitlistCount && (
                    <p className="text-zinc-500 text-xs flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" /> {product.waitlistCount} {wt.waiting}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Size selection - only for available products */}
          {isAvailable && (
            <div className="space-y-4 border-y border-zinc-900 py-6 md:py-8">
              <h4 className="font-black italic uppercase text-[10px] md:text-sm tracking-widest">{t.size}</h4>
              <div className="flex flex-wrap gap-2 md:gap-4">
                {product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold border transition-all duration-300 ${selectedSize === size ? 'bg-gradient-street text-black border-none shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'border-zinc-800 text-zinc-500 hover:border-[#00f2ff]'}`}>{size}</button>
                ))}
              </div>
            </div>
          )}
          
          {/* Add to Cart or Waitlist Button */}
          {isAvailable ? (
            <Button onClick={() => addToCart(product, selectedSize)} variant="gradient" className="w-full py-5 md:py-6 text-lg md:text-xl">{t.add_to_cart}</Button>
          ) : (
            <button 
              onClick={() => setIsWaitlistOpen(true)}
              className="w-full py-5 md:py-6 bg-zinc-900 border-2 border-[#adff2f] text-[#adff2f] font-black uppercase tracking-wider text-lg md:text-xl hover:bg-[#adff2f] hover:text-black transition-all duration-500 flex items-center justify-center gap-3"
            >
              <Heart className="w-6 h-6" />
              {wt.cantWait}
            </button>
          )}
          
          <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 space-y-4 relative group">
            <Sparkles className="absolute top-4 right-4 w-8 h-8 text-gradient-street opacity-20" />
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">{t.ai_stylist_title}</h3>
            {advice ? <p className="text-zinc-300 italic text-base animate-in fade-in duration-700">"{advice}"</p> : <p className="text-zinc-500 italic text-sm">{t.ai_stylist_prompt}</p>}
            <button onClick={fetchAdvice} disabled={loadingAdvice} className="w-full py-3 border-2 border-dashed border-zinc-800 text-zinc-400 font-black italic uppercase hover:border-gradient-street hover:text-white transition-all duration-500 flex items-center justify-center gap-2">
              {loadingAdvice ? <div className="w-4 h-4 border-2 border-[#00f2ff] border-t-white rounded-full animate-spin" /> : <>{t.ai_stylist_btn} <Zap className="w-4 h-4 text-gradient-street" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('NL');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const t = TRANSLATIONS[lang];

  const navigate = (page: Page, id?: string) => {
    setCurrentPage(page);
    if (id) setSelectedProductId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const addToCart = (product: Product, size: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) return prev.map(item => item.id === product.id && item.selectedSize === size ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setTimeout(() => setIsCartOpen(true), 800);
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  return (
    <div className="relative selection:bg-[#00f2ff] selection:text-black scroll-smooth">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 h-16 md:h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-white"><Menu /></button>
            <div className="text-lg md:text-2xl font-black italic tracking-tighter cursor-pointer text-gradient-street pr-2" onClick={() => navigate('home')}>STRAATFANAAT</div>
            <nav className="hidden md:flex items-center gap-8 uppercase font-black italic text-sm">
              <button onClick={() => navigate('shop')} className={currentPage === 'shop' ? 'text-gradient-street' : 'text-white'}>{t.nav_shop}</button>
              <button onClick={() => navigate('lookbook')} className={currentPage === 'lookbook' ? 'text-gradient-street' : 'text-white'}>{t.nav_lookbook}</button>
              <button onClick={() => navigate('about')} className={currentPage === 'about' ? 'text-gradient-street' : 'text-white'}>{t.nav_about}</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-transparent text-white font-black italic text-xs outline-none border border-zinc-800 px-2 py-1"><option value="NL" className="bg-black">NL</option><option value="EN" className="bg-black">EN</option><option value="PL" className="bg-black">PL</option></select>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-white group"><ShoppingCart />{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-gradient-street text-black text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}</button>
            <button onClick={() => navigate('admin')} className="text-zinc-700 hover:text-white"><Lock className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black p-8 flex flex-col gap-12 animate-in slide-in-from-left">
          <div className="flex justify-between items-center"><span className="text-gradient-street text-xl font-black italic">MENU</span><button onClick={() => setIsMenuOpen(false)} className="text-white"><X className="w-8 h-8" /></button></div>
          <nav className="flex flex-col gap-6 text-4xl font-black italic uppercase">
            <button onClick={() => navigate('shop')} className="text-left hover:text-gradient-street">{t.nav_shop}</button>
            <button onClick={() => navigate('lookbook')} className="text-left hover:text-gradient-street">{t.nav_lookbook}</button>
            <button onClick={() => navigate('about')} className="text-left hover:text-gradient-street">{t.nav_about}</button>
          </nav>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full sm:max-w-md bg-zinc-950 h-full p-8 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black italic uppercase text-gradient-street">{t.cart_title}</h2><button onClick={() => setIsCartOpen(false)}><X className="text-white" /></button></div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.length === 0 ? <p className="text-zinc-500 font-bold uppercase text-center py-12">{t.empty_cart}</p> : 
                cart.map(item => (<div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-2 bg-black border border-zinc-900"><img src={item.image} className="w-16 h-16 object-cover" /><div className="flex-1"><div className="flex justify-between font-black text-xs"><h3>{item.name}</h3></div><p className="text-[10px] text-zinc-500">SIZE: {item.selectedSize}</p><p className="font-mono text-[#adff2f] text-sm">€{item.price * item.quantity}</p></div></div>))
              }
            </div>
            {cart.length > 0 && <div className="pt-6 border-t border-zinc-900 space-y-4"><div className="flex justify-between items-end"><span className="text-zinc-500 font-bold uppercase text-xs">{t.total}</span><span className="text-2xl font-black text-gradient-street">€{cartTotal}</span></div><Button onClick={() => { setIsCartOpen(false); navigate('checkout'); }} variant="gradient" className="w-full">{t.checkout}</Button></div>}
          </div>
        </div>
      )}

      <main>
        {currentPage === 'home' && <Home lang={lang} onNavigate={navigate} products={storeProducts} />}
        {currentPage === 'shop' && <Shop lang={lang} onNavigate={navigate} onQuickView={setQuickViewProduct} products={storeProducts} />}
        {currentPage === 'product' && <ProductDetail productId={selectedProductId} lang={lang} addToCart={addToCart} products={storeProducts} />}
        {currentPage === 'lookbook' && <Lookbook lang={lang} onNavigate={navigate} />}
        {currentPage === 'about' && <About lang={lang} />}
        {currentPage === 'admin' && <AdminPanel lang={lang} />}
        {currentPage === 'checkout' && <Checkout lang={lang} cart={cart} onBack={() => navigate('shop')} onSuccess={() => navigate('home')} clearCart={() => setCart([])} />}
      </main>

      <footer className="bg-zinc-950 py-16 px-4 md:px-12 border-t border-zinc-900 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6"><h2 className="text-3xl font-black italic text-gradient-street">STRAATFANAAT</h2><p className="text-zinc-500 max-w-sm italic">{t.footer_desc}</p><div className="flex gap-6"><Instagram className="hover:text-[#00f2ff] cursor-pointer" /><Twitter className="hover:text-[#00f2ff] cursor-pointer" /><Facebook className="hover:text-[#00f2ff] cursor-pointer" /></div></div>
          <div><h3 className="font-black italic mb-6 text-white/80">{t.footer_links}</h3><ul className="space-y-3 text-zinc-500 font-bold text-xs uppercase"><li><button onClick={() => navigate('shop')}>{t.nav_shop}</button></li><li><button onClick={() => navigate('lookbook')}>{t.nav_lookbook}</button></li><li><button onClick={() => navigate('about')}>{t.nav_about}</button></li></ul></div>
          <div><h3 className="font-black italic mb-6 text-white/80">{t.footer_newsletter}</h3><div className="space-y-3"><input type="email" placeholder="EMAIL" className="w-full bg-zinc-900 border border-zinc-800 p-3 font-bold text-xs outline-none focus:border-[#00f2ff]" /><Button variant="gradient" className="w-full !py-3">{t.footer_join_btn}</Button></div></div>
        </div>
        <div className="mt-16 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] font-black tracking-widest text-zinc-600 uppercase">
           <div>© 2024 STRAATFANAAT. {t.footer_rights}</div>
           <div className="text-gradient-street">{t.footer_made_by}</div>
        </div>
      </footer>
    </div>
  );
}
