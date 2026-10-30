import { BadgeCheck, Headset, TrendingUp, Code2, Lock, Gem, ShieldCheck, KeyRound } from 'lucide-react';

export const VALUES = [
  {
    title: 'Verified Community',
    text: 'Every applicant is reviewed by hand, so the people you meet are here to roleplay — not to troll.',
    icon: BadgeCheck,
  },
  {
    title: 'Expert Staff',
    text: 'An experienced team online across time zones, with clear escalation and real accountability.',
    icon: Headset,
  },
  {
    title: 'Balanced Economy',
    text: 'Prices, wages and payouts tuned so a night of honest work still means something.',
    icon: TrendingUp,
  },
  {
    title: 'Custom Scripts',
    text: 'Purpose-built systems for jobs, businesses and crime — not a stock framework with a new logo.',
    icon: Code2,
  },
  {
    title: 'Secure & Monitored',
    text: 'Anti-cheat, logging and active moderation on every session, around the clock.',
    icon: Lock,
  },
  {
    title: 'Bespoke Roleplay',
    text: 'Story-first design: fewer scripted set pieces, more room for the character you want to play.',
    icon: Gem,
  },
];

export const EXTRA_VALUES = [
  { title: 'Fair Play', text: 'No pay-to-win. Store purchases never grant in-game advantage.', icon: ShieldCheck },
  { title: 'Private Whitelist', text: 'Applications reviewed privately, with a direct line to staff.', icon: KeyRound },
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
