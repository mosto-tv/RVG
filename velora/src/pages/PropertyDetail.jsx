import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  CalendarDays,
  Check,
  Heart,
  Mail,
  MapPin,
  Maximize,
  Phone,
  Share2,
  Star,
  Mic,
} from 'lucide-react';
import Lightbox from '../components/Lightbox.jsx';
import Modal from '../components/Modal.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { BookingForm, ContactForm } from '../components/Forms.jsx';
import { useFetch } from '../lib/useFetch.js';
import { priceFmt } from '../lib/api.js';
import { categoryLabel, cityLabel, statusLabel } from '../lib/labels.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FEATURE_BLURB = 'در این امکان گنجانده شده است';

export default function PropertyDetail() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/properties/${id}`, [id]);
  const { isSaved, toggle } = useFavorites();
  const { push } = useToast();
  const [lightbox, setLightbox] = useState(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const property = data?.property;
  const related = data?.related || [];
  const gallery = property?.gallery || [];
  const saved = property ? isSaved(property.id) : false;

  const mapSrc = useMemo(() => {
    if (!property?.coords) return null;
    const [lat, lng] = property.coords;
    const d = 0.012;
    const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].join('%2C');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [property]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        push('لینک کپی شد.', 'success');
      }
    } catch {
      push('اشتراک‌گذاری لغو شد.', 'info');
    }
  };

  if (loading) {
    return (
      <div className="shell detail">
        <div className="skeleton" style={{ height: 260, borderRadius: 22 }} />
        <div className="loading-row">
          <span className="loading-row__bar" />
          در حال بارگذاری امکان
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="shell detail">
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <span className="empty-state__icon">
            <MapPin size={20} />
          </span>
          <h3>این امکان در حال حاضر فعال نیست</h3>
          <p>ممکن است برای این فصل از چرخه خارج شده باشد. تیم ما می‌تواند گزینه‌ای نزدیک به آن پیشنهاد دهد.</p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/listings" className="btn btn--sm">
              بازگشت به امکانات
            </Link>
            <Link to="/contact" className="btn btn--outline btn--sm">
              گفتگو با تیم
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const agent = property.agentProfile;

  return (
    <div className="shell detail">
      <nav className="crumbs" aria-label="مسیر صفحه">
        <Link to="/">خانه</Link> <span>/</span> <Link to="/listings">امکانات</Link> <span>/</span>{' '}
        <span>{property.title}</span>
      </nav>

      <div className="gallery">
        <div
          className="gallery__main"
          onClick={() => setLightbox(0)}
          onKeyDown={(event) => event.key === 'Enter' && setLightbox(0)}
          role="button"
          tabIndex={0}
          data-cursor="view"
          aria-label="باز کردن گالری"
        >
          <img src={gallery[0]} alt={`${property.title} — نمای اصلی`} />
          <span className="gallery__count">
            <Maximize size={12} /> {gallery.length} تصویر
          </span>
        </div>
        {gallery.slice(1, 3).map((src, index) => (
          <div
            key={src}
            className="gallery__thumb"
            onClick={() => setLightbox(index + 1)}
            role="button"
            tabIndex={0}
            data-cursor="view"
            onKeyDown={(event) => event.key === 'Enter' && setLightbox(index + 1)}
            aria-label={`باز کردن تصویر ${index + 2}`}
          >
            <img src={src} alt={`${property.title} — نمای ${index + 2}`} />
          </div>
        ))}
      </div>

      <div className="detail__head">
        <div>
          <span className="eyebrow">{categoryLabel(property.type)}</span>
          <h1 className="detail__title">{property.title}</h1>
          <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="detail__location">
              <MapPin size={14} /> {property.neighborhood}، {cityLabel(property.city)}، {cityLabel(property.country)}
            </span>
            <span className="property-card__rating">
              <Star size={13} fill="currentColor" /> {property.rating.toFixed(1)} امتیاز انجمن
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flexWrap: 'wrap' }}>
          <div>
            <div className="detail__price">{priceFmt(property.price)}</div>
            <small className="muted" style={{ fontSize: '0.75rem' }}>
              میانگین درآمد · {statusLabel(property.status)}
            </small>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className={`icon-btn${saved ? ' ' : ''}`}
              onClick={() => toggle(property.id)}
              aria-label={saved ? 'حذف از ذخیره‌شده‌ها' : 'ذخیره این امکان'}
              aria-pressed={saved}
              style={{
                border: '1px solid var(--border)',
                background: saved ? 'var(--emerald)' : 'var(--white)',
                color: saved ? 'var(--gold-soft)' : 'var(--charcoal)',
              }}
            >
              <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button
              className="icon-btn"
              onClick={share}
              aria-label="اشتراک‌گذاری این امکان"
              style={{ border: '1px solid var(--border)', background: 'var(--white)' }}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="detail__grid">
        <div className="detail__main">
          <div className="spec-strip">
            <div className="spec">
              <span className="spec__value">{property.beds}</span>
              <span className="spec__label">بازیکن</span>
            </div>
            <div className="spec">
              <span className="spec__value">{property.baths}</span>
              <span className="spec__label">دقیقه</span>
            </div>
            <div className="spec">
              <span className="spec__value">{property.size.toLocaleString()}</span>
              <span className="spec__label">اعتبار</span>
            </div>
            <div className="spec">
              <span className="spec__value">{property.year}</span>
              <span className="spec__label">از سال</span>
            </div>
          </div>

          <div className="detail-block">
            <h2>{property.headline}</h2>
            <p>{property.description}</p>
          </div>

          <div className="detail-block">
            <h2>ویژگی‌های سیستم</h2>
            <div className="feature-grid">
              {property.features.map((feature) => (
                <div key={feature} className="feature-item">
                  <Check size={15} /> {feature}
                </div>
              ))}
            </div>
            <p className="form-note" style={{ marginTop: '0.8rem' }}>
              {FEATURE_BLURB}. مستندات کامل و راهنمای گام‌به‌گام در صورت درخواست در اختیار شما قرار می‌گیرد.
            </p>
          </div>

          <div className="detail-block">
            <h2>محله</h2>
            <p style={{ marginBottom: '1rem' }}>
              {property.neighborhood}، {cityLabel(property.city)} — نقشه تعاملی خیابان‌هایی که الهام‌بخش این محله بوده‌اند.
            </p>
            <div className="map-frame">
              {mapSrc && (
                <iframe
                  title={`نقشه ${property.title}`}
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </div>

          <div className="detail-block">
            <h2>مشخصات امکان</h2>
            <ul className="info-list">
              <li>
                <span>شناسه امکان</span>
                <span>RIA-{property.id.slice(0, 6).toUpperCase()}</span>
              </li>
              <li>
                <span>وضعیت</span>
                <span>{statusLabel(property.status)}</span>
              </li>
              <li>
                <span>دسته‌بندی</span>
                <span>{categoryLabel(property.type)}</span>
              </li>
              <li>
                <span>مدت سشن</span>
                <span>{property.baths} دقیقه</span>
              </li>
              <li>
                <span>میانگین درآمد</span>
                <span>{priceFmt(property.price)}</span>
              </li>
              <li>
                <span>مسئول بخش</span>
                <span>{agent?.name || 'تیم مدیریت ریا'}</span>
              </li>
            </ul>
          </div>
        </div>

        <aside className="detail__side">
          <div className="side-card">
            <div>
              <span className="eyebrow eyebrow--plain" style={{ fontSize: '0.62rem' }}>
                مسئول این بخش
              </span>
              <div className="side-card__agent" style={{ marginTop: '0.7rem' }}>
                {agent && <img src={agent.portrait} alt={agent.name} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{agent?.name || 'تیم مدیریت ریا'}</div>
                  <div className="muted" style={{ fontSize: '0.78rem' }}>
                    {agent?.role || 'مدیریت سرور'}
                  </div>
                </div>
              </div>
            </div>

            <div className="side-card__actions">
              <button className="btn" onClick={() => setVisitOpen(true)}>
                <CalendarDays size={15} /> درخواست بازی
              </button>
              <button className="btn btn--outline" onClick={() => setInfoOpen(true)}>
                <Mail size={15} /> درخواست اطلاعات
              </button>
              {agent && (
                <a
                  href={`mailto:${agent.email}?subject=${encodeURIComponent(`پرسش درباره ${property.title}`)}`}
                  className="btn btn--outline"
                >
                  <Phone size={15} /> تماس با تیم
                </a>
              )}
              <button className="btn btn--outline" onClick={() => toggle(property.id)} aria-pressed={saved}>
                <Heart size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'ذخیره شد' : 'ذخیره این امکان'}
              </button>
            </div>

            <div className="info-list" style={{ marginTop: '0.2rem' }}>
              <li>
                <span>
                  <Users size={13} /> بازیکنان
                </span>
                <span>{property.beds}</span>
              </li>
              <li>
                <span>
                  <Clock size={13} /> دقیقه
                </span>
                <span>{property.baths}</span>
              </li>
              <li>
                <span>
                  <Mic size={13} /> صدای مجاور
                </span>
                <span>{property.features.includes('صدای مجاور') ? 'فعال' : 'اختیاری'}</span>
              </li>
            </div>
          </div>

          <div className="panel panel--muted">
            <h3 className="panel__title">این مسیر را در نظر دارید؟</h3>
            <p className="panel__sub" style={{ marginBottom: '0.8rem' }}>
              تیم ما می‌تواند سیستم‌ها را برایتان توضیح دهد یا در انتخاب اولین شغل شما در شهر کمک کند.
            </p>
            <Link to="/book-visit" className="link-arrow">
              درخواست بازی <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div className="section-head__text">
              <span className="eyebrow">تجربه‌های مشابه</span>
              <h2>این‌ها هم ممکن است بپسندید</h2>
            </div>
            <Link to="/listings" className="link-arrow">
              همه امکانات <ArrowRight size={14} />
            </Link>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      )}

      <div style={{ paddingBottom: '2rem' }}>
        <Link to="/listings" className="link-arrow">
          <ArrowLeft size={14} /> بازگشت به شهر
        </Link>
      </div>

      {lightbox !== null && (
        <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      <Modal open={visitOpen} onClose={() => setVisitOpen(false)} labelledBy="visit-title">
        <h2 id="visit-title">درخواست وایت‌لیست</h2>
        <p className="modal__sub">
          {property.title} · {cityLabel(property.city)}. تاریخ مورد نظر را انتخاب کنید تا تیم ما تأیید کند.
        </p>
        <BookingForm property={property} onDone={() => setVisitOpen(false)} />
      </Modal>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} labelledBy="info-title">
        <h2 id="info-title">درخواست اطلاعات بیشتر</h2>
        <p className="modal__sub">
          اطلاعات خود را بفرستید تا مستندات کامل و یادداشت‌های ورود به بازی را برای {property.title} ارسال کنیم.
        </p>
        <ContactForm />
      </Modal>
    </div>
  );
}
