import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import ValueGrid, { VALUES, EXTRA_VALUES } from '../components/ValueGrid.jsx';
import AgentCard from '../components/AgentCard.jsx';
import SectionHead from '../components/SectionHead.jsx';
import { useFetch } from '../lib/useFetch.js';

const PROCESS = [
  { num: '01', title: 'Private brief', text: 'A conversation about how you want to live — not a filter form.' },
  { num: '02', title: 'Curated shortlist', text: 'Four to six residences, each walked and verified by us first.' },
  { num: '03', title: 'Diligence', text: 'Titles, surveys, planning and service charges reviewed by counsel.' },
  { num: '04', title: 'Completion', text: 'Negotiation, escrow and handover coordinated end to end.' },
];

export default function About() {
  const { data } = useFetch('/agents');
  const agents = (data?.items || []).slice(0, 3);

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <span>About</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>A quiet standard in luxury real estate</h1>
            <p className="lede" style={{ marginTop: '0.8rem' }}>
              Velora Estates was founded in 2009 to advise private clients on the acquisition of architecturally
              significant homes. We represent a small number of residences at any time, and we know each of them
              intimately.
            </p>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell editorial">
          <Reveal className="editorial__media">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"
              alt="Modern villa facade at dusk"
            />
          </Reveal>
          <Reveal className="editorial__body" delay={80}>
            <span className="eyebrow">Our philosophy</span>
            <h2>Fewer residences, understood completely</h2>
            <p className="lede">
              Most portals show everything. We show very little — because a home is not a search result. Every
              residence in the collection has been visited, photographed and assessed by an advisor who can answer
              questions about its structure, its light and its neighbours.
            </p>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Our clients are typically buying a second or third home, often across borders. They value discretion
              over scale, and judgement over inventory.
            </p>
            <div className="stat-row">
              <div className="stat">
                <b>16</b>
                <span>Years advising</span>
              </div>
              <div className="stat">
                <b>1,240</b>
                <span>Residences placed</span>
              </div>
              <div className="stat">
                <b>$4.2B</b>
                <span>Transacted value</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell">
          <div className="split-form">
            <Reveal className="panel">
              <span className="eyebrow">Mission</span>
              <h2 style={{ fontSize: '1.7rem', marginTop: '0.6rem' }}>To make exceptional homes legible</h2>
              <p className="lede" style={{ marginTop: '0.8rem' }}>
                Buying well requires more than a good address. We translate architecture, provenance and
                neighbourhood into clear advice, so a decision of this size is made with confidence rather than
                urgency.
              </p>
            </Reveal>
            <Reveal className="panel panel--muted" delay={80}>
              <span className="eyebrow">Vision</span>
              <h2 style={{ fontSize: '1.7rem', marginTop: '0.6rem' }}>The most trusted private desk in five cities</h2>
              <p className="lede" style={{ marginTop: '0.8rem' }}>
                We are building a practice that outlives trends: one standard of representation in Dubai, London,
                Miami, Monaco and New York, and a record of clients who return for their next home.
              </p>
            </Reveal>
          </div>

          <div className="process" style={{ marginTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
            {PROCESS.map((step) => (
              <div key={step.num} className="process__step">
                <span className="process__num">{step.num}</span>
                <span className="process__title">{step.title}</span>
                <span className="process__text">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow="Why clients trust us"
            title="The Velora standard"
            lede="Six commitments, applied to every residence and every transaction."
            center
          />
          <ValueGrid items={[...VALUES, ...EXTRA_VALUES].slice(0, 6)} />
        </div>
      </section>

      {agents.length > 0 && (
        <section className="section section--cream">
          <div className="shell">
            <SectionHead
              eyebrow="Our people"
              title="Professional team"
              action={
                <Link to="/agents" className="link-arrow">
                  All agents <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="agent-grid">
              {agents.map((agent) => (
                <AgentCard key={agent.slug} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">Velora Estates</span>
          <h2>Begin with a conversation</h2>
          <p>Tell us what you are looking for. We will tell you honestly whether we can help.</p>
          <Link to="/contact" className="btn btn--gold">
            Contact us <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
