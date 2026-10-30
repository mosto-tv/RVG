import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, Clock, ShieldCheck } from 'lucide-react';
import { BookingForm } from '../components/Forms.jsx';
import { useFetch } from '../lib/useFetch.js';
import { priceFmt } from '../lib/api.js';
import { categoryLabel, cityLabel } from '../lib/labels.js';

export default function BookVisit() {
  const [params] = useSearchParams();
  const propertyId = params.get('property');
  const { data } = useFetch(propertyId ? `/properties/${propertyId}` : '/properties?limit=1', [propertyId]);
  const property = propertyId ? data?.property : null;

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <span>درخواست</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>درخواست ورود به شهر</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              هر درخواست را یکی از اعضای تیم می‌خواند و پس از آن یک مصاحبه صوتی کوتاه انجام می‌شود. تاریخ مورد نظر
              را انتخاب کنید تا حداکثر تا یک روز کاری تأیید کنیم.
            </p>
          </div>
        </div>
      </div>

      <div className="shell split-form" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="panel">
          <h2 className="panel__title">درخواست وایت‌لیست</h2>
          <p className="panel__sub">همه فیلدها الزامی هستند. اطلاعات شما محرمانه می‌ماند.</p>
          <BookingForm property={property} />
        </div>

        <aside style={{ display: 'grid', gap: '1rem' }}>
          {property && (
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <img
                src={property.image}
                alt={property.title}
                style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.1rem 1.2rem 1.3rem' }}>
                <span className="eyebrow" style={{ fontSize: '0.6rem' }}>
                  {categoryLabel(property.type)}
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginTop: '0.4rem' }}>
                  {property.title}
                </h3>
                <p className="muted" style={{ fontSize: '0.85rem' }}>
                  {property.neighborhood}، {cityLabel(property.city)}
                </p>
                <p
                  style={{
                    color: 'var(--emerald)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.2rem',
                    marginTop: '0.4rem',
                  }}
                >
                  {priceFmt(property.price)}
                </p>
                <Link to={`/listings/${property.id}`} className="link-arrow" style={{ marginTop: '0.7rem' }}>
                  مشاهده امکان
                </Link>
              </div>
            </div>
          )}

          <div className="panel panel--muted">
            <h3 className="panel__title" style={{ fontSize: '1.1rem' }}>
              چه چیزی در انتظار شماست
            </h3>
            <ul className="info-list" style={{ marginTop: '0.8rem' }}>
              <li>
                <span>
                  <CalendarCheck size={13} /> تأیید
                </span>
                <span>حداکثر ۱ روز کاری</span>
              </li>
              <li>
                <span>
                  <Clock size={13} /> مصاحبه
                </span>
                <span>۲۰ تا ۳۰ دقیقه</span>
              </li>
              <li>
                <span>
                  <ShieldCheck size={13} /> بررسی توسط
                </span>
                <span>تیم مدیریت، به‌صورت خصوصی</span>
              </li>
            </ul>
            <p className="form-note" style={{ marginTop: '0.9rem' }}>
              با دوستانتان درخواست می‌دهید؟ نام کاربری دیسکورد آن‌ها را در توضیحات بنویسید تا مصاحبه گروهی
              هماهنگ کنیم.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
