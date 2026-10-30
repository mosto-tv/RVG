import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="shell" style={{ paddingBlock: 'clamp(3rem, 8vw, 6rem)' }}>
      <div className="empty-state" style={{ maxWidth: 640, marginInline: 'auto' }}>
        <span className="empty-state__icon">
          <Compass size={22} />
        </span>
        <h3>This address does not exist</h3>
        <p>
          The page you are looking for has moved or was never listed. The collection, however, is very much open.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn--sm">
            Return home
          </Link>
          <Link to="/listings" className="btn btn--outline btn--sm">
            Browse residences
          </Link>
        </div>
      </div>
    </div>
  );
}
