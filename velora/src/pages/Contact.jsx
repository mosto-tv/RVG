import { Link } from 'react-router-dom';
import { Mail, Link2, MessageCircle, Clock } from 'lucide-react';
import { ContactForm } from '../components/Forms.jsx';

export default function Contact() {
  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <span>Contact</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>Contact Ria Roleplay</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              Our staff team replies within one day. For whitelist interviews, use the application form so we can
              hold a slot with the right department.
            </p>
          </div>
        </div>
      </div>

      <div className="shell contact-grid">
        <div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <MessageCircle size={16} />
            </span>
            <div>
              <b>Discord</b>
              <a href="https://discord.gg/riaroleplay" target="_blank" rel="noreferrer">
                discord.gg/riaroleplay
              </a>
              <div className="form-note">Announcements, support tickets and events</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Mail size={16} />
            </span>
            <div>
              <b>Email</b>
              <a href="mailto:support@riaroleplay.com">support@riaroleplay.com</a>
              <div className="form-note">Replies within one business day</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Link2 size={16} />
            </span>
            <div>
              <b>Server address</b>
              cfx.re/join/riaroleplay
              <div className="form-note">Whitelist required · connect through FiveM</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Clock size={16} />
            </span>
            <div>
              <b>Staff coverage</b>
              EU · NA · APAC
              <div className="form-note">Moderators online around the clock</div>
            </div>
          </div>

          <div className="map-frame" style={{ marginTop: '1.4rem', minHeight: 280 }}>
            <iframe
              title="Map of downtown Los Angeles, the reference for Los Santos"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-118.2730%2C34.0360%2C-118.2230%2C34.0650&layer=mapnik&marker=34.0505%2C-118.2487"
              loading="lazy"
            />
          </div>
        </div>

        <div className="panel">
          <h2 className="panel__title">Send a message</h2>
          <p className="panel__sub">
            Tell us what you are looking for in a city. We will reply with a straight answer, not a sales pitch.
          </p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
