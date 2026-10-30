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
              <Link to="/">Home</Link> <span>/</span> <span>Apply</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>Apply for the city</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              Every application is read by a member of staff and followed by a short voice interview. Choose a date
              and we will confirm within one business day.
            </p>
          </div>
        </div>
      </div>

      <div className="shell split-form" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="panel">
          <h2 className="panel__title">Whitelist application</h2>
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
                  View feature
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
                  <Clock size={13} /> Interview
                </span>
                <span>20–30 minutes</span>
              </li>
              <li>
                <span>
                  <ShieldCheck size={13} /> Reviewed by
                </span>
                <span>Staff, in private</span>
              </li>
            </ul>
            <p className="form-note" style={{ marginTop: '0.9rem' }}>
              Applying with friends? Add their Discord handles in the message and we will schedule a group
              interview.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
