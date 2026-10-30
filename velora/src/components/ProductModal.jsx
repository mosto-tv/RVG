import { Check, ShieldCheck, Plus } from 'lucide-react';
import Modal from './Modal.jsx';
import { money } from '../lib/api.js';

export default function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null;

  return (
    <Modal open onClose={onClose} wide panelClass="modal__panel--product" labelledBy="product-modal-title">
      <div className="product-modal">
        <div className="product-modal__media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-modal__body">
          <span className="product-card__category">{product.category}</span>
          <h2 id="product-modal-title">{product.name}</h2>
          <p className="modal__sub">{product.tagline}</p>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(247,245,237,.72)' }}>
            {product.description}
          </p>

          <ul className="product-modal__features">
            {product.features.map((feature) => (
              <li key={feature}>
                <Check size={14} /> {feature}
              </li>
            ))}
          </ul>

          <div className="product-card__foot" style={{ paddingTop: 0 }}>
            <div className="price-block">
              <span className="price">{money(product.priceCents, product.currency)}</span>
              {product.originalPriceCents && (
                <span className="price--muted">{money(product.originalPriceCents, product.currency)}</span>
              )}
              <span className="price__note">{product.availability}</span>
            </div>
            <button
              className="btn btn--ria"
              onClick={() => {
                onAdd(product);
                onClose();
              }}
            >
              <Plus size={14} /> Add to selection
            </button>
          </div>

          <p className="cart-legal" style={{ display: 'flex', gap: '0.45rem' }}>
            <ShieldCheck size={14} style={{ flex: '0 0 auto', marginTop: 1 }} />
            Payment is completed on the official RIA ROLEPLAY Tebex checkout. We never see or store your card
            details.
          </p>
        </div>
      </div>
    </Modal>
  );
}
