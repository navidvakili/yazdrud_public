// ============================================================
// Functions — توابع پرکاربرد سایت عمومی
// ============================================================

import { API_BASE_URL } from '../shared-constants';

// ========== Core API Function ==========

/**
 * تابع اصلی درخواست‌های API (مشابه الگوی frontend)
 * @param URL - مسیر نقطه پایانی (بدون /api/)
 * @param params - داده‌های بدنه درخواست (برای GET نادیده گرفته می‌شود)
 * @param method - متد HTTP (GET, POST, PUT, DELETE)
 * @returns Promise با داده‌های پاسخ
 */
export const API = async <T = any>(URL: string, params: any = {}, method: string = 'GET'): Promise<T> => {
  const url = `${API_BASE_URL}/${URL}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET' && params) {
    options.body = JSON.stringify(params);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorBody: any;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: `HTTP error! status: ${response.status}` };
    }
    const error = new Error(errorBody.message || `HTTP error! status: ${response.status}`) as any;
    error.status = response.status;
    error.errors = errorBody?.errors;
    throw error;
  }

  return response.json() as Promise<T>;
};

/**
 * Collect browser fingerprint data to identify the current device/browser.
 * Returns a JSON string with device and browser characteristics.
 */
export const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') return '{}';

  const data: Record<string, any> = {
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    colorDepth: window.screen?.colorDepth,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat?.().resolvedOptions?.().timeZone,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    productSub: navigator.productSub,
  };

  return JSON.stringify(data);
};
