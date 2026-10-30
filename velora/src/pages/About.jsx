import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import ValueGrid, { VALUES, EXTRA_VALUES } from '../components/ValueGrid.jsx';
import AgentCard from '../components/AgentCard.jsx';
import SectionHead from '../components/SectionHead.jsx';
import { useFetch } from '../lib/useFetch.js';

const PROCESS = [
  { num: '01', title: 'درخواست', text: 'یک فرم کوتاه درباره شخصیتی که می‌خواهید بازی کنید — نه یک آزمون.' },
  { num: '02', title: 'مصاحبه', text: 'بیست دقیقه گفتگوی صوتی با تیم، درباره قوانین و داستان شما.' },
  { num: '03', title: 'وایت‌لیست', text: 'دسترسی صادر می‌شود، شناسه شما متصل و آشناسازی کامل انجام می‌شود.' },
  { num: '04', title: 'اولین شیفت', text: 'جایگاه شغلی، تور محله‌ها و یک عضو تیم در دسترس اگر مشکلی پیش آمد.' },
];

export default function About() {
  const { data } = useFetch('/agents');
  const agents = (data?.items || []).slice(0, 3);

  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <span>درباره ما</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>استانداردی برای رول‌پلی جدی</h1>
            <p className="lede" style={{ marginTop: '0.8rem' }}>
              ریا رول‌پلی در سال ۲۰۲۱ تأسیس شد تا شهری بسازد که در آن نوشتن مهم‌تر از تعداد اسکریپت‌ها باشد. یک سرور
              داریم، وایت‌لیست را محدود نگه می‌داریم و بیشتر کسانی را که اینجا بازی می‌کنند با نام می‌شناسیم.
            </p>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell editorial">
          <Reveal className="editorial__media">
            <img
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=85"
              alt="خط آسمان لس سانتوس در غروب"
            />
          </Reveal>
          <Reveal className="editorial__body" delay={80}>
            <span className="eyebrow">فلسفه ما</span>
            <h2>امکانات کمتر، اما کامل</h2>
            <p className="lede">
              بیشتر سرورها آن‌قدر سیستم روی هم می‌چینند که دیگر هیچ‌کدام با هم کار نمی‌کنند. ما کمتر منتشر می‌کنیم —
              چون یک شغل تنها وقتی ارزش بازی کردن دارد که اقتصاد پشت آن، واکنش پلیس به آن و آدم‌هایی که از آن تأثیر
              می‌گیرند، همه درست رفتار کنند. هر سیستم در ریا پیش از انتشار توسط بازیکنان تست می‌شود.
            </p>
            <p className="lede" style={{ marginTop: '1rem' }}>
              بازیکنان ما انسان‌های بالغی با شغل و زندگی هستند. آن‌ها پیوستگی را به تازگی و داستان خوب را به تکرار
              بی‌پایان ترجیح می‌دهند. ما هم همین‌طور.
            </p>
            <div className="stat-row">
              <div className="stat">
                <b>5</b>
                <span>سال فعالیت</span>
              </div>
              <div className="stat">
                <b>4,800</b>
                <span>شهروند ثبت‌شده</span>
              </div>
              <div className="stat">
                <b>1.8M</b>
                <span>ساعت رول‌پلی</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="shell">
          <div className="split-form">
            <Reveal className="panel">
              <span className="eyebrow">مأموریت</span>
              <h2 style={{ fontSize: '1.7rem', marginTop: '0.6rem' }}>رول‌پلی خوب را به حالت پیش‌فرض تبدیل کنیم</h2>
              <p className="lede" style={{ marginTop: '0.8rem' }}>
                یک شهر تنها وقتی کار می‌کند که قوانین روشن باشند و تیم آن‌ها را یکسان اجرا کند. ما سیستم‌هایی می‌سازیم
                که شخصیت را بر تکرار پاداش می‌دهند، نظارت را یکدست نگه می‌دارند و ساعت اول در سرور را به‌اندازه
                ساعت صدم خوب می‌کنند.
              </p>
            </Reveal>
            <Reveal className="panel panel--muted" delay={80}>
              <span className="eyebrow">چشم‌انداز</span>
              <h2 style={{ fontSize: '1.7rem', marginTop: '0.6rem' }}>محترم‌ترین شهر دنیای فایوام</h2>
              <p className="lede" style={{ marginTop: '0.8rem' }}>
                ما سروری می‌سازیم که از مدها عمر بیشتری دارد: یک استاندارد نظارت در همه مناطق زمانی، سیستم‌های
                اختصاصی که زیر بار سنگین هم دوام می‌آورند و انجمنی که برای فصل بعدی برمی‌گردد.
              </p>
            </Reveal>
          </div>

          <div className="process" style={{ marginTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
            {PROCESS.map((step) => (
              <div key={step.num} className="process__step">
                <span className="process__num">{step.num}</span>
                <span className="process__title">{step.title}</span>
                <span className="process__text">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow="چرا بازیکنان می‌مانند"
            title="استاندارد ریا"
            lede="شش تعهد که در هر سشن و هر گزارشی که بررسی می‌کنیم اعمال می‌شود."
            center
          />
          <ValueGrid items={[...VALUES, ...EXTRA_VALUES].slice(0, 6)} />
        </div>
      </section>

      {agents.length > 0 && (
        <section className="section section--cream">
          <div className="shell">
            <SectionHead
              eyebrow="آدم‌های ما"
              title="تیمی که پشت این شهر است"
              action={
                <Link to="/agents" className="link-arrow">
                  همه اعضای تیم <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="agent-grid">
              {agents.map((agent) => (
                <AgentCard key={agent.slug} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="final-cta">
        <div className="shell">
          <span className="eyebrow">ریا رول‌پلی</span>
          <h2>با یک گفتگو شروع کنید</h2>
          <p>بگویید دوست دارید چطور بازی کنید. صادقانه می‌گوییم که ما شهر مناسبی برای آن هستیم یا نه.</p>
          <Link to="/contact" className="btn btn--gold">
            تماس با ما <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
