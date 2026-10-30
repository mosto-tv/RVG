export default function SectionHead({ eyebrow, title, lede, action, center = false, id }) {
  return (
    <div className={`section-head${center ? ' section-head--center' : ''}`}>
      <div className="section-head__text">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 id={id}>{title}</h2>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {action}
    </div>
  );
}
