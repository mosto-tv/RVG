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
          در حال بارگذاری فهرست شما
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
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <span>امکانات ذخیره‌شده</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>امکانات ذخیره‌شده</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              فهرستی خصوصی، تنها برای شما. {ids.length} امکان ذخیره شده است.
            </p>
          </div>
          <Link to="/listings" className="btn btn--outline">
            مرور شهر
          </Link>
        </div>
      </div>

      <div className="shell" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        {loadingProperties && (
          <div className="loading-row">
            <span className="loading-row__bar" />
            در حال بارگذاری امکانات
          </div>
        )}

        {!loadingProperties && saved.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Heart size={20} />
            </span>
            <h3>هنوز چیزی ذخیره نکرده‌اید</h3>
            <p>با زدن قلب روی هر امکان، آن را برای بعد اینجا نگه دارید.</p>
            <Link to="/listings" className="btn btn--sm">
              مرور امکانات
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
