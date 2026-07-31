import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Stats from './components/Stats';
import News from './components/News';
import Map from './components/Map';
import Footer from './components/Footer';

import NewsArchivePage from './components/pages/NewsArchivePage';
import LandAllocationPage from './components/pages/LandAllocationPage';
import UrbanPlanningPage from './components/pages/UrbanPlanningPage';
import RoadsTransportPage from './components/pages/RoadsTransportPage';
import ServicesPage from './components/pages/ServicesPage';
import { ActivePage } from './types';
import {
  resolveRoute,
  buildRoute,
  getInitialRoute,
  updatePageMeta,
  updateCanonical,
  RouteKey,
} from './router';

export default function App() {
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // ========== مسیریابی مبتنی بر URL ==========

  /** تنظیم صفحه و متا از روی RouteKey */
  const applyRoute = (routeKey: RouteKey, extra?: { newsId?: number; newsTitle?: string }) => {
    setCurrentPage(routeKey as ActivePage);
    if (routeKey === 'news') {
      setSelectedNewsId(extra?.newsId ?? null);
    }
    updatePageMeta(routeKey, extra?.newsTitle || undefined);
    updateCanonical(buildRoute(routeKey, extra));
  };

  /** به‌روزرسانی URL بدون رفرش */
  const pushUrl = (routeKey: RouteKey, extra?: { newsId?: number; newsTitle?: string }) => {
    const url = buildRoute(routeKey, extra);
    window.history.pushState({ page: routeKey, ...extra }, '', url);
    applyRoute(routeKey, extra);
  };

  /** مقداردهی اولیه از URL */
  useEffect(() => {
    const initial = getInitialRoute();
    applyRoute(initial.page, initial.newsId ? { newsId: initial.newsId } : undefined);
    setSelectedNewsId(initial.newsId ?? null);

    // گوش دادن به دکمه‌های بازگشت/جلو مرورگر
    const handlePopState = (e: PopStateEvent) => {
      const route = resolveRoute(window.location.pathname);
      applyRoute(route.page, route.newsId ? { newsId: route.newsId } : undefined);
      setSelectedNewsId(route.newsId ?? null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = (pageOrSection: string, itemId?: number, itemTitle?: string) => {
    if (pageOrSection === 'news' || pageOrSection === 'news-archive') {
      pushUrl('news', itemId ? { newsId: itemId, newsTitle: itemTitle } : undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'services' || pageOrSection === 'e-services') {
      pushUrl('services', itemId ? { newsId: itemId } : undefined);
      setSelectedServiceId(itemId || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'land-allocation' || pageOrSection === 'housing-movement') {
      pushUrl('land-allocation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'urban-planning') {
      pushUrl('urban-planning');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'roads-transport') {
      pushUrl('roads-transport');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'home' || pageOrSection === 'hero') {
      pushUrl('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (currentPage !== 'home') {
        pushUrl('home');
        // Home content (hero slider, news thumbnails, map) loads async from the API.
        // A fixed delay scrolls too early: when images/data arrive, the page grows and
        // the target moves down — leaving the viewport on the wrong section. So wait
        // until the target exists and its document position stops changing, then scroll.
        setTimeout(() => {
          let lastTop = -1;
          let stableCount = 0;
          let tries = 0;
          const scrollToTarget = (target: HTMLElement) =>
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          const waitUntilStable = () => {
            tries += 1;
            const target = document.getElementById(pageOrSection);
            if (!target) {
              // Section not mounted yet — keep polling (bounded ~7.5s).
              if (tries < 30) setTimeout(waitUntilStable, 250);
              else window.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
            const top = target.getBoundingClientRect().top + window.scrollY;
            if (top === lastTop) stableCount += 1;
            else {
              stableCount = 0;
              lastTop = top;
            }
            // Two identical reads (~500ms apart) ⇒ layout has settled.
            if (stableCount >= 2 || tries >= 30) scrollToTarget(target);
            else setTimeout(waitUntilStable, 250);
          };
          waitUntilStable();
        }, 150);
      } else {
        const targetElement = document.getElementById(pageOrSection);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between selection:bg-[#2A9D8F] selection:text-white relative overflow-hidden"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Dynamic Luminous Blobs for Glass Blur Effect */}
      <div className="absolute top-[8%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#B76E4C]/25 blur-[120px] pointer-events-none animate-float-1 z-0"></div>
      <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#2A9D8F]/20 blur-[140px] pointer-events-none animate-float-2 z-0"></div>
      <div className="absolute bottom-[20%] left-[5%] w-[380px] h-[380px] rounded-full bg-[#C98A5A]/25 blur-[110px] pointer-events-none animate-float-1 z-0"></div>

      {/* Persistent Header */}
      <Header
        fontSizeScale={fontSizeScale}
        setFontSizeScale={setFontSizeScale}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        onNavigate={handleNavigate}
      />

      {/* CONDITIONAL PAGE RENDERING */}
      {currentPage === 'news' && (
        <main className="flex-grow z-10">
          <NewsArchivePage
            fontSizeScale={fontSizeScale}
            onNavigate={(pg) => handleNavigate(pg)}
            selectedNewsId={selectedNewsId}
          />
        </main>
      )}

      {currentPage === 'land-allocation' && (
        <main className="flex-grow z-10">
          <LandAllocationPage
            fontSizeScale={fontSizeScale}
            onNavigate={(pg) => handleNavigate(pg)}
          />
        </main>
      )}

      {currentPage === 'urban-planning' && (
        <main className="flex-grow z-10">
          <UrbanPlanningPage
            fontSizeScale={fontSizeScale}
            onNavigate={(pg) => handleNavigate(pg)}
          />
        </main>
      )}

      {currentPage === 'roads-transport' && (
        <main className="flex-grow z-10">
          <RoadsTransportPage
            fontSizeScale={fontSizeScale}
            onNavigate={(pg) => handleNavigate(pg)}
          />
        </main>
      )}

      {currentPage === 'services' && (
        <main className="flex-grow z-10">
          <ServicesPage
            fontSizeScale={fontSizeScale}
            onNavigate={handleNavigate}
            initialServiceId={selectedServiceId}
          />
        </main>
      )}

      {currentPage === 'home' && (
        <>
          {/* Full Screen Hero Slider */}
          <Hero onNavigate={handleNavigate} />

          {/* Main Sections */}
          <main className="flex-grow relative z-10">
            {/* Animated Ticker / Important announcement */}
            <div className="backdrop-blur-md bg-white/20 border-y border-white/30 text-[#1F3A5F] py-2.5 px-4 text-xs font-bold overflow-hidden shadow-sm flex items-center justify-center gap-4">
              <span className="bg-[#1F3A5F] text-white px-2.5 py-0.5 rounded text-[10px] animate-pulse">
                اطلاعیه ویژه
              </span>
              <p className="marquee whitespace-nowrap text-center">
                ثبت‌نام مجدد متقاضیان سه فرزندی طرح قانون حمایت از خانواده و جوانی جمعیت در استان یزد آغاز شد.
              </p>
            </div>

            {/* Services / e-Services */}
            <div id="services">
              <Services fontSizeScale={fontSizeScale} onNavigate={handleNavigate} />
            </div>

            {/* Dynamic Organization Counter / Statistics */}
            <div id="stats">
              <Stats fontSizeScale={fontSizeScale} />
            </div>

            {/* Latest News */}
            <div id="news">
              <News fontSizeScale={fontSizeScale} onNavigate={handleNavigate} />
            </div>

            {/* Interactive Map */}
            <div id="interactive-map">
              <Map fontSizeScale={fontSizeScale} />
            </div>

            {/* Citizen Feedback Survey Section */}
            <section className="py-12 px-6 max-w-4xl mx-auto glass-panel border border-white/50 rounded-3xl mb-16 text-center shadow-lg relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 text-9xl opacity-5 text-[#B76E4C] pointer-events-none">
                <i className="fa-solid fa-hotel"></i>
              </div>

              <div className="relative z-10 space-y-4">
                <h4 className="text-xl font-black text-[#1F3A5F]">دیدگاه شما سازنده فرداست</h4>
                <p className="text-xs text-gray-600 font-semibold max-w-xl mx-auto leading-relaxed">
                  آیا از تنوع و سرعت خدمات هوشمند پورتال راه و شهرسازی یزد رضایت دارید؟ بازخورد شما به مدیران کل در بهبود فرآیند واگذاری زمین و توسعه جاده‌های استان یاری می‌رساند.
                </p>

                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={() =>
                      alert('ممنون از رای مثبت و انتخاب شما. ما همواره در جهت بهسازی کیفیت خدمات کوشا هستیم.')
                    }
                    className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-smile"></i>
                    <span>بله، کاملاً رضایت دارم</span>
                  </button>
                  <button
                    onClick={() =>
                      alert('پیام دریافت شد. لطفاً مشکلات پورتال را از طریق سامانه ثبت شکایت مطرح نمایید تا سریعاً رسیدگی شود.')
                    }
                    className="bg-white/80 hover:bg-white text-[#1F3A5F] border border-white/60 font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-meh"></i>
                    <span>نیاز به بهبود دارد</span>
                  </button>
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {/* Footer */}
      <Footer fontSizeScale={fontSizeScale} onNavigate={handleNavigate} />
    </div>
  );
}
