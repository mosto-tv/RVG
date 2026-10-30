import { Link, useParams } from 'react-router-dom';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    intro:
      'Velora Estates collects only the information required to answer an enquiry, arrange a viewing or deliver a store purchase. This policy explains what we hold and why.',
    sections: [
      {
        heading: 'What we collect',
        body: 'Name, email address, telephone number and the residences you have saved or asked to view. For RIA ROLEPLAY store purchases we also hold your FiveM identifier, so that entitlements can be delivered to the correct player.',
      },
      {
        heading: 'How it is used',
        body: 'To respond to enquiries, confirm viewings, keep a private wishlist for your account, and — for store purchases — to deliver the package you bought and to keep a transaction record. We do not sell your data.',
      },
      {
        heading: 'Payments',
        body: 'Payments for RIA ROLEPLAY packages are processed entirely by Tebex. Card details are entered on Tebex’s hosted checkout and are never transmitted to, or stored by, this website.',
      },
      {
        heading: 'Your rights',
        body: 'You may request a copy of the data held about you, ask for it to be corrected, or ask for your account to be deleted. Write to private@veloraestates.com and we will respond within 30 days.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'These terms govern use of this website and the advisory services offered by Velora Estates.',
    sections: [
      {
        heading: 'Property information',
        body: 'Residence details, measurements and imagery are provided in good faith for guidance. Guide prices and availability are subject to change and do not constitute an offer or contract.',
      },
      {
        heading: 'Viewings',
        body: 'Viewings are arranged by appointment and are accompanied. Requests submitted through this site are confirmed by an advisor; a request alone does not create a booking.',
      },
      {
        heading: 'Accounts',
        body: 'You are responsible for keeping your account credentials confidential. Saved residences and viewing history are private to your account.',
      },
      {
        heading: 'Liability',
        body: 'Nothing on this site constitutes legal, tax or investment advice. Independent professional advice should be obtained before any acquisition.',
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
        <a href="mailto:private@veloraestates.com" style={{ color: 'var(--emerald)' }}>
          private@veloraestates.com
        </a>
        .
      </p>
    </div>
  );
}
