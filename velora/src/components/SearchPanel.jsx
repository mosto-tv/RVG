import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Wallet, BedDouble } from 'lucide-react';
import { shortPrice } from '../lib/api.js';

const LOCATIONS = ['Dubai', 'London', 'Miami', 'New York', 'Monaco', 'Los Angeles'];
const TYPES = ['Villas', 'Penthouses', 'Apartments', 'Waterfront Homes', 'Commercial Spaces', 'Smart Homes'];
const BEDS = ['Any', '1+', '2+', '3+', '4+', '5+'];

export default function SearchPanel({ compact = false }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [minM, setMinM] = useState(1);
  const [maxM, setMaxM] = useState(20);
  const [beds, setBeds] = useState('Any');

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    if (minM > 1) params.set('minPrice', String(minM * 1_000_000));
    if (maxM < 20) params.set('maxPrice', String(maxM * 1_000_000));
    if (beds !== 'Any') params.set('beds', beds.replace('+', ''));
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form className="search-panel" onSubmit={submit} aria-label="Search properties">
      <div className="search-panel__field">
        <label className="search-panel__label" htmlFor="hero-location">
          <MapPin size={12} /> Location
        </label>
        <select
          id="hero-location"
          className="search-panel__control"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        >
          <option value="">All destinations</option>
          {LOCATIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="search-panel__field">
        <label className="search-panel__label" htmlFor="hero-type">
          <Home size={12} /> Property Type
        </label>
        <select
          id="hero-type"
          className="search-panel__control"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="">Any residence</option>
          {TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="search-panel__field">
        <span className="search-panel__label">
          <Wallet size={12} /> Budget
        </span>
        <div className="budget">
          <span className="budget__value">
            {shortPrice(minM * 1_000_000)} – {maxM >= 20 ? 'No limit' : shortPrice(maxM * 1_000_000)}
          </span>
          <div className="range-row">
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={minM}
              aria-label="Minimum budget"
              onChange={(event) => {
                const value = Number(event.target.value);
                setMinM(value);
                if (value > maxM) setMaxM(value);
              }}
            />
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={maxM}
              aria-label="Maximum budget"
              onChange={(event) => {
                const value = Number(event.target.value);
                setMaxM(value);
                if (value < minM) setMinM(value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="search-panel__field">
        <label className="search-panel__label" htmlFor="hero-beds">
          <BedDouble size={12} /> Bedrooms
        </label>
        <select
          id="hero-beds"
          className="search-panel__control"
          value={beds}
          onChange={(event) => setBeds(event.target.value)}
        >
          {BEDS.map((option) => (
            <option key={option} value={option}>
              {option === 'Any' ? 'Any' : `${option} bedrooms`}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={`btn btn--block search-panel__submit${compact ? ' btn--sm' : ''}`}>
        <Search size={15} /> Search
      </button>
    </form>
  );
}
