import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const IMAGE = 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=85';

export default function SignIn() {
  const { user, signIn } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/account'} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await signIn(values);
      push('Welcome back.', 'success');
      navigate(location.state?.from || '/account');
    } catch (err) {
      setErrors(err.fields || { password: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__media">
        <img src={IMAGE} alt="Los Santos skyline at golden hour" />
        <div className="auth-page__quote">
          <p>“Three years in and the city still surprises me.”</p>
          <span>Whitelisted player, Los Santos</span>
        </div>
      </div>
      <div className="auth-page__form">
        <div className="auth-card">
          <span className="eyebrow">Player access</span>
          <h1>Sign in</h1>
          <p className="lede" style={{ marginTop: '-0.4rem' }}>
            Your saved features, whitelist applications and RIA store purchases in one place.
          </p>
          <form onSubmit={submit} noValidate style={{ display: 'grid', gap: '0.9rem' }}>
            <div className="field">
              <label className="field__label" htmlFor="si-email">
                Email address
              </label>
              <input
                id="si-email"
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
              <label className="field__label" htmlFor="si-password">
                Password
              </label>
              <input
                id="si-password"
                type="password"
                className="field__control"
                value={values.password}
                onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
                aria-invalid={Boolean(errors.password)}
                autoComplete="current-password"
              />
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>
            <button className="btn btn--block" type="submit" disabled={busy}>
              {busy ? <span className="btn__spinner" /> : <LogIn size={15} />} Sign in
            </button>
          </form>
          <p className="auth-switch">
            New to Ria? <Link to="/signup">Create an account</Link>
          </p>
          <Link to="/store" className="link-arrow" style={{ justifyContent: 'center' }}>
            RIA store <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
