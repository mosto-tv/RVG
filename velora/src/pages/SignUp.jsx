import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const IMAGE = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=85';

export default function SignUp() {
  const { user, signUp } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = 'نام و نام خانوادگی خود را وارد کنید.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) next.email = 'یک نشانی ایمیل معتبر وارد کنید.';
    if (values.password.length < 8) next.password = 'گذرواژه باید حداقل ۸ کاراکتر باشد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await signUp(values);
      push('حساب ساخته شد. به ریا خوش آمدید.', 'success');
      navigate('/account');
    } catch (err) {
      setErrors(err.fields || { email: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__media">
        <img src={IMAGE} alt="مرکز شهر لس سانتوس در غروب" />
        <div className="auth-page__quote">
          <p>«هر جزئیاتی پیش از آنکه به فکر پرسیدنش بیفتیم، انجام شده بود.»</p>
          <span>بازیکن وایت‌لیست‌شده، بلین کانتی</span>
        </div>
      </div>
      <div className="auth-page__form">
        <div className="auth-card">
          <span className="eyebrow">دسترسی بازیکن</span>
          <h1>ساخت حساب کاربری</h1>
          <p className="lede" style={{ marginTop: '-0.4rem' }}>
            امکانات را ذخیره کنید، برای وایت‌لیست درخواست بدهید و خریدهای فروشگاه ریا را یکجا نگه دارید.
          </p>
          <form onSubmit={submit} noValidate style={{ display: 'grid', gap: '0.9rem' }}>
            <div className="field">
              <label className="field__label" htmlFor="su-name">
                نام و نام خانوادگی
              </label>
              <input
                id="su-name"
                className="field__control"
                value={values.name}
                onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
              />
              {errors.name && <span className="field__error">{errors.name}</span>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="su-email">
                نشانی ایمیل
              </label>
              <input
                id="su-email"
                type="email"
                className="field__control"
                value={values.email}
                onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                aria-invalid={Boolean(errors.email)}
                autoComplete="email"
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="su-phone">
                شماره تماس (اختیاری)
              </label>
              <input
                id="su-phone"
                className="field__control"
                value={values.phone}
                onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
                autoComplete="tel"
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="su-password">
                گذرواژه
              </label>
              <input
                id="su-password"
                type="password"
                className="field__control"
                value={values.password}
                onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
                aria-invalid={Boolean(errors.password)}
                autoComplete="new-password"
              />
              {errors.password && <span className="field__error">{errors.password}</span>}
              <span className="form-note">حداقل ۸ کاراکتر.</span>
            </div>
            <button className="btn btn--block" type="submit" disabled={busy}>
              {busy ? <span className="btn__spinner" /> : <UserPlus size={15} />} ساخت حساب
            </button>
          </form>
          <p className="auth-switch">
            قبلاً وایت‌لیست گرفته‌اید؟ <Link to="/signin">ورود</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
