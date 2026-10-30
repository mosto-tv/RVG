import { Link } from 'react-router-dom';
import AgentCard from '../components/AgentCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { useFetch } from '../lib/useFetch.js';

export default function Agents() {
  const { data, loading } = useFetch('/agents');
  const agents = data?.items || [];

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <span>Agents</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>Meet Our Agents</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              A small, senior team — each advisor runs one market and knows every street in it.
            </p>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          {loading && (
            <div className="loading-row">
              <span className="loading-row__bar" />
              Loading advisors
            </div>
          )}
          <div className="agent-grid">
            {agents.map((agent, index) => (
              <Reveal key={agent.slug} delay={index * 70}>
                <AgentCard agent={agent} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell editorial">
          <Reveal className="editorial__body">
            <span className="eyebrow">How we work</span>
            <h2>One advisor, from first viewing to keys</h2>
            <p className="lede">
              You are not passed between departments. Your advisor researches the residence, negotiates the terms
              and coordinates legal, survey and handover. The relationship stays personal.
            </p>
            <div className="process" style={{ marginTop: '1.8rem', gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
              <div className="process__step">
                <span className="process__num">01</span>
                <span className="process__title">Brief</span>
                <span className="process__text">A private conversation about location, architecture and horizon.</span>
              </div>
              <div className="process__step">
                <span className="process__num">02</span>
                <span className="process__title">Curate</span>
                <span className="process__text">A short list of on- and off-market residences, presented in person.</span>
              </div>
              <div className="process__step">
                <span className="process__num">03</span>
                <span className="process__title">Acquire</span>
                <span className="process__text">Offer, diligence and legal coordination handled discreetly.</span>
              </div>
              <div className="process__step">
                <span className="process__num">04</span>
                <span className="process__title">Settle</span>
                <span className="process__text">Handover, staffing introductions and post-completion care.</span>
              </div>
            </div>
          </Reveal>
          <Reveal className="editorial__media" delay={80}>
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
              alt="Interior of a Velora residence"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">Direct lines</span>
          <h2>Speak with an advisor</h2>
          <p>Tell us the brief. We will come back with two or three residences worth your time.</p>
          <Link to="/contact" className="btn btn--gold">
            Contact the team
          </Link>
        </div>
      </section>
    </>
  );
}
