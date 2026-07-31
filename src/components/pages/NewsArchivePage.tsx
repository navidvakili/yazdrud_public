import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { API, decodeHtmlEntities, decodeAndStripHtml } from '../../shared-utils';
import { NewsItem, NewsComment, ActivePage, PhotoReportImage } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface NewsArchivePageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage) => void;
  selectedNewsId?: number | null;
}

export default function NewsArchivePage({ fontSizeScale, onNavigate, selectedNewsId }: NewsArchivePageProps) {
  // State for news list and filtering
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for active article and content
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [articleContent, setArticleContent] = useState<string>('');
  const [articleDetail, setArticleDetail] = useState<NewsItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  
  // State for gallery lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalNews, setTotalNews] = useState(0);
  const perPage = 12;

  // Comments state
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<NewsComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Load initial news list
  useEffect(() => {
    loadNews();
  }, []);

  // Handle direct navigation to a specific news article (home-card click, direct
  // URL, browser back/forward).
  //
  // IMPORTANT: this must NOT re-open the article when `newsList` is updated by the
  // optimistic view-count bump — otherwise the effect loops forever and floods the
  // views endpoint (views_count once jumped from ~450 to 5400 because of that).
  //
  // Pattern: `selectedNewsId` change → store a *pending* id → open it exactly once
  // when `newsList` is loaded (list loads asynchronously, so the id may arrive
  // before the list). Consuming the pending id guarantees a single open + increment.
  const pendingNewsIdRef = useRef<number | null>(null);
  const lastOpenedNewsIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedNewsId) {
      pendingNewsIdRef.current = selectedNewsId;
    } else {
      // Returned to archive (browser back / direct /اخبار URL)
      pendingNewsIdRef.current = null;
      lastOpenedNewsIdRef.current = null;
      setActiveArticle(null);
      setArticleDetail(null);
      setArticleContent('');
      setContentError(null);
    }
  }, [selectedNewsId]);

  useEffect(() => {
    const id = pendingNewsIdRef.current;
    if (id === null || id === undefined) return;
    if (newsList.length === 0) return; // list not loaded yet — wait

    const match = newsList.find((n) => n.id === id);
    if (!match) return;

    pendingNewsIdRef.current = null; // consume — open exactly once
    handleSelectArticle(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsList]);

  // Load news list from API
  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await API<{ data: NewsItem[]; total: number }>('news?per_page=500&page=1');
      setNewsList(res.data || []);
      setTotalNews(res.total ?? 0);
      setCurrentPage(1);
      setLastPage(Math.ceil((res.data?.length || 0) / perPage));
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full article detail with content
  const fetchArticleDetail = async (id: number) => {
    setDetailLoading(true);
    setContentError(null);
    
    try {
      const res = await API<{ data: NewsItem }>(`news/${id}`);
      
      if (res.data) {
        setArticleDetail(res.data);
        
        // Update content from API response
        const content = res.data.content || res.data.summary || '';
        setArticleContent(content);
        
        // Update active article with fresh data
        setActiveArticle(prev => {
          if (prev && prev.id === id) {
            return {
              ...prev,
              content: res.data.content || prev.content,
              summary: res.data.summary || prev.summary,
              comments_count: res.data.comments_count !== undefined ? res.data.comments_count : prev.comments_count,
              photo_report_images: res.data.photo_report_images || prev.photo_report_images,
              views_count: res.data.views_count || prev.views_count
            };
          }
          return prev;
        });
      } else {
        setContentError('متن خبر در دسترس نیست.');
      }
    } catch (error) {
      console.error('Error fetching article detail:', error);
      setContentError('خطا در دریافت متن خبر. لطفاً مجدداً تلاش کنید.');
      
      // Fallback to existing content if available
      if (activeArticle) {
        setArticleContent(activeArticle.content || activeArticle.summary || '');
      }
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
    } catch (error) {
      console.error('Error loading comments:', error);
      setCommentsList([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Increment view count on server
  const incrementArticleViews = (id: number) => {
    API(`news/${id}/views`, {}, 'POST').catch(() => {});
  };

  // Handle article selection
  const handleSelectArticle = (news: NewsItem) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Mark as opened so a second navigation pass won't re-open / re-increment
    lastOpenedNewsIdRef.current = news.id;

    // Increment view count
    incrementArticleViews(news.id);
    setNewsList(prev => prev.map(n => 
      n.id === news.id ? { ...n, views_count: (n.views_count || 0) + 1 } : n
    ));

    // Set active article and initial content
    setActiveArticle(news);
    setArticleContent(news.content || news.summary || '');
    setContentError(null);
    
    // Fetch full details
    fetchArticleDetail(news.id);
    loadComments(news.id);

    // Update URL and title
    const seoUrl = `/اخبار/${news.id}/${news.title.replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF\s-]/g, '').trim()}`;
    window.history.pushState({ page: 'news', newsId: news.id, newsTitle: news.title }, '', seoUrl);
    document.title = `${news.title} | آرشیو جامع اخبار و اطلاعیه‌ها | اداره کل راه و شهرسازی استان یزد`;

    // Update canonical link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + seoUrl);
  };

  // Handle back to archive
  const handleBackToArchive = () => {
    setActiveArticle(null);
    setArticleDetail(null);
    setArticleContent('');
    setContentError(null);
    setCommentsList([]);
    setCommentSuccess(false);
    window.history.pushState({ page: 'news' }, '', '/اخبار');
    document.title = 'آرشیو جامع اخبار و اطلاعیه‌ها | اداره کل راه و شهرسازی استان یزد';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build categories dynamically
  const allCategories = React.useMemo(() => {
    const cats = new Set<string>();
    newsList.forEach(n => { if (n.category_name) cats.add(n.category_name); });
    return ['همه', ...Array.from(cats)];
  }, [newsList]);

  // Client-side filtering
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

  // Client-side pagination
  const paginatedNews = React.useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredNews.slice(start, start + perPage);
  }, [filteredNews, currentPage]);

  // Update pagination when filters change
  const prevFilteredLen = React.useRef(0);
  useEffect(() => {
    const computedLastPage = Math.max(1, Math.ceil(filteredNews.length / perPage));
    setLastPage(computedLastPage);
    if (filteredNews.length < prevFilteredLen.current && currentPage > computedLastPage) {
      setCurrentPage(computedLastPage);
    }
    prevFilteredLen.current = filteredNews.length;
  }, [filteredNews.length, currentPage]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => {
          const images = (articleDetail?.photo_report_images ?? activeArticle?.photo_report_images ?? []) as PhotoReportImage[];
          return prev !== null && prev < images.length - 1 ? prev + 1 : prev;
        });
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => {
          const images = (articleDetail?.photo_report_images ?? activeArticle?.photo_report_images ?? []) as PhotoReportImage[];
          return prev !== null && prev > 0 ? prev - 1 : prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, articleDetail, activeArticle]);

  // Utility functions
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
      const res = await API<{ message: string; data: NewsComment }>(
        `news/${activeArticle.id}/comments`,
        { author_name: commentName, content: commentText },
        'POST'
      );
      
      // Add new comment to list optimistically
      if (res.data) {
        setCommentsList(prev => [res.data, ...prev]);
        // Update comment count
        setActiveArticle(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : prev);
      }
      
      setCommentName('');
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Breadcrumb items
  const newsBreadcrumbItems = activeArticle
    ? [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        {
          label: 'اخبار و اطلاع‌رسانی',
          onClick: handleBackToArchive,
        },
        {
          label: `دسته: ${activeArticle.category_name || 'عمومی'}`,
          onClick: () => {
            handleBackToArchive();
            if (activeArticle.category_name) setSelectedCategory(activeArticle.category_name);
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

  // Render gallery images
  const renderGallery = () => {
    const galleryImages = (articleDetail?.photo_report_images ?? activeArticle?.photo_report_images ?? []) as PhotoReportImage[];
    if (galleryImages.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#1F3A5F]">
          <i className="fa-solid fa-images text-indigo-500"></i>
          <span className="text-sm font-black">گزارش تصویری</span>
          <span className="text-xs text-gray-400 font-mono">({galleryImages.length} تصویر)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-gray-100 group cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.title || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <i className="fa-solid fa-search-plus text-white text-xl"></i>
              </div>
              {img.title && (
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[10px] text-white font-semibold line-clamp-1">{img.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render article content
  const renderArticleContent = () => {
    if (detailLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="w-10 h-10 border-4 border-[#1F3A5F]/20 border-t-[#1F3A5F] rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-semibold">در حال دریافت متن خبر...</span>
          <span className="text-xs text-gray-400">لطفاً چند لحظه صبر کنید</span>
        </div>
      );
    }

    if (contentError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <i className="fa-solid fa-circle-exclamation text-red-500 text-2xl mb-3"></i>
          <p className="text-sm text-red-700 font-semibold">{contentError}</p>
          {activeArticle?.content && (
            <button
              onClick={() => setArticleContent(activeArticle.content || '')}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
            >
              نمایش محتوای موجود
            </button>
          )}
        </div>
      );
    }

    if (!articleContent) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <i className="fa-solid fa-file-lines text-yellow-500 text-2xl mb-3"></i>
          <p className="text-sm text-yellow-700 font-semibold">متن خبر در دسترس نیست</p>
          <p className="text-xs text-yellow-600 mt-1">لطفاً بعداً مجدداً تلاش کنید</p>
        </div>
      );
    }

    return (
      <div 
        className="prose max-w-none text-gray-800 leading-loose text-sm sm:text-base font-semibold space-y-4"
        dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(articleContent) }}
      />
    );
  };

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
          {activeArticle ? (
            // ARTICLE DETAIL VIEW
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Back to archive header */}
              <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <button
                  onClick={handleBackToArchive}
                  className="px-4 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <i className="fa-solid fa-arrow-right"></i>
                  <span>بازگشت به لیست آرشیو اخبار</span>
                </button>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-bold">
                  <span className="bg-[#2A9D8F]/15 text-[#2A9D8F] px-3 py-1 rounded-full font-black">
                    کد خبر: NEWS-{activeArticle.id}
                  </span>
                  <span>
                    <i className="fa-solid fa-eye text-[#2A9D8F] ml-1"></i> 
                    {activeArticle.views_count || 0} بازدید
                  </span>
                </div>
              </div>

              {/* Main Article Content */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200/80 space-y-8">
                {/* Article Header */}
                <div className="space-y-4 border-b border-gray-100 pb-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#B76E4C] font-extrabold">
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
                    <div 
                      className="text-sm sm:text-base text-gray-600 font-bold leading-relaxed bg-[#F5F6F8] p-4 rounded-2xl border-r-4 border-[#2A9D8F] [&_p]:mb-0"
                      dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(activeArticle.summary) }}
                    />
                  )}
                </div>

                {/* Main Image */}
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
                <div className="pt-4 border-t border-gray-100">
                  {renderArticleContent()}
                </div>

                {/* Gallery — گزارش تصویری در پایان خبر */}
                {(activeArticle.is_photo_report || articleDetail?.is_photo_report) && renderGallery()}

                {/* Short Link */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-semibold">
                    <span>🔗 لینک کوتاه:</span>
                    <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 font-mono text-xs dir-ltr break-all">
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

                {/* Tags */}
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

              {/* Comments Section */}
              {activeArticle.comments_enabled !== false && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-200 space-y-6">
                  <h3 className="text-xl font-black text-[#1F3A5F] flex items-center gap-2">
                    <i className="fa-solid fa-comments text-[#2A9D8F]"></i>
                    <span>نظرات شهروندان و ذی‌نفعان</span>
                    <span className="text-xs font-bold text-gray-400 font-mono">
                      ({activeArticle.comments_count ?? 0} نظر)
                    </span>
                  </h3>

                  {/* Comment list */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {commentsLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <div className="w-5 h-5 border-2 border-[#1F3A5F]/20 border-t-[#1F3A5F] rounded-full animate-spin" />
                        <span className="text-xs text-gray-500 font-semibold">در حال بارگذاری نظرات...</span>
                      </div>
                    ) : commentsList.length === 0 ? (
                      <div className="bg-[#F5F6F8] p-6 rounded-2xl border border-gray-200 text-center">
                        <i className="fa-solid fa-comment-slash text-gray-300 text-2xl mb-2"></i>
                        <p className="text-xs text-gray-500 font-semibold">
                          هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهید!
                        </p>
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

                  {/* Submit comment form */}
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
                    />

                    <button
                      type="submit"
                      disabled={commentSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {commentSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>در حال ارسال...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane"></i>
                          <span>ثبت و ارسال نظر</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          ) : (
            // ARCHIVE GRID VIEW
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Search & Filter */}
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
                  <p className="text-xs text-gray-500 font-semibold">در حال بارگذاری اخبار...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredNews.length === 0 && (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 space-y-3">
                  <i className="fa-solid fa-newspaper text-4xl text-gray-300"></i>
                  <h4 className="font-extrabold text-[#1F3A5F]">خبری یافت نشد</h4>
                  <p className="text-xs text-gray-500 font-semibold">
                    {searchQuery ? 'عبارت دیگری را برای جستجو وارد کنید.' : 'هیچ خبری در این دسته‌بندی وجود ندارد.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-[#1F3A5F] text-white rounded-xl text-xs font-bold hover:bg-[#1F3A5F]/90 transition-colors"
                    >
                      پاک کردن جستجو
                    </button>
                  )}
                </div>
              )}

              {/* News Grid */}
              {!loading && filteredNews.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedNews.map((news) => (
                      <motion.div
                        key={news.id}
                        whileHover={{ y: -6 }}
                        onClick={() => handleSelectArticle(news)}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image */}
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
                            {news.is_photo_report && (
                              <span className="absolute bottom-3 left-3 bg-indigo-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 backdrop-blur-sm">
                                <i className="fa-solid fa-images"></i>
                                <span>گزارش تصویری</span>
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
                              <span>
                                <i className="fa-regular fa-calendar ml-1 text-[#2A9D8F]"></i>
                                {formatDate(news.published_at || news.created_at)}
                              </span>
                              <span>
                                <i className="fa-regular fa-eye ml-1"></i> {news.views_count || 0}
                              </span>
                            </div>

                            <h3 className="text-base font-extrabold text-[#1F3A5F] group-hover:text-[#B76E4C] transition-colors leading-snug line-clamp-2">
                              {news.title}
                            </h3>

                            <p className="text-xs text-gray-600 line-clamp-3 font-semibold leading-relaxed">
                              {decodeAndStripHtml(
                                news.summary || 
                                (news.content ? news.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...' : '')
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#2A9D8F]">
                          <span>مطالعه کامل خبر</span>
                          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {lastPage > 1 && (
                    <div className="flex flex-col items-center gap-4 pt-8">
                      <div className="text-xs text-gray-500 font-semibold">
                        صفحه {currentPage.toLocaleString('fa-IR')} از {lastPage.toLocaleString('fa-IR')} 
                        (مجموع {filteredNews.length.toLocaleString('fa-IR')} خبر)
                      </div>
                      <div className="flex items-center gap-2" dir="ltr">
                        <button
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setCurrentPage(prev => Math.max(1, prev - 1));
                          }}
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
                                onClick={() => {
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  setCurrentPage(p);
                                }}
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
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setCurrentPage(prev => Math.min(lastPage, prev + 1));
                          }}
                          disabled={currentPage >= lastPage}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 bg-white text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#1F3A5F] transition-all cursor-pointer"
                        >
                          بعدی
                          <i className="fa-solid fa-chevron-left mr-1"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (() => {
        const galleryImages = (articleDetail?.photo_report_images ?? activeArticle?.photo_report_images ?? []) as PhotoReportImage[];
        const current = galleryImages[lightboxIndex];
        if (!current) return null;
        
        return (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 left-4 text-white/80 hover:text-white text-2xl transition-colors z-10 cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="absolute top-4 right-4 text-white/60 text-xs font-mono bg-black/40 px-3 py-1.5 rounded-full">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl transition-colors z-10 cursor-pointer"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            )}

            <div className="max-w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={current.url}
                alt={current.title || ''}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              {current.title && (
                <p className="mt-4 text-white/80 text-sm font-semibold text-center max-w-lg">
                  {current.title}
                </p>
              )}
            </div>

            {lightboxIndex < galleryImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl transition-colors z-10 cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}