import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="shell" style={{ paddingBlock: 'clamp(3rem, 8vw, 6rem)' }}>
      <div className="empty-state" style={{ maxWidth: 640, marginInline: 'auto' }}>
        <span className="empty-state__icon">
          <Compass size={22} />
        </span>
        <h3>این نشانی وجود ندارد</h3>
        <p>صفحه‌ای که دنبالش هستید جابه‌جا شده یا هرگز اینجا نبوده است. اما شهر کاملاً باز است.</p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn--sm">
            بازگشت به خانه
          </Link>
          <Link to="/listings" className="btn btn--outline btn--sm">
            مرور امکانات
          </Link>
        </div>
      </div>
    </div>
  );
}
