import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
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
            <h1 style={{ marginTop: '0.7rem' }}>Contact Velora Estates</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              Our advisory desk replies within one business day. For viewings, use the booking form so we can hold a
              slot with the residence team.
            </p>
          </div>
        </div>
      </div>

      <div className="shell contact-grid">
        <div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Phone size={16} />
            </span>
            <div>
              <b>Telephone</b>
              <a href="tel:+97145550100">+971 4 555 0100</a>
              <div className="form-note">Private client line · 08:00–20:00 GST</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Mail size={16} />
            </span>
            <div>
              <b>Email</b>
              <a href="mailto:private@veloraestates.com">private@veloraestates.com</a>
              <div className="form-note">Replies within one business day</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <MapPin size={16} />
            </span>
            <div>
              <b>Head office</b>
              Level 42, Index Tower, DIFC
              <div className="form-note">Dubai, United Arab Emirates</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Clock size={16} />
            </span>
            <div>
              <b>Other desks</b>
              London · Miami · Monaco · New York
              <div className="form-note">By appointment only</div>
            </div>
          </div>

          <div className="map-frame" style={{ marginTop: '1.4rem', minHeight: 280 }}>
            <iframe
              title="Velora Estates head office map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=55.2650%2C25.2080%2C55.2850%2C25.2220&layer=mapnik&marker=25.2150%2C55.2750"
              loading="lazy"
            />
          </div>
        </div>

        <div className="panel">
          <h2 className="panel__title">Send a message</h2>
          <p className="panel__sub">
            Tell us the city, the horizon and the budget. We will reply with a short, considered shortlist.
          </p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
