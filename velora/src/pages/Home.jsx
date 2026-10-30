import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Sparkles, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import SearchPanel from '../components/SearchPanel.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import AgentCard from '../components/AgentCard.jsx';
import LocationsGrid from '../components/LocationsGrid.jsx';
import ValueGrid, { VALUES } from '../components/ValueGrid.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Reveal from '../components/Reveal.jsx';
import { useFetch } from '../lib/useFetch.js';
import { priceFmt } from '../lib/api.js';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2200&q=85';
const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85';

const ASIDE_VALUES = VALUES.slice(0, 4);

export default function Home() {
  const meta = useFetch('/properties/meta');
  const featured = useFetch('/properties?featured=true&limit=4');
  const agents = useFetch('/agents');
  const locations = useFetch('/locations');

  const items = featured.data?.items || [];
  const lead = items[0];
  const stacked = items.slice(1, 3);
  const fourth = items[3];

  return (
    <>
      <section className="hero" style={{ marginTop: 'calc(var(--header-h) * -1)' }}>
        <div className="hero__media">
          <img src={HERO_IMAGE} alt="Contemporary glass villa with an infinity pool at dusk" />
        </div>
        <div className="hero__scrim" />

        <div className="shell hero__inner">
          <div className="hero__content">
            <span className="eyebrow hero__eyebrow">Private client advisory since 2009</span>
            <h1>
              Discover Exceptional
              <em>Living Spaces</em>
            </h1>
            <p className="hero__lede">
              Explore curated luxury properties designed for extraordinary lifestyles — quietly, and by
              appointment.
            </p>
            <div className="hero__actions">
              <Link to="/listings" className="btn btn--gold">
                Explore Properties <ArrowRight size={15} />
              </Link>
              <Link to="/book-visit" className="btn btn--ghost-light">
                Schedule Tour
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <b>1,240</b>
                <span>Curated residences</span>
              </div>
              <div className="hero__stat">
                <b>18</b>
                <span>Countries</span>
              </div>
              <div className="hero__stat">
                <b>$4.2B</b>
                <span>Transacted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="shell search-wrap">
        <SearchPanel />
      </div>

      <section className="section section--tight">
        <div className="shell">
          <SectionHead
            eyebrow="Browse by type"
            title="Property Categories"
            lede="Six ways into the collection — each opened with a single click."
            action={
              <Link to="/listings" className="link-arrow">
                All listings <ArrowRight size={14} />
              </Link>
            }
          />
          <Reveal>
            <CategoryGrid types={meta.data?.types || []} />
          </Reveal>
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="shell home-split">
          <div>
            <SectionHead
              eyebrow="Selected residences"
              title="Featured Residences"
              lede="A short list of the most considered homes currently available through Velora."
              action={
                <Link to="/listings" className="link-arrow">
                  View all <ArrowRight size={14} />
                </Link>
              }
            />

            {featured.loading && (
              <div className="loading-row">
                <span className="loading-row__bar" />
                Loading the collection
              </div>
            )}

            {featured.error && (
              <div className="form-alert form-alert--error">
                The collection could not be loaded. Please refresh, or call our advisory desk.
              </div>
            )}

            {lead && (
              <Reveal>
                <PropertyCard property={lead} variant="wide" />
              </Reveal>
            )}

            {stacked.length > 0 && (
              <div className="featured-stack">
                {stacked.map((property, index) => (
                  <Reveal key={property.id} delay={80 + index * 70}>
                    <PropertyCard property={property} variant="compact" />
                  </Reveal>
                ))}
              </div>
            )}

            {fourth && (
              <Reveal style={{ marginTop: '1.1rem' }}>
                <PropertyCard property={fourth} variant="compact" />
              </Reveal>
            )}
          </div>

          <aside className="home-split__aside">
            <Reveal className="aside-card">
              <h3 className="aside-card__title">Why Choose Velora Estates</h3>
              <p className="aside-card__lede">Discretion, diligence and a collection curated by hand.</p>
              <div className="aside-values">
                {ASIDE_VALUES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="aside-value">
                      <span className="aside-value__icon">
                        <Icon size={15} strokeWidth={1.6} />
                      </span>
                      <span className="aside-value__title">{item.title}</span>
                      <span className="aside-value__text">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal className="callout-card" delay={60}>
              <img src={BANNER_IMAGE} alt="Infinity pool overlooking the ocean at golden hour" loading="lazy" />
              <div>
                <h3>Own Your Dream Property Today</h3>
                <p>Exceptional homes. Extraordinary lifestyles. Personalised service.</p>
                <Link to="/contact" className="btn btn--gold btn--sm">
                  Check Availability
                </Link>
              </div>
            </Reveal>

            <Reveal className="aside-card" delay={120}>
              <h3 className="aside-card__title">Meet Our Agents</h3>
              <p className="aside-card__lede">Three desks. One standard of care.</p>
              {(agents.data?.items || []).map((agent) => (
                <AgentCard key={agent.slug} agent={agent} compact />
              ))}
              <Link to="/agents" className="link-arrow" style={{ marginTop: '0.9rem' }}>
                Meet the team <ArrowRight size={13} />
              </Link>
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            eyebrow="Prime locations"
            title="Prime Locations"
            lede="Five addresses that define the collection — from Palm Jumeirah to the Cotswolds."
            action={
              <Link to="/listings" className="link-arrow">
                Browse all destinations <ArrowRight size={14} />
              </Link>
            }
          />
          {locations.loading ? (
            <div className="loading-row">
              <span className="loading-row__bar" />
              Loading destinations
            </div>
          ) : (
            <Reveal>
              <LocationsGrid items={locations.data?.items || []} />
            </Reveal>
          )}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow="The Velora standard"
            title="Why Choose Velora Estates"
            lede="Six commitments that shape every acquisition we advise on."
            center
          />
          <Reveal>
            <ValueGrid items={VALUES} />
          </Reveal>
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal className="cta-banner">
            <img src={BANNER_IMAGE} alt="Waterfront villa pool at sunset" loading="lazy" />
            <div className="cta-banner__inner">
              <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
                By appointment
              </span>
              <h2>Own Your Dream Property Today</h2>
              <p>Exceptional homes. Extraordinary lifestyles. Personalised service.</p>
              <Link to="/contact" className="btn btn--gold">
                Check Availability <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            eyebrow="Your advisors"
            title="Meet Our Agents"
            lede="Senior advisors with deep local knowledge in each of our markets."
            action={
              <Link to="/agents" className="link-arrow">
                All agents <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="agent-grid">
            {(agents.data?.items || []).slice(0, 3).map((agent) => (
              <Reveal key={agent.slug}>
                <AgentCard agent={agent} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">Velora Estates</span>
          <h2>Luxury Living Starts Here</h2>
          <p>Discover exceptional properties and find the perfect place to call home.</p>
          <Link to="/listings" className="btn btn--gold">
            Get Started <ArrowRight size={15} />
          </Link>
          <div
            style={{
              display: 'flex',
              gap: 'clamp(1rem, 3vw, 2.5rem)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '2.6rem',
              color: 'rgba(247,245,237,.62)',
              fontSize: '0.76rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={13} /> Verified listings
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={13} /> 4.9 average client rating
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={13} /> 18 countries
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarDays size={13} /> Viewings in 48 hours
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={13} /> Off-market access
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
