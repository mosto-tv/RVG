import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, Clock, ShieldCheck } from 'lucide-react';
import { BookingForm } from '../components/Forms.jsx';
import { useFetch } from '../lib/useFetch.js';
import { priceFmt } from '../lib/api.js';

export default function BookVisit() {
  const [params] = useSearchParams();
  const propertyId = params.get('property');
  const { data } = useFetch(propertyId ? `/properties/${propertyId}` : '/properties?limit=1', [propertyId]);
  const property = propertyId ? data?.property : null;

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <span>Book a visit</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>Book a private visit</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              Viewings are arranged by appointment, accompanied by the residence advisor. Choose a date and we will
              confirm within one business day.
            </p>
          </div>
        </div>
      </div>

      <div className="shell split-form" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="panel">
          <h2 className="panel__title">Viewing request</h2>
          <p className="panel__sub">All fields marked are required. Your details stay private.</p>
          <BookingForm property={property} />
        </div>

        <aside style={{ display: 'grid', gap: '1rem' }}>
          {property && (
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <img src={property.image} alt={property.title} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
              <div style={{ padding: '1.1rem 1.2rem 1.3rem' }}>
                <span className="eyebrow" style={{ fontSize: '0.6rem' }}>
                  {property.type}
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginTop: '0.4rem' }}>
                  {property.title}
                </h3>
                <p className="muted" style={{ fontSize: '0.85rem' }}>
                  {property.neighborhood}, {property.city}
                </p>
                <p style={{ color: 'var(--emerald)', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginTop: '0.4rem' }}>
                  {priceFmt(property.price)}
                </p>
                <Link to={`/listings/${property.id}`} className="link-arrow" style={{ marginTop: '0.7rem' }}>
                  View residence
                </Link>
              </div>
            </div>
          )}

          <div className="panel panel--muted">
            <h3 className="panel__title" style={{ fontSize: '1.1rem' }}>
              What to expect
            </h3>
            <ul className="info-list" style={{ marginTop: '0.8rem' }}>
              <li>
                <span>
                  <CalendarCheck size={13} /> Confirmation
                </span>
                <span>Within 1 business day</span>
              </li>
              <li>
                <span>
                  <Clock size={13} /> Duration
                </span>
                <span>45–60 minutes</span>
              </li>
              <li>
                <span>
                  <ShieldCheck size={13} /> Discretion
                </span>
                <span>Private, no open house</span>
              </li>
            </ul>
            <p className="form-note" style={{ marginTop: '0.9rem' }}>
              Travelling? Ask for a live virtual walkthrough instead — our advisors can host a video viewing.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
