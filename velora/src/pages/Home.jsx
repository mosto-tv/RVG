import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Sparkles, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import SearchPanel from '../components/SearchPanel.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import AgentCard from '../components/AgentCard.jsx';
import LocationsGrid from '../components/LocationsGrid.jsx';
import ValueGrid, { VALUES } from '../components/ValueGrid.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Reveal from '../components/Reveal.jsx';
import { useFetch } from '../lib/useFetch.js';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2200&q=85';
const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=2000&q=85';

const ASIDE_VALUES = VALUES.slice(0, 4);

export default function Home() {
  const meta = useFetch('/properties/meta');
  const featured = useFetch('/properties?featured=true&limit=4');
  const agents = useFetch('/agents');
  const locations = useFetch('/locations');

  const items = featured.data?.items || [];
  const lead = items[0];
  const stacked = items.slice(1, 3);
  const fourth = items[3];

  return (
    <>
      <section className="hero" style={{ marginTop: 'calc(var(--header-h) * -1)' }}>
        <div className="hero__media">
          <img src={HERO_IMAGE} alt="مرکز شهر لس سانتوس در غروب" />
        </div>
        <div className="hero__scrim" />

        <div className="shell hero__inner">
          <div className="hero__content">
            <span className="eyebrow hero__eyebrow">رول‌پلی جدی از سال ۲۰۲۱</span>
            <h1>
              قدم به یک
              <em>زندگی دیگر در لس سانتوس بگذارید</em>
            </h1>
            <p className="hero__lede">
              یک شهر رول‌پلی حرفه‌ای فایوام، ساخته‌شده برای داستان‌هایی که وزن دارند — وایت‌لیست‌شده، دست‌ساز و هر شب
              در حال اجرا.
            </p>
            <div className="hero__actions">
              <Link to="/listings" className="btn btn--gold">
                مشاهده امکانات <ArrowRight size={15} />
              </Link>
              <Link to="/book-visit" className="btn btn--ghost-light">
                درخواست وایت‌لیست
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <b>4,800</b>
                <span>شهروند ثبت‌شده</span>
              </div>
              <div className="hero__stat">
                <b>32</b>
                <span>اسکریپت اختصاصی</span>
              </div>
              <div className="hero__stat">
                <b>24/7</b>
                <span>آپ‌تایم شهر</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="shell search-wrap">
        <SearchPanel />
      </div>

      <section className="section section--tight">
        <div className="shell">
          <SectionHead
            eyebrow="مرور بر اساس دسته‌بندی"
            title="دسته‌بندی‌های سرور"
            lede="شش مسیر ورود به شهر — هر کدام با یک کلیک باز می‌شود."
            action={
              <Link to="/listings" className="link-arrow">
                همه امکانات <ArrowRight size={14} />
              </Link>
            }
          />
          <Reveal>
            <CategoryGrid types={meta.data?.types || []} />
          </Reveal>
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="shell home-split">
          <div>
            <SectionHead
              eyebrow="امکانات منتخب"
              title="تجربه‌های شاخص"
              lede="فهرست کوتاهی از پرطرفدارترین سیستم‌هایی که همین حالا در ریا فعال هستند."
              action={
                <Link to="/listings" className="link-arrow">
                  مشاهده همه <ArrowRight size={14} />
                </Link>
              }
            />

            {featured.loading && (
              <div className="loading-row">
                <span className="loading-row__bar" />
                در حال بارگذاری امکانات
              </div>
            )}

            {featured.error && (
              <div className="form-alert form-alert--error">
                بارگذاری فهرست امکانات ممکن نشد. صفحه را دوباره بارگذاری کنید یا در دیسکورد ما بپرسید.
              </div>
            )}

            {lead && (
              <Reveal>
                <PropertyCard property={lead} variant="wide" />
              </Reveal>
            )}

            {stacked.length > 0 && (
              <div className="featured-stack">
                {stacked.map((property, index) => (
                  <Reveal key={property.id} delay={80 + index * 70}>
                    <PropertyCard property={property} variant="compact" />
                  </Reveal>
                ))}
              </div>
            )}

            {fourth && (
              <Reveal style={{ marginTop: '1.1rem' }}>
                <PropertyCard property={fourth} variant="compact" />
              </Reveal>
            )}
          </div>

          <aside className="home-split__aside">
            <Reveal className="aside-card">
              <h3 className="aside-card__title">چرا ریا رول‌پلی؟</h3>
              <p className="aside-card__lede">کارایی، انصاف و شهری که با دست ساخته و پرداخته شده است.</p>
              <div className="aside-values">
                {ASIDE_VALUES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="aside-value">
                      <span className="aside-value__icon">
                        <Icon size={15} strokeWidth={1.6} />
                      </span>
                      <span className="aside-value__title">{item.title}</span>
                      <span className="aside-value__text">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal className="callout-card" delay={60}>
              <img src={BANNER_IMAGE} alt="خیابانی در واینوود، غرق در نور نئون" loading="lazy" />
              <div>
                <h3>داستان خود را امشب شروع کنید</h3>
                <p>اسکریپت‌های اختصاصی. اقتصاد منصفانه. شهری که پاسخ می‌دهد.</p>
                <Link to="/contact" className="btn btn--gold btn--sm">
                  پیوستن به شهر
                </Link>
              </div>
            </Reveal>

            <Reveal className="aside-card" delay={120}>
              <h3 className="aside-card__title">با تیم ما آشنا شوید</h3>
              <p className="aside-card__lede">سه بخش. یک استاندارد از مسئولیت.</p>
              {(agents.data?.items || []).map((agent) => (
                <AgentCard key={agent.slug} agent={agent} compact />
              ))}
              <Link to="/agents" className="link-arrow" style={{ marginTop: '0.9rem' }}>
                آشنایی با تیم <ArrowRight size={13} />
              </Link>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            eyebrow="محله‌های شاخص"
            title="محله‌های شاخص"
            lede="پنج محله که شهر را تعریف می‌کنند — از واینوود هیلز تا پالتو بی."
            action={
              <Link to="/listings" className="link-arrow">
                مرور همه محله‌ها <ArrowRight size={14} />
              </Link>
            }
          />
          {locations.loading ? (
            <div className="loading-row">
              <span className="loading-row__bar" />
              در حال بارگذاری محله‌ها
            </div>
          ) : (
            <Reveal>
              <LocationsGrid items={locations.data?.items || []} />
            </Reveal>
          )}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow="استاندارد ریا"
            title="چرا ریا رول‌پلی؟"
            lede="شش تعهد که هر ساعتی را که در شهر می‌گذرانید شکل می‌دهد."
            center
          />
          <Reveal>
            <ValueGrid items={VALUES} />
          </Reveal>
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal className="cta-banner">
            <img src={BANNER_IMAGE} alt="چراغ‌های بلوار در واینوود، شبانه" loading="lazy" />
            <div className="cta-banner__inner">
              <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
                وایت‌لیست باز است
              </span>
              <h2>داستان شما امشب شروع می‌شود</h2>
              <p>اسکریپت‌های اختصاصی. اقتصاد منصفانه. شهری که پاسخ می‌دهد.</p>
              <Link to="/contact" className="btn btn--gold">
                همین حالا درخواست دهید <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            eyebrow="تیم شما"
            title="با تیم ما آشنا شوید"
            lede="مدیران ارشدی که هر سیستم شهر را از نزدیک می‌شناسند."
            action={
              <Link to="/agents" className="link-arrow">
                همه اعضای تیم <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="agent-grid">
            {(agents.data?.items || []).slice(0, 3).map((agent) => (
              <Reveal key={agent.slug}>
                <AgentCard agent={agent} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">ریا رول‌پلی</span>
          <h2>شهر شما منتظر است</h2>
          <p>به هزاران بازیکن در شهری بپیوندید که برای داستان‌های شنیدنی ساخته شده است.</p>
          <Link to="/listings" className="btn btn--gold">
            شروع کنید <ArrowRight size={15} />
          </Link>
          <div
            style={{
              display: 'flex',
              gap: 'clamp(1rem, 3vw, 2.5rem)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '2.6rem',
              color: 'rgba(247,245,237,.62)',
              fontSize: '0.76rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={13} /> بازیکنان تأیید‌شده
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={13} /> امتیاز ۴.۹ از انجمن
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={13} /> آپ‌تایم ۲۴ ساعته
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarDays size={13} /> بررسی درخواست در ۴۸ ساعت
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={13} /> دسترسی وایت‌لیست
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
