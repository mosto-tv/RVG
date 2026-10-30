import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, CircleDashed, Copy, RefreshCw, ShieldAlert, Truck } from 'lucide-react';
import { api, formatDateTime, money } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

const STATUS_LABEL = {
  pending: 'Awaiting Tebex confirmation',
  paid: 'Payment verified',
  failed: 'Payment failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const DELIVERY_LABEL = {
  delivered: 'Delivered',
  pending: 'Pending review',
  queued: 'Queued',
  failed: 'Failed',
  not_started: 'Not started',
};

export default function OrderConfirmation() {
  const { reference } = useParams();
  const { push } = useToast();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });
  const [forbidden, setForbidden] = useState(false);

  const token = (() => {
    try {
      const raw = window.localStorage.getItem(`velora_order_${reference}`);
      return raw ? JSON.parse(raw).token : '';
    } catch {
      return '';
    }
  })();

  const load = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const data = await api.get(`/store/orders/${reference}${token ? `?token=${token}` : ''}`);
      setOrder(data.order);
      setState({ loading: false, error: null });
    } catch (err) {
      setForbidden(err.status === 403);
      setState({ loading: false, error: err });
    }
  }, [reference, token]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      push('Order reference copied.', 'success');
    } catch {
      push('Could not copy the reference.', 'error');
    }
  };

  return (
    <div className="shell order-page">
      <nav className="crumbs" aria-label="Breadcrumb" style={{ marginBottom: '1.2rem' }}>
        <Link to="/">Home</Link> <span>/</span> <Link to="/store">RIA Store</Link> <span>/</span>{' '}
        <span>Order {reference}</span>
      </nav>

      {state.loading && !order && (
        <div className="loading-row">
          <span className="loading-row__bar" />
          Checking payment status
        </div>
      )}

      {state.error && !order && (
        <div className="panel">
          <h2 className="panel__title">
            {forbidden ? 'This order needs its checkout link' : 'Order not available'}
          </h2>
          <p className="panel__sub">
            {forbidden
              ? 'For privacy, an order can only be opened from the browser that started the checkout, or from your player account if you were signed in.'
              : state.error.message}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link to="/player" className="btn btn--sm">
              Open purchase history
            </Link>
            <Link to="/store" className="btn btn--outline btn--sm">
              Back to the store
            </Link>
          </div>
        </div>
      )}

      {order && (
        <div className="order-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span className={`order-status order-status--${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span>
              <h1 style={{ fontSize: '1.9rem', marginTop: '0.8rem' }}>Order {order.reference}</h1>
              <p className="muted" style={{ fontSize: '0.86rem', marginTop: '0.3rem' }}>
                Placed {formatDateTime(order.createdAt)} · Paid via Tebex
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <button className="btn btn--outline btn--sm" onClick={copy}>
                <Copy size={13} /> Reference
              </button>
              <button className="btn btn--outline btn--sm" onClick={load}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          <div className="timeline">
            <div className={`timeline__step ${order.status !== 'pending' ? 'is-done' : ''}`}>
              <span className="timeline__dot" />
              <span>
                <b>Checkout opened</b> — order created for {order.email}
              </span>
            </div>
            <div className={`timeline__step ${order.status === 'paid' ? 'is-done' : ''}`}>
              <span className="timeline__dot" />
              <span>
                <b>Payment verified server-side</b>{' '}
                {order.paidAt ? `— ${formatDateTime(order.paidAt)}` : '— awaiting the Tebex webhook'}
              </span>
            </div>
            <div
              className={`timeline__step ${
                order.items.every((item) => item.delivery === 'delivered') ? 'is-done' : ''
              }`}
            >
              <span className="timeline__dot" />
              <span>
                <b>Entitlement delivered</b> to {order.playerIdentifier}
              </span>
            </div>
          </div>

          {order.status !== 'paid' && (
            <div className="form-alert form-alert--info">
              <CircleDashed size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
              <span>
                This page refreshes automatically. Nothing is delivered until Tebex confirms the payment to our
                server — you can safely close this tab and return later from the same browser or your player
                account.
              </span>
            </div>
          )}

          {order.status === 'paid' && order.items.some((item) => item.delivery !== 'delivered') && (
            <div className="form-alert form-alert--error">
              <ShieldAlert size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
              <span>
                Payment is confirmed. One or more packages are queued for manual delivery — the RIA team has been
                notified and will complete them shortly. You can also raise a support request from your player
                account.
              </span>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Packages</h2>
            <div className="order-lines">
              {order.items.map((item) => (
                <div key={item.name} className="order-line">
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className="order-line__delivery">
                      Qty {item.quantity} ·{' '}
                      <span className={`delivery-pill delivery-pill--${item.delivery}`}>
                        <Truck size={11} /> {DELIVERY_LABEL[item.delivery] || item.delivery}
                      </span>
                    </div>
                  </div>
                  <span>{money(item.priceCents * item.quantity)}</span>
                </div>
              ))}
              <div className="order-line" style={{ borderBottom: 'none', fontWeight: 700 }}>
                <span>Total paid</span>
                <span>{money(order.totalCents)}</span>
              </div>
            </div>
          </div>

          <div className="info-list">
            <li>
              <span>Player identifier</span>
              <span className="data-table__mono">{order.playerIdentifier}</span>
            </li>
            <li>
              <span>Tebex transaction</span>
              <span className="data-table__mono">{order.transactionId || 'Pending'}</span>
            </li>
            <li>
              <span>Provider</span>
              <span>Tebex (RIA ROLEPLAY)</span>
            </li>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link to="/player" className="btn btn--sm">
              <CheckCircle2 size={14} /> Purchase history
            </Link>
            <Link to="/store" className="btn btn--outline btn--sm">
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
