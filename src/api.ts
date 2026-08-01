// ============================================================
// API Helper — توابع ارتباط با بک‌اند جهت نمایش در سایت عمومی
// ============================================================

import { API } from './shared-utils/functions';

export { API };

/**
 * دریافت اطلاعات شهرستان‌ها برای نقشه تعاملی از بک‌اند
 */
export async function fetchCountyProjects<T = any>(): Promise<T> {
  return API<T>('county-projects?lang=fa');
}

/**
 * دریافت پروژه اسلایدر هوشمند (Slider Studio) برای نمایش عمومی
 */
export async function fetchSliderStudioProject<T = any>(): Promise<T> {
  return API<T>('slider-studio/public?lang=fa');
}
