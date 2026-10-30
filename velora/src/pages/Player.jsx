import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BadgeCheck, Copy, IdCard, LifeBuoy, PackageCheck, RefreshCw, ShoppingBag, Truck } from 'lucide-react';
import { api, formatDateTime, money } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const DELIVERY_CLASS = {
  delivered: 'delivery-pill--delivered',
  pending: 'delivery-pill--pending',
  queued: 'delivery-pill--pending',
  failed: 'delivery-pill--failed',
  not_started: 'delivery-pill--not_started',
};

export default function Player() {
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [summary, setSummary] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });
  const [identifier, setIdentifier] = useState('');
  const [busy, setBusy] = useState(false);
  const [support, setSupport] = useState({ subject: '', message: '', orderReference: '' });
  const [supportErrors, setSupportErrors] = useState({});

  const load = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const data = await api.get('/player/summary');
      setSummary(data);
      setIdentifier(data.user?.fivemId || '');
      setState({ loading: false, error: null });
    } catch (err) {
      setState({ loading: false, error: err });
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (loading) {
    return (
      <div className="shell">
        <div className="loading-row">
          <span className="loading-row__bar" />
          Loading player account
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;

  const saveIdentifier = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.patch('/auth/me', { name: user.name, phone: user.phone || '', fivemId: identifier });
      push('FiveM identifier saved. Deliveries will now target it.', 'success');
      load();
    } catch (err) {
      push(err.fields?.fivemId || err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const submitSupport = async (event) => {
    event.preventDefault();
    setSupportErrors({});
    setBusy(true);
    try {
      const data = await api.post('/player/support', support);
      push(data.message, 'success');
      setSupport({ subject: '', message: '', orderReference: '' });
      load();
    } catch (err) {
      setSupportErrors(err.fields || {});
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const copyIdentifier = async () => {
    if (!summary?.user?.fivemId) return;
    await navigator.clipboard.writeText(summary.user.fivemId);
    push('Identifier copied.', 'success');
  };

  return (
    <>
      <div className="player-hero">
        <div className="shell player-hero__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="account-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <span className="ria-badge">RIA ROLEPLAY · Player account</span>
              <h1 style={{ marginTop: '0.5rem' }}>{user.name}</h1>
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                {summary?.user?.fivemId || 'No FiveM identifier linked yet'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn--ria btn--sm" onClick={load}>
              <RefreshCw size={13} /> Refresh
            </button>
            <Link to="/store" className="btn btn--store-ghost btn--sm">
              <ShoppingBag size={13} /> Visit store
            </Link>
          </div>
        </div>
      </div>

      <div className="shell" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        {state.loading && !summary && (
          <div className="loading-row">
            <span className="loading-row__bar" />
            Loading purchases
          </div>
        )}

        {summary && (
          <>
            <div className="player-stats">
              <div className="player-stat">
                <b>{summary.totals.orders}</b>
                <span>Orders</span>
              </div>
              <div className="player-stat">
                <b>{summary.totals.paid}</b>
                <span>Verified payments</span>
              </div>
              <div className="player-stat">
                <b>{money(summary.totals.spentCents)}</b>
                <span>Total spent</span>
              </div>
              <div className="player-stat">
                <b>{summary.totals.pendingDeliveries}</b>
                <span>Pending deliveries</span>
              </div>
            </div>

            <div className="split-form">
              <div className="panel">
                <h2 className="panel__title">Purchase history</h2>
                <p className="panel__sub">Every order, its payment status and delivery state.</p>

                {summary.orders.length === 0 && (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <span className="empty-state__icon">
                      <ShoppingBag size={18} />
                    </span>
                    <h3>No purchases yet</h3>
                    <p>Packages you buy appear here with their delivery status.</p>
                    <Link to="/store" className="btn btn--sm">
                      Browse the store
                    </Link>
                  </div>
                )}

                {summary.orders.map((order) => (
                  <div key={order.reference} style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>Order {order.reference}</div>
                        <div className="form-note">{formatDateTime(order.createdAt)}</div>
                      </div>
                      <span
                        className={`order-status order-status--${order.status}`}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="order-lines" style={{ marginTop: '0.6rem' }}>
                      {order.items.map((item) => (
                        <div key={`${order.reference}-${item.name}`} className="order-line">
                          <div>
                            <div style={{ fontSize: '0.88rem' }}>{item.name}</div>
                            <span className={`delivery-pill ${DELIVERY_CLASS[item.delivery] || ''}`}>
                              <Truck size={11} /> {item.delivery.replace('_', ' ')}
                            </span>
                          </div>
                          <span>{money(item.priceCents * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <form className="panel" onSubmit={saveIdentifier}>
                  <h2 className="panel__title">FiveM identifier</h2>
                  <p className="panel__sub">
                    Required for automatic delivery. Use the identifier your server reports, for example{' '}
                    <code>license:1a2b3c…</code>.
                  </p>
                  <div className="field">
                    <label className="field__label" htmlFor="pl-fivem">
                      Identifier
                    </label>
                    <input
                      id="pl-fivem"
                      className="field__control"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="license:1a2b3c4d5e6f"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                    <button className="btn btn--sm" type="submit" disabled={busy}>
                      <IdCard size={13} /> Save identifier
                    </button>
                    {summary.user?.fivemId && (
                      <button type="button" className="btn btn--outline btn--sm" onClick={copyIdentifier}>
                        <Copy size={13} /> Copy
                      </button>
                    )}
                  </div>
                </form>

                <div className="panel panel--muted">
                  <h2 className="panel__title" style={{ fontSize: '1.15rem' }}>
                    Active memberships
                  </h2>
                  {summary.memberships.length === 0 ? (
                    <p className="panel__sub" style={{ marginBottom: 0 }}>
                      No memberships delivered yet.
                    </p>
                  ) : (
                    <ul className="info-list" style={{ marginTop: '0.6rem' }}>
                      {summary.memberships.map((row) => (
                        <li key={row.id}>
                          <span>
                            <BadgeCheck size={13} style={{ color: 'var(--forest)' }} /> {row.product_name}
                          </span>
                          <span>{row.status === 'delivered' ? 'Active' : 'Pending'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <form className="panel" onSubmit={submitSupport}>
                  <h2 className="panel__title" style={{ fontSize: '1.15rem' }}>
                    <LifeBuoy size={15} style={{ verticalAlign: '-2px' }} /> Support request
                  </h2>
                  <p className="panel__sub">Delivery issues are answered within 24 hours by the RIA team.</p>
                  <div className="field" style={{ marginBottom: '0.6rem' }}>
                    <label className="field__label" htmlFor="sup-subject">
                      Subject
                    </label>
                    <input
                      id="sup-subject"
                      className="field__control"
                      value={support.subject}
                      onChange={(event) => setSupport((prev) => ({ ...prev, subject: event.target.value }))}
                      aria-invalid={Boolean(supportErrors.subject)}
                    />
                    {supportErrors.subject && <span className="field__error">{supportErrors.subject}</span>}
                  </div>
                  <div className="field" style={{ marginBottom: '0.6rem' }}>
                    <label className="field__label" htmlFor="sup-order">
                      Order reference (optional)
                    </label>
                    <input
                      id="sup-order"
                      className="field__control"
                      value={support.orderReference}
                      onChange={(event) => setSupport((prev) => ({ ...prev, orderReference: event.target.value }))}
                      placeholder="RIA-XXXXXXXX"
                    />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="sup-message">
                      Message
                    </label>
                    <textarea
                      id="sup-message"
                      className="field__control"
                      value={support.message}
                      onChange={(event) => setSupport((prev) => ({ ...prev, message: event.target.value }))}
                      aria-invalid={Boolean(supportErrors.message)}
                      style={{ minHeight: 100 }}
                    />
                    {supportErrors.message && <span className="field__error">{supportErrors.message}</span>}
                  </div>
                  <button className="btn btn--sm" type="submit" disabled={busy} style={{ marginTop: '0.8rem' }}>
                    <PackageCheck size={13} /> Send request
                  </button>
                </form>

                {summary.support.length > 0 && (
                  <div className="panel">
                    <h2 className="panel__title" style={{ fontSize: '1.15rem' }}>
                      Your requests
                    </h2>
                    <ul className="info-list" style={{ marginTop: '0.6rem' }}>
                      {summary.support.map((row) => (
                        <li key={row.id}>
                          <span>{row.subject}</span>
                          <span className="status-pill status-pill--gold">{row.status.replace('_', ' ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
