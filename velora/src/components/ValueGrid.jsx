import { BadgeCheck, Headset, TrendingUp, Box, Lock, Gem, ShieldCheck, KeyRound } from 'lucide-react';

export const VALUES = [
  {
    title: 'Verified Listings',
    text: 'Every property is carefully reviewed, title-checked and verified before it reaches the collection.',
    icon: BadgeCheck,
  },
  {
    title: 'Expert Agents',
    text: 'Experienced professionals with deep local market knowledge across five global cities.',
    icon: Headset,
  },
  {
    title: 'Smart Investments',
    text: 'Carefully selected opportunities with genuine long-term capital potential.',
    icon: TrendingUp,
  },
  {
    title: '3D Virtual Tours',
    text: 'Explore properties through immersive virtual walkthroughs before you travel.',
    icon: Box,
  },
  {
    title: 'Secure Transactions',
    text: 'Professional legal and escrow guidance throughout the purchasing process.',
    icon: Lock,
  },
  {
    title: 'Bespoke Service',
    text: 'Personalised assistance tailored to every client, from search to keys.',
    icon: Gem,
  },
];

export const EXTRA_VALUES = [
  { title: 'Security Investments', text: 'Ownership structures reviewed by counsel in each jurisdiction.', icon: ShieldCheck },
  { title: 'Discreet Access', text: 'Off-market residences shared privately with qualified buyers.', icon: KeyRound },
];

export function ValueList({ items = VALUES }) {
  return (
    <div className="values">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="value-item">
            <span className="value-item__icon">
              <Icon size={17} strokeWidth={1.5} />
            </span>
            <h3 className="value-item__title">{item.title}</h3>
            <p className="value-item__text">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function ValueGrid({ items = VALUES }) {
  return (
    <div className="value-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="value-item">
            <span className="value-item__icon">
              <Icon size={18} strokeWidth={1.5} />
            </span>
            <h3 className="value-item__title">{item.title}</h3>
            <p className="value-item__text">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}
