import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, CircleDashed, Copy, RefreshCw, ShieldAlert, Truck } from 'lucide-react';
import { api, formatDateTime, money } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

const STATUS_LABEL = {
  pending: 'در انتظار تأیید Tebex',
  paid: 'پرداخت تأیید شده',
  failed: 'پرداخت ناموفق',
  cancelled: 'لغو شده',
  refunded: 'بازگشت وجه شده',
};

const DELIVERY_LABEL = {
  delivered: 'تحویل شده',
  pending: 'در انتظار بررسی',
  queued: 'در صف',
  failed: 'ناموفق',
  not_started: 'شروع نشده',
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
      push('شماره سفارش کپی شد.', 'success');
    } catch {
      push('کپی شماره سفارش ممکن نشد.', 'error');
    }
  };

  return (
    <div className="shell order-page">
      <nav className="crumbs" aria-label="مسیر صفحه" style={{ marginBottom: '1.2rem' }}>
        <Link to="/">خانه</Link> <span>/</span> <Link to="/store">فروشگاه ریا</Link> <span>/</span>{' '}
        <span>سفارش {reference}</span>
      </nav>

      {state.loading && !order && (
        <div className="loading-row">
          <span className="loading-row__bar" />
          در حال بررسی وضعیت پرداخت
        </div>
      )}

      {state.error && !order && (
        <div className="panel">
          <h2 className="panel__title">
            {forbidden ? 'این سفارش نیازمند لینک تسویه خود است' : 'سفارش در دسترس نیست'}
          </h2>
          <p className="panel__sub">
            {forbidden
              ? 'برای حفظ حریم خصوصی، هر سفارش تنها از همان مرورگری باز می‌شود که تسویه را آغاز کرده، یا از حساب بازیکن شما اگر هنگام خرید وارد شده بودید.'
              : state.error.message}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link to="/player" className="btn btn--sm">
              باز کردن تاریخچه خرید
            </Link>
            <Link to="/store" className="btn btn--outline btn--sm">
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      )}

      {order && (
        <div className="order-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span className={`order-status order-status--${order.status}`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
              <h1 style={{ fontSize: '1.9rem', marginTop: '0.8rem' }}>سفارش {order.reference}</h1>
              <p className="muted" style={{ fontSize: '0.86rem', marginTop: '0.3rem' }}>
                ثبت‌شده در {formatDateTime(order.createdAt)} · پرداخت از طریق Tebex
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <button className="btn btn--outline btn--sm" onClick={copy}>
                <Copy size={13} /> کپی شماره
              </button>
              <button className="btn btn--outline btn--sm" onClick={load}>
                <RefreshCw size={13} /> به‌روزرسانی
              </button>
            </div>
          </div>

          <div className="timeline">
            <div className={`timeline__step ${order.status !== 'pending' ? 'is-done' : ''}`}>
              <span className="timeline__dot" />
              <span>
                <b>درگاه باز شد</b> — سفارش برای {order.email} ثبت شد
              </span>
            </div>
            <div className={`timeline__step ${order.status === 'paid' ? 'is-done' : ''}`}>
              <span className="timeline__dot" />
              <span>
                <b>پرداخت در سمت سرور تأیید شد</b>{' '}
                {order.paidAt ? `— ${formatDateTime(order.paidAt)}` : '— در انتظار وب‌هوک Tebex'}
              </span>
            </div>
            <div
              className={`timeline__step ${
                order.items.every((item) => item.delivery === 'delivered') ? 'is-done' : ''
              }`}
            >
              <span className="timeline__dot" />
              <span>
                <b>مزایا تحویل داده شد</b> به {order.playerIdentifier}
              </span>
            </div>
          </div>

          {order.status !== 'paid' && (
            <div className="form-alert form-alert--info">
              <CircleDashed size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
              <span>
                این صفحه به‌طور خودکار به‌روزرسانی می‌شود. تا زمانی که Tebex پرداخت را به سرور ما تأیید نکند چیزی
                تحویل داده نمی‌شود — می‌توانید این تب را ببندید و بعداً از همان مرورگر یا حساب بازیکن خود برگردید.
              </span>
            </div>
          )}

          {order.status === 'paid' && order.items.some((item) => item.delivery !== 'delivered') && (
            <div className="form-alert form-alert--error">
              <ShieldAlert size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
              <span>
                پرداخت تأیید شده است. یک یا چند پکیج در صف تحویل دستی قرار دارند — تیم ریا مطلع شده و به‌زودی آن‌ها
                را تکمیل می‌کند. می‌توانید از حساب بازیکن خود هم درخواست پشتیبانی ثبت کنید.
              </span>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>پکیج‌ها</h2>
            <div className="order-lines">
              {order.items.map((item) => (
                <div key={item.name} className="order-line">
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className="order-line__delivery">
                      تعداد {item.quantity} ·{' '}
                      <span className={`delivery-pill delivery-pill--${item.delivery}`}>
                        <Truck size={11} /> {DELIVERY_LABEL[item.delivery] || item.delivery}
                      </span>
                    </div>
                  </div>
                  <span>{money(item.priceCents * item.quantity)}</span>
                </div>
              ))}
              <div className="order-line" style={{ borderBottom: 'none', fontWeight: 700 }}>
                <span>مجموع پرداخت‌شده</span>
                <span>{money(order.totalCents)}</span>
              </div>
            </div>
          </div>

          <div className="info-list">
            <li>
              <span>شناسه بازیکن</span>
              <span className="data-table__mono">{order.playerIdentifier}</span>
            </li>
            <li>
              <span>تراکنش Tebex</span>
              <span className="data-table__mono">{order.transactionId || 'در انتظار'}</span>
            </li>
            <li>
              <span>ارائه‌دهنده</span>
              <span>Tebex (ریا رول‌پلی)</span>
            </li>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link to="/player" className="btn btn--sm">
              <CheckCircle2 size={14} /> تاریخچه خرید
            </Link>
            <Link to="/store" className="btn btn--outline btn--sm">
              ادامه خرید
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
