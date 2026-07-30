// ============================================================
// DevelopmentTimeline — روند توسعه و تحول عمران شهری و جاده‌ای
//
// نمایش تایم‌لاین رویدادهای توسعه عمرانی در صفحه اصلی وب‌سایت
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { apiGet } from '../api';

interface TimelineItem {
  id: number;
  title: string;
  description: string | null;
  year: string;
  icon: string | null;
  image_url: string | null;
  type: 'road' | 'urban' | 'both';
  sort_order: number;
}

interface DevelopmentTimelineProps {
  fontSizeScale: number;
}

const typeLabels: Record<string, string> = {
  road: 'راه‌سازی',
  urban: 'عمران شهری',
  both: 'توسعه عمرانی',
};

export default function DevelopmentTimeline({ fontSizeScale }: DevelopmentTimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const result = await apiGet<{ success: boolean; data: TimelineItem[] }>('development-timeline');
        if (!cancelled && result.success) {
          setItems(result.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Error loading development timeline:', err);
          setError(null); // Silently fail — don't show error to users
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Intersection Observer for scroll-based animation
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setActiveIndex((prev) => (prev === null ? index : prev));
          }
        });
      },
      { threshold: 0.3 }
    );

    const cards = sectionRef.current?.querySelectorAll('.timeline-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [items]);

  if (loading || items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="development-timeline"
      className="py-16 px-6 max-w-7xl mx-auto relative"
    >
      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-[#1F3A5F]/10 text-[#1F3A5F] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
          <i className="fa-solid fa-road"></i>
          <span>گام‌های توسعه</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-[#1F3A5F] mb-3">
          روند توسعه و تحول عمران شهری و جاده‌ای یزد
        </h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed font-semibold">
          استان یزد با بهره‌گیری از توان مهندسان و متخصصان داخلی، گام‌های بلندی در مسیر توسعه
          زیرساخت‌های عمرانی و حمل‌ونقل برداشته است.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute right-4 md:right-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2A9D8F] via-[#B76E4C] to-[#1F3A5F] opacity-30 rounded-full"></div>

        <div className="space-y-8">
          {items.map((item, index) => {
            const isLeft = index % 2 === 0;
            const isActive = activeIndex !== null && index <= activeIndex;

            return (
              <div
                key={item.id}
                data-index={index}
                className={`timeline-card relative flex flex-col md:flex-row items-start gap-4 md:gap-8 transition-all duration-700 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Content Card */}
                <div
                  className={`flex-1 group ${
                    isLeft ? 'md:text-left md:pr-0 md:pl-0' : 'md:text-left md:pr-0 md:pl-0'
                  } ${isLeft ? 'md:ml-auto md:pl-12' : 'md:mr-auto md:pr-12'}`}
                  style={isLeft ? { paddingRight: '0' } : { paddingLeft: '0' }}
                >
                  <div
                    className={`relative p-5 md:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                      isActive
                        ? 'bg-white/90 border-white/60 shadow-lg'
                        : 'bg-white/50 border-white/30'
                    }`}
                  >
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                          item.type === 'road'
                            ? 'bg-[#B76E4C]/10 text-[#B76E4C]'
                            : item.type === 'urban'
                            ? 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                            : 'bg-[#1F3A5F]/10 text-[#1F3A5F]'
                        }`}
                      >
                        <i
                          className={`${
                            item.icon || (item.type === 'road' ? 'fa-solid fa-road' : item.type === 'urban' ? 'fa-solid fa-city' : 'fa-solid fa-compass')
                          }`}
                        ></i>
                        <span>{typeLabels[item.type]}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[#1F3A5F] mb-2">{item.title}</h3>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    )}

                    {/* Image */}
                    {item.image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-32 md:h-40 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Year Badge - Center */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-6 flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                      isActive
                        ? 'bg-[#1F3A5F] text-white scale-100'
                        : 'bg-white/80 text-gray-400 scale-90'
                    }`}
                  >
                    <i className="fa-solid fa-calendar text-xs"></i>
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full transition-all duration-500 ${
                      isActive
                        ? 'bg-[#1F3A5F]/10 text-[#1F3A5F]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {item.year}
                  </span>
                </div>

                {/* Mobile Year */}
                <div className="md:hidden flex items-center gap-2 pr-12">
                  <span className="text-xs font-bold text-[#B76E4C] bg-[#B76E4C]/10 px-2.5 py-0.5 rounded-full">
                    {item.year}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
