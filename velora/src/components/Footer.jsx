import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Youtube, Music2, Mail, Link2, ArrowUpRight } from 'lucide-react';
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
              A premium FiveM roleplay city — built for stories, run by the people who play in it.
            </p>
            <div className="footer__socials">
              <a href="https://discord.gg/riaroleplay" target="_blank" rel="noreferrer" aria-label="Discord">
                <MessageCircle size={16} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube size={16} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
                <Music2 size={16} />
              </a>
            </div>
          </div>

          <div>
            <p className="footer__title">Categories</p>
            <div className="footer__links">
              <Link to="/listings?type=Careers">Careers</Link>
              <Link to="/listings?type=Businesses">Businesses</Link>
              <Link to="/listings?type=Vehicles">Vehicles</Link>
              <Link to="/listings?type=Crime%20%26%20Heists">Crime &amp; Heists</Link>
              <Link to="/store">RIA Roleplay Store</Link>
            </div>
          </div>

          <div>
            <p className="footer__title">Quick Links</p>
            <div className="footer__links">
              <Link to="/">Home</Link>
              <Link to="/listings">Features</Link>
              <Link to="/projects">Roadmap</Link>
              <Link to="/agents">Staff</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div className="footer__news">
            <p className="footer__title">Stay Informed</p>
            <p>Server news, patch notes and event announcements, once a month.</p>
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
                <MessageCircle size={14} style={{ marginTop: 4 }} /> discord.gg/riaroleplay
              </li>
              <li>
                <Mail size={14} style={{ marginTop: 4 }} /> support@riaroleplay.com
              </li>
              <li>
                <Link2 size={14} style={{ marginTop: 4 }} /> cfx.re/join/riaroleplay
              </li>
              <li>
                <ArrowUpRight size={14} style={{ marginTop: 4 }} />
                <Link to="/book-visit" style={{ borderBottom: '1px solid rgba(247,245,237,.3)' }}>
                  Apply for whitelist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Ria Roleplay. All rights reserved.</span>
          <div className="footer__legal-links">
            <Link to="/legal/privacy">Privacy Policy</Link>
            <Link to="/legal/terms">Terms &amp; Conditions</Link>
            <Link to="/legal/tebex">Store &amp; Payment Terms</Link>
          </div>
        </div>
      </div>
      <div className="footer__wordmark" aria-hidden="true">
        RIA
      </div>
    </footer>
  );
}
