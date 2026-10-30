import { Link } from 'react-router-dom';
import AgentCard from '../components/AgentCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { useFetch } from '../lib/useFetch.js';

export default function Agents() {
  const { data, loading } = useFetch('/agents');
  const agents = data?.items || [];

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <span>تیم مدیریت</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>با تیم ما آشنا شوید</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              تیمی کوچک و باتجربه — هر عضو مسئول یک بخش است و برای هر تیکت در آن بخش پاسخگو.
            </p>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          {loading && (
            <div className="loading-row">
              <span className="loading-row__bar" />
              در حال بارگذاری تیم
            </div>
          )}
          <div className="agent-grid">
            {agents.map((agent, index) => (
              <Reveal key={agent.slug} delay={index * 70}>
                <AgentCard agent={agent} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell editorial">
          <Reveal className="editorial__body">
            <span className="eyebrow">شیوه کار ما</span>
            <h2>یک تیم، از اولین درخواست تا اولین شیفت</h2>
            <p className="lede">
              شما را بین ربات‌ها دست‌به‌دست نمی‌کنند. درخواست شما را یک انسان می‌خواند، مصاحبه را کسی انجام می‌دهد
              که خودش در شهر بازی می‌کند و همان تیم بعد از آن هم به تیکت‌های شما پاسخ می‌دهد.
            </p>
            <div className="process" style={{ marginTop: '1.8rem', gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
              <div className="process__step">
                <span className="process__num">01</span>
                <span className="process__title">درخواست</span>
                <span className="process__text">یک فرم کوتاه درباره شخصیتی که می‌خواهید بازی کنید.</span>
              </div>
              <div className="process__step">
                <span className="process__num">02</span>
                <span className="process__title">مصاحبه</span>
                <span className="process__text">بیست دقیقه گفتگوی صوتی با یکی از اعضای تیم.</span>
              </div>
              <div className="process__step">
                <span className="process__num">03</span>
                <span className="process__title">وایت‌لیست</span>
                <span className="process__text">دسترسی به سرور، آشناسازی و اولین جایگاه شغلی شما.</span>
              </div>
              <div className="process__step">
                <span className="process__num">04</span>
                <span className="process__title">رول‌پلی</span>
                <span className="process__text">دسترسی کامل به همه سیستم‌ها، رویدادها و محله‌ها.</span>
              </div>
            </div>
          </Reveal>
          <Reveal className="editorial__media" delay={80}>
            <img
              src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=85"
              alt="خط آسمان شهر در نور طلایی"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">خط ارتباطی مستقیم</span>
          <h2>با تیم صحبت کنید</h2>
          <p>بگویید از یک شهر چه می‌خواهید. ما صادقانه می‌گوییم که ریا جای مناسبی برای آن هست یا نه.</p>
          <Link to="/contact" className="btn btn--gold">
            تماس با تیم
          </Link>
        </div>
      </section>
    </>
  );
}
