// Display labels for values that stay in English in the data layer.
// Filters, URLs and API parameters keep comparing the original keys, so
// nothing about search, sorting or the storefront logic changes; only the
// text a visitor reads is Persian.
export const CATEGORY_LABELS = {
  Careers: 'مشاغل',
  Businesses: 'کسب‌وکارها',
  Vehicles: 'خودروها',
  'Crime & Heists': 'جرم و سرقت',
  Racing: 'مسابقات',
  Lifestyle: 'سبک زندگی',
};

export const STATUS_LABELS = {
  Live: 'فعال',
  Seasonal: 'فصلی',
  Weekly: 'هفتگی',
  Released: 'منتشر شده',
  'In Development': 'در حال توسعه',
  pending: 'در انتظار',
  paid: 'پرداخت تأیید شده',
  failed: 'ناموفق',
  cancelled: 'لغو شده',
  refunded: 'بازگشت وجه',
  delivered: 'تحویل شده',
  queued: 'در صف',
  not_started: 'شروع نشده',
  open: 'باز',
  in_progress: 'در حال بررسی',
  closed: 'بسته',
};

export const CITY_LABELS = {
  'Los Santos': 'لس سانتوس',
  Vinewood: 'واینوود',
  Vespucci: 'وسپوچی',
  'Del Perro': 'دل پرو',
  'Sandy Shores': 'سندی شورز',
  'Paleto Bay': 'پالتو بی',
  Grapeseed: 'گریپ‌سید',
  'Cayo Perico': 'کایو پریکو',
  'Blaine County': 'بلین کانتی',
  'San Andreas': 'سن آندریاس',
  Caribbean: 'کارائیب',
};

export const STORE_CATEGORY_LABELS = {
  'Exclusive Server Packages': 'پکیج‌های اختصاصی سرور',
  'VIP Memberships': 'عضویت VIP',
  'Premium Memberships': 'عضویت پرمیوم',
  'Priority Access Packages': 'دسترسی اولویت‌دار',
  'Cosmetic Benefits': 'مزایای ظاهری',
  'Exclusive Community Benefits': 'مزایای ویژه انجمن',
  'Limited-Time Offers': 'پیشنهادهای محدود',
  'Featured Packages': 'پکیج‌های ویژه',
};

export const label = (map, value) => (value ? map[value] || value : value);
export const categoryLabel = (value) => label(CATEGORY_LABELS, value);
export const statusLabel = (value) => label(STATUS_LABELS, value);
export const cityLabel = (value) => label(CITY_LABELS, value);
export const storeCategoryLabel = (value) => label(STORE_CATEGORY_LABELS, value);
