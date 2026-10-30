import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2 } from 'lucide-react';

export default function LocationsGrid({ items = [] }) {
  return (
    <div className="locations-grid">
      {items.map((location) => (
        <Link
          key={location.slug}
          to={`/listings?location=${encodeURIComponent(location.city)}`}
          className={`location-card loc--${location.slug}`}
          data-cursor="explore"
        >
          <img src={location.image} alt={`${location.name}, ${location.city}`} loading="lazy" />
          <div>
            <span className="location-card__city">{location.city}</span>
            <h3 className="location-card__name">{location.name}</h3>
            <p className="location-card__desc">{location.description}</p>
          </div>
          <div className="location-card__foot">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={12} /> {location.properties} properties
            </span>
            <span className="location-card__link">
              Explore <ArrowUpRight size={13} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
