import { useEffect, useState } from 'react';
import { ArrowRight, BedDouble, Heart, MapPin, Maximize, Bath, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { priceFmt } from '../lib/api.js';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function PropertyCard({ property, variant = 'default', showFavorite = true }) {
  const { isSaved, toggle } = useFavorites();
  const [saved, setSaved] = useState(isSaved(property.id));

  useEffect(() => {
    setSaved(isSaved(property.id));
  }, [property.id, isSaved]);

  const className = [
    'property-card',
    variant === 'compact' ? 'property-card--compact' : '',
    variant === 'wide' ? 'property-card--wide' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className}>
      <Link to={`/listings/${property.id}`} className="property-card__media" aria-label={property.title}>
        <img src={property.image} alt={`${property.title}, ${property.city}`} loading="lazy" />
        <span className="property-card__frame" />
        <span className="property-card__badges">
          {property.featured && <span className="badge badge--gold">Featured</span>}
          <span className="badge">{property.type}</span>
        </span>
      </Link>

      {showFavorite && (
        <button
          className={`fav-btn${saved ? ' is-saved' : ''}`}
          onClick={() => toggle(property.id)}
          aria-label={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
          aria-pressed={saved}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      )}

      <div className="property-card__body">
        <div className="property-card__top">
          <div>
            <h3 className="property-card__title">
              <Link to={`/listings/${property.id}`}>{property.title}</Link>
            </h3>
            <span className="property-card__location">
              <MapPin size={12} /> {property.neighborhood}, {property.city}
            </span>
          </div>
          <span className="property-card__rating">
            <Star size={13} fill="currentColor" /> {property.rating.toFixed(1)}
          </span>
        </div>

        <span className="property-card__price">{priceFmt(property.price)}</span>

        <div className="property-card__meta">
          <span>
            <BedDouble size={13} /> {property.beds} Beds
          </span>
          <span>
            <Bath size={13} /> {property.baths} Baths
          </span>
          <span>
            <Maximize size={13} /> {property.size.toLocaleString()} sq ft
          </span>
        </div>

        <div className="property-card__foot">
          <span className="badge badge--emerald">{property.status}</span>
          <Link to={`/listings/${property.id}`} className="property-card__link">
            View Details <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
