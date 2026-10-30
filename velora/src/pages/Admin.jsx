import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  RefreshCw,
  ReceiptText,
  Search,
  ShieldAlert,
  Truck,
  Users,
  LifeBuoy,
  Inbox,
} from 'lucide-react';
import { api, formatDateTime, money } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'products', label: 'Products', icon: Boxes },
  { key: 'orders', label: 'Orders', icon: ReceiptText },
  { key: 'deliveries', label: 'Deliveries', icon: Truck },
  { key: 'players', label: 'Player lookup', icon: Users },
  { key: 'support', label: 'Support', icon: LifeBuoy },
  { key: 'inbox', label: 'Inbox', icon: Inbox },
];

const statusClass = (status) =>
  status === 'paid' || status === 'delivered'
    ? 'status-pill'
    : status === 'failed' || status === 'cancelled'
      ? 'status-pill status-pill--red'
      : status === 'pending' || status === 'queued'
        ? 'status-pill status-pill--gold'
        : 'status-pill status-pill--grey';

export default function Admin() {
  const { user, loading } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [support, setSupport] = useState([]);
  const [inbox, setInbox] = useState(null);
  const [lookup, setLookup] = useState({ q: '', result: null });
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadOverview = useCallback(async () => {
    const data = await api.get('/admin/overview');
    setOverview(data);
  }, []);

  const loadTab = useCallback(
    async (key) => {
      setBusy(true);
      try {
        if (key === 'overview') await loadOverview();
        if (key === 'products') setProducts((await api.get('/admin/products')).items);
        if (key === 'orders') setOrders((await api.get('/admin/orders')).items);
        if (key === 'deliveries') setDeliveries((await api.get('/admin/deliveries')).items);
        if (key === 'support') setSupport((await api.get('/admin/support')).items);
        if (key === 'inbox') setInbox(await api.get('/admin/inbox'));
      } catch (err) {
        push(err.message, 'error');
      } finally {
        setBusy(false);
      }
    },
    [loadOverview, push],
  );

  useEffect(() => {
    if (user?.role === 'admin') loadTab(tab);
  }, [tab, user, loadTab]);

  if (loading) {
    return (
      <div className="shell">
        <div className="loading-row">
          <span className="loading-row__bar" />
          Verifying access
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;

  if (user.role !== 'admin') {
    return (
      <div className="shell" style={{ paddingBlock: '3rem' }}>
        <div className="empty-state">
          <span className="empty-state__icon">
            <ShieldAlert size={20} />
          </span>
          <h3>Administrator access required</h3>
          <p>This dashboard is restricted to RIA ROLEPLAY administrators. Your account does not have that role.</p>
          <Link to="/store" className="btn btn--sm">
            Back to the store
          </Link>
        </div>
      </div>
    );
  }

  const toggleProduct = async (product, key) => {
    try {
      const data = await api.patch(`/admin/products/${product.id}`, { [key]: !product[key] });
      setProducts((prev) => prev.map((item) => (item.id === product.id ? { ...item, ...data.product } : item)));
      push(`${product.name} updated.`, 'success');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const syncTebex = async () => {
    setSyncing(true);
    try {
      const data = await api.post('/admin/sync-tebex', {});
      push(`Tebex sync complete — ${data.linked} packages linked, ${data.updatedPrices} prices updated.`, 'success');
      loadTab('products');
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const redeliver = async (reference) => {
    try {
      await api.post(`/admin/orders/${reference}/resend-delivery`, {});
      push('Delivery attempt recorded.', 'success');
      loadTab('orders');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const setDelivery = async (row, status) => {
    try {
      await api.patch(`/admin/deliveries/${row.id}`, { status });
      push(`Delivery marked ${status}.`, 'success');
      loadTab('deliveries');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const setSupportStatus = async (row, status) => {
    try {
      await api.patch(`/admin/support/${row.id}`, { status });
      push('Support request updated.', 'success');
      loadTab('support');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const runLookup = async (event) => {
    event.preventDefault();
    if (!lookup.q.trim()) return;
    setBusy(true);
    try {
      const result = await api.get(`/admin/players?identifier=${encodeURIComponent(lookup.q.trim())}`);
      setLookup((prev) => ({ ...prev, result }));
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head__inner">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <Link to="/store">Store</Link> <span>/</span>{' '}
              <span>Admin</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem', fontSize: '2.1rem' }}>Store administration</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn--outline btn--sm" onClick={() => loadTab(tab)} disabled={busy}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="btn btn--sm" onClick={syncTebex} disabled={syncing}>
              {syncing ? <span className="btn__spinner" /> : <RefreshCw size={13} />} Sync Tebex packages
            </button>
          </div>
        </div>
      </div>

      <div className="admin-shell">
        <nav className="admin-nav" aria-label="Admin sections">
          <span className="admin-nav__title">RIA ROLEPLAY</span>
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={tab === item.key ? 'is-active' : ''} onClick={() => setTab(item.key)}>
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="admin-main">
          {tab === 'overview' && !overview && <div className="admin-empty">Loading dashboard…</div>}

          {tab === 'overview' && overview && (
            <>
              <div className="admin-cards">
                <div className="admin-card">
                  <b>{money(overview.revenueCents)}</b>
                  <span>Verified revenue</span>
                </div>
                <div className="admin-card">
                  <b>{overview.ordersByStatus.find((row) => row.status === 'paid')?.count || 0}</b>
                  <span>Paid orders</span>
                </div>
                <div className="admin-card admin-card--alert">
                  <b>{overview.pendingDeliveries}</b>
                  <span>Deliveries needing attention</span>
                </div>
                <div className="admin-card">
                  <b>{overview.newsletter}</b>
                  <span>Newsletter subscribers</span>
                </div>
              </div>

              <div className="panel">
                <h2 className="panel__title">Tebex connection</h2>
                <p className="panel__sub">
                  {overview.tebex.configured
                    ? 'Connected. Checkout, webhooks and verification are active.'
                    : `Not connected — missing ${overview.tebex.missing.join(', ')}.`}
                </p>
                <ul className="info-list">
                  <li>
                    <span>Checkout (public token)</span>
                    <span>{overview.tebex.configured ? 'Configured' : 'Missing'}</span>
                  </li>
                  <li>
                    <span>Webhook signature secret</span>
                    <span>{overview.tebex.missing.includes('TEBEX_WEBHOOK_SECRET') ? 'Missing' : 'Configured'}</span>
                  </li>
                  <li>
                    <span>FiveM delivery endpoint</span>
                    <span>{overview.tebex.deliveryConfigured ? 'Configured' : 'Manual delivery'}</span>
                  </li>
                  <li>
                    <span>Store URL</span>
                    <span>{overview.tebex.storeUrl || 'Not set'}</span>
                  </li>
                </ul>
              </div>

              <div className="split-form">
                <div className="panel">
                  <h2 className="panel__title">Recent orders</h2>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Player</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.recentOrders.length === 0 && (
                          <tr>
                            <td colSpan={4} className="admin-empty">
                              No orders yet.
                            </td>
                          </tr>
                        )}
                        {overview.recentOrders.map((order) => (
                          <tr key={order.reference}>
                            <td className="data-table__mono">{order.reference}</td>
                            <td className="data-table__mono">{order.playerIdentifier}</td>
                            <td>{money(order.totalCents)}</td>
                            <td>
                              <span className={statusClass(order.status)}>{order.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="panel">
                  <h2 className="panel__title">Top packages</h2>
                  {overview.topProducts.length === 0 ? (
                    <p className="panel__sub">No paid packages yet.</p>
                  ) : (
                    <ul className="info-list">
                      {overview.topProducts.map((row) => (
                        <li key={row.name}>
                          <span>{row.name}</span>
                          <span>{money(row.revenue)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <h2 className="panel__title" style={{ marginTop: '1.4rem' }}>
                    Webhook activity
                  </h2>
                  <ul className="info-list">
                    {overview.webhooks.length === 0 && <li><span>No events received yet.</span></li>}
                    {overview.webhooks.map((event) => (
                      <li key={event.id}>
                        <span className="data-table__mono">{event.event_type}</span>
                        <span>{event.signature_valid ? 'verified' : 'rejected'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {tab === 'products' && (
            <div className="panel">
              <h2 className="panel__title">Products &amp; Tebex packages</h2>
              <p className="panel__sub">
                Prices shown on the storefront. Use “Sync Tebex packages” to link live packages and import real
                prices from Tebex.
              </p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Package</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Tebex ID</th>
                      <th>Visible</th>
                      <th>Featured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                          <div className="form-note">{product.availability}</div>
                        </td>
                        <td>{product.category}</td>
                        <td>{money(product.priceCents, product.currency)}</td>
                        <td className="data-table__mono">{product.tebexPackageId || '—'}</td>
                        <td>
                          <button className="btn btn--outline btn--sm" onClick={() => toggleProduct(product, 'visible')}>
                            {product.visible ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td>
                          <button className="btn btn--outline btn--sm" onClick={() => toggleProduct(product, 'featured')}>
                            {product.featured ? 'Featured' : 'Standard'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="panel">
              <h2 className="panel__title">Orders</h2>
              <p className="panel__sub">Payment status comes from Tebex webhooks that are re-verified server-side.</p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Placed</th>
                      <th>Player</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          No orders recorded yet.
                        </td>
                      </tr>
                    )}
                    {orders.map((order) => (
                      <tr key={order.reference}>
                        <td className="data-table__mono">{order.reference}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td className="data-table__mono">{order.playerIdentifier}</td>
                        <td>{order.items.map((item) => item.name).join(', ')}</td>
                        <td>{money(order.totalCents)}</td>
                        <td>
                          <span className={statusClass(order.status)}>{order.status}</span>
                        </td>
                        <td>
                          {order.status === 'paid' && (
                            <button className="btn btn--outline btn--sm" onClick={() => redeliver(order.reference)}>
                              Re-deliver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'deliveries' && (
            <div className="panel">
              <h2 className="panel__title">Deliveries</h2>
              <p className="panel__sub">
                Failed hand-offs are parked as <b>pending</b> and never retried automatically. Confirm manually only
                after applying the entitlement in-game.
              </p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Package</th>
                      <th>Player</th>
                      <th>Attempts</th>
                      <th>Status</th>
                      <th>Last error</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          No deliveries recorded yet.
                        </td>
                      </tr>
                    )}
                    {deliveries.map((row) => (
                      <tr key={row.id}>
                        <td className="data-table__mono">{row.reference}</td>
                        <td>{row.product_name}</td>
                        <td className="data-table__mono">{row.player_identifier}</td>
                        <td>{row.attempts}</td>
                        <td>
                          <span className={statusClass(row.status)}>{row.status}</span>
                        </td>
                        <td className="form-note" style={{ maxWidth: 240 }}>
                          {row.last_error || '—'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {row.status !== 'delivered' && (
                            <button className="btn btn--outline btn--sm" onClick={() => setDelivery(row, 'delivered')}>
                              Mark delivered
                            </button>
                          )}
                          {row.status !== 'failed' && (
                            <button
                              className="btn btn--outline btn--sm"
                              style={{ marginLeft: 4 }}
                              onClick={() => setDelivery(row, 'failed')}
                            >
                              Mark failed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'players' && (
            <div className="panel">
              <h2 className="panel__title">Player purchase lookup</h2>
              <p className="panel__sub">Search by FiveM identifier, email or name.</p>
              <form className="admin-toolbar" onSubmit={runLookup}>
                <input
                  className="input"
                  value={lookup.q}
                  onChange={(event) => setLookup((prev) => ({ ...prev, q: event.target.value }))}
                  placeholder="license:1a2b3c… or player@email.com"
                  aria-label="Player identifier or email"
                />
                <button className="btn btn--sm" type="submit" disabled={busy}>
                  <Search size={13} /> Search
                </button>
              </form>

              {lookup.result && (
                <>
                  <h3 style={{ fontSize: '1.05rem', marginBlock: '1rem 0.5rem' }}>Accounts</h3>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>FiveM identifier</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lookup.result.users.length === 0 && (
                          <tr>
                            <td colSpan={4} className="admin-empty">
                              No matching accounts.
                            </td>
                          </tr>
                        )}
                        {lookup.result.users.map((row) => (
                          <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.email}</td>
                            <td className="data-table__mono">{row.fivem_id || '—'}</td>
                            <td>{row.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', marginBlock: '1.2rem 0.5rem' }}>Orders</h3>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Player</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lookup.result.orders.length === 0 && (
                          <tr>
                            <td colSpan={4} className="admin-empty">
                              No orders for this player.
                            </td>
                          </tr>
                        )}
                        {lookup.result.orders.map((order) => (
                          <tr key={order.reference}>
                            <td className="data-table__mono">{order.reference}</td>
                            <td className="data-table__mono">{order.playerIdentifier}</td>
                            <td>{money(order.totalCents)}</td>
                            <td>
                              <span className={statusClass(order.status)}>{order.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'support' && (
            <div className="panel">
              <h2 className="panel__title">Support requests</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Received</th>
                      <th>From</th>
                      <th>Order</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {support.length === 0 && (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          No support requests.
                        </td>
                      </tr>
                    )}
                    {support.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateTime(row.created_at)}</td>
                        <td>{row.email || row.user_id}</td>
                        <td className="data-table__mono">{row.order_reference || '—'}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.subject}</div>
                          <div className="form-note" style={{ maxWidth: 320 }}>
                            {row.message}
                          </div>
                        </td>
                        <td>
                          <span className={statusClass(row.status)}>{row.status.replace('_', ' ')}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="btn btn--outline btn--sm" onClick={() => setSupportStatus(row, 'in_progress')}>
                            In progress
                          </button>
                          <button
                            className="btn btn--outline btn--sm"
                            style={{ marginLeft: 4 }}
                            onClick={() => setSupportStatus(row, 'closed')}
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'inbox' && (
            <div className="split-form">
              <div className="panel">
                <h2 className="panel__title">Viewing requests</h2>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Residence</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inbox?.bookings || []).length === 0 && (
                        <tr>
                          <td colSpan={3} className="admin-empty">
                            No viewing requests.
                          </td>
                        </tr>
                      )}
                      {(inbox?.bookings || []).map((row) => (
                        <tr key={row.id}>
                          <td>
                            {row.name}
                            <div className="form-note">{row.email}</div>
                          </td>
                          <td>{row.property_title || 'General tour'}</td>
                          <td>
                            {row.preferred_date} · {row.preferred_time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel">
                <h2 className="panel__title">Messages</h2>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>Subject</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inbox?.messages || []).length === 0 && (
                        <tr>
                          <td colSpan={2} className="admin-empty">
                            No messages.
                          </td>
                        </tr>
                      )}
                      {(inbox?.messages || []).map((row) => (
                        <tr key={row.id}>
                          <td>
                            {row.name}
                            <div className="form-note">{row.email}</div>
                          </td>
                          <td>
                            {row.subject || 'Enquiry'}
                            <div className="form-note">{row.message.slice(0, 90)}…</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h2 className="panel__title" style={{ marginTop: '1.4rem' }}>
                  Newsletter
                </h2>
                <p className="panel__sub">{inbox?.newsletter?.length || 0} subscribers</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
