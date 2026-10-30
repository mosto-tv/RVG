import { Link, useParams } from 'react-router-dom';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    intro:
      'Ria Roleplay collects only the information required to answer a ticket, review a whitelist application or deliver a store purchase. This policy explains what we hold and why.',
    sections: [
      {
        heading: 'What we collect',
        body: 'Name, email address, telephone or Discord handle and the features you have saved or applied for. For RIA ROLEPLAY store purchases we also hold your FiveM identifier, so that entitlements can be delivered to the correct player.',
      },
      {
        heading: 'How it is used',
        body: 'To respond to enquiries, schedule whitelist interviews, keep a private list for your account, and — for store purchases — to deliver the package you bought and to keep a transaction record. We do not sell your data.',
      },
      {
        heading: 'Payments',
        body: 'Payments for RIA ROLEPLAY packages are processed entirely by Tebex. Card details are entered on Tebex’s hosted checkout and are never transmitted to, or stored by, this website.',
      },
      {
        heading: 'Your rights',
        body: 'You may request a copy of the data held about you, ask for it to be corrected, or ask for your account to be deleted. Write to support@riaroleplay.com and we will respond within 30 days.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro:
      'These terms govern use of this website, the Ria Roleplay FiveM server and the community services offered here.',
    sections: [
      {
        heading: 'Server information',
        body: 'Feature descriptions, payouts, session lengths and availability are provided in good faith for guidance. Systems change between updates and nothing on this site constitutes a guarantee of access, earnings or uptime.',
      },
      {
        heading: 'Whitelist applications',
        body: 'Applications are reviewed by staff and followed by a voice interview. A submitted application is not confirmation of whitelist, and access may be withheld or withdrawn under the community rules.',
      },
      {
        heading: 'Accounts',
        body: 'You are responsible for keeping your account credentials confidential. Saved features and application history are private to your account.',
      },
      {
        heading: 'Liability',
        body: 'Nothing on this site constitutes legal or financial advice. Server access is a licence to play under the community rules and can be withdrawn independently of any purchase.',
      },
    ],
  },
  tebex: {
    title: 'Store & Payment Terms',
    intro:
      'The RIA ROLEPLAY store sells memberships, priority access and cosmetic packages for a FiveM community. All real-money payments are processed by Tebex as the authorised payment provider.',
    sections: [
      {
        heading: 'Authorised payment provider',
        body: 'Checkout is hosted by Tebex. We never collect, see or store card details. Payment confirmation is only accepted after Tebex notifies our server and the transaction is re-verified server-side.',
      },
      {
        heading: 'What is sold',
        body: 'Memberships, priority queue access, cosmetic items and community benefits only. We do not sell in-game currency, randomised rewards, loot boxes or gambling mechanics, and nothing purchased can be cashed out or transferred for real-world value.',
      },
      {
        heading: 'Delivery',
        body: 'Packages are delivered automatically to the FiveM identifier supplied at checkout. If an automatic delivery fails it is recorded as pending and reviewed by an administrator, usually within 24 hours. Duplicate deliveries are prevented by a unique record per purchased line.',
      },
      {
        heading: 'Refunds and chargebacks',
        body: 'Refund requests are handled under the Tebex Acceptable Use Policy. Because benefits are delivered instantly, refunds are considered case by case where a package has not been consumed. Fraudulent chargebacks result in entitlement removal and account suspension.',
      },
      {
        heading: 'Compliance',
        body: 'Sales operate under the Cfx.re Platform License Agreement, the Rockstar Creator Platform License Agreement and the Tebex Acceptable Use Policy. Server access may be withdrawn for breaches of the community rules, independent of any purchase.',
      },
    ],
  },
};

export default function Legal() {
  const { slug } = useParams();
  const page = CONTENT[slug] || CONTENT.privacy;

  return (
    <div className="shell legal-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <span>{page.title}</span>
      </nav>
      <h1 style={{ marginTop: '0.8rem' }}>{page.title}</h1>
      <p className="lede" style={{ marginTop: '0.8rem' }}>
        {page.intro}
      </p>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      <p className="form-note" style={{ marginTop: '2rem' }}>
        Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Questions:{' '}
        <a href="mailto:support@riaroleplay.com" style={{ color: 'var(--emerald)' }}>
          support@riaroleplay.com
        </a>
        .
      </p>
    </div>
  );
}
