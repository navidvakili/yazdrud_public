import React, { useState } from 'react';
import { NEWS_DATA } from '../data';
import { NewsItem } from '../types';

interface NewsProps {
  fontSizeScale: number;
  onNavigate?: (page: string, newsId?: number) => void;
}

export default function News({ fontSizeScale, onNavigate }: NewsProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('همه');
  const [newsList, setNewsList] = useState<NewsItem[]>(NEWS_DATA);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsViews, setNewsViews] = useState<{ [key: number]: number }>({
    1: NEWS_DATA[0].views,
    2: NEWS_DATA[1].views,
    3: NEWS_DATA[2].views,
  });

  const handleOpenNews = (news: NewsItem) => {
    // Increment simulated views
    setNewsViews(prev => ({
      ...prev,
      [news.id]: (prev[news.id] || news.views) + 1
    }));
    if (onNavigate) {
      onNavigate('news', news.id);
    }
  };

  const categories = ['همه', 'مسکن', 'راه', 'شهرسازی'];

  const filteredNews = newsList.filter(news => {
    const matchesCategory = activeCategoryFilter === 'همه' || news.category === activeCategoryFilter;
    const matchesSearch = news.title.includes(newsSearch) || news.summary.includes(newsSearch);
    return matchesCategory && matchesSearch;
  });

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
          {categories.map((cat) => (
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

      {/* News Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredNews.map((news) => (
          <article
            key={news.id}
            onClick={() => handleOpenNews(news)}
            className="group glass-card rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between cursor-pointer border border-white/35"
          >
            <div>
              {/* Image with Tag Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 right-3 bg-[#B76E4C] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                  {news.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-calendar-day text-[#2A9D8F]"></i>
                    <span>{news.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-eye text-[#2A9D8F]"></i>
                    <span>{(newsViews[news.id] || news.views).toLocaleString('fa-IR')} بازدید</span>
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-[#1F3A5F] leading-snug group-hover:text-[#B76E4C] transition-colors">
                  {news.title}
                </h4>

                <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3">
                  {news.summary}
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
