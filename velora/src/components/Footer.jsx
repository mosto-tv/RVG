import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { Brand } from './Header.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  const subscribe = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      const data = await api.post('/newsletter', { email });
      push(data.message, data.alreadySubscribed ? 'info' : 'success');
      setEmail('');
    } catch (err) {
      push(err.fields?.email || err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <Brand light />
            <p className="footer__mission">
              Discover exceptional properties and experience a higher standard of luxury real estate.
            </p>
            <div className="footer__socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          <div>
            <p className="footer__title">Property Types</p>
            <div className="footer__links">
              <Link to="/listings?type=Villas">Villas</Link>
              <Link to="/listings?type=Penthouses">Penthouses</Link>
              <Link to="/listings?type=Apartments">Apartments</Link>
              <Link to="/listings?type=Waterfront%20Homes">Waterfront Homes</Link>
              <Link to="/store">RIA Roleplay Store</Link>
            </div>
          </div>

          <div>
            <p className="footer__title">Quick Links</p>
            <div className="footer__links">
              <Link to="/">Home</Link>
              <Link to="/listings">Listings</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/agents">Agents</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div className="footer__news">
            <p className="footer__title">Stay Inspired</p>
            <p>Receive exclusive property updates and curated market insights.</p>
            <form className="footer__subscribe" onSubmit={subscribe}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                required
              />
              <button type="submit" disabled={busy}>
                {busy ? '…' : 'Subscribe'}
              </button>
            </form>
            <ul className="footer__contact">
              <li>
                <Phone size={14} style={{ marginTop: 4 }} /> +971 4 555 0100
              </li>
              <li>
                <Mail size={14} style={{ marginTop: 4 }} /> private@veloraestates.com
              </li>
              <li>
                <MapPin size={14} style={{ marginTop: 4 }} /> Level 42, Index Tower, DIFC, Dubai
              </li>
              <li>
                <ArrowUpRight size={14} style={{ marginTop: 4 }} />
                <Link to="/book-visit" style={{ borderBottom: '1px solid rgba(247,245,237,.3)' }}>
                  Arrange a private viewing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Velora Estates. All rights reserved.</span>
          <div className="footer__legal-links">
            <Link to="/legal/privacy">Privacy Policy</Link>
            <Link to="/legal/terms">Terms &amp; Conditions</Link>
            <Link to="/legal/tebex">Store &amp; Payment Terms</Link>
          </div>
        </div>
      </div>
      <div className="footer__wordmark" aria-hidden="true">
        VELORA
      </div>
    </footer>
  );
}
