import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  CalendarDays,
  Check,
  Heart,
  Mail,
  MapPin,
  Maximize,
  Phone,
  Share2,
  Star,
  Mic,
} from 'lucide-react';
import Lightbox from '../components/Lightbox.jsx';
import Modal from '../components/Modal.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { BookingForm, ContactForm } from '../components/Forms.jsx';
import { useFetch } from '../lib/useFetch.js';
import { priceFmt } from '../lib/api.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FEATURE_BLURB = 'Included in this feature';

export default function PropertyDetail() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/properties/${id}`, [id]);
  const { isSaved, toggle } = useFavorites();
  const { push } = useToast();
  const [lightbox, setLightbox] = useState(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const property = data?.property;
  const related = data?.related || [];
  const gallery = property?.gallery || [];
  const saved = property ? isSaved(property.id) : false;

  const mapSrc = useMemo(() => {
    if (!property?.coords) return null;
    const [lat, lng] = property.coords;
    const d = 0.012;
    const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].join('%2C');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [property]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        push('Link copied to clipboard.', 'success');
      }
    } catch {
      push('Sharing was cancelled.', 'info');
    }
  };

  if (loading) {
    return (
      <div className="shell detail">
        <div className="skeleton" style={{ height: 260, borderRadius: 22 }} />
        <div className="loading-row">
          <span className="loading-row__bar" />
          Loading feature
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="shell detail">
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <span className="empty-state__icon">
            <MapPin size={20} />
          </span>
          <h3>This feature is not live right now</h3>
          <p>It may have been rotated out for the season. Our staff can suggest something close to it.</p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/listings" className="btn btn--sm">
              Back to features
            </Link>
            <Link to="/contact" className="btn btn--outline btn--sm">
              Speak to staff
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const agent = property.agentProfile;

  return (
    <div className="shell detail">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <Link to="/listings">Features</Link> <span>/</span>{' '}
        <span>{property.title}</span>
      </nav>

      <div className="gallery">
        <div
          className="gallery__main"
          onClick={() => setLightbox(0)}
          onKeyDown={(event) => event.key === 'Enter' && setLightbox(0)}
          role="button"
          tabIndex={0}
          data-cursor="view"
          aria-label="Open gallery"
        >
          <img src={gallery[0]} alt={`${property.title} — main view`} />
          <span className="gallery__count">
            <Maximize size={12} /> {gallery.length} photos
          </span>
        </div>
        {gallery.slice(1, 3).map((src, index) => (
          <div
            key={src}
            className="gallery__thumb"
            onClick={() => setLightbox(index + 1)}
            role="button"
            tabIndex={0}
            data-cursor="view"
            onKeyDown={(event) => event.key === 'Enter' && setLightbox(index + 1)}
            aria-label={`Open photo ${index + 2}`}
          >
            <img src={src} alt={`${property.title} — view ${index + 2}`} />
          </div>
        ))}
      </div>

      <div className="detail__head">
        <div>
          <span className="eyebrow">{property.type}</span>
          <h1 className="detail__title">{property.title}</h1>
          <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="detail__location">
              <MapPin size={14} /> {property.neighborhood}, {property.city}, {property.country}
            </span>
            <span className="property-card__rating">
              <Star size={13} fill="currentColor" /> {property.rating.toFixed(1)} community rating
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flexWrap: 'wrap' }}>
          <div>
            <div className="detail__price">{priceFmt(property.price)}</div>
            <small className="muted" style={{ fontSize: '0.75rem' }}>
              Average payout · {property.status}
            </small>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className={`icon-btn${saved ? ' ' : ''}`}
              onClick={() => toggle(property.id)}
              aria-label={saved ? 'Remove from saved' : 'Save feature'}
              aria-pressed={saved}
              style={{
                border: '1px solid var(--border)',
                background: saved ? 'var(--emerald)' : 'var(--white)',
                color: saved ? 'var(--gold-soft)' : 'var(--charcoal)',
              }}
            >
              <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button className="icon-btn" onClick={share} aria-label="Share feature" style={{ border: '1px solid var(--border)', background: 'var(--white)' }}>
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="detail__grid">
        <div className="detail__main">
          <div className="spec-strip">
            <div className="spec">
              <span className="spec__value">{property.beds}</span>
              <span className="spec__label">Players</span>
            </div>
            <div className="spec">
              <span className="spec__value">{property.baths}</span>
              <span className="spec__label">Minutes</span>
            </div>
            <div className="spec">
              <span className="spec__value">{property.size.toLocaleString()}</span>
              <span className="spec__label">Rep reward</span>
            </div>
            <div className="spec">
              <span className="spec__value">{property.year}</span>
              <span className="spec__label">Live since</span>
            </div>
          </div>

          <div className="detail-block">
            <h2>{property.headline}</h2>
            <p>{property.description}</p>
          </div>

          <div className="detail-block">
            <h2>System Highlights</h2>
            <div className="feature-grid">
              {property.features.map((feature) => (
                <div key={feature} className="feature-item">
                  <Check size={15} /> {feature}
                </div>
              ))}
            </div>
            <p className="form-note" style={{ marginTop: '0.8rem' }}>
              {FEATURE_BLURB}. Full documentation and a walkthrough are available on request.
            </p>
          </div>

          <div className="detail-block">
            <h2>District</h2>
            <p style={{ marginBottom: '1rem' }}>
              {property.neighborhood}, {property.city} — an interactive map of the streets that inspired it.
            </p>
            <div className="map-frame">
              {mapSrc && (
                <iframe
                  title={`Map of ${property.title}`}
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </div>

          <div className="detail-block">
            <h2>Feature detail</h2>
            <ul className="info-list">
              <li>
                <span>Feature ID</span>
                <span>RIA-{property.id.slice(0, 6).toUpperCase()}</span>
              </li>
              <li>
                <span>Status</span>
                <span>{property.status}</span>
              </li>
              <li>
                <span>Category</span>
                <span>{property.type}</span>
              </li>
              <li>
                <span>Session length</span>
                <span>{property.baths} minutes</span>
              </li>
              <li>
                <span>Average payout</span>
                <span>{priceFmt(property.price)}</span>
              </li>
              <li>
                <span>Lead staff</span>
                <span>{agent?.name || 'Ria staff team'}</span>
              </li>
            </ul>
          </div>
        </div>

        <aside className="detail__side">
          <div className="side-card">
            <div>
              <span className="eyebrow eyebrow--plain" style={{ fontSize: '0.62rem' }}>
                Your lead
              </span>
              <div className="side-card__agent" style={{ marginTop: '0.7rem' }}>
                {agent && <img src={agent.portrait} alt={agent.name} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{agent?.name || 'Ria Staff Team'}</div>
                  <div className="muted" style={{ fontSize: '0.78rem' }}>
                    {agent?.role || 'Server administration'}
                  </div>
                </div>
              </div>
            </div>

            <div className="side-card__actions">
              <button className="btn" onClick={() => setVisitOpen(true)}>
                <CalendarDays size={15} /> Apply To Play
              </button>
              <button className="btn btn--outline" onClick={() => setInfoOpen(true)}>
                <Mail size={15} /> Request Information
              </button>
              {agent && (
                <a href={`mailto:${agent.email}?subject=${encodeURIComponent(`Enquiry: ${property.title}`)}`} className="btn btn--outline">
                  <Phone size={15} /> Contact Staff
                </a>
              )}
              <button
                className="btn btn--outline"
                onClick={() => toggle(property.id)}
                aria-pressed={saved}
              >
                <Heart size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save Feature'}
              </button>
            </div>

            <div className="info-list" style={{ marginTop: '0.2rem' }}>
              <li>
                <span>
                  <Users size={13} /> Players
                </span>
                <span>{property.beds}</span>
              </li>
              <li>
                <span>
                  <Clock size={13} /> Minutes
                </span>
                <span>{property.baths}</span>
              </li>
              <li>
                <span>
                  <Mic size={13} /> Proximity voice
                </span>
                <span>{property.features.includes('Proximity voice') ? 'Enabled' : 'Optional'}</span>
              </li>
            </div>
          </div>

          <div className="panel panel--muted">
            <h3 className="panel__title">Considering this path?</h3>
            <p className="panel__sub" style={{ marginBottom: '0.8rem' }}>
              Our staff can walk you through the systems, or help you pick your first job in the city.
            </p>
            <Link to="/book-visit" className="link-arrow">
              Apply to play <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div className="section-head__text">
              <span className="eyebrow">Similar experiences</span>
              <h2>You may also enjoy</h2>
            </div>
            <Link to="/listings" className="link-arrow">
              All features <ArrowRight size={14} />
            </Link>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      )}

      <div style={{ paddingBottom: '2rem' }}>
        <Link to="/listings" className="link-arrow">
          <ArrowLeft size={14} /> Back to the city
        </Link>
      </div>

      {lightbox !== null && (
        <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      <Modal open={visitOpen} onClose={() => setVisitOpen(false)} labelledBy="visit-title">
        <h2 id="visit-title">Apply for whitelist</h2>
        <p className="modal__sub">
          {property.title} · {property.city}. Choose a preferred date and our staff will confirm.
        </p>
        <BookingForm property={property} onDone={() => setVisitOpen(false)} />
      </Modal>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} labelledBy="info-title">
        <h2 id="info-title">Request more information</h2>
        <p className="modal__sub">
          Send your details and we will share the full feature documentation and onboarding notes for{' '}
          {property.title}.
        </p>
        <ContactForm />
      </Modal>
    </div>
  );
}
