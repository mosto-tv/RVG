import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';
import { useFetch } from '../lib/useFetch.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

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
    push(`${product.name} added to your selection.`, 'success');
    cart.openCart?.();
  };

  const cancelOrder = async () => {
    const stored = window.localStorage.getItem(`velora_order_${cancelledRef}`);
    const token = stored ? JSON.parse(stored).token : '';
    try {
      await apiCancel(cancelledRef, token);
      push('Checkout cancelled — no payment was taken.', 'info');
    } catch {
      push('Checkout cancelled — no payment was taken.', 'info');
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
              <Sparkles size={12} /> RIA ROLEPLAY · Official store
            </span>
            <h1>The RIA Collection</h1>
            <p>
              Memberships, priority access and cosmetic packages for the RIA ROLEPLAY community. Every purchase is
              completed on our official Tebex checkout and delivered automatically to your FiveM identifier.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
              <button className="btn btn--ria" onClick={cart.openCart}>
                <ShoppingBag size={15} /> Your selection {cart.count > 0 ? `(${cart.count})` : ''}
              </button>
              <Link to="/player" className="btn btn--store-ghost">
                Purchase history <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="store-hero__stats">
            <div className="store-stat">
              <b>{products.length}</b>
              <span>Packages</span>
            </div>
            <div className="store-stat">
              <b>Tebex</b>
              <span>Secure checkout</span>
            </div>
            <div className="store-stat">
              <b>Auto</b>
              <span>Delivery</span>
            </div>
          </div>
        </div>
      </header>

      <div className="shell store-body">
        {cancelledRef && (
          <div className="store-notice" style={{ marginTop: 0, marginBottom: '1.2rem' }}>
            <ShieldCheck size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
            <div>
              <strong>Checkout cancelled.</strong> No payment was taken for order {cancelledRef}. You can rebuild
              your selection at any time.
              <button className="link-arrow" style={{ display: 'inline-flex', marginLeft: '0.8rem' }} onClick={cancelOrder}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {status.data && !status.data.configured && (
          <div className="store-notice" style={{ marginTop: 0, marginBottom: '1.4rem' }}>
            <ShieldCheck size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
            <div>
              <strong>Tebex is not connected yet.</strong> The catalogue is live and browsable, but checkout stays
              closed until the store administrator adds the RIA ROLEPLAY Tebex credentials:
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                {status.data.missing.map((key) => (
                  <code key={key}>{key}</code>
                ))}
              </div>
              <span style={{ display: 'block', marginTop: '0.4rem', opacity: 0.85 }}>
                No simulated or fake checkout is offered — payments only ever run through Tebex.
              </span>
            </div>
          </div>
        )}

        {featured.length > 0 && (
          <section style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
            <div className="store-section-title">
              <h2>Featured Packages</h2>
              <span>Curated by the RIA team</span>
            </div>
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} onOpen={setModalProduct} onAdd={addToCart} />
              ))}
            </div>
          </section>
        )}

        <div className="store-section-title">
          <h2>All Packages</h2>
          <span>Memberships, access and cosmetics</span>
        </div>

        <div className="store-toolbar">
          <label className="store-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search packages, memberships, cosmetics"
              aria-label="Search store packages"
            />
          </label>
          <span style={{ fontSize: '0.78rem', color: 'rgba(247,245,237,.5)' }}>{visible.length} packages</span>
        </div>

        <div className="category-scroll" style={{ marginBottom: '1.6rem' }}>
          <button className={`store-chip${category === '' ? ' is-active' : ''}`} onClick={() => setCategory('')}>
            All categories
          </button>
          {categories.map((item) => (
            <button
              key={item}
              className={`store-chip${category === item ? ' is-active' : ''}`}
              onClick={() => setCategory(category === item ? '' : item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-row" style={{ color: 'rgba(247,245,237,.5)' }}>
            <span className="loading-row__bar" />
            Loading packages
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="empty-state" style={{ background: 'var(--ria-panel)', borderColor: 'var(--ria-border)' }}>
            <span className="empty-state__icon">
              <Search size={20} />
            </span>
            <h3 style={{ color: 'var(--ivory)' }}>No packages match that search</h3>
            <p style={{ color: 'rgba(247,245,237,.6)' }}>
              Try another category, or clear the search to see the full collection.
            </p>
            <button
              className="btn btn--ria btn--sm"
              onClick={() => {
                setSearch('');
                setCategory('');
              }}
            >
              Clear search
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
            <h2>How delivery works</h2>
          </div>
          <div className="process" style={{ gap: '1rem' }}>
            {[
              { icon: ShoppingBag, title: 'Choose your packages', text: 'Build a selection of memberships, access or cosmetics.' },
              { icon: ShieldCheck, title: 'Pay on Tebex', text: 'Card details are entered only on the official Tebex checkout.' },
              { icon: Truck, title: 'Server-side verification', text: 'Tebex notifies our server; the payment is re-verified before anything ships.' },
              { icon: PackageCheck, title: 'Delivered automatically', text: 'The entitlement is applied to your FiveM identifier and recorded.' },
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
            <Check size={13} style={{ verticalAlign: '-2px', marginRight: 4, color: 'var(--ria-yellow)' }} />
            All RIA ROLEPLAY packages are cosmetic, membership or access benefits. We do not sell in-game currency,
            randomised rewards, loot boxes or gambling mechanics, and purchases never transfer real-world value back
            to players. Sales follow the Cfx.re Platform License, the Rockstar Creator Platform License and the Tebex
            Acceptable Use Policy. Read the <Link to="/legal/tebex" style={{ color: 'var(--ria-yellow)' }}>store terms</Link>.
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
