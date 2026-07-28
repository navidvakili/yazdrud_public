import React, { useState, useEffect } from 'react';
import { apiGet } from '../api';
import { NewsItem } from '../types';

interface NewsProps {
  fontSizeScale: number;
  onNavigate?: (page: string, newsId?: number) => void;
}

export default function News({ fontSizeScale, onNavigate }: NewsProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('همه');
  const [newsSearch, setNewsSearch] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ data: NewsItem[] }>('news?per_page=20');
      setNewsList(res.data || []);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری اخبار');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique category names from news list
  const allCategories = React.useMemo(() => {
    const cats = new Set<string>();
    newsList.forEach(n => {
      if (n.category_name) cats.add(n.category_name);
    });
    return ['همه', ...Array.from(cats)];
  }, [newsList]);

  // Format date to Persian readable
  const formatDate = (iso: string | null): string => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const filteredNews = newsList.filter(news => {
    const matchesCategory = activeCategoryFilter === 'همه' || news.category_name === activeCategoryFilter;
    const matchesSearch = !newsSearch
      || news.title.includes(newsSearch)
      || (news.summary && news.summary.includes(newsSearch));
    return matchesCategory && matchesSearch;
  });

  // Generate a deterministic color from category name
  const getCategoryColor = (name: string | null): string => {
    const colors: Record<string, string> = {
      'راه': '#2A9D8F',
      'مسکن': '#B76E4C',
      'شهرسازی': '#1F3A5F',
      'بازآفرینی': '#C98A5A',
      'مناقصات': '#E76F51',
      'سازمانی': '#264653',
    };
    return name && colors[name] ? colors[name] : '#B76E4C';
  };

  return (
    <section
      id="news"
      className="py-16 px-4 max-w-7xl mx-auto"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-[#B76E4C] font-bold text-sm tracking-wider block mb-2">
          📰 رویدادها و تصمیمات کلیدی
        </span>
        <h3 className="text-3xl font-black text-[#1F3A5F]">آخرین اخبار و اطلاعیه‌ها</h3>
        <p className="text-gray-600 text-sm font-semibold mt-2 max-w-md mx-auto">
          جدیدترین اخبار مسکن ملی، افتتاح کلان پروژه‌های راه و بهسازی بافت تاریخی شهرهای یزد
        </p>
        <div className="w-16 h-1 bg-[#B76E4C] mx-auto mt-3 rounded"></div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 glass-panel p-4 rounded-2xl border border-white/40 shadow-md">
        {/* Category Toggles */}
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-[#1F3A5F] text-white shadow-sm'
                  : 'bg-white/75 text-[#1F3A5F] border border-white/50 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="جستجو در آرشیو اخبار..."
            value={newsSearch}
            onChange={(e) => setNewsSearch(e.target.value)}
            className="w-full bg-white/70 border border-white/45 rounded-lg pr-9 pl-4 py-2 text-xs focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none focus:bg-white transition-all"
          />
          <i className="fa-solid fa-magnifying-glass absolute right-3 top-3 text-gray-400 text-xs"></i>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#1F3A5F]/20 border-t-[#1F3A5F] rounded-full animate-spin" />
            <span className="text-sm text-gray-500 font-semibold">در حال بارگذاری اخبار...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-16 px-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
            <i className="fa-solid fa-circle-exclamation text-red-400 text-3xl mb-3"></i>
            <p className="text-red-700 text-sm font-bold mb-2">خطا در دریافت اطلاعات</p>
            <p className="text-red-500 text-xs mb-4">{error}</p>
            <button
              onClick={loadNews}
              className="px-5 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      )}

      {/* News Grid (3 Columns) */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredNews.map((news) => (
            <article
              key={news.id}
              onClick={() => {
                if (onNavigate) onNavigate('news', news.id);
              }}
              className="group glass-card rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between cursor-pointer border border-white/35"
            >
              <div>
                {/* Image with Tag Overlay */}
                <div className="relative h-48 overflow-hidden">
                  {news.image_url ? (
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F3A5F]/10 to-[#B76E4C]/10">
                      <i className="fa-solid fa-newspaper text-4xl text-gray-300"></i>
                    </div>
                  )}
                  <span
                    className="absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow"
                    style={{ backgroundColor: getCategoryColor(news.category_name) }}
                  >
                    {news.category_name || 'عمومی'}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-calendar-day text-[#2A9D8F]"></i>
                      <span>{formatDate(news.published_at || news.created_at)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-eye text-[#2A9D8F]"></i>
                      <span>{news.views_count.toLocaleString('fa-IR')} بازدید</span>
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-[#1F3A5F] leading-snug group-hover:text-[#B76E4C] transition-colors">
                    {news.title}
                  </h4>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3">
                    {news.summary || news.content?.slice(0, 150) + '...'}
                  </p>
                </div>
              </div>

              {/* Read More Footer */}
              <div className="p-5 pt-0 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#1F3A5F] group-hover:text-[#2A9D8F] transition-colors">
                <span>مطالعه کامل خبر</span>
                <i className="fa-solid fa-arrow-left-long group-hover:-translate-x-1 transition-transform"></i>
              </div>
            </article>
          ))}

          {filteredNews.length === 0 && (
            <div className="col-span-1 md:col-span-3 text-center py-12 text-gray-500 text-sm font-semibold">
              هیچ خبری منطبق با جستجو یا دسته انتخابی شما یافت نشد.
            </div>
          )}
        </div>
      )}

      {/* Bottom Archive Trigger */}
      <div className="text-center mt-12">
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate('news');
            } else {
              alert('شما در حال حاضر به آخرین آرشیو سال ۱۴۰۵ اداره کل یزد دسترسی دارید.');
            }
          }}
          className="px-6 py-3 rounded-lg border-2 border-[#1F3A5F] text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-white font-bold text-xs md:text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
        >
          <i className="fa-solid fa-folder-open text-[#2A9D8F]"></i>
          <span>مشاهده آرشیو جامع اخبار و اطلاعیه‌ها</span>
        </button>
      </div>
    </section>
  );
}
