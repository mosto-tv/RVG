import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Heart, LogOut, ShieldCheck, User, ShoppingBag, Check } from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'saved', label: 'Saved residences', icon: Heart },
  { key: 'store', label: 'RIA store account', icon: ShoppingBag },
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
          Loading your account
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
      push('Profile updated.', 'success');
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await signOut();
    push('Signed out.', 'info');
    navigate('/');
  };

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <span>Account</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>Your Account</h1>
          </div>
          <button className="btn btn--outline btn--sm" onClick={logout}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div className="shell account-grid">
        <nav className="account-nav" aria-label="Account sections">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={tab === item.key ? 'is-active' : ''} onClick={() => setTab(item.key)}>
                <Icon size={15} /> {item.label}
                {item.key === 'saved' && <span style={{ marginLeft: 'auto', opacity: 0.7 }}>{ids.length}</span>}
              </button>
            );
          })}
          <Link to="/player">
            <ShoppingBag size={15} /> Purchases &amp; deliveries
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin">
              <ShieldCheck size={15} /> Admin dashboard
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
            {user.role === 'admin' && <span className="chip chip--gold" style={{ marginLeft: 'auto' }}>Administrator</span>}
          </div>

          {tab === 'profile' && (
            <div className="panel" style={{ maxWidth: 620 }}>
              <h2 className="panel__title">Personal details</h2>
              <p className="panel__sub">
                Used for viewing confirmations and, for RIA players, to match store purchases to your FiveM
                identifier.
              </p>
              <form onSubmit={save}>
                <div className="form-grid">
                  <div className="field form-grid--full">
                    <label className="field__label" htmlFor="ac-name">
                      Full name
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
                      Email
                    </label>
                    <input id="ac-email" className="field__control" value={user.email} disabled />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="ac-phone">
                      Phone
                    </label>
                    <input
                      id="ac-phone"
                      className="field__control"
                      value={values.phone}
                      onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="+971 4 555 0100"
                    />
                  </div>
                  <div className="field form-grid--full">
                    <label className="field__label" htmlFor="ac-fivem">
                      FiveM identifier (optional)
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
                      Used only to deliver RIA ROLEPLAY store purchases. Never shared publicly.
                    </span>
                  </div>
                </div>
                <button className="btn" type="submit" disabled={busy} style={{ marginTop: '1.2rem' }}>
                  {busy ? <span className="btn__spinner" /> : <Check size={15} />} Save changes
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
                  <h3>No saved residences yet</h3>
                  <p>Save any residence from the collection and it will appear here.</p>
                  <Link to="/listings" className="btn btn--sm">
                    Explore listings
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
              <h2 className="panel__title">RIA ROLEPLAY store</h2>
              <p className="panel__sub">
                Store purchases are matched to your FiveM identifier. Your purchase history, memberships and delivery
                status live in the player area.
              </p>
              <div className="info-list">
                <li>
                  <span>FiveM identifier</span>
                  <span>{user.fivemId || 'Not set'}</span>
                </li>
                <li>
                  <span>Store status</span>
                  <span>{user.fivemId ? 'Ready for automatic delivery' : 'Add an identifier to enable delivery'}</span>
                </li>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.2rem' }}>
                <Link to="/store" className="btn btn--sm">
                  Visit the store
                </Link>
                <Link to="/player" className="btn btn--outline btn--sm">
                  Purchase history
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
