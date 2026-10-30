import { Link } from 'react-router-dom';
import { Check, Plus, ShoppingBag } from 'lucide-react';
import { money } from '../lib/api.js';

export default function ProductCard({ product, onOpen, onAdd }) {
  return (
    <article className="product-card">
      <button
        type="button"
        className="product-card__media"
        onClick={() => onOpen(product)}
        aria-label={`View ${product.name}`}
        data-cursor="view"
        style={{ border: 'none', padding: 0, cursor: 'pointer', background: 'none', display: 'block' }}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-card__badges">
          {product.badge && <span className="store-badge">{product.badge}</span>}
          {product.discountPercent ? (
            <span className="store-badge store-badge--emerald">−{product.discountPercent}%</span>
          ) : null}
        </span>
      </button>

      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__tagline">{product.tagline}</p>

        <ul className="product-card__features">
          {product.features.slice(0, 3).map((feature) => (
            <li key={feature}>
              <Check size={13} /> {feature}
            </li>
          ))}
        </ul>

        <div className="product-card__foot">
          <div className="price-block">
            <span className="price">{money(product.priceCents, product.currency)}</span>
            {product.originalPriceCents ? (
              <span className="price--muted">{money(product.originalPriceCents, product.currency)}</span>
            ) : (
              <span className="price__note">One-time · Tebex checkout</span>
            )}
          </div>
          <div className="product-card__actions">
            <button className="btn btn--sm btn--ria" onClick={() => onAdd(product)}>
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        <button
          type="button"
          className="link-arrow"
          onClick={() => onOpen(product)}
          style={{ background: 'none', padding: 0, marginTop: '0.4rem' }}
        >
          <ShoppingBag size={13} /> Package details
        </button>
      </div>
    </article>
  );
}

export const ProductLink = ({ product }) => (
  <Link to={`/store?product=${product.slug}`} className="product-card__name">
    {product.name}
  </Link>
);
