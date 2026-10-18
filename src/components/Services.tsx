import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { API, decodeHtmlEntities } from '../shared-utils';
import { ActivePage } from '../types';

interface ServicesProps {
  fontSizeScale: number;
  onNavigate?: (page: ActivePage, itemId?: number, itemTitle?: string, formSlug?: string) => void;
}

interface PublicFormCard {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  type: 'form' | 'survey' | 'quiz' | 'registration';
  theme: { primaryColor?: string } | null;
}

/** پالت چرخشی رنگ کارت — همان رنگ‌های برند سایت، برای فرم‌های بدون رنگ اختصاصی در تم */
const ACCENT_PALETTE = ['#1F3A5F', '#B76E4C', '#2A9D8F', '#C98A5A'];

/** آیکون هر نوع فرم — برای تمایز بصری فرم/پرسشنامه/آزمون/ثبت‌نام */
const TYPE_ICONS: Record<PublicFormCard['type'], string> = {
  form: 'fa-solid fa-file-pen',
  survey: 'fa-solid fa-square-poll-vertical',
  quiz: 'fa-solid fa-circle-question',
  registration: 'fa-solid fa-user-plus',
};

export default function Services({ fontSizeScale, onNavigate }: ServicesProps) {
  const [forms, setForms] = useState<PublicFormCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    API<{ data: PublicFormCard[] }>('forms/public-cards')
      .then((res) => {
        if (!cancelled) setForms(res.data || []);
      })
      .catch(() => {
        /* silent — خالی ماندن فهرست، بدون شکستن کل صفحهٔ اصلی */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenForm = (form: PublicFormCard) => {
    if (onNavigate) onNavigate('form', undefined, undefined, form.slug);
  };

  return (
    <section
      id="services"
      className="py-16 px-4 max-w-7xl mx-auto"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Yazd Architectural Decorative Tile Frame Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <span className="text-[#2A9D8F] font-bold text-sm tracking-widest block mb-2 uppercase">
          💠 پیشخوان خدمات هوشمند شهروندان
        </span>
        <h3 className="text-3xl md:text-4xl font-black text-[#1F3A5F] flex items-center justify-center gap-2">
          <i className="fa-solid fa-cubes text-[#B76E4C] text-2xl"></i>
          <span>خدمات الکترونیک اداره کل</span>
        </h3>
        <p className="text-[#C98A5A] text-sm md:text-base font-semibold max-w-xl mx-auto mt-3">
          برای تکمیل فرم‌ها و پرسشنامه‌های الکترونیک منتشرشده، روی یکی از موارد زیر کلیک کنید.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#2A9D8F] via-[#B76E4C] to-[#2A9D8F] mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 min-h-[190px] bg-white/40 border border-white/40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && forms.length === 0 && (
        <div className="glass-panel border border-white/60 rounded-2xl p-12 text-center text-[#1F3A5F]/60">
          <i className="fa-solid fa-file-circle-xmark text-3xl mb-3 block text-gray-300"></i>
          <p className="font-bold text-sm">در حال حاضر فرم منتشرشده‌ای برای نمایش وجود ندارد.</p>
        </div>
      )}

      {!loading && forms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {forms.map((form, index) => {
            const accent = form.theme?.primaryColor || ACCENT_PALETTE[index % ACCENT_PALETTE.length];
            return (
              <motion.button
                key={form.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenForm(form)}
                className="group relative glass-card rounded-2xl p-6 text-right transition-shadow duration-300 flex flex-col justify-between min-h-[190px] focus:outline-none cursor-pointer border border-white/40 hover:border-[#2A9D8F]/50 shadow-md hover:shadow-xl"
              >
                {/* Tile Background Decor */}
                <div className="absolute top-2 left-2 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none text-2xl">
                  <i className="fa-solid fa-mosque"></i>
                </div>

                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm transition-transform group-hover:rotate-6"
                    style={{ backgroundColor: accent }}
                  >
                    <i className={`${TYPE_ICONS[form.type] || TYPE_ICONS.form} text-lg`}></i>
                  </div>
                  <h4 className="text-base font-extrabold text-[#1F3A5F] mb-2 group-hover:text-[#B76E4C] transition-colors">
                    {decodeHtmlEntities(form.title)}
                  </h4>
                  {form.description && (
                    <p className="text-xs text-gray-600 font-bold leading-relaxed line-clamp-3">
                      {decodeHtmlEntities(form.description)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 text-xs font-bold text-[#2A9D8F] mt-4 opacity-85 group-hover:opacity-100">
                  <span>تکمیل فرم</span>
                  <i className="fa-solid fa-arrow-left-long text-[10px] group-hover:-translate-x-1 transition-transform"></i>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}
