// ============================================================
// مسیریاب سئو محور — آدرس‌های تمیز و اختصاصی برای هر صفحه
// ============================================================

export type RouteKey = 'home' | 'news' | 'land-allocation' | 'urban-planning' | 'roads-transport' | 'services';

/**
 * نگاشت مسیرهای سئو — هر کلید صفحه به یک آدرس فارسی اختصاصی
 */
export const ROUTES: Record<RouteKey, string> = {
  home: '/',
  news: '/اخبار',
  'land-allocation': '/تخصیص-اراضی-و-مسکن',
  'urban-planning': '/شهرسازی-و-معماری',
  'roads-transport': '/راه-و-حمل-و-نقل',
  services: '/خدمات',
};

/** عنوان فارسی هر صفحه برای تگ title */
export const PAGE_TITLES: Record<RouteKey, string> = {
  home: 'درگاه خدمات هوشمند راه و شهرسازی استان یزد',
  news: 'آرشیو جامع اخبار و اطلاعیه‌ها',
  'land-allocation': 'تخصیص اراضی و مسکن',
  'urban-planning': 'شهرسازی و معماری',
  'roads-transport': 'راه و حمل‌ونقل',
  services: 'خدمات الکترونیک',
};

/** توضیحات متای هر صفحه برای SEO */
export const PAGE_DESCRIPTIONS: Record<RouteKey, string> = {
  home: 'پورتال جامع اداره کل راه و شهرسازی استان یزد — ارائه خدمات هوشمند واگذاری زمین، شهرسازی، حمل‌ونقل و اطلاع‌رسانی اخبار و طرح‌های عمرانی',
  news: 'آرشیو کامل اخبار و اطلاعیه‌های اداره کل راه و شهرسازی استان یزد — آخرین اخبار حوزه مسکن، شهرسازی و حمل‌ونقل',
  'land-allocation': 'مشاهده طرح‌ها و فرآیندهای تخصیص اراضی، نهضت ملی مسکن، زمین‌های طرح جوانی جمعیت و ثبت‌نام متقاضیان در استان یزد',
  'urban-planning': 'اطلاع از طرح‌های توسعه شهری، ضوابط شهرسازی، پروانه‌های ساختمانی و معماری شهری در استان یزد',
  'roads-transport': 'آخرین وضعیت پروژه‌های راه‌سازی، حمل‌ونقل جاده‌ای، آزادراه‌ها و محورهای مواصلاتی استان یزد',
  services: 'سامانه خدمات الکترونیک — استعلام، پیگیری درخواست‌ها و خدمات غیرحضوری اداره کل راه و شهرسازی استان یزد',
};

/** نگاشت معکوس — از مسیر URL به کلید صفحه */
function buildPathToKey(): Map<string, RouteKey> {
  const map = new Map<string, RouteKey>();
  for (const [key, path] of Object.entries(ROUTES)) {
    map.set(path, key as RouteKey);
  }
  return map;
}
const PATH_TO_KEY = buildPathToKey();

/**
 * تشخیص صفحه و پارامترها از روی مسیر URL
 */
export interface RouteResult {
  page: RouteKey;
  newsId?: number;
  newsSlug?: string;
}

export function resolveRoute(path: string): RouteResult {
  // حذف trailing slash (جز مسیر ریشه)
  const normalized = path === '/' ? '/' : path.replace(/\/$/, '');

  // بررسی آدرس جزئیات خبر: /اخبار/{id}/{slug?}
  const newsMatch = normalized.match(/^\/اخبار\/(\d+)(?:\/(.+))?$/);
  if (newsMatch) {
    return {
      page: 'news',
      newsId: parseInt(newsMatch[1], 10),
      newsSlug: newsMatch[2],
    };
  }

  // تطابق دقیق مسیر
  if (PATH_TO_KEY.has(normalized)) {
    return { page: PATH_TO_KEY.get(normalized)! };
  }

  // پیش‌فرض: صفحه اصلی
  return { page: 'home' };
}

/**
 * تولید مسیر URL از روی صفحه و پارامترهای اختیاری
 */
export function buildRoute(page: RouteKey, params?: { newsId?: number; newsTitle?: string }): string {
  if (params?.newsId) {
    const slug = params.newsTitle
      ? params.newsTitle.replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF\s-]/g, '').trim()
      : 'مشاهده-خبر';
    return `/اخبار/${params.newsId}/${slug}`;
  }
  return ROUTES[page];
}

/**
 * به‌روزرسانی عنوان صفحه و متا تگ‌ها بر اساس مسیر جاری
 */
export function updatePageMeta(page: RouteKey, extraTitle?: string): void {
  const baseTitle = PAGE_TITLES[page] || '';
  document.title = extraTitle
    ? `${extraTitle} | ${baseTitle}`
    : `${baseTitle} | اداره کل راه و شهرسازی استان یزد`;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', PAGE_DESCRIPTIONS[page] || '');
}

/**
 * مقدار کانونی (canonical) — جلوگیری از محتوای تکراری
 */
export function updateCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', window.location.origin + url);
}

/**
 * مقداردهی اولیه مسیریاب — خواندن مسیر جاری و بازگشت صفحه متناظر
 */
export function getInitialRoute(): RouteResult {
  return resolveRoute(window.location.pathname);
}
