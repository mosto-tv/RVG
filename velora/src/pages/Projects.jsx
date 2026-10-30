import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, MapPin, Building2, Ruler } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { useFetch } from '../lib/useFetch.js';
import { priceFmt } from '../lib/api.js';
import { cityLabel, statusLabel } from '../lib/labels.js';

const STATUS_CLASS = {
  Live: 'status-dot',
  'In Development': 'status-dot status-dot--soon',
  Released: 'status-dot status-dot--done',
};

export default function Projects() {
  const { data, loading } = useFetch('/projects');
  const [status, setStatus] = useState('All');

  const items = data?.items || [];
  const statuses = data?.statuses || [];
  const filtered = useMemo(
    () => (status === 'All' ? items : items.filter((project) => project.status === status)),
    [items, status],
  );

  return (
    <>
      <header className="banner-head" style={{ marginTop: 'calc(var(--header-h) * -1)', paddingTop: 'var(--header-h)' }}>
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=85"
          alt="خط آسمان لس سانتوس در غروب"
        />
        <div className="shell banner-head__inner">
          <span className="eyebrow">نقشه راه</span>
          <h1>به‌روزرسانی‌های سرور</h1>
          <p>
            هر فصلی که منتشر کرده‌ایم و هر چیزی که همین حالا در حال ساخت است — از فصل «داستان‌های آپ‌تاون» تا
            گسترش کایو پریکو.
          </p>
        </div>
      </header>

      <section className="section section--tight">
        <div className="shell">
          <div className="section-head" style={{ alignItems: 'center' }}>
            <div className="pill-tabs" role="tablist" aria-label="فیلتر به‌روزرسانی‌ها بر اساس وضعیت">
              {['All', ...statuses].map((option) => (
                <button
                  key={option}
                  role="tab"
                  aria-selected={status === option}
                  className={status === option ? 'is-active' : ''}
                  onClick={() => setStatus(option)}
                >
                  {option === 'All' ? 'همه' : statusLabel(option)}
                </button>
              ))}
            </div>
            <span className="form-note">{filtered.length} به‌روزرسانی</span>
          </div>

          {loading && (
            <div className="loading-row">
              <span className="loading-row__bar" />
              در حال بارگذاری به‌روزرسانی‌ها
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <span className="empty-state__icon">
                <Building2 size={20} />
              </span>
              <h3>در این مرحله به‌روزرسانی‌ای نیست</h3>
              <p>هر فصل فصل‌های تازه اضافه می‌شود. از تیم ما بپرسید قدم بعدی چیست.</p>
              <Link to="/contact" className="btn btn--sm">
                پرسش از تیم
              </Link>
            </div>
          )}

          <div className="project-grid">
            {filtered.map((project, index) => (
              <Reveal key={project.slug} delay={index * 60}>
                <article className="project-card">
                  <div className="project-card__media">
                    <img src={project.image} alt={project.name} loading="lazy" />
                    <span className="property-card__badges">
                      <span className="badge badge--emerald">{statusLabel(project.status)}</span>
                    </span>
                  </div>
                  <div className="project-card__body">
                    <span className={STATUS_CLASS[project.status] || 'status-dot'}>{statusLabel(project.status)}</span>
                    <h2 style={{ fontSize: '1.5rem' }}>{project.name}</h2>
                    <span className="property-card__location">
                      <MapPin size={12} /> {cityLabel(project.city)}، {cityLabel(project.country)}
                    </span>
                    <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.9 }}>
                      {project.description}
                    </p>
                    <div className="project-card__meta">
                      <span className="project-card__price">{priceFmt(project.startingPrice)} هدیه شروع</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building2 size={13} /> {project.units} امکان جدید
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CalendarClock size={13} /> {project.delivery}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Ruler size={13} /> {project.architect}
                      </span>
                    </div>
                    {project.gallery?.length > 1 && (
                      <div className="gallery-strip" style={{ marginTop: '0.6rem' }}>
                        {project.gallery.slice(0, 3).map((src) => (
                          <img key={src} src={src} alt="" loading="lazy" />
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                      <Link to="/contact" className="btn btn--sm">
                        یادداشت انتشار
                      </Link>
                      <Link to="/book-visit" className="btn btn--outline btn--sm">
                        پیوستن به تست بازی
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">دسترسی زودهنگام</span>
          <h2>برای فصل بعدی ثبت‌نام کنید</h2>
          <p>دسترسی بتا پیش از هر انتشار، اول به انجمن دیسکورد ما باز می‌شود.</p>
          <Link to="/contact" className="btn btn--gold">
            اعلام علاقه‌مندی <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
