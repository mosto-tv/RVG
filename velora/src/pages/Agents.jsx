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
              <Link to="/">Home</Link> <span>/</span> <span>Staff</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>Meet Our Staff</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              A small, senior team — each member owns one department and answers for every ticket in it.
            </p>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          {loading && (
            <div className="loading-row">
              <span className="loading-row__bar" />
              Loading staff
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
            <h2>One team, from first application to first shift</h2>
            <p className="lede">
              You are not handed between bots. Your application is read by a person, your interview is run by
              someone who plays the city, and the same team answers your tickets afterwards.
            </p>
            <div className="process" style={{ marginTop: '1.8rem', gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
              <div className="process__step">
                <span className="process__num">01</span>
                <span className="process__title">Apply</span>
                <span className="process__text">A short form about the character you want to play.</span>
              </div>
              <div className="process__step">
                <span className="process__num">02</span>
                <span className="process__title">Interview</span>
                <span className="process__text">Twenty minutes in voice with a member of staff.</span>
              </div>
              <div className="process__step">
                <span className="process__num">03</span>
                <span className="process__title">Whitelist</span>
                <span className="process__text">Server access, onboarding and your first job placement.</span>
              </div>
              <div className="process__step">
                <span className="process__num">04</span>
                <span className="process__title">Roleplay</span>
                <span className="process__text">Full access to every system, event and district.</span>
              </div>
            </div>
          </Reveal>
          <Reveal className="editorial__media" delay={80}>
            <img
              src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=85"
              alt="City skyline at golden hour"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">Direct lines</span>
          <h2>Talk to the team</h2>
          <p>Tell us what you want from a city. We will tell you honestly whether Ria is the right fit.</p>
          <Link to="/contact" className="btn btn--gold">
            Contact the team
          </Link>
        </div>
      </section>
    </>
  );
}
