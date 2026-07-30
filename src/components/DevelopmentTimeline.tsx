// ============================================================
// DevelopmentTimeline — روند توسعه و تحول عمران شهری و جاده‌ای
//
// نمایش آیتم‌های توسعه عمرانی در صفحه اصلی وب‌سایت
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { apiGet } from '../api';

interface TimelineItem {
  id: number;
  title: string;
  icon: string | null;
  value: string | null;
  value_index: string | null;
  sort_order: number;
  is_active: boolean;
}

interface DevelopmentTimelineProps {
  fontSizeScale: number;
}

const ICONS_META: Record<string, { label: string; color: string }> = {
  'fa-road':        { label: 'جاده',          color: '#B76E4C' },
  'fa-city':        { label: 'شهر',           color: '#1F3A5F' },
  'fa-building':    { label: 'ساختمان',       color: '#2A9D8F' },
  'fa-home':        { label: 'مسکن',          color: '#C98A5A' },
  'fa-train':       { label: 'قطار',          color: '#4A6FA5' },
  'fa-bus':         { label: 'اتوبوس',        color: '#E76F51' },
  'fa-car':         { label: 'خودرو',         color: '#6C757D' },
  'fa-tree':        { label: 'فضای سبز',      color: '#2D936C' },
  'fa-water':       { label: 'آب',            color: '#00B4D8' },
  'fa-bolt':        { label: 'برق',           color: '#FFD166' },
  'fa-cogs':        { label: 'تجهیزات',       color: '#6C5CE7' },
  'fa-hard-hat':    { label: 'ساخت‌وساز',     color: '#F4A261' },
  'fa-map-marked-alt': { label: 'نقشه',       color: '#264653' },
  'fa-industry':    { label: 'صنعت',          color: '#A8DADC' },
  'fa-hospital':    { label: 'بیمارستان',     color: '#E63946' },
  'fa-school':      { label: 'مدرسه',         color: '#7B2D8E' },
  'fa-university':  { label: 'دانشگاه',       color: '#3D5A80' },
  'fa-bridge':      { label: 'پل',            color: '#8D6E63' },
  'fa-rocket':      { label: 'پیشرفت',        color: '#E07A5F' },
  'fa-flag':        { label: 'افتتاح',        color: '#D62828' },
  'fa-user-graduate': { label: 'دانشجویان',    color: '#5B8DEF' },
  'fa-briefcase':     { label: 'اشتغال',       color: '#E67E22' },
  'fa-book-open':     { label: 'رشته تحصیلی',  color: '#8E44AD' },
  'fa-handshake':     { label: 'شریک علمی',    color: '#1ABC9C' },
  'fa-person-digging': { label: 'عمران',        color: '#B76E4C' },
  'fa-desktop':        { label: 'فناوری',       color: '#6C5CE7' },
};

/** Normalize icon class for FontAwesome 6 compatibility */
const normalizeIcon = (icon: string | null): string => {
  if (!icon) return 'fa-solid fa-road';
  if (icon.includes(' ')) return icon; // already has style prefix
  return `fa-solid ${icon}`;
};

/** Extract icon name from full class (e.g. "fa-solid fa-road" → "fa-road") */
const iconNameOnly = (icon: string | null): string => {
  if (!icon) return 'fa-road';
  const parts = icon.trim().split(/\s+/);
  return parts[parts.length - 1];
};

export default function DevelopmentTimeline({ fontSizeScale }: DevelopmentTimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const result = await apiGet<{ success: boolean; data: TimelineItem[] }>('development-timeline');
        if (!cancelled && result.success) {
          setItems(result.data);
        }
      } catch (err: any) {
        if (!cancelled) console.error('Error loading development timeline:', err);
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, index) => {
          const iconName = iconNameOnly(item.icon);
          const iconMeta = ICONS_META[iconName] || null;
          const iconClasses = normalizeIcon(item.icon);
          const delay = index * 100;

          return (
            <div
              key={item.id}
              className={`
                relative p-5 md:p-6 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm
                shadow-lg hover:shadow-xl transition-all duration-500 group
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: `${delay}ms` }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow-md mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: iconMeta?.color || '#1F3A5F' }}
              >
                <i className={iconClasses}></i>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-[#1F3A5F] mb-3">{item.title}</h3>

              {/* Value */}
              {item.value && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-[#1F3A5F]">
                    {item.value}
                  </span>
                  {item.value_index && (
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.value_index}
                    </span>
                  )}
                </div>
              )}

              {/* Index badge at bottom */}
              {!item.value && item.value_index && (
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                  {item.value_index}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
