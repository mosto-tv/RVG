import { Link } from 'react-router-dom';
import { Building2, Crown, Landmark, Waves, Store, Cpu } from 'lucide-react';

const ICONS = {
  Villas: Building2,
  Penthouses: Crown,
  Apartments: Landmark,
  'Waterfront Homes': Waves,
  'Commercial Spaces': Store,
  'Smart Homes': Cpu,
};

const ORDER = ['Villas', 'Penthouses', 'Apartments', 'Waterfront Homes', 'Commercial Spaces', 'Smart Homes'];

export { ORDER as CATEGORY_ORDER, ICONS as CATEGORY_ICONS };

export default function CategoryGrid({ types = [], activeType = '' }) {
  return (
    <div className="category-grid">
      {ORDER.map((name) => {
        const Icon = ICONS[name];
        const count = types.find((entry) => entry.name === name)?.count ?? 0;
        return (
          <Link
            key={name}
            to={`/listings?type=${encodeURIComponent(name)}`}
            className={`category-card${activeType === name ? ' category-card--active' : ''}`}
            aria-label={`Browse ${name}`}
          >
            <span className="category-card__icon">
              <Icon size={19} strokeWidth={1.4} />
            </span>
            <span className="category-card__name">{name}</span>
            <span className="category-card__count">{count} listings</span>
          </Link>
        );
      })}
    </div>
  );
}
