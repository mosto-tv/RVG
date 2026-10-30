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
import { statusLabel } from '../lib/labels.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'overview', label: 'نمای کلی', icon: BarChart3 },
  { key: 'products', label: 'محصولات', icon: Boxes },
  { key: 'orders', label: 'سفارش‌ها', icon: ReceiptText },
  { key: 'deliveries', label: 'تحویل‌ها', icon: Truck },
  { key: 'players', label: 'جستجوی بازیکن', icon: Users },
  { key: 'support', label: 'پشتیبانی', icon: LifeBuoy },
  { key: 'inbox', label: 'صندوق پیام', icon: Inbox },
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
          در حال بررسی دسترسی
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
          <h3>دسترسی مدیر لازم است</h3>
          <p>این داشبورد تنها در اختیار مدیران ریا رول‌پلی است. حساب شما این نقش را ندارد.</p>
          <Link to="/store" className="btn btn--sm">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const toggleProduct = async (product, key) => {
    try {
      const data = await api.patch(`/admin/products/${product.id}`, { [key]: !product[key] });
      setProducts((prev) => prev.map((item) => (item.id === product.id ? { ...item, ...data.product } : item)));
      push(`${product.name} به‌روزرسانی شد.`, 'success');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const syncTebex = async () => {
    setSyncing(true);
    try {
      const data = await api.post('/admin/sync-tebex', {});
      push(
        `همگام‌سازی Tebex کامل شد — ${data.linked} پکیج متصل و ${data.updatedPrices} قیمت به‌روزرسانی شد.`,
        'success',
      );
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
      push('تلاش برای تحویل ثبت شد.', 'success');
      loadTab('orders');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const setDelivery = async (row, status) => {
    try {
      await api.patch(`/admin/deliveries/${row.id}`, { status });
      push(`وضعیت تحویل به «${statusLabel(status)}» تغییر کرد.`, 'success');
      loadTab('deliveries');
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const setSupportStatus = async (row, status) => {
    try {
      await api.patch(`/admin/support/${row.id}`, { status });
      push('درخواست پشتیبانی به‌روزرسانی شد.', 'success');
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
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <Link to="/store">فروشگاه</Link> <span>/</span>{' '}
              <span>مدیریت</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem', fontSize: '2.1rem' }}>مدیریت فروشگاه</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn--outline btn--sm" onClick={() => loadTab(tab)} disabled={busy}>
              <RefreshCw size={13} /> به‌روزرسانی
            </button>
            <button className="btn btn--sm" onClick={syncTebex} disabled={syncing}>
              {syncing ? <span className="btn__spinner" /> : <RefreshCw size={13} />} همگام‌سازی پکیج‌های Tebex
            </button>
          </div>
        </div>
      </div>

      <div className="admin-shell">
        <nav className="admin-nav" aria-label="بخش‌های مدیریت">
          <span className="admin-nav__title">ریا رول‌پلی</span>
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
          {tab === 'overview' && !overview && <div className="admin-empty">در حال بارگذاری داشبورد…</div>}

          {tab === 'overview' && overview && (
            <>
              <div className="admin-cards">
                <div className="admin-card">
                  <b>{money(overview.revenueCents)}</b>
                  <span>درآمد تأییدشده</span>
                </div>
                <div className="admin-card">
                  <b>{overview.ordersByStatus.find((row) => row.status === 'paid')?.count || 0}</b>
                  <span>سفارش پرداخت‌شده</span>
                </div>
                <div className="admin-card admin-card--alert">
                  <b>{overview.pendingDeliveries}</b>
                  <span>تحویل نیازمند بررسی</span>
                </div>
                <div className="admin-card">
                  <b>{overview.newsletter}</b>
                  <span>عضو خبرنامه</span>
                </div>
              </div>

              <div className="panel">
                <h2 className="panel__title">اتصال Tebex</h2>
                <p className="panel__sub">
                  {overview.tebex.configured
                    ? 'متصل است. پرداخت، وب‌هوک‌ها و تأیید تراکنش فعال هستند.'
                    : `متصل نیست — موارد ناموجود: ${overview.tebex.missing.join('، ')}.`}
                </p>
                <ul className="info-list">
                  <li>
                    <span>درگاه پرداخت (توکن عمومی)</span>
                    <span>{overview.tebex.configured ? 'تنظیم شده' : 'ناموجود'}</span>
                  </li>
                  <li>
                    <span>کلید امضای وب‌هوک</span>
                    <span>{overview.tebex.missing.includes('TEBEX_WEBHOOK_SECRET') ? 'ناموجود' : 'تنظیم شده'}</span>
                  </li>
                  <li>
                    <span>نقطه تحویل فایوام</span>
                    <span>{overview.tebex.deliveryConfigured ? 'تنظیم شده' : 'تحویل دستی'}</span>
                  </li>
                  <li>
                    <span>نشانی فروشگاه</span>
                    <span>{overview.tebex.storeUrl || 'تنظیم نشده'}</span>
                  </li>
                </ul>
              </div>

              <div className="split-form">
                <div className="panel">
                  <h2 className="panel__title">سفارش‌های اخیر</h2>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>شماره</th>
                          <th>بازیکن</th>
                          <th>مبلغ</th>
                          <th>وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.recentOrders.length === 0 && (
                          <tr>
                            <td colSpan={4} className="admin-empty">
                              هنوز سفارشی ثبت نشده است.
                            </td>
                          </tr>
                        )}
                        {overview.recentOrders.map((order) => (
                          <tr key={order.reference}>
                            <td className="data-table__mono">{order.reference}</td>
                            <td className="data-table__mono">{order.playerIdentifier}</td>
                            <td>{money(order.totalCents)}</td>
                            <td>
                              <span className={statusClass(order.status)}>{statusLabel(order.status)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="panel">
                  <h2 className="panel__title">پرفروش‌ترین پکیج‌ها</h2>
                  {overview.topProducts.length === 0 ? (
                    <p className="panel__sub">هنوز پکیج پرداخت‌شده‌ای نیست.</p>
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
                    فعالیت وب‌هوک
                  </h2>
                  <ul className="info-list">
                    {overview.webhooks.length === 0 && (
                      <li>
                        <span>هنوز رویدادی دریافت نشده است.</span>
                      </li>
                    )}
                    {overview.webhooks.map((event) => (
                      <li key={event.id}>
                        <span className="data-table__mono">{event.event_type}</span>
                        <span>{event.signature_valid ? 'تأیید‌شده' : 'ردشده'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {tab === 'products' && (
            <div className="panel">
              <h2 className="panel__title">محصولات و پکیج‌های Tebex</h2>
              <p className="panel__sub">
                قیمت‌هایی که در فروشگاه نمایش داده می‌شود. با «همگام‌سازی پکیج‌های Tebex» پکیج‌های فعال را متصل و
                قیمت‌های واقعی را از Tebex وارد کنید.
              </p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>پکیج</th>
                      <th>دسته</th>
                      <th>قیمت</th>
                      <th>شناسه Tebex</th>
                      <th>نمایش</th>
                      <th>ویژه</th>
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
                            {product.visible ? 'نمایان' : 'پنهان'}
                          </button>
                        </td>
                        <td>
                          <button className="btn btn--outline btn--sm" onClick={() => toggleProduct(product, 'featured')}>
                            {product.featured ? 'ویژه' : 'عادی'}
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
              <h2 className="panel__title">سفارش‌ها</h2>
              <p className="panel__sub">وضعیت پرداخت از وب‌هوک‌های Tebex می‌آید که در سمت سرور دوباره بررسی می‌شوند.</p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>شماره</th>
                      <th>تاریخ</th>
                      <th>بازیکن</th>
                      <th>اقلام</th>
                      <th>مبلغ</th>
                      <th>وضعیت</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          هنوز سفارشی ثبت نشده است.
                        </td>
                      </tr>
                    )}
                    {orders.map((order) => (
                      <tr key={order.reference}>
                        <td className="data-table__mono">{order.reference}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td className="data-table__mono">{order.playerIdentifier}</td>
                        <td>{order.items.map((item) => item.name).join('، ')}</td>
                        <td>{money(order.totalCents)}</td>
                        <td>
                          <span className={statusClass(order.status)}>{statusLabel(order.status)}</span>
                        </td>
                        <td>
                          {order.status === 'paid' && (
                            <button className="btn btn--outline btn--sm" onClick={() => redeliver(order.reference)}>
                              تحویل دوباره
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
              <h2 className="panel__title">تحویل‌ها</h2>
              <p className="panel__sub">
                تحویل‌های ناموفق به‌صورت <b>در انتظار</b> نگه داشته می‌شوند و هرگز خودکار دوباره تلاش نمی‌شوند. تنها
                پس از اعمال مزایا در بازی، به‌صورت دستی تأیید کنید.
              </p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>سفارش</th>
                      <th>پکیج</th>
                      <th>بازیکن</th>
                      <th>تلاش‌ها</th>
                      <th>وضعیت</th>
                      <th>آخرین خطا</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          هنوز تحویلی ثبت نشده است.
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
                          <span className={statusClass(row.status)}>{statusLabel(row.status)}</span>
                        </td>
                        <td className="form-note" style={{ maxWidth: 240 }}>
                          {row.last_error || '—'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {row.status !== 'delivered' && (
                            <button className="btn btn--outline btn--sm" onClick={() => setDelivery(row, 'delivered')}>
                              ثبت به‌عنوان تحویل‌شده
                            </button>
                          )}
                          {row.status !== 'failed' && (
                            <button
                              className="btn btn--outline btn--sm"
                              style={{ marginInlineStart: 4 }}
                              onClick={() => setDelivery(row, 'failed')}
                            >
                              ثبت به‌عنوان ناموفق
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
              <h2 className="panel__title">جستجوی خرید بازیکن</h2>
              <p className="panel__sub">جستجو بر اساس شناسه فایوام، ایمیل یا نام.</p>
              <form className="admin-toolbar" onSubmit={runLookup}>
                <input
                  className="input"
                  value={lookup.q}
                  onChange={(event) => setLookup((prev) => ({ ...prev, q: event.target.value }))}
                  placeholder="license:1a2b3c… یا player@email.com"
                  aria-label="شناسه یا ایمیل بازیکن"
                />
                <button className="btn btn--sm" type="submit" disabled={busy}>
                  <Search size={13} /> جستجو
                </button>
              </form>

              {lookup.result && (
                <>
                  <h3 style={{ fontSize: '1.05rem', marginBlock: '1rem 0.5rem' }}>حساب‌ها</h3>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>نام</th>
                          <th>ایمیل</th>
                          <th>شناسه فایوام</th>
                          <th>نقش</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lookup.result.users.length === 0 && (
                          <tr>
                            <td colSpan={4} className="admin-empty">
                              حسابی مطابق جستجو پیدا نشد.
                            </td>
                          </tr>
                        )}
                        {lookup.result.users.map((row) => (
                          <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.email}</td>
                            <td className="data-table__mono">{row.fivem_id || '—'}</td>
                            <td>{row.role === 'admin' ? 'مدیر' : 'کاربر'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', marginBlock: '1.2rem 0.5rem' }}>سفارش‌ها</h3>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>شماره</th>
                          <th>بازیکن</th>
                          <th>مبلغ</th>
                          <th>وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lookup.result.orders.length === 0 && (
                          <tr>
                            <td colSpan={4} className="admin-empty">
                              سفارشی برای این بازیکن ثبت نشده است.
                            </td>
                          </tr>
                        )}
                        {lookup.result.orders.map((order) => (
                          <tr key={order.reference}>
                            <td className="data-table__mono">{order.reference}</td>
                            <td className="data-table__mono">{order.playerIdentifier}</td>
                            <td>{money(order.totalCents)}</td>
                            <td>
                              <span className={statusClass(order.status)}>{statusLabel(order.status)}</span>
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
              <h2 className="panel__title">درخواست‌های پشتیبانی</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>دریافت</th>
                      <th>فرستنده</th>
                      <th>سفارش</th>
                      <th>موضوع</th>
                      <th>وضعیت</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {support.length === 0 && (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          درخواست پشتیبانی‌ای وجود ندارد.
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
                          <span className={statusClass(row.status)}>{statusLabel(row.status)}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button
                            className="btn btn--outline btn--sm"
                            onClick={() => setSupportStatus(row, 'in_progress')}
                          >
                            در حال بررسی
                          </button>
                          <button
                            className="btn btn--outline btn--sm"
                            style={{ marginInlineStart: 4 }}
                            onClick={() => setSupportStatus(row, 'closed')}
                          >
                            بستن
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
                <h2 className="panel__title">درخواست‌های وایت‌لیست</h2>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>نام</th>
                        <th>امکان</th>
                        <th>زمان</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inbox?.bookings || []).length === 0 && (
                        <tr>
                          <td colSpan={3} className="admin-empty">
                            درخواستی وجود ندارد.
                          </td>
                        </tr>
                      )}
                      {(inbox?.bookings || []).map((row) => (
                        <tr key={row.id}>
                          <td>
                            {row.name}
                            <div className="form-note">{row.email}</div>
                          </td>
                          <td>{row.property_title || 'درخواست عمومی'}</td>
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
                <h2 className="panel__title">پیام‌ها</h2>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>فرستنده</th>
                        <th>موضوع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inbox?.messages || []).length === 0 && (
                        <tr>
                          <td colSpan={2} className="admin-empty">
                            پیامی وجود ندارد.
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
                            {row.subject || 'پرسش'}
                            <div className="form-note">{row.message.slice(0, 90)}…</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h2 className="panel__title" style={{ marginTop: '1.4rem' }}>
                  خبرنامه
                </h2>
                <p className="panel__sub">{inbox?.newsletter?.length || 0} عضو</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
