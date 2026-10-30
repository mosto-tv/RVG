import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, ArrowRight, MapPin } from 'lucide-react';
import { api, priceFmt } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cityLabel } from '../lib/labels.js';

const NAV = [
  { to: '/', label: 'خانه' },
  { to: '/listings', label: 'امکانات' },
  { to: '/projects', label: 'نقشه راه' },
  { to: '/agents', label: 'تیم مدیریت' },
  { to: '/about', label: 'درباره ما' },
  { to: '/contact', label: 'تماس' },
];

export const Brand = ({ light = false, onClick }) => (
  <Link to="/" className={`brand${light ? ' brand--light' : ''}`} onClick={onClick} aria-label="صفحه اصلی ریا رول‌پلی">
    <span className="brand__main">RIA</span>
    <span className="brand__sub">ROLEPLAY</span>
  </Link>
);

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  const isStore = location.pathname.startsWith('/store') || location.pathname.startsWith('/player');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setTerm('');
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle('is-locked', menuOpen);
    return () => document.body.classList.remove('is-locked');
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || term.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.get(`/properties${api.query({ q: term.trim(), limit: 5 })}`);
        if (!controller.signal.aborted) setResults(data.items || []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 260);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term, searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = term.trim();
    setSearchOpen(false);
    navigate(value ? `/listings?q=${encodeURIComponent(value)}` : '/listings');
  };

  const overHero = location.pathname === '/' || isStore;

  return (
    <>
      <header
        className={`site-header${scrolled ? ' is-scrolled' : ''}${overHero && !scrolled ? ' site-header--over' : ''}${
          isStore ? ' site-header--dark' : ''
        }`}
      >
        <div className="shell header__inner">
          <Brand light={isStore} />

          <nav className="nav" aria-label="ناوبری اصلی">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <button
              className="icon-btn"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="جستجوی امکانات"
              aria-expanded={searchOpen}
            >
              <Search size={18} />
            </button>
            <Link
              to={user ? '/account' : '/signin'}
              className="icon-btn"
              aria-label={user ? 'حساب کاربری شما' : 'ورود به حساب'}
            >
              <User size={18} />
            </Link>
            {isStore && (
              <button className="icon-btn" onClick={cart.openCart} aria-label="باز کردن سبد خرید">
                <ShoppingBag size={18} />
                {cart.count > 0 && <span className="icon-btn__badge">{cart.count}</span>}
              </button>
            )}
            <Link to="/book-visit" className="btn btn--gold btn--sm header__cta">
              درخواست عضویت
            </Link>
            <button
              className="icon-btn hamburger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="منو"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-flyout">
            <div className="shell search-flyout__inner">
              <form className="search-flyout__row" onSubmit={submitSearch}>
                <Search size={18} color="var(--muted)" />
                <input
                  ref={inputRef}
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="جستجو بر اساس محله، دسته‌بندی یا نام امکان"
                  aria-label="جستجوی امکانات"
                />
                <button type="submit" className="btn btn--sm">
                  جستجو
                </button>
              </form>
              {searching && <p className="form-note">در حال جستجو در شهر…</p>}
              {!searching && term.trim().length >= 2 && results.length === 0 && (
                <p className="form-note">هیچ امکانی با «{term.trim()}» پیدا نشد. یک محله یا دسته‌بندی را امتحان کنید.</p>
              )}
              {results.length > 0 && (
                <div className="search-flyout__results">
                  {results.map((item) => (
                    <Link key={item.id} to={`/listings/${item.id}`} className="search-result">
                      <img src={item.image} alt="" />
                      <span>
                        <span className="search-result__title">{item.title}</span>
                        <span className="search-result__meta">
                          {cityLabel(item.city)} · درآمد {priceFmt(item.price)} · {item.beds} بازیکن
                        </span>
                      </span>
                      <ArrowRight size={15} style={{ marginInlineStart: 'auto', color: 'var(--muted)' }} />
                    </Link>
                  ))}
                </div>
              )}
              {term.trim().length < 2 && (
                <p className="form-note">
                  «واینوود»، «مسابقات»، «مشاغل» یا نام یک امکان را بنویسید — نتایج هم‌زمان با تایپ به‌روز می‌شود.
                </p>
              )}
            </div>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="mobile-nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="mobile-nav__link" onClick={() => setMenuOpen(false)}>
              {item.label}
              <ArrowRight size={18} />
            </NavLink>
          ))}
          <NavLink to="/store" className="mobile-nav__link" onClick={() => setMenuOpen(false)}>
            فروشگاه ریا
            <ArrowRight size={18} />
          </NavLink>
          <div className="mobile-nav__footer">
            <Link to="/book-visit" className="btn btn--gold btn--block" onClick={() => setMenuOpen(false)}>
              درخواست عضویت
            </Link>
            <Link
              to={user ? '/account' : '/signin'}
              className="btn btn--outline btn--block"
              onClick={() => setMenuOpen(false)}
            >
              {user ? 'حساب من' : 'ورود'}
            </Link>
            <p className="form-note" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <MapPin size={14} /> لس سانتوس · سندی شورز · پالتو بی · گریپ‌سید · کایو پریکو
            </p>
          </div>
        </div>
      )}
    </>
  );
}
