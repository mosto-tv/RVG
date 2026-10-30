import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import ValueGrid, { VALUES, EXTRA_VALUES } from '../components/ValueGrid.jsx';
import AgentCard from '../components/AgentCard.jsx';
import SectionHead from '../components/SectionHead.jsx';
import { useFetch } from '../lib/useFetch.js';

const PROCESS = [
  { num: '01', title: 'Application', text: 'A short form about the character you want to play — not a quiz.' },
  { num: '02', title: 'Interview', text: 'Twenty minutes in voice with staff, to talk through the rules and your story.' },
  { num: '03', title: 'Whitelist', text: 'Access granted, identifier linked and onboarding handled end to end.' },
  { num: '04', title: 'First shift', text: 'A job placement, a district tour and a staff member on call if anything breaks.' },
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
            <h1 style={{ marginTop: '0.7rem' }}>A standard set for serious roleplay</h1>
            <p className="lede" style={{ marginTop: '0.8rem' }}>
              Ria Roleplay was founded in 2021 to build a city where the writing mattered more than the script
              count. We run one server, keep the whitelist tight, and know most of the people who play here by name.
            </p>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell editorial">
          <Reveal className="editorial__media">
            <img
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=85"
              alt="Los Santos skyline at dusk"
            />
          </Reveal>
          <Reveal className="editorial__body" delay={80}>
            <span className="eyebrow">Our philosophy</span>
            <h2>Fewer features, built completely</h2>
            <p className="lede">
              Most servers stack systems until nothing works together. We ship less — because a job is only worth
              playing if the economy behind it, the police response to it and the people affected by it all behave
              properly. Every system on Ria is tested by players before it goes live.
            </p>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Our players are adults with jobs and lives. They value consistency over novelty, and good stories over
              grind. So do we.
            </p>
            <div className="stat-row">
              <div className="stat">
                <b>5</b>
                <span>Years online</span>
              </div>
              <div className="stat">
                <b>4,800</b>
                <span>Citizens registered</span>
              </div>
              <div className="stat">
                <b>1.8M</b>
                <span>Hours roleplayed</span>
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
              <h2 style={{ fontSize: '1.7rem', marginTop: '0.6rem' }}>To make good roleplay the default</h2>
              <p className="lede" style={{ marginTop: '0.8rem' }}>
                A city only works when the rules are clear and the staff apply them evenly. We build systems that
                reward character over grind, moderate consistently, and make the first hour on the server as good
                as the hundredth.
              </p>
            </Reveal>
            <Reveal className="panel panel--muted" delay={80}>
              <span className="eyebrow">Vision</span>
              <h2 style={{ fontSize: '1.7rem', marginTop: '0.6rem' }}>The most respected city in FiveM</h2>
              <p className="lede" style={{ marginTop: '0.8rem' }}>
                We are building a server that outlives trends: one standard of moderation across every time zone,
                custom systems that hold up under load, and a community that comes back for the next chapter.
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
            eyebrow="Why players stay"
            title="The Ria standard"
            lede="Six commitments, applied to every session and every report we review."
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
              title="The team behind the city"
              action={
                <Link to="/agents" className="link-arrow">
                  All staff <ArrowRight size={14} />
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
          <span className="eyebrow">Ria Roleplay</span>
          <h2>Begin with a conversation</h2>
          <p>Tell us how you like to play. We will tell you honestly whether we are the right city for it.</p>
          <Link to="/contact" className="btn btn--gold">
            Contact us <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
