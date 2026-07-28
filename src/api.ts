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
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
