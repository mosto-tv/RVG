import { Link } from 'react-router-dom';
import { MessageCircle, Youtube, Mail, Globe } from 'lucide-react';
import { cityLabel } from '../lib/labels.js';

export default function AgentCard({ agent, compact = false }) {
  if (compact) {
    return (
      <div className="agent-compact">
        <img src={agent.portrait} alt={agent.name} loading="lazy" />
        <div>
          <div className="agent-compact__name">{agent.name}</div>
          <div className="agent-compact__role">{agent.role}</div>
        </div>
        <a
          href={`mailto:${agent.email}`}
          className="icon-btn"
          style={{ marginInlineStart: 'auto', width: 32, height: 32 }}
          aria-label={`ایمیل به ${agent.name}`}
        >
          <Mail size={14} />
        </a>
      </div>
    );
  }

  return (
    <article className="agent-card">
      <div className="agent-card__portrait">
        <img src={agent.portrait} alt={`${agent.name}، ${agent.role}`} loading="lazy" />
      </div>
      <h3 className="agent-card__name">{agent.name}</h3>
      <span className="agent-card__role">{agent.role}</span>
      <p className="agent-card__bio">{agent.bio}</p>

      {Array.isArray(agent.listings) && agent.listings.length > 0 && (
        <div className="agent-listings">
          {agent.listings.slice(0, 2).map((listing) => (
            <Link key={listing.id} to={`/listings/${listing.id}`} className="agent-listing">
              <img src={listing.image} alt="" loading="lazy" />
              <span>
                <b>{listing.title}</b> · {cityLabel(listing.city)}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="agent-card__actions">
        <a href={`mailto:${agent.email}?subject=${encodeURIComponent('درخواست از تیم سرور')}`} className="btn btn--sm">
          <Mail size={13} /> تماس با تیم
        </a>
        <Link to={`/listings?agent=${agent.slug}`} className="btn btn--outline btn--sm">
          مشاهده امکانات
        </Link>
      </div>

      <div className="agent-card__socials">
        <a href="https://discord.gg/riaroleplay" aria-label={`${agent.name} در دیسکورد`}>
          <MessageCircle size={14} />
        </a>
        <a href={agent.socials?.linkedin || '#'} aria-label={`${agent.name} در سرور`}>
          <Youtube size={14} />
        </a>
        <a href="https://discord.gg/riaroleplay" aria-label={`${agent.name} در سرور`}>
          <Globe size={14} />
        </a>
      </div>
    </article>
  );
}
