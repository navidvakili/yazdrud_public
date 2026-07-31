// ============================================================
// Shared Constants — مقادیر ثابت سایت عمومی
// ============================================================

/** آدرس سرور بک‌اند لاراول (بر اساس محیط) */
export const BACKEND_API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : 'https://db.yazdrud.ir';

/** پیشوند API */
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api'
  : 'https://db.yazdrud.ir/api';

/** نام سازمان / دانشگاه */
export const COMPANY_NAME = 'شرکت فناوری اطلاعات کارانت';
