import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { API, decodeHtmlEntities, decodeAndStripHtml } from '../../shared-utils';
import { NewsItem, NewsComment, ActivePage } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface NewsArchivePageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage) => void;
  selectedNewsId?: number | null;
}

export default function NewsArchivePage({ fontSizeScale, onNavigate, selectedNewsId }: NewsArchivePageProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [articleDetail, setArticleDetail] = useState<NewsItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalNews, setTotalNews] = useState(0);
  const perPage = 12;

  useEffect(() => {
    loadNews();
  }, []);

  // Fetch full article detail (with content) when viewing a single article
  const fetchArticleDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await API<{ data: NewsItem }>(`news/${id}`);
      setArticleDetail(res.data);
      // Update active article with fresh comments count from detail
      if (res.data.comments_count !== undefined) {
        setActiveArticle(prev => prev && prev.id === id ? { ...prev, comments_count: res.data.comments_count } : prev);
      }
    } catch {
      // fallback: show what we have from list
      setArticleDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Load comments for an article
  const loadComments = async (newsId: number) => {
    setCommentsLoading(true);
    try {
      const res = await API<{ data: NewsComment[] }>(`news/${newsId}/comments`);
      setCommentsList(res.data || []);
    } catch {
      setCommentsList([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSelectArticle = (news: NewsItem) => {
    // Scroll to top when opening article detail
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setActiveArticle(news);
    fetchArticleDetail(news.id);
    loadComments(news.id);
    // به‌روزرسانی URL با عنوان خبر برای سئو
    const seoUrl = `/اخبار/${news.id}/${news.title.replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF\s-]/g, '').trim()}`;
    window.history.pushState({ page: 'news', newsId: news.id, newsTitle: news.title }, '', seoUrl);
    document.title = `${news.title} | آرشیو جامع اخبار و اطلاعیه‌ها | اداره کل راه و شهرسازی استان یزد`;

    // به‌روزرسانی لینک canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + seoUrl);
  };

  useEffect(() => {
    if (selectedNewsId && newsList.length > 0) {
      const match = newsList.find((n) => n.id === selectedNewsId);
      if (match) {
        setActiveArticle(match);
        fetchArticleDetail(match.id);
        loadComments(match.id);
      }
    } else if (!selectedNewsId) {
      setActiveArticle(null);
      setArticleDetail(null);
    }
  }, [selectedNewsId, newsList]);

  const loadNews = async () => {
    setLoading(true);
    try {
      // Fetch enough items for meaningful client-side pagination
      const res = await API<{ data: NewsItem[]; total: number }>('news?per_page=500&page=1');
      setNewsList(res.data || []);
      setTotalNews(res.total ?? 0);
      setCurrentPage(1);
      setLastPage(Math.ceil((res.data?.length || 0) / perPage));
    } catch {
      // silently fail — component shows empty state
    } finally {
      setLoading(false);
    }
  };

  // New comment form state
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<NewsComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Build categories dynamically from data
  const allCategories = React.useMemo(() => {
    const cats = new Set<string>();
    newsList.forEach(n => { if (n.category_name) cats.add(n.category_name); });
    return ['همه', ...Array.from(cats)];
  }, [newsList]);

  // Client-side filtering (category + search)
  const filteredNews = React.useMemo(() => {
    return newsList.filter((item) => {
      const matchesCategory = selectedCategory === 'همه' || item.category_name === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.title.includes(searchQuery) ||
        (item.summary && item.summary.includes(searchQuery)) ||
        (item.content && item.content.includes(searchQuery)) ||
        (item.tags && item.tags.some((t) => t.includes(searchQuery)));
      return matchesCategory && matchesSearch;
    });
  }, [newsList, selectedCategory, searchQuery]);

  // Client-side pagination slice
  const paginatedNews = React.useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredNews.slice(start, start + perPage);
  }, [filteredNews, currentPage]);

  // Update lastPage when filters change, and clamp currentPage if out of bounds
  const prevFilteredLen = React.useRef(0);
  useEffect(() => {
    const computedLastPage = Math.max(1, Math.ceil(filteredNews.length / perPage));
    setLastPage(computedLastPage);
    // Only clamp currentPage when filter results shrink (not on every render cycle)
    if (filteredNews.length < prevFilteredLen.current && currentPage > computedLastPage) {
      setCurrentPage(computedLastPage);
    }
    prevFilteredLen.current = filteredNews.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNews.length, perPage]);

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !activeArticle) return;
    setCommentSubmitting(true);
    try {
      const res = await API<{ message: string; data: NewsComment }>(`news/${activeArticle.id}/comments`, {
        author_name: commentName,
        content: commentText,
      }, 'POST');
      setCommentName('');
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (err: any) {
      // Comment still appears optimistically but will show error
      console.error('Error submitting comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const newsBreadcrumbItems = activeArticle
    ? [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        {
          label: 'اخبار و اطلاع‌رسانی',
          onClick: () => {
            setActiveArticle(null);
            setArticleDetail(null);
            setSelectedCategory('همه');
            window.history.pushState({ page: 'news' }, '', '/اخبار');
            document.title = 'آرشیو جامع اخبار و اطلاعیه‌ها | اداره کل راه و شهرسازی استان یزد';
          },
        },
        {
          label: `دسته: ${activeArticle.category_name || 'عمومی'}`,
          onClick: () => {
            setActiveArticle(null);
            setArticleDetail(null);
            if (activeArticle.category_name) setSelectedCategory(activeArticle.category_name);
            window.history.pushState({ page: 'news' }, '', '/اخبار');
            document.title = 'آرشیو جامع اخبار و اطلاعیه‌ها | اداره کل راه و شهرسازی استان یزد';
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
                onClick={() => {
                  setActiveArticle(null);
                  setArticleDetail(null);
                  window.history.pushState({ page: 'news' }, '', '/اخبار');
                  document.title = 'آرشیو جامع اخبار و اطلاعیه‌ها | اداره کل راه و شهرسازی استان یزد';
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                  className="px-4 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <i className="fa-solid fa-arrow-right"></i>
                  <span>بازگشت به لیست آرشیو اخبار</span>
                </button>

                <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                  <span className="bg-[#2A9D8F]/15 text-[#2A9D8F] px-3 py-1 rounded-full font-black">
                    کد خبر: NEWS-{activeArticle.id}
                  </span>
                  <span><i className="fa-solid fa-eye text-[#2A9D8F] ml-1"></i> {activeArticle.views_count} بازدید</span>
                </div>
              </div>

              {/* Main Article Content Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200/80 space-y-8">
                {/* Article Header */}
                <div className="space-y-4 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-3 text-xs text-[#B76E4C] font-extrabold flex-wrap">
                    <span className="px-3 py-1 bg-[#B76E4C]/10 rounded-lg">
                      دسته‌بندی: {activeArticle.category_name || 'عمومی'}
                    </span>
                    <span>•</span>
                    <span>تاریخ انتشار: {formatDate(activeArticle.published_at || activeArticle.created_at)}</span>
                    {activeArticle.author_name && (
                      <>
                        <span>•</span>
                        <span>منبع: {activeArticle.author_name}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-[#1F3A5F] leading-tight">
                    {activeArticle.title}
                  </h2>

                  {activeArticle.summary && (
                    <div className="text-sm sm:text-base text-gray-600 font-bold leading-relaxed bg-[#F5F6F8] p-4 rounded-2xl border-r-4 border-[#2A9D8F] [&_p]:mb-0"
                      dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(activeArticle.summary) }}
                    />
                  )}
                </div>

                {/* Main Hero Image */}
                {activeArticle.image_url && (
                  <div className="relative rounded-2xl overflow-hidden shadow-md max-h-[480px]">
                    <img
                      src={activeArticle.image_url}
                      alt={activeArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold">
                      {activeArticle.title}
                    </div>
                  </div>
                )}

                {/* Article Body */}
                <div className="prose max-w-none text-gray-800 leading-loose text-sm sm:text-base font-semibold space-y-4">
                  {detailLoading ? (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="w-8 h-8 border-4 border-[#1F3A5F]/20 border-t-[#1F3A5F] rounded-full animate-spin" />
                      <span className="text-sm text-gray-500 font-semibold">در حال دریافت متن خبر...</span>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities((articleDetail && articleDetail.content) || activeArticle.content || activeArticle.summary || '') }} />
                  )}
                </div>

                {/* Short Link — Copyable */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                    <span>🔗 لینک کوتاه:</span>
                    <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 font-mono text-xs dir-ltr">
                      yazdrud.ir/n/{activeArticle.id}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`yazdrud.ir/n/${activeArticle.id}`);
                        const btn = document.getElementById(`copy-btn-${activeArticle.id}`);
                        if (btn) {
                          const orig = btn.innerHTML;
                          btn.innerHTML = '✅ کپی شد!';
                          setTimeout(() => btn.innerHTML = orig, 2000);
                        }
                      }}
                      id={`copy-btn-${activeArticle.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-bold transition-all cursor-pointer"
                    >
                      کپی لینک
                    </button>
                  </div>
                </div>

                {/* Article Tags */}
                {activeArticle.tags && activeArticle.tags.length > 0 && (
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
              {activeArticle.comments_enabled !== false && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-200 space-y-6">
                <h3 className="text-xl font-black text-[#1F3A5F] flex items-center gap-2">
                  <i className="fa-solid fa-comments text-[#2A9D8F]"></i>
                  <span>نظرات شهروندان و ذی‌نفعان</span>
                  <span className="text-xs font-bold text-gray-400 font-mono">({activeArticle.comments_count ?? 0} نظر)</span>
                </h3>

                {/* Comment list */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="w-5 h-5 border-2 border-[#1F3A5F]/20 border-t-[#1F3A5F] rounded-full animate-spin" />
                      <span className="text-xs text-gray-500 font-semibold">در حال بارگذاری نظرات...</span>
                    </div>
                  ) : commentsList.length === 0 ? (
                    <div className="bg-[#F5F6F8] p-6 rounded-2xl border border-gray-200 text-center">
                      <i className="fa-solid fa-comment-slash text-gray-300 text-2xl mb-2"></i>
                      <p className="text-xs text-gray-500 font-semibold">هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهید!</p>
                    </div>
                  ) : (
                    commentsList.map((c) => (
                      <div key={c.id} className="bg-[#F5F6F8] p-4 rounded-2xl border border-gray-200 space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-[#1F3A5F]">
                          <span>{c.author_name}</span>
                          <span className="text-gray-400">
                            {new Date(c.created_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 font-semibold">{c.content}</p>
                      </div>
                    ))
                  )}
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
                    disabled={commentSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {commentSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <i className="fa-solid fa-paper-plane"></i>
                    )}
                    <span>{commentSubmitting ? 'در حال ارسال...' : 'ثبت و ارسال نظر'}</span>
                  </button>
                </form>
              </div>
              )}
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
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
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
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="جستجو در عنوان یا متن اخبار..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-[#1F3A5F] focus:outline-none focus:border-[#2A9D8F]"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 space-y-3">
                  <div className="w-10 h-10 border-4 border-[#1F3A5F]/20 border-t-[#1F3A5F] rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 font-semibold">در حال بارگذاری...</p>
                </div>
              )}

              {/* News Grid */}
              {!loading && filteredNews.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 space-y-3">
                  <i className="fa-solid fa-newspaper text-4xl text-gray-300"></i>
                  <h4 className="font-extrabold text-[#1F3A5F]">خبری یافت نشد</h4>
                  <p className="text-xs text-gray-500 font-semibold">عبارت دیگری را برای جستجو وارد کنید.</p>
                </div>
              ) : !loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedNews.map((news) => (
                    <motion.div
                      key={news.id}
                      whileHover={{ y: -6 }}
                      onClick={() => handleSelectArticle(news)}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image banner */}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          {news.image_url ? (
                            <img
                              src={news.image_url}
                              alt={news.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F3A5F]/10 to-[#B76E4C]/10">
                              <i className="fa-solid fa-newspaper text-4xl text-gray-300"></i>
                            </div>
                          )}
                          <span
                            className="absolute top-3 right-3 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md"
                            style={{ backgroundColor: news.category_color || '#B76E4C' }}
                          >
                            {news.category_name || 'عمومی'}
                          </span>
                        </div>

                        {/* Article Info */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
                            <span>
                              <i className="fa-regular fa-calendar ml-1 text-[#2A9D8F]"></i>
                              {formatDate(news.published_at || news.created_at)}
                            </span>
                            <span><i className="fa-regular fa-eye ml-1"></i> {news.views_count}</span>
                          </div>

                          <h3 className="text-base font-extrabold text-[#1F3A5F] group-hover:text-[#B76E4C] transition-colors leading-snug">
                            {news.title}
                          </h3>

                          <p className="text-xs text-gray-600 line-clamp-3 font-semibold leading-relaxed">
                            {decodeAndStripHtml(news.summary || (news.content ? news.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...' : ''))}
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
              ) : null}

              {/* Pagination Controls — Client-side */}
              {!activeArticle && !loading && lastPage > 1 && (
                <div className="flex flex-col items-center gap-4 pt-8">
                  <div className="text-xs text-gray-500 font-semibold">
                    صفحه {currentPage.toLocaleString('fa-IR')} از {lastPage.toLocaleString('fa-IR')} (مجموع {filteredNews.length.toLocaleString('fa-IR')} خبر)
                  </div>
                  <div className="flex items-center gap-2" dir="ltr">
                    <button
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 bg-white text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#1F3A5F] transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-chevron-right ml-1"></i>
                      قبلی
                    </button>

                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2)
                      .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="text-gray-400 px-1 text-xs">...</span>
                          )}
                          <button
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setCurrentPage(p); }}
                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              p === currentPage
                                ? 'bg-[#1F3A5F] text-white shadow-md'
                                : 'bg-white border border-gray-300 text-[#1F3A5F] hover:bg-gray-100'
                            }`}
                          >
                            {p.toLocaleString('fa-IR')}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setCurrentPage(prev => Math.min(lastPage, prev + 1)); }}
                      disabled={currentPage >= lastPage}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 bg-white text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#1F3A5F] transition-all cursor-pointer"
                    >
                      بعدی
                      <i className="fa-solid fa-chevron-left mr-1"></i>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
