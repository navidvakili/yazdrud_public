import { useEffect, useState } from 'react';
import { API } from '../shared-utils';

interface TimelineItem {
  id: number;
  title: string;
  icon: string | null;
  value: string | null;
  value_index: string | null;
  sort_order: number;
  is_active: boolean;
}

interface StatItem {
  target: number;
  label: string;
  suffix: string;
  icon: string;
  color: string;
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
  if (icon.includes(' ')) return icon;
  return `fa-solid ${icon}`;
};

/** Extract icon name from full class (e.g. "fa-solid fa-road" → "fa-road") */
const iconNameOnly = (icon: string | null): string => {
  if (!icon) return 'fa-road';
  const parts = icon.trim().split(/\s+/);
  return parts[parts.length - 1];
};

interface StatsProps {
  fontSizeScale: number;
}

export default function Stats({ fontSizeScale }: StatsProps) {
  const [items, setItems] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<number[]>([]);

  // Fetch stats from the Development Timeline API
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const result = await API<{ success: boolean; data: TimelineItem[] }>('development-timeline?lang=fa');
        if (!cancelled && result.success && result.data.length > 0) {
          const mapped: StatItem[] = result.data.map((item) => {
            const iconName = iconNameOnly(item.icon);
            const meta = ICONS_META[iconName] || { color: '#1F3A5F' };
            return {
              target: parseInt(item.value || '0', 10) || 0,
              label: item.title,
              suffix: item.value_index || '',
              icon: normalizeIcon(item.icon),
              color: meta.color,
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        if (!cancelled) console.error('Error loading stats:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Animated counter
  useEffect(() => {
    if (items.length === 0) return;

    const duration = 1500;
    const frameRate = 30;
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let currentFrame = 0;

    setCounts(new Array(items.length).fill(0));

    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newCounts = items.map((stat) => {
        const value = Math.round(stat.target * easeProgress);
        return value > stat.target ? stat.target : value;
      });
      setCounts(newCounts);

      if (currentFrame >= totalFrames) {
        setCounts(items.map((stat) => stat.target));
        clearInterval(timer);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [items]);

  if (loading || items.length === 0) return null;

  return (
    <section
      className="glass-panel-dark text-white py-16 px-6 shadow-2xl relative max-w-7xl mx-auto rounded-3xl border border-white/15 my-16 overflow-hidden"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Yazd Clay Arch Border Bottom Divider */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-white/5 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-[#E7D3B1]">
            روند توسعه و تحول عمران شهری و جاده‌ای یزد
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-xl mx-auto">
            آمار افتخارآمیز خدمت‌رسانی بی‌وقفه اداره کل راه و شهرسازی استان یزد به هموطنان گرانقدر در سال‌های اخیر
          </p>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center flex flex-col justify-between hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-white text-lg mb-4"
                   style={{ backgroundColor: stat.color }}>
                <i className={stat.icon}></i>
              </div>

              <div>
                {/* Big Animated Value */}
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
                  <span>{counts[index]?.toLocaleString('fa-IR') ?? 0}</span>
                  {stat.suffix && (
                    <span className="text-[#E7D3B1] text-base sm:text-lg lg:text-xl mr-1">{stat.suffix}</span>
                  )}
                </div>

                {/* Underline decorative */}
                <div className="w-12 h-0.5 mx-auto bg-white/20 my-2.5"></div>

                <p className="text-xs sm:text-sm text-[#E7D3B1] font-bold">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
