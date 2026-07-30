// ============================================================
// API Helper — توابع ارتباط با بک‌اند جهت نمایش در سایت عمومی
// ============================================================

const API_BASE_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api'
  : '/api';

/**
 * تابع اصلی درخواست‌های API
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * ارسال درخواست POST به API
 */
export async function apiPost<T = any>(endpoint: string, data: Record<string, any>): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * دریافت اطلاعات شهرستان‌ها برای نقشه تعاملی از بک‌اند
 */
export async function fetchCountyProjects<T = any>(): Promise<T> {
  return apiGet('county-projects');
}

/**
 * دریافت اسلایدهای صفحه اصلی از بک‌اند
 */
export async function fetchHeroSlides<T = any>(): Promise<T> {
  return apiGet('hero-slides');
}

/**
 * دریافت پروژه اسلایدر هوشمند (Slider Studio) برای نمایش عمومی
 */
export async function fetchSliderStudioProject<T = any>(): Promise<T> {
  return apiGet('slider-studio/public');
}
