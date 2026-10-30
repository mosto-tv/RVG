import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const IMAGE = 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85';

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
    if (values.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) next.email = 'Enter a valid email address.';
    if (values.password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await signUp(values);
      push('Account created. Welcome to Velora.', 'success');
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
        <img src={IMAGE} alt="Contemporary residence interior" />
        <div className="auth-page__quote">
          <p>“Every detail was handled before we thought to ask.”</p>
          <span>Private client, Dubai</span>
        </div>
      </div>
      <div className="auth-page__form">
        <div className="auth-card">
          <span className="eyebrow">Client access</span>
          <h1>Create an account</h1>
          <p className="lede" style={{ marginTop: '-0.4rem' }}>
            Save residences, request viewings and keep your RIA store purchases together.
          </p>
          <form onSubmit={submit} noValidate style={{ display: 'grid', gap: '0.9rem' }}>
            <div className="field">
              <label className="field__label" htmlFor="su-name">
                Full name
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
                Email address
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
                Phone (optional)
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
                Password
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
              <span className="form-note">At least 8 characters.</span>
            </div>
            <button className="btn btn--block" type="submit" disabled={busy}>
              {busy ? <span className="btn__spinner" /> : <UserPlus size={15} />} Create account
            </button>
          </form>
          <p className="auth-switch">
            Already a client? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
