import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { API } from '../shared-utils';
import { ROUTES, RouteKey } from '../router';

interface HeaderProps {
  fontSizeScale: number;
  setFontSizeScale: (scale: number) => void;
  isHighContrast: boolean;
  setIsHighContrast: (contrast: boolean) => void;
  onNavigate: (section: string) => void;
}

/** آیتم منوی پویا — همان‌طور که از /api/navigation/public می‌آید */
interface PublicNavItem {
  id: string;
  title: string;
  targetUrl: string;
  target?: '_self' | '_blank';
  children?: PublicNavItem[];
}

const PATH_TO_ROUTE_KEY = new Map<string, RouteKey>(
  Object.entries(ROUTES).map(([key, path]) => [path, key as RouteKey])
);

export default function Header({
  fontSizeScale,
  setFontSizeScale,
  isHighContrast,
  setIsHighContrast,
  onNavigate,
}: HeaderProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateLanguage = (languageId: string) => {
      document.documentElement.lang = languageId;
      document.documentElement.dir = i18n.dir(languageId);
    };
    updateLanguage(i18n.language || 'fa');
    i18n.on('languageChanged', updateLanguage);
    return () => {
      i18n.off('languageChanged', updateLanguage);
    };
  }, []);

  // منوی ثابت پیش‌فرض — همیشه در دسترس، حتی اگر منویی هنوز از «مدیریت و ساخت
  // ناوبری» منتشر نشده باشد یا واکشی آن با خطا مواجه شود.
  const fallbackMenuItems: { label: string; id: string }[] = [
    { label: t('yazdrud.header.menuHome'), id: 'home' },
    { label: t('yazdrud.header.menuServices'), id: 'services' },
    { label: t('yazdrud.header.menuLandAllocation'), id: 'land-allocation' },
    { label: t('yazdrud.header.menuUrbanPlanning'), id: 'urban-planning' },
    { label: t('yazdrud.header.menuRoadsTransport'), id: 'roads-transport' },
    { label: t('yazdrud.header.menuNews'), id: 'news' },
    { label: t('yazdrud.header.menuMap'), id: 'interactive-map' },
    { label: t('yazdrud.header.menuContact'), id: 'footer' },
  ];

  // منوی پویا — در صورت انتشار یک منو با موقعیت «header-main-menu» از طریق
  // ماژول «مدیریت و ساخت ناوبری»، جایگزین منوی ثابت بالا می‌شود.
  const [dynamicItems, setDynamicItems] = useState<PublicNavItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    API<{ data: { menus: Record<string, { items: PublicNavItem[] }> } }>('navigation/public')
      .then((res) => {
        if (cancelled) return;
        const items = res?.data?.menus?.['header-main-menu']?.items;
        if (Array.isArray(items) && items.length > 0) setDynamicItems(items);
      })
      .catch(() => {
        // بی‌صدا نادیده گرفته می‌شود — منوی ثابت به‌عنوان fallback همچنان کار می‌کند
      });
    return () => {
      cancelled = true;
    };
  }, []);

  interface ResolvedMenuItem {
    label: string;
    onClick?: () => void;
    href?: string;
    target?: '_self' | '_blank';
  }

  const resolvedMenuItems: ResolvedMenuItem[] =
    dynamicItems && dynamicItems.length > 0
      ? dynamicItems.map((item) => {
          const matchedKey = PATH_TO_ROUTE_KEY.get(item.targetUrl);
          if (matchedKey) {
            return { label: item.title, onClick: () => onNavigate(matchedKey) };
          }
          return { label: item.title, href: item.targetUrl, target: item.target || '_self' };
        })
      : fallbackMenuItems.map((item) => ({ label: item.label, onClick: () => onNavigate(item.id) }));

  const toggleHighContrast = () => {
    const nextState = !isHighContrast;
    setIsHighContrast(nextState);
    if (nextState) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const handleFontIncrease = () => {
    if (fontSizeScale < 1.3) setFontSizeScale(fontSizeScale + 0.1);
  };

  const handleFontDecrease = () => {
    if (fontSizeScale > 0.9) setFontSizeScale(fontSizeScale - 0.1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`جستجو برای عبارت "${searchQuery}" در تارنمای مسکن و شهرسازی یزد...`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-40 w-full text-white transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-xl bg-[#152843]/95 shadow-2xl border-b border-white/20 py-0.5' 
        : 'backdrop-blur-md bg-[#1F3A5F]/80 shadow-lg border-b border-white/10'
    }`}>
      {/* Top Bar */}
      <div className="bg-black/20 backdrop-blur-md py-2 px-4 text-xs font-medium flex flex-wrap justify-between items-center border-b border-white/10">
        <div className="flex items-center space-x-4 space-x-reverse">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-phone text-[#2A9D8F]"></i>
            <span className="font-mono">۰۳۵-۳۶۲۳۶۲۰۰</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 opacity-90">
            <i className="fa-solid fa-clock text-[#2A9D8F]"></i>
            <span>{t('yazdrud.header.workingHours')}</span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1 opacity-90">
            <i className="fa-solid fa-map-location-dot text-[#2A9D8F]"></i>
            <span>{t('yazdrud.header.address')}</span>
          </span>
        </div>

        {/* Accessibility & Tools */}
        <div className="flex items-center gap-3">
          {/* Font scale buttons */}
          <div className="flex items-center bg-white/10 rounded px-1.5 py-0.5 border border-white/15">
            <button
              onClick={handleFontIncrease}
              className="px-2 py-0.5 hover:bg-white/15 rounded transition-colors text-[11px]"
              title="افزایش اندازه قلم (A+)"
              aria-label="افزایش اندازه قلم"
            >
              الف <i className="fa-solid fa-plus text-[8px] mr-0.5"></i>
            </button>
            <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
            <button
              onClick={handleFontDecrease}
              className="px-2 py-0.5 hover:bg-white/15 rounded transition-colors text-[11px]"
              title="کاهش اندازه قلم (A-)"
              aria-label="کاهش اندازه قلم"
            >
              الف <i className="fa-solid fa-minus text-[8px] mr-0.5"></i>
            </button>
          </div>

          {/* High Contrast Button */}
          <button
            onClick={toggleHighContrast}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs border ${
              isHighContrast
                ? 'bg-[#2A9D8F] text-white border-transparent'
                : 'bg-white/10 hover:bg-white/20 border-white/20'
            }`}
            title={t('yazdrud.header.highContrast')}
            aria-label={t('yazdrud.header.highContrast')}
          >
            <i className="fa-solid fa-eye-low-vision"></i>
            <span className="hidden lg:inline">{t('yazdrud.header.highContrast')}</span>
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1 px-2.5 rounded bg-white/10 hover:bg-white/20 transition-all text-xs border border-white/20 flex items-center gap-1"
            title={t('yazdrud.header.search')}
            aria-label={t('yazdrud.header.search')}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span className="hidden sm:inline">{t('yazdrud.header.search')}</span>
          </button>

        </div>
      </div>

      {/* Main Header / Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
        {/* Logo and Org Name */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 text-right cursor-pointer group text-white border-0 bg-transparent p-0"
        >
          {/* Logo Image */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <img 
              src="/assets/images/logo-white.png" 
              alt="لوگو اداره کل راه و شهرسازی استان یزد"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm md:text-base lg:text-lg font-black tracking-tight text-white group-hover:text-[#E7D3B1] transition-colors">
              {t('yazdrud.header.orgName')}
            </h1>
            <p className="text-[10px] md:text-xs text-[#E7D3B1] font-bold">
              {t('yazdrud.header.tagline')}
            </p>
          </div>
        </button>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {resolvedMenuItems.map((item, i) =>
            item.href ? (
              <a
                key={i}
                href={item.href}
                target={item.target}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="px-3 py-2 text-sm font-bold rounded-lg hover:bg-white/10 hover:text-[#E7D3B1] active:scale-95 transition-all text-white/95"
              >
                {item.label}
              </a>
            ) : (
              <button
                key={i}
                onClick={item.onClick}
                className="px-3 py-2 text-sm font-bold rounded-lg hover:bg-white/10 hover:text-[#E7D3B1] active:scale-95 transition-all text-white/95"
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
          aria-label={t('yazdrud.header.openMenu')}
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      </div>

      {/* Floating Inline Search Panel */}
      {isSearchOpen && (
        <div className="bg-[#1F3A5F] py-3.5 px-4 shadow-inner border-b border-[#2A9D8F]/30 animate-fade-in-up">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={t('yazdrud.header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white text-gray-900 rounded-lg px-4 py-2 text-sm focus:ring-3 focus:ring-[#2A9D8F] focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                {t('yazdrud.header.searchSubmit')}
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {t('yazdrud.header.cancel')}
              </button>
            </form>
          </div>
        </div>
      )}

    </header>

      {/* Mobile Full-Screen Overlay Navigation - Portaled to body to escape header's backdrop-blur */}
      {createPortal(
        isMobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-between p-6 animate-fade-in-up" style={{ backgroundColor: '#0F2440' }}>
            <div>
              {/* Mobile Header Inside Menu */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg p-1 flex items-center justify-center shrink-0">
                    <img 
                      src="/assets/images/logo-white.png" 
                      alt="لوگو اداره کل راه و شهرسازی استان یزد"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white leading-tight">{t('yazdrud.header.orgName')}</h2>
                    <p className="text-[10px] text-[#E7D3B1] font-medium">{t('yazdrud.header.mobileTagline')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={t('yazdrud.header.closeMenu')}
                >
                  <i className="fa-solid fa-xmark text-lg text-white"></i>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-2">
                {resolvedMenuItems.map((item, i) =>
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      target={item.target}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-right px-4 py-3 text-base font-bold text-white hover:bg-[#B76E4C] rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <i className="fa-solid fa-chevron-left text-xs opacity-65"></i>
                    </a>
                  ) : (
                    <button
                      key={i}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        item.onClick?.();
                      }}
                      className="w-full text-right px-4 py-3 text-base font-bold text-white hover:bg-[#B76E4C] rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <i className="fa-solid fa-chevron-left text-xs opacity-65"></i>
                    </button>
                  )
                )}
              </nav>
            </div>

            {/* Mobile Menu Footer Info */}
            <div className="border-t border-white/10 pt-4 text-center">
              <p className="text-xs text-[#E7D3B1] mb-2">تلفن گویا پشتیبانی خدمات الکترونیک:</p>
              <p className="text-lg font-bold text-white font-mono">۰۳۵-۳۶۲۳۵۰۶۰</p>
            </div>
          </div>
        ),
        document.body
      )}
    </>
  );
}
