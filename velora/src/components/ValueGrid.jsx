import { BadgeCheck, Headset, TrendingUp, Code2, Lock, Gem, ShieldCheck, KeyRound } from 'lucide-react';

export const VALUES = [
  {
    title: 'انجمن تأیید‌شده',
    text: 'هر متقاضی به‌صورت دستی بررسی می‌شود؛ پس آدم‌هایی که می‌بینید برای رول‌پلی آمده‌اند، نه برای خرابکاری.',
    icon: BadgeCheck,
  },
  {
    title: 'تیم متخصص',
    text: 'تیمی باتجربه در همه مناطق زمانی آنلاین است، با مسیر مشخص برای پیگیری و پاسخگویی واقعی.',
    icon: Headset,
  },
  {
    title: 'اقتصاد متعادل',
    text: 'قیمت‌ها، دستمزدها و درآمدها طوری تنظیم شده‌اند که یک شب کار صادقانه هم ارزش داشته باشد.',
    icon: TrendingUp,
  },
  {
    title: 'اسکریپت‌های اختصاصی',
    text: 'سیستم‌هایی که از پایه برای این شهر نوشته شده‌اند — نه یک فریم‌ورک آماده با لوگوی عوض‌شده.',
    icon: Code2,
  },
  {
    title: 'امن و پایش‌شده',
    text: 'ضدتقلب، ثبت گزارش و نظارت فعال در هر سشن، در تمام ساعات شبانه‌روز.',
    icon: Lock,
  },
  {
    title: 'رول‌پلی سفارشی',
    text: 'طراحی داستان‌محور: صحنه‌های از پیش نوشته‌شده کمتر، فضای بیشتر برای شخصیتی که می‌خواهید بازی کنید.',
    icon: Gem,
  },
];

export const EXTRA_VALUES = [
  {
    title: 'بازی عادلانه',
    text: 'بدون پرداخت برای برتری. خرید از فروشگاه هرگز مزیت درون‌بازی نمی‌دهد.',
    icon: ShieldCheck,
  },
  { title: 'وایت‌لیست خصوصی', text: 'درخواست‌ها خصوصی بررسی می‌شوند، با خط ارتباطی مستقیم با تیم.', icon: KeyRound },
];

export function ValueList({ items = VALUES }) {
  return (
    <div className="values">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="value-item">
            <span className="value-item__icon">
              <Icon size={17} strokeWidth={1.5} />
            </span>
            <h3 className="value-item__title">{item.title}</h3>
            <p className="value-item__text">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function ValueGrid({ items = VALUES }) {
  return (
    <div className="value-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="value-item">
            <span className="value-item__icon">
              <Icon size={18} strokeWidth={1.5} />
            </span>
            <h3 className="value-item__title">{item.title}</h3>
            <p className="value-item__text">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}
