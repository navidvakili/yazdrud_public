import React, { useState, useEffect, useRef } from 'react';
import housingSlideImg from '../assets/images/yazd_housing_slide_1784826043247.jpg';
import highwaySlideImg from '../assets/images/yazd_highway_slide_1784826054593.jpg';
import citySlideImg from '../assets/images/yazd_city_regeneration_slide_1784826083474.jpg';

interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const slides = [
    {
      id: 'housing',
      tag: 'پروژه پیشران مسکن',
      title: 'نهضت ملی مسکن و واگذاری اراضی یزد',
      subtitle: 'واگذاری اراضی مسکونی و ساخت خانه‌های ویلایی و تک‌واحدی متناسب با زیست‌بوم و بادگیرهای اصیل یزد',
      badge: '۱۴۰ پروژه مسکونی فعال',
      badgeIcon: 'fa-house-chimney',
      bgImage: housingSlideImg,
      primaryCtaText: 'ورود به سامانه نهضت مسکن',
      primaryCtaTarget: 'services',
      secondaryCtaText: 'استعلام فوری وضعیت فرم ج',
      secondaryCtaTarget: 'services',
    },
    {
      id: 'transport',
      tag: 'زیرساخت و ترانزیت',
      title: 'توسعه بزرگراه‌ها و راه‌های شریانی استان',
      subtitle: 'بهسازی، دوبانده‌سازی و ارتقای ایمنی بیش از ۸۵۰ کیلومتر از محورهای اصلی و کویری استان یزد',
      badge: '۸۵۰ کیلومتر راه ترانزیتی',
      badgeIcon: 'fa-road',
      bgImage: highwaySlideImg,
      primaryCtaText: 'نقشه پروژه‌های جاده‌ای یزد',
      primaryCtaTarget: 'interactive-map',
      secondaryCtaText: 'گزارش پروژه‌های راه‌سازی',
      secondaryCtaTarget: 'news',
    },
    {
      id: 'regeneration',
      tag: 'شهرسازی و میراث جهانی',
      title: 'بازآفرینی شهری و احیای بافت تاریخی یزد',
      subtitle: 'حفظ و احیای هویت خشتی ثبت شده در یونسکو، بهسازی بافت فرسوده و بازآفرینی محلات کهن استان',
      badge: '۳۲۰ پروژه عمران شهری',
      badgeIcon: 'fa-city',
      bgImage: citySlideImg,
      primaryCtaText: 'طرح‌های بازآفرینی شهری',
      primaryCtaTarget: 'services',
      secondaryCtaText: 'مشاهده آخرین اخبار شهرسازی',
      secondaryCtaTarget: 'news',
    },
    {
      id: 'family',
      tag: 'حمایت از خانواده و جمعیت',
      title: 'طرح قانون حمایت از خانواده و جوانی جمعیت',
      subtitle: 'تخصیص اراضی رایگان به خانوارهای دارای ۳ فرزند و بیشتر و جوانان متقاضی مسکن در کلیه شهرستان‌های یزد',
      badge: '۱۲۰ خدمت آنلاین پورتال',
      badgeIcon: 'fa-users',
      bgImage: housingSlideImg,
      primaryCtaText: 'ثبت‌نام طرح جوانی جمعیت',
      primaryCtaTarget: 'services',
      secondaryCtaText: 'میز خدمت هوشمند',
      secondaryCtaTarget: 'services',
    },
  ];

  // Auto advance slides every 6 seconds if not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        // Next slide in RTL
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowRight') {
        // Prev slide in RTL
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    if (deltaX > 50) {
      handlePrev();
    } else if (deltaX < -50) {
      handleNext();
    }
    touchStartXRef.current = null;
  };

  const slide = slides[currentSlide];

  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden text-white pt-28 pb-12 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides */}
      {slides.map((item, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              isActive
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 pointer-events-none z-0'
            }`}
          >
            <img
              src={item.bgImage}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Multi-layered Glass Dark Gradients for high contrast without box cards */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] via-[#152843]/80 to-black/55"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        );
      })}

      {/* Slide Navigation Arrows */}
      {/* Next Button (Left in RTL) */}
      <button
        onClick={handleNext}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/35 active:scale-90 text-white border border-white/30 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-2xl cursor-pointer group"
        title="اسلاید بعدی"
        aria-label="اسلاید بعدی"
      >
        <i className="fa-solid fa-chevron-left text-lg sm:text-2xl group-hover:-translate-x-0.5 transition-transform"></i>
      </button>

      {/* Prev Button (Right in RTL) */}
      <button
        onClick={handlePrev}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/35 active:scale-90 text-white border border-white/30 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-2xl cursor-pointer group"
        title="اسلاید قبلی"
        aria-label="اسلاید قبلی"
      >
        <i className="fa-solid fa-chevron-right text-lg sm:text-2xl group-hover:translate-x-0.5 transition-transform"></i>
      </button>

      {/* Main Frameless Slide Text Content */}
      <div className="relative z-20 max-w-5xl mx-auto text-center px-4 sm:px-6">
        <div key={slide.id} className="animate-fade-in-up py-4">
          
          {/* Ministry Header Sub-Badge - Floating Pill with Teal/Gold glow */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#152843]/80 backdrop-blur-md border border-[#2A9D8F]/60 text-[#F1E0C5] text-xs sm:text-sm font-black mb-5 shadow-2xl">
            <i className={`fa-solid ${slide.badgeIcon} text-[#2A9D8F] text-base`}></i>
            <span>{slide.tag}</span>
          </div>

          {/* Big Frameless Slide Title with Strong Drop-Shadow & Dual Color Accent */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 text-white leading-snug drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            <span className="bg-gradient-to-r from-white via-slate-100 to-[#E7D3B1] bg-clip-text text-transparent">
              {slide.title}
            </span>
          </h2>

          {/* Slide Description - Crisp contrast text with subtle gold tint */}
          <p className="text-sm sm:text-lg md:text-xl font-bold text-amber-50/95 max-w-3xl mx-auto mb-7 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            {slide.subtitle}
          </p>

          {/* Stat Badge - Floating pill */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2A9D8F] to-emerald-600 text-white text-xs sm:text-sm font-extrabold shadow-2xl border border-teal-300/40 backdrop-blur-md">
              <i className="fa-solid fa-chart-line text-xs"></i>
              <span>{slide.badge}</span>
            </span>
          </div>

          {/* Action Buttons - Frameless high-contrast CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA */}
            <button
              onClick={() => onNavigate(slide.primaryCtaTarget)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2A9D8F] via-[#218276] to-[#1F3A5F] hover:from-[#218276] hover:to-[#172e4c] text-white font-black text-sm sm:text-base shadow-2xl border border-teal-300/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <i className="fa-solid fa-arrow-pointer text-[#E7D3B1] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"></i>
              <span>{slide.primaryCtaText}</span>
            </button>

            {/* Secondary CTA */}
            <button
              onClick={() => onNavigate(slide.secondaryCtaTarget)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black/45 hover:bg-black/65 border border-amber-200/40 text-[#E7D3B1] hover:text-white font-black text-sm sm:text-base backdrop-blur-md shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <i className="fa-solid fa-layer-group text-[#2A9D8F]"></i>
              <span>{slide.secondaryCtaText}</span>
            </button>
          </div>

          {/* Quick Help Footer Link */}
          <div className="mt-8 text-xs text-amber-100/90 flex items-center justify-center gap-2.5 font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <i className="fa-solid fa-shield-halved text-[#2A9D8F]"></i>
            <span>درگاه رسمی اداره کل راه و شهرسازی استان یزد</span>
          </div>
        </div>
      </div>

      {/* Slide Pagination & Controls Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/25 shadow-2xl">
        {/* Play / Pause Toggle */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-white/80 hover:text-white transition-colors p-1 text-xs"
          title={isPaused ? 'پخش اسلایدر' : 'توقف اسلایدر'}
          aria-label="کنترل پخش اسلایدر"
        >
          <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
        </button>

        <div className="w-[1px] h-4 bg-white/20 mx-1"></div>

        {/* Slide Bullets */}
        <div className="flex items-center gap-2">
          {slides.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-2.5 bg-[#2A9D8F] shadow-md'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`اسلاید ${index + 1}: ${item.title}`}
              aria-label={`تغییر به اسلاید ${index + 1}`}
            />
          ))}
        </div>

        <div className="w-[1px] h-4 bg-white/20 mx-1"></div>

        {/* Slide Counter */}
        <span className="text-xs font-mono font-bold text-white/90">
          ۰{currentSlide + 1} / ۰{slides.length}
        </span>
      </div>

      {/* Bottom Autoplay Timer Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-30 overflow-hidden">
        <div
          key={currentSlide + (isPaused ? '-paused' : '-running')}
          className={`h-full bg-gradient-to-r from-[#2A9D8F] to-[#E7D3B1] ${
            isPaused ? 'opacity-50' : 'animate-progress'
          }`}
          style={{
            animationDuration: '6000ms',
            animationTimingFunction: 'linear',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>

      {/* Yazd Clay Arch Border Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden pointer-events-none z-20">
        <svg
          viewBox="0 0 100 10"
          className="absolute bottom-0 w-full h-8 text-[#F5F6F8]"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0 10 Q5 0 10 10 Q15 0 20 10 Q25 0 30 10 Q35 0 40 10 Q45 0 50 10 Q55 0 60 10 Q65 0 70 10 Q75 0 80 10 Q85 0 90 10 Q95 0 100 10 Z" />
        </svg>
      </div>
    </section>
  );
}

