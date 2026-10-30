import { useEffect, useState } from 'react';
import { ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react';
import { api, money } from '../lib/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function CartDrawer() {
  const cart = useCart();
  const { user } = useAuth();
  const { push } = useToast();
  const [email, setEmail] = useState(user?.email || '');
  const [playerIdentifier, setPlayerIdentifier] = useState(user?.fivemId || '');
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail((prev) => prev || user.email);
    if (user?.fivemId) setPlayerIdentifier((prev) => prev || user.fivemId);
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle('is-locked', cart.open);
    return () => document.body.classList.remove('is-locked');
  }, [cart.open]);

  if (!cart.open) return null;

  const checkout = async (event) => {
    event.preventDefault();
    setProblem(null);
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = 'Enter the email for your Tebex receipt.';
    if (!/^(license2?|steam|discord|fivem|xbl|live):[A-Za-z0-9:_-]{4,80}$/.test(playerIdentifier.trim())) {
      next.playerIdentifier = 'Use your FiveM identifier, e.g. license:1a2b3c4d5e.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const data = await api.post('/store/checkout', {
        items: cart.items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        email,
        playerIdentifier: playerIdentifier.trim(),
      });
      // Remember the order token so the return page can read the receipt.
      window.localStorage.setItem(
        `velora_order_${data.reference}`,
        JSON.stringify({ token: data.accessToken, at: Date.now() }),
      );
      push('Opening the official Tebex checkout…', 'info');
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setBusy(false);
      if (err.fields) setErrors(err.fields);
      if (err.code === 'TEBEX_NOT_CONFIGURED' || err.code === 'PACKAGES_NOT_LINKED' || err.code === 'TEBEX_ERROR') {
        setProblem({ code: err.code, message: err.message, missing: err.missing, packages: err.packages });
      } else {
        push(err.message, 'error');
      }
    }
  };

  return (
    <>
      <div className="drawer-scrim" onClick={cart.closeCart} aria-hidden="true" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your selection">
        <div className="cart-drawer__head">
          <h2>
            <ShoppingBag size={18} style={{ verticalAlign: '-3px', marginRight: '0.4rem', color: 'var(--ria-yellow)' }} />
            Your selection
          </h2>
          <button className="icon-btn icon-btn--store" onClick={cart.closeCart} aria-label="Close cart">
            <X size={17} />
          </button>
        </div>

        <div className="cart-drawer__body">
          {cart.items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(247,245,237,.55)' }}>
              <ShoppingBag size={26} style={{ marginBottom: '0.6rem' }} />
              <p style={{ fontSize: '0.9rem' }}>Your selection is empty.</p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Add a package from the store to continue.</p>
            </div>
          )}

          {cart.items.map((item) => (
            <div key={item.slug} className="cart-item">
              <img src={item.image} alt="" />
              <div>
                <div className="cart-item__name">{item.name}</div>
                <div className="cart-item__meta">
                  {money(item.priceCents)} · Qty {item.quantity}
                </div>
              </div>
              <button className="cart-item__remove" onClick={() => cart.remove(item.slug)} aria-label={`Remove ${item.name}`}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {cart.items.length > 0 && (
          <div className="cart-drawer__foot">
            <div className="cart-total">
              <span>Total</span>
              <b>{money(cart.totalCents)}</b>
            </div>

            {problem && (
              <div className="store-notice" style={{ marginTop: 0 }}>
                <ShieldCheck size={16} style={{ flex: '0 0 auto', marginTop: 2 }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{problem.message}</strong>
                  {problem.missing?.length ? (
                    <span>
                      Required configuration: {problem.missing.map((key) => <code key={key}>{key}</code>)}
                    </span>
                  ) : null}
                  {problem.packages?.length ? <span>Unlinked packages: {problem.packages.join(', ')}</span> : null}
                </div>
              </div>
            )}

            <form onSubmit={checkout} style={{ display: 'grid', gap: '0.7rem' }}>
              <div className="field">
                <label className="field__label" htmlFor="cart-email">
                  Receipt email
                </label>
                <input
                  id="cart-email"
                  type="email"
                  className="field__control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="field__error">{errors.email}</span>}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="cart-fivem">
                  FiveM identifier
                </label>
                <input
                  id="cart-fivem"
                  className="field__control"
                  value={playerIdentifier}
                  onChange={(event) => setPlayerIdentifier(event.target.value)}
                  aria-invalid={Boolean(errors.playerIdentifier)}
                  placeholder="license:1a2b3c4d5e6f..."
                />
                {errors.playerIdentifier && <span className="field__error">{errors.playerIdentifier}</span>}
              </div>
              <button type="submit" className="btn btn--ria btn--block" disabled={busy}>
                {busy ? <span className="btn__spinner" /> : null}
                {busy ? 'Opening Tebex' : 'Purchase via Tebex'}
              </button>
            </form>

            <p className="cart-legal">
              You will be redirected to the official RIA ROLEPLAY Tebex checkout. Delivery is automatic once Tebex
              confirms payment server-side.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
