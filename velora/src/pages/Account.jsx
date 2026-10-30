import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Heart, LogOut, ShieldCheck, User, ShoppingBag, Check } from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'profile', label: 'پروفایل', icon: User },
  { key: 'saved', label: 'امکانات ذخیره‌شده', icon: Heart },
  { key: 'store', label: 'حساب فروشگاه ریا', icon: ShoppingBag },
];

export default function Account() {
  const { user, loading, updateProfile, signOut } = useAuth();
  const { ids } = useFavorites();
  const { push } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [values, setValues] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    fivemId: user?.fivemId || '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { data } = useFetch('/properties?limit=48');

  if (loading) {
    return (
      <div className="shell">
        <div className="loading-row">
          <span className="loading-row__bar" />
          در حال بارگذاری حساب شما
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;

  const saved = (data?.items || []).filter((property) => ids.includes(property.id));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await updateProfile(values);
      push('پروفایل به‌روزرسانی شد.', 'success');
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await signOut();
    push('از حساب خارج شدید.', 'info');
    navigate('/');
  };

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <span>حساب کاربری</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>حساب کاربری شما</h1>
          </div>
          <button className="btn btn--outline btn--sm" onClick={logout}>
            <LogOut size={14} /> خروج از حساب
          </button>
        </div>
      </div>

      <div className="shell account-grid">
        <nav className="account-nav" aria-label="بخش‌های حساب">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={tab === item.key ? 'is-active' : ''} onClick={() => setTab(item.key)}>
                <Icon size={15} /> {item.label}
                {item.key === 'saved' && <span style={{ marginInlineStart: 'auto', opacity: 0.7 }}>{ids.length}</span>}
              </button>
            );
          })}
          {user.role === 'admin' && (
            <Link to="/admin">
              <ShieldCheck size={15} /> داشبورد مدیریت
            </Link>
          )}
        </nav>

        <div>
          <div className="account-head">
            <span className="account-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {user.email}
              </div>
            </div>
            {user.role === 'admin' && (
              <span className="chip chip--gold" style={{ marginInlineStart: 'auto' }}>
                مدیر
              </span>
            )}
          </div>

          {tab === 'profile' && (
            <div className="panel" style={{ maxWidth: 620 }}>
              <h2 className="panel__title">اطلاعات شخصی</h2>
              <p className="panel__sub">
                برای تأیید درخواست‌ها استفاده می‌شود و برای بازیکنان ریا، برای تطبیق خریدهای فروشگاه با شناسه فایوام
                شما.
              </p>
              <form onSubmit={save}>
                <div className="form-grid">
                  <div className="field form-grid--full">
                    <label className="field__label" htmlFor="ac-name">
                      نام و نام خانوادگی
                    </label>
                    <input
                      id="ac-name"
                      className="field__control"
                      value={values.name}
                      onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="ac-email">
                      ایمیل
                    </label>
                    <input id="ac-email" className="field__control" value={user.email} disabled />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="ac-phone">
                      شماره تماس
                    </label>
                    <input
                      id="ac-phone"
                      className="field__control"
                      value={values.phone}
                      onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="+98 912 555 0100"
                    />
                  </div>
                  <div className="field form-grid--full">
                    <label className="field__label" htmlFor="ac-fivem">
                      شناسه فایوام (اختیاری)
                    </label>
                    <input
                      id="ac-fivem"
                      className="field__control"
                      value={values.fivemId}
                      onChange={(event) => setValues((prev) => ({ ...prev, fivemId: event.target.value }))}
                      placeholder="license:1a2b3c4d5e6f..."
                      aria-invalid={Boolean(errors.fivemId)}
                    />
                    {errors.fivemId && <span className="field__error">{errors.fivemId}</span>}
                    <span className="form-note">
                      تنها برای تحویل خریدهای فروشگاه ریا رول‌پلی استفاده می‌شود و هرگز به‌صورت عمومی منتشر نمی‌شود.
                    </span>
                  </div>
                </div>
                <button className="btn" type="submit" disabled={busy} style={{ marginTop: '1.2rem' }}>
                  {busy ? <span className="btn__spinner" /> : <Check size={15} />} ذخیره تغییرات
                </button>
              </form>
            </div>
          )}

          {tab === 'saved' && (
            <>
              {saved.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">
                    <Heart size={20} />
                  </span>
                  <h3>هنوز امکانی ذخیره نکرده‌اید</h3>
                  <p>هر امکانی را از شهر ذخیره کنید تا اینجا نمایش داده شود.</p>
                  <Link to="/listings" className="btn btn--sm">
                    مرور امکانات
                  </Link>
                </div>
              ) : (
                <div className="results-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
                  {saved.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'store' && (
            <div className="panel" style={{ maxWidth: 620 }}>
              <h2 className="panel__title">فروشگاه ریا رول‌پلی</h2>
              <p className="panel__sub">
                خریدهای فروشگاه با شناسه فایوام شما تطبیق داده می‌شوند. تاریخچه خرید، عضویت‌ها و وضعیت تحویل در بخش
                بازیکن قرار دارد.
              </p>
              <div className="info-list">
                <li>
                  <span>شناسه فایوام</span>
                  <span>{user.fivemId || 'ثبت نشده'}</span>
                </li>
                <li>
                  <span>وضعیت فروشگاه</span>
                  <span>{user.fivemId ? 'آماده تحویل خودکار' : 'برای فعال‌سازی تحویل، شناسه را اضافه کنید'}</span>
                </li>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.2rem' }}>
                <Link to="/store" className="btn btn--sm">
                  رفتن به فروشگاه
                </Link>
                <Link to="/player" className="btn btn--outline btn--sm">
                  تاریخچه خرید
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
