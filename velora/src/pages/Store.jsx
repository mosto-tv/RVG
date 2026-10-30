import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';
import { useFetch } from '../lib/useFetch.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { storeCategoryLabel } from '../lib/labels.js';

const HERO = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2000&q=85';

export default function Store() {
  const { data, loading } = useFetch('/store/products');
  const status = useFetch('/store/status');
  const cart = useCart();
  const { push } = useToast();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [modalProduct, setModalProduct] = useState(null);

  const products = data?.items || [];
  const featured = data?.featured || [];
  const categories = data?.categories || [];

  const cancelledRef = params.get('cancelled');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (category && product.category !== category) return false;
      if (term && !`${product.name} ${product.category} ${product.tagline}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, category, search]);

  const addToCart = (product) => {
    cart.add(product);
    push(`«${product.name}» به سبد شما اضافه شد.`, 'success');
    cart.openCart?.();
  };

  const cancelOrder = async () => {
    const stored = window.localStorage.getItem(`velora_order_${cancelledRef}`);
    const token = stored ? JSON.parse(stored).token : '';
    try {
      await apiCancel(cancelledRef, token);
      push('پرداخت لغو شد — مبلغی از شما کسر نشد.', 'info');
    } catch {
      push('پرداخت لغو شد — مبلغی از شما کسر نشد.', 'info');
    }
    const next = new URLSearchParams(params);
    next.delete('cancelled');
    setParams(next, { replace: true });
  };

  return (
    <div className="store-page">
      <header className="store-hero">
        <div className="store-hero__bg">
          <img src={HERO} alt="" />
        </div>
        <div className="shell store-hero__inner">
          <div>
            <span className="ria-badge">
              <Sparkles size={12} /> ریا رول‌پلی · فروشگاه رسمی
            </span>
            <h1>مجموعه ریا</h1>
            <p>
              عضویت‌ها، دسترسی اولویت‌دار و پکیج‌های ظاهری برای انجمن ریا رول‌پلی. هر خرید در درگاه رسمی Tebex ما
              تکمیل و به‌صورت خودکار به شناسه فایوام شما تحویل می‌شود.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
              <button className="btn btn--ria" onClick={cart.openCart}>
                <ShoppingBag size={15} /> سبد خرید شما {cart.count > 0 ? `(${cart.count})` : ''}
              </button>
              <Link to="/player" className="btn btn--store-ghost">
                تاریخچه خرید <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="store-hero__stats">
            <div className="store-stat">
              <b>{products.length}</b>
              <span>پکیج</span>
            </div>
            <div className="store-stat">
              <b>Tebex</b>
              <span>پرداخت امن</span>
            </div>
            <div className="store-stat">
              <b>خودکار</b>
              <span>تحویل</span>
            </div>
          </div>
        </div>
      </header>

      <div className="shell store-body">
        {cancelledRef && (
          <div className="store-notice" style={{ marginTop: 0, marginBottom: '1.2rem' }}>
            <ShieldCheck size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
            <div>
              <strong>پرداخت لغو شد.</strong> برای سفارش {cancelledRef} مبلغی کسر نشد. هر زمان بخواهید می‌توانید
              سبد خود را دوباره بسازید.
              <button
                className="link-arrow"
                style={{ display: 'inline-flex', marginInlineStart: '0.8rem' }}
                onClick={cancelOrder}
              >
                بستن
              </button>
            </div>
          </div>
        )}

        {status.data && !status.data.configured && (
          <div className="store-notice" style={{ marginTop: 0, marginBottom: '1.4rem' }}>
            <ShieldCheck size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
            <div>
              <strong>Tebex هنوز متصل نشده است.</strong> فهرست پکیج‌ها فعال و قابل مرور است، اما پرداخت تا زمانی که
              مدیر فروشگاه اطلاعات Tebex ریا رول‌پلی را اضافه نکند بسته می‌ماند:
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                {status.data.missing.map((key) => (
                  <code key={key}>{key}</code>
                ))}
              </div>
              <span style={{ display: 'block', marginTop: '0.4rem', opacity: 0.85 }}>
                هیچ پرداخت شبیه‌سازی‌شده یا صوری ارائه نمی‌شود — پرداخت‌ها تنها از طریق Tebex انجام می‌شوند.
              </span>
            </div>
          </div>
        )}

        {featured.length > 0 && (
          <section style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
            <div className="store-section-title">
              <h2>پکیج‌های ویژه</h2>
              <span>انتخاب‌شده توسط تیم ریا</span>
            </div>
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} onOpen={setModalProduct} onAdd={addToCart} />
              ))}
            </div>
          </section>
        )}

        <div className="store-section-title">
          <h2>همه پکیج‌ها</h2>
          <span>عضویت، دسترسی و اقلام ظاهری</span>
        </div>

        <div className="store-toolbar">
          <label className="store-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی پکیج، عضویت یا اقلام ظاهری"
              aria-label="جستجوی پکیج‌های فروشگاه"
            />
          </label>
          <span style={{ fontSize: '0.78rem', color: 'rgba(247,245,237,.5)' }}>{visible.length} پکیج</span>
        </div>

        <div className="category-scroll" style={{ marginBottom: '1.6rem' }}>
          <button className={`store-chip${category === '' ? ' is-active' : ''}`} onClick={() => setCategory('')}>
            همه دسته‌ها
          </button>
          {categories.map((item) => (
            <button
              key={item}
              className={`store-chip${category === item ? ' is-active' : ''}`}
              onClick={() => setCategory(category === item ? '' : item)}
            >
              {storeCategoryLabel(item)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-row" style={{ color: 'rgba(247,245,237,.5)' }}>
            <span className="loading-row__bar" />
            در حال بارگذاری پکیج‌ها
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="empty-state" style={{ background: 'var(--ria-panel)', borderColor: 'var(--ria-border)' }}>
            <span className="empty-state__icon">
              <Search size={20} />
            </span>
            <h3 style={{ color: 'var(--ivory)' }}>هیچ پکیجی با این جستجو پیدا نشد</h3>
            <p style={{ color: 'rgba(247,245,237,.6)' }}>
              دسته دیگری را امتحان کنید یا جستجو را پاک کنید تا همه مجموعه را ببینید.
            </p>
            <button
              className="btn btn--ria btn--sm"
              onClick={() => {
                setSearch('');
                setCategory('');
              }}
            >
              پاک کردن جستجو
            </button>
          </div>
        )}

        {visible.length > 0 && (
          <div className="product-grid">
            {visible.map((product) => (
              <ProductCard key={product.slug} product={product} onOpen={setModalProduct} onAdd={addToCart} />
            ))}
          </div>
        )}

        <section style={{ marginTop: 'clamp(2.5rem, 5vw, 4rem)', display: 'grid', gap: '1.4rem' }}>
          <div className="store-section-title">
            <h2>تحویل چگونه انجام می‌شود</h2>
          </div>
          <div className="process" style={{ gap: '1rem' }}>
            {[
              {
                icon: ShoppingBag,
                title: 'پکیج‌های خود را انتخاب کنید',
                text: 'سبدی از عضویت، دسترسی یا اقلام ظاهری بسازید.',
              },
              {
                icon: ShieldCheck,
                title: 'پرداخت در Tebex',
                text: 'اطلاعات کارت تنها در درگاه رسمی Tebex وارد می‌شود.',
              },
              {
                icon: Truck,
                title: 'تأیید در سمت سرور',
                text: 'Tebex به سرور ما اطلاع می‌دهد و پرداخت پیش از تحویل دوباره بررسی می‌شود.',
              },
              {
                icon: PackageCheck,
                title: 'تحویل خودکار',
                text: 'مزایا روی شناسه فایوام شما اعمال و ثبت می‌شود.',
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="process__step" style={{ borderColor: 'var(--ria-border)' }}>
                  <Icon size={18} style={{ color: 'var(--ria-yellow)' }} />
                  <span className="process__title" style={{ color: 'var(--ivory)' }}>
                    {String(index + 1).padStart(2, '0')} · {step.title}
                  </span>
                  <span className="process__text" style={{ color: 'rgba(247,245,237,.58)' }}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="cart-legal" style={{ maxWidth: '75ch' }}>
            <Check size={13} style={{ verticalAlign: '-2px', marginInlineEnd: 4, color: 'var(--ria-yellow)' }} />
            همه پکیج‌های ریا رول‌پلی مزایای ظاهری، عضویت یا دسترسی هستند. ما ارز درون‌بازی، جایزه تصادفی، جعبه شانس
            یا مکانیک قمار نمی‌فروشیم و خریدها هرگز ارزش واقعی به بازیکنان بازنمی‌گردانند. فروش تابع مجوز پلتفرم
            Cfx.re، مجوز پلتفرم سازندگان Rockstar و سیاست پذیرش استفاده Tebex است.{' '}
            <Link to="/legal/tebex" style={{ color: 'var(--ria-yellow)' }}>
              قوانین فروشگاه
            </Link>
            .
          </p>
        </section>
      </div>

      {modalProduct && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} onAdd={addToCart} />
      )}
    </div>
  );
}

const apiCancel = async (reference, token) => {
  const res = await fetch(`/api/store/orders/${reference}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Cancel failed');
  return res.json();
};
