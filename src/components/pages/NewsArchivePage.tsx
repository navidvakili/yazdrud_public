import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NEWS_DATA } from '../../data';
import { NewsItem, ActivePage } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface NewsArchivePageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage) => void;
  selectedNewsId?: number | null;
}

export default function NewsArchivePage({ fontSizeScale, onNavigate, selectedNewsId }: NewsArchivePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(
    selectedNewsId ? NEWS_DATA.find((n) => n.id === selectedNewsId) || null : null
  );

  useEffect(() => {
    if (selectedNewsId) {
      const match = NEWS_DATA.find((n) => n.id === selectedNewsId);
      if (match) {
        setActiveArticle(match);
      }
    } else {
      setActiveArticle(null);
    }
  }, [selectedNewsId]);

  // New comment form state
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<
    { id: number; name: string; date: string; text: string }[]
  >([
    {
      id: 1,
      name: 'مهندس حسینی (ناظر ساختمان)',
      date: '۴ تیر ۱۴۰۵',
      text: 'با تشکر از اطلاع‌رسانی به موقع. اجرای این پروژه‌ها به توسعه ایمن استان یزد کمک فراوانی می‌کند.',
    },
  ]);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const categories = ['همه', 'مسکن', 'راه', 'شهرسازی', 'بازآفرینی', 'مناقصات', 'سازمانی'];

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'همه' || item.category === selectedCategory;
    const matchesSearch =
      item.title.includes(searchQuery) ||
      item.summary.includes(searchQuery) ||
      item.content.includes(searchQuery) ||
      (item.tags && item.tags.some((t) => t.includes(searchQuery)));
    return matchesCategory && matchesSearch;
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    const newEntry = {
      id: Date.now(),
      name: commentName,
      date: 'هم‌اکنون',
      text: commentText,
    };
    setCommentsList([newEntry, ...commentsList]);
    setCommentName('');
    setCommentText('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  const newsBreadcrumbItems = activeArticle
    ? [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        {
          label: 'اخبار و اطلاع‌رسانی',
          onClick: () => {
            setActiveArticle(null);
            setSelectedCategory('همه');
          },
        },
        {
          label: `دسته: ${activeArticle.category}`,
          onClick: () => {
            setActiveArticle(null);
            setSelectedCategory(activeArticle.category);
          },
        },
        { label: activeArticle.title, active: true },
      ]
    : selectedCategory !== 'همه'
    ? [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        { label: 'اخبار و اطلاع‌رسانی', onClick: () => setSelectedCategory('همه') },
        { label: `دسته: ${selectedCategory}`, active: true },
      ]
    : [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        { label: 'آرشیو جامع اخبار و اطلاعیه‌ها', active: true },
      ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 text-[#1F3A5F]" style={{ fontSize: `${16 * fontSizeScale}px` }}>
      <Breadcrumb
        currentPage="news"
        pageTitle="اخبار و اطلاع‌رسانی"
        items={newsBreadcrumbItems}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <AnimatePresence mode="wait">
          {/* ARTICLE READER DETAIL VIEW */}
          {activeArticle ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Back to archive header */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <i className="fa-solid fa-arrow-right"></i>
                  <span>بازگشت به لیست آرشیو اخبار</span>
                </button>

                <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                  <span className="bg-[#2A9D8F]/15 text-[#2A9D8F] px-3 py-1 rounded-full font-black">
                    کد خبر: {activeArticle.code || 'NEWS-1405'}
                  </span>
                  <span><i className="fa-solid fa-[#2A9D8F] fa-eye ml-1"></i> {activeArticle.views} بازدید</span>
                </div>
              </div>

              {/* Main Article Content Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200/80 space-y-8">
                {/* Article Header */}
                <div className="space-y-4 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-3 text-xs text-[#B76E4C] font-extrabold">
                    <span className="px-3 py-1 bg-[#B76E4C]/10 rounded-lg">دسته‌بندی: {activeArticle.category}</span>
                    <span>•</span>
                    <span>تاریخ انتشار: {activeArticle.date}</span>
                    {activeArticle.author && (
                      <>
                        <span>•</span>
                        <span>منبع: {activeArticle.author}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-[#1F3A5F] leading-tight">
                    {activeArticle.title}
                  </h2>

                  <p className="text-sm sm:text-base text-gray-600 font-bold leading-relaxed bg-[#F5F6F8] p-4 rounded-2xl border-r-4 border-[#2A9D8F]">
                    {activeArticle.summary}
                  </p>
                </div>

                {/* Main Hero Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-md max-h-[480px]">
                  <img
                    src={activeArticle.image}
                    alt={activeArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold">
                    تصویر مربوط به گزارش خبر - اداره کل راه و شهرسازی استان یزد
                  </div>
                </div>

                {/* Article Body Paragraphs */}
                <div className="prose max-w-none text-gray-800 leading-loose text-sm sm:text-base font-semibold space-y-4">
                  <p>{activeArticle.content}</p>
                  <p>
                    این طرح در راستای چشم‌انداز توسعه متوازن استان یزد، ارتقای زیرساخت‌های حمل‌ونقل و تأمین مسکن شایسته برای خانواده‌های یزدی اجرا شده است. کلیه ناظران فنی و مسئولان ذی‌ربط بر نحوه اجرای استاندارد و مطابق ضوابط ملی ساختمان نظارت مستمر دارند.
                  </p>
                </div>

                {/* Gallery if available */}
                {activeArticle.gallery && activeArticle.gallery.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-black text-[#1F3A5F] flex items-center gap-2">
                      <i className="fa-solid fa-images text-[#2A9D8F]"></i>
                      <span>گالری تصاویر گزارش</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeArticle.gallery.map((gImg, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-48">
                          <img src={gImg} alt="گالری خبر" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments Section */}
                {activeArticle.pdfAttachment && (
                  <div className="bg-[#1F3A5F]/5 border border-[#1F3A5F]/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#B76E4C] text-white rounded-xl flex items-center justify-center text-xl shadow-md">
                        <i className="fa-solid fa-file-pdf"></i>
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-[#1F3A5F]">پیوست رسمی اطلاعیه</h5>
                        <p className="text-xs text-gray-500 font-bold">{activeArticle.pdfAttachment}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`در حال دانلود فایل پیوست: ${activeArticle.pdfAttachment}`)}
                      className="px-5 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <i className="fa-solid fa-download"></i>
                      <span>دانلود فایل PDF</span>
                    </button>
                  </div>
                )}

                {/* Article Tags */}
                {activeArticle.tags && (
                  <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-gray-100">
                    <span className="text-xs font-black text-gray-500">برچسب‌ها:</span>
                    {activeArticle.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments & Discussion Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-200 space-y-6">
                <h3 className="text-xl font-black text-[#1F3A5F] flex items-center gap-2">
                  <i className="fa-solid fa-comments text-[#2A9D8F]"></i>
                  <span>نظرات شهروندان و ذی‌نفعان</span>
                </h3>

                {/* Comment list */}
                <div className="space-y-4">
                  {commentsList.map((c) => (
                    <div key={c.id} className="bg-[#F5F6F8] p-4 rounded-2xl border border-gray-200 space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-[#1F3A5F]">
                        <span>{c.name}</span>
                        <span className="text-gray-400">{c.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 font-semibold">{c.text}</p>
                    </div>
                  ))}
                </div>

                {/* Submit new comment form */}
                <form onSubmit={handleAddComment} className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-black text-[#1F3A5F]">ارسال نظر جدید:</h4>

                  {commentSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>نظر شما با موفقیت دریافت شد و پس از بررسی منتشر خواهد شد.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="نام و نام خانوادگی یا عنوان شغلی"
                      required
                      className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="متن نظر یا پیشنهاد شما..."
                    rows={3}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:border-[#2A9D8F] focus:outline-none"
                  ></textarea>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>ثبت و ارسال نظر</span>
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* ARCHIVE GRID VIEW */
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Search & Filter Header Control Bar */}
              <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-200/80 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  {/* Category Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-[#1F3A5F] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-80">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="جستجو در عنوان یا متن اخبار..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-[#1F3A5F] focus:outline-none focus:border-[#2A9D8F]"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  </div>
                </div>
              </div>

              {/* News Grid */}
              {filteredNews.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 space-y-3">
                  <i className="fa-solid fa-newspaper text-4xl text-gray-300"></i>
                  <h4 className="font-extrabold text-[#1F3A5F]">خبری یافت نشد</h4>
                  <p className="text-xs text-gray-500 font-semibold">عبارت دیگری را برای جستجو وارد کنید.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNews.map((news) => (
                    <motion.div
                      key={news.id}
                      whileHover={{ y: -6 }}
                      onClick={() => setActiveArticle(news)}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image banner */}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          <img
                            src={news.image}
                            alt={news.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 right-3 bg-[#1F3A5F]/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                            {news.category}
                          </span>
                        </div>

                        {/* Article Info */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
                            <span><i className="fa-regular fa-calendar ml-1 text-[#2A9D8F]"></i> {news.date}</span>
                            <span><i className="fa-regular fa-eye ml-1"></i> {news.views}</span>
                          </div>

                          <h3 className="text-base font-extrabold text-[#1F3A5F] group-hover:text-[#B76E4C] transition-colors leading-snug">
                            {news.title}
                          </h3>

                          <p className="text-xs text-gray-600 line-clamp-3 font-semibold leading-relaxed">
                            {news.summary}
                          </p>
                        </div>
                      </div>

                      {/* Footer Read Action */}
                      <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#2A9D8F]">
                        <span>مطالعه کامل خبر</span>
                        <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
