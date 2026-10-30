import { Link, Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useFetch } from '../lib/useFetch.js';

export default function Favorites() {
  const { user, loading } = useAuth();
  const { ids } = useFavorites();
  const { data, loading: loadingProperties } = useFetch('/properties?limit=48');

  if (loading) {
    return (
      <div className="shell">
        <div className="loading-row">
          <span className="loading-row__bar" />
          Loading your list
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  const saved = (data?.items || []).filter((property) => ids.includes(property.id));

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <span>Saved features</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>Saved Features</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              A private list, visible only to you. {ids.length} feature{ids.length === 1 ? '' : 's'} saved.
            </p>
          </div>
          <Link to="/listings" className="btn btn--outline">
            Browse the city
          </Link>
        </div>
      </div>

      <div className="shell" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        {loadingProperties && (
          <div className="loading-row">
            <span className="loading-row__bar" />
            Loading features
          </div>
        )}

        {!loadingProperties && saved.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Heart size={20} />
            </span>
            <h3>Nothing saved yet</h3>
            <p>Tap the heart on any feature to keep it here for later.</p>
            <Link to="/listings" className="btn btn--sm">
              Explore features
            </Link>
          </div>
        )}

        {saved.length > 0 && (
          <div className="results-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
            {saved.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
