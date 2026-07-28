import { ServiceItem, CountyData } from './types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 1,
    title: 'پنجره واحد خدمات',
    icon: 'fa-solid fa-window-restore',
    description: 'دسترسی یکپارچه به کلیه خدمات الکترونیک راه و شهرسازی',
    color: '#1F3A5F',
  },
  {
    id: 2,
    title: 'نهضت ملی مسکن',
    icon: 'fa-solid fa-house-chimney',
    description: 'سامانه ثبت‌نام، استعلام و پیگیری پروژه مسکن ملی یزد',
    color: '#B76E4C',
  },
  {
    id: 3,
    title: 'استعلام فرم ج',
    icon: 'fa-solid fa-file-signature',
    description: 'بررسی وضعیت سبز بودن فرم ج متقاضیان تسهیلات مسکن',
    color: '#2A9D8F',
  },
  {
    id: 4,
    title: 'نظام مهندسی',
    icon: 'fa-solid fa-compass-drafting',
    description: 'خدمات مهندسان، تمدید پروانه اشتغال و ارجاع نظارت کارگاهی',
    color: '#C98A5A',
  },
  {
    id: 5,
    title: 'سامانه مکاتبات',
    icon: 'fa-solid fa-envelope-open-text',
    description: 'ثبت و پیگیری آنلاین نامه‌های اداری و مکاتبات شهروندان',
    color: '#1F3A5F',
  },
  {
    id: 6,
    title: 'پیگیری درخواست',
    icon: 'fa-solid fa-magnifying-glass-chart',
    description: 'مشاهده آخرین وضعیت پرونده‌های شهرسازی و زمین و مسکن',
    color: '#2A9D8F',
  },
  {
    id: 7,
    title: 'ثبت شکایت',
    icon: 'fa-solid fa-circle-exclamation',
    description: 'ارسال شکایات، انتقادات و گزارش‌های مردمی به بازرسی',
    color: '#B76E4C',
  },
  {
    id: 8,
    title: 'میز خدمت حضوری',
    icon: 'fa-solid fa-users-gear',
    description: 'نوبت‌دهی آنلاین جهت ملاقات مردمی و پیگیری حضوری درخواست‌ها',
    color: '#C98A5A',
  },
];

export const COUNTIES_DATA: CountyData[] = [
  {
    id: 'yazd',
    name: 'یزد',
    x: 268, // مرکز استان
    y: 212,
    roadProjects: 45,
    housingUnits: 4820,
    urbanPlans: 12,
    hasHousingWorkshop: true,
    description: 'مرکز استان و کانون توسعه با بزرگترین پروژه‌های انبوه‌سازی مسکن و تقاطع‌های غیرهمسطح.'
  },
  {
    id: 'meybod',
    name: 'میبد',
    x: 186, // شمال غرب یزد (واقعی)
    y: 191,
    roadProjects: 22,
    housingUnits: 1430,
    urbanPlans: 6,
    description: 'دومین شهرستان پرجمعیت با تمرکز بر بازآفرینی شهری بافت تاریخی و بهبود دسترسی‌های جاده‌ای صنایع.'
  },
  {
    id: 'ardakan',
    name: 'اردکان',
    x: 265, // شمال بزرگ‌ترین شهرستان
    y: 120,
    roadProjects: 35,
    housingUnits: 2550,
    urbanPlans: 8,
    description: 'پهناورترین شهرستان با احداث باندهای بزرگراهی متصل به خطوط ترانزیت ملی و مسکن کارگری صنایع.'
  },
  {
    id: 'bafq',
    name: 'بافق',
    x: 393, // شرق استان
    y: 234,
    roadProjects: 18,
    housingUnits: 910,
    urbanPlans: 4,
    description: 'قطب معدنی استان با تمرکز بر توسعه بزرگراه‌های متصل به معادن سنگ آهن و ریلی مسافربری.'
  },
  {
    id: 'mehriz',
    name: 'مهریز',
    x: 287, // جنوب یزد
    y: 270,
    roadProjects: 15,
    housingUnits: 1180,
    urbanPlans: 5,
    hasHousingWorkshop: true,
    description: 'دروازه جنوبی استان با احداث کمربندی جدید و ساخت خانه‌های ویلایی یک طبقه در طرح مسکن ملی.'
  },
  {
    id: 'taft',
    name: 'تفت',
    x: 195, // جنوب غرب یزد (واقعی)
    y: 278,
    roadProjects: 12,
    housingUnits: 790,
    urbanPlans: 4,
    description: 'منطقه پایکوهی یزد با طرح‌های بهسازی معابر روستایی و حفاظت از پهنه‌های باغ‌شهری و تفرجگاهی.'
  },
  {
    id: 'abarkuh',
    name: 'ابرکوه',
    x: 153, // غربی‌ترین نقطه استان
    y: 303,
    roadProjects: 14,
    housingUnits: 650,
    urbanPlans: 3,
    description: 'کهن‌شهر غربی استان با محور مواصلاتی یزد-شیراز و توسعه خدمات شهری بر محور سرو کهنسال.'
  },
  {
    id: 'ashkezar',
    name: 'اشکذر',
    x: 224, // بین یزد و میبد
    y: 194,
    roadProjects: 8,
    housingUnits: 520,
    urbanPlans: 3,
    description: 'مرکز پرورش اسب و کانون گلخانه‌ای با طرح‌های بهبود راه‌های روستایی و حریم شهری.'
  },
  {
    id: 'behabad',
    name: 'بهاباد',
    x: 446, // شرقی‌ترین نقطه استان
    y: 208,
    roadProjects: 10,
    housingUnits: 495,
    urbanPlans: 2,
    description: 'دورافتاده‌ترین منطقه توسعه با احداث راه‌های امن کویری و واگذاری اراضی به ساکنین بومی.'
  },
  {
    id: 'khatam',
    name: 'خاتم',
    x: 231, // جنوبی‌ترین نقطه
    y: 401,
    roadProjects: 11,
    housingUnits: 410,
    urbanPlans: 2,
    description: 'قطب کشاورزی با تمرکز بر آسفالت راه‌های بین‌مزارع و بهسازی ورودی شهر هرات.'
  },
  {
    id: 'zarch',
    name: 'زارچ',
    x: 270,
    y: 189,
    roadProjects: 6,
    housingUnits: 380,
    urbanPlans: 2,
    hasHousingWorkshop: true,
    description: 'شهرستان شرق یزد با تمرکز بر توسعه راه‌های روستایی و طرح‌های مسکن ملی حومه‌ای.'
  },
  {
    id: 'marvast',
    name: 'مروست',
    x: 258,
    y: 463,
    roadProjects: 5,
    housingUnits: 290,
    urbanPlans: 1,
    description: 'منطقه دورافتاده جنوب استان با محور مواصلاتی خاتم-مروست و طرح‌های بهسازی راه‌های کوهستانی.'
  }
];