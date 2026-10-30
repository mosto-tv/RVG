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

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2200&q=85';
const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=2000&q=85';

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
          <img src={HERO_IMAGE} alt="Downtown Los Santos at golden hour" />
        </div>
        <div className="hero__scrim" />

        <div className="shell hero__inner">
          <div className="hero__content">
            <span className="eyebrow hero__eyebrow">Serious roleplay since 2021</span>
            <h1>
              Step Into Another
              <em>Life In Los Santos</em>
            </h1>
            <p className="hero__lede">
              A premium FiveM roleplay city built for stories with weight — whitelisted, hand-modded, and
              running every night.
            </p>
            <div className="hero__actions">
              <Link to="/listings" className="btn btn--gold">
                Explore Features <ArrowRight size={15} />
              </Link>
              <Link to="/book-visit" className="btn btn--ghost-light">
                Apply For Whitelist
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <b>4,800</b>
                <span>Registered citizens</span>
              </div>
              <div className="hero__stat">
                <b>32</b>
                <span>Custom scripts</span>
              </div>
              <div className="hero__stat">
                <b>24/7</b>
                <span>City uptime</span>
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
            eyebrow="Browse by category"
            title="Server Categories"
            lede="Six ways into the city — each opened with a single click."
            action={
              <Link to="/listings" className="link-arrow">
                All features <ArrowRight size={14} />
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
              eyebrow="Selected features"
              title="Featured Experiences"
              lede="A short list of the most played systems live on Ria right now."
              action={
                <Link to="/listings" className="link-arrow">
                  View all <ArrowRight size={14} />
                </Link>
              }
            />

            {featured.loading && (
              <div className="loading-row">
                <span className="loading-row__bar" />
                Loading features
              </div>
            )}

            {featured.error && (
              <div className="form-alert form-alert--error">
                The feature list could not be loaded. Please refresh, or ask in our Discord.
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
              <h3 className="aside-card__title">Why Choose Ria Roleplay</h3>
              <p className="aside-card__lede">Performance, fairness and a city curated by hand.</p>
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
              <img src={BANNER_IMAGE} alt="Neon-lit street in Vinewood at night" loading="lazy" />
              <div>
                <h3>Start Your Story Tonight</h3>
                <p>Custom scripts. Fair economy. A city that answers.</p>
                <Link to="/contact" className="btn btn--gold btn--sm">
                  Join The City
                </Link>
              </div>
            </Reveal>

            <Reveal className="aside-card" delay={120}>
              <h3 className="aside-card__title">Meet Our Staff</h3>
              <p className="aside-card__lede">Three departments. One standard of care.</p>
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
            eyebrow="Prime districts"
            title="Prime Districts"
            lede="Five districts that define the city — from Vinewood Hills to Paleto Bay."
            action={
              <Link to="/listings" className="link-arrow">
                Browse all districts <ArrowRight size={14} />
              </Link>
            }
          />
          {locations.loading ? (
            <div className="loading-row">
              <span className="loading-row__bar" />
              Loading districts
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
            eyebrow="The Ria standard"
            title="Why Choose Ria Roleplay"
            lede="Six commitments that shape every hour you spend in the city."
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
            <img src={BANNER_IMAGE} alt="Night-time boulevard lights in Vinewood" loading="lazy" />
            <div className="cta-banner__inner">
              <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
                Whitelist open
              </span>
              <h2>Your Story Starts Tonight</h2>
              <p>Custom scripts. Fair economy. A city that answers.</p>
              <Link to="/contact" className="btn btn--gold">
                Apply Now <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            eyebrow="Your team"
            title="Meet Our Staff"
            lede="Senior staff with deep knowledge of every system in the city."
            action={
              <Link to="/agents" className="link-arrow">
                All staff <ArrowRight size={14} />
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
          <span className="eyebrow">Ria Roleplay</span>
          <h2>Your City Is Waiting</h2>
          <p>Join thousands of players in a city built for stories worth telling.</p>
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
              <ShieldCheck size={13} /> Verified players
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={13} /> 4.9 community rating
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={13} /> 24/7 uptime
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarDays size={13} /> Applications in 48h
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={13} /> Whitelist access
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
