import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Gamepad2, Coins, Users } from 'lucide-react';
import { shortPrice } from '../lib/api.js';

const LOCATIONS = ['Los Santos', 'Vinewood', 'Vespucci', 'Del Perro', 'Sandy Shores', 'Paleto Bay'];
const TYPES = ['Careers', 'Businesses', 'Vehicles', 'Crime & Heists', 'Racing', 'Lifestyle'];
const PLAYERS = ['Any', '2+', '4+', '8+', '16+', '32+'];
const MAX_PAYOUT = 25000;

export default function SearchPanel({ compact = false }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [minPayout, setMinPayout] = useState(1000);
  const [maxPayout, setMaxPayout] = useState(MAX_PAYOUT);
  const [players, setPlayers] = useState('Any');

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    if (minPayout > 1000) params.set('minPrice', String(minPayout));
    if (maxPayout < MAX_PAYOUT) params.set('maxPrice', String(maxPayout));
    if (players !== 'Any') params.set('beds', players.replace('+', ''));
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form className="search-panel" onSubmit={submit} aria-label="Search features">
      <div className="search-panel__field">
        <label className="search-panel__label" htmlFor="hero-location">
          <MapPin size={12} /> District
        </label>
        <select
          id="hero-location"
          className="search-panel__control"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        >
          <option value="">All districts</option>
          {LOCATIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="search-panel__field">
        <label className="search-panel__label" htmlFor="hero-type">
          <Gamepad2 size={12} /> Category
        </label>
        <select
          id="hero-type"
          className="search-panel__control"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="">Any category</option>
          {TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="search-panel__field">
        <span className="search-panel__label">
          <Coins size={12} /> Payout
        </span>
        <div className="budget">
          <span className="budget__value">
            {shortPrice(minPayout)} – {maxPayout >= MAX_PAYOUT ? 'No limit' : shortPrice(maxPayout)}
          </span>
          <div className="range-row">
            <input
              type="range"
              min="1000"
              max={MAX_PAYOUT}
              step="500"
              value={minPayout}
              aria-label="Minimum payout"
              onChange={(event) => {
                const value = Number(event.target.value);
                setMinPayout(value);
                if (value > maxPayout) setMaxPayout(value);
              }}
            />
            <input
              type="range"
              min="1000"
              max={MAX_PAYOUT}
              step="500"
              value={maxPayout}
              aria-label="Maximum payout"
              onChange={(event) => {
                const value = Number(event.target.value);
                setMaxPayout(value);
                if (value < minPayout) setMinPayout(value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="search-panel__field">
        <label className="search-panel__label" htmlFor="hero-beds">
          <Users size={12} /> Players
        </label>
        <select
          id="hero-beds"
          className="search-panel__control"
          value={players}
          onChange={(event) => setPlayers(event.target.value)}
        >
          {PLAYERS.map((option) => (
            <option key={option} value={option}>
              {option === 'Any' ? 'Any' : `${option} players`}
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
