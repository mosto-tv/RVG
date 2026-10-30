import { Link } from 'react-router-dom';
import { Mail, Link2, MessageCircle, Clock } from 'lucide-react';
import { ContactForm } from '../components/Forms.jsx';

export default function Contact() {
  return (
    <>
      <div className="page-head">
        <div className="shell page-head__inner">
          <div>
            <nav className="crumbs" aria-label="مسیر صفحه">
              <Link to="/">خانه</Link> <span>/</span> <span>تماس</span>
            </nav>
            <h1 style={{ marginTop: '0.7rem' }}>تماس با ریا رول‌پلی</h1>
            <p className="lede" style={{ marginTop: '0.7rem' }}>
              تیم مدیریت ما در کمتر از یک روز پاسخ می‌دهد. برای مصاحبه وایت‌لیست از فرم درخواست استفاده کنید تا
              زمان را با بخش مربوطه هماهنگ کنیم.
            </p>
          </div>
        </div>
      </div>

      <div className="shell contact-grid">
        <div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <MessageCircle size={16} />
            </span>
            <div>
              <b>دیسکورد</b>
              <a href="https://discord.gg/riaroleplay" target="_blank" rel="noreferrer">
                discord.gg/riaroleplay
              </a>
              <div className="form-note">اطلاعیه‌ها، تیکت‌های پشتیبانی و رویدادها</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Mail size={16} />
            </span>
            <div>
              <b>ایمیل</b>
              <a href="mailto:support@riaroleplay.com">support@riaroleplay.com</a>
              <div className="form-note">پاسخ حداکثر تا یک روز کاری</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Link2 size={16} />
            </span>
            <div>
              <b>نشانی سرور</b>
              cfx.re/join/riaroleplay
              <div className="form-note">نیازمند وایت‌لیست · اتصال از طریق FiveM</div>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-item__icon">
              <Clock size={16} />
            </span>
            <div>
              <b>پوشش تیم</b>
              اروپا · آمریکای شمالی · آسیا-اقیانوسیه
              <div className="form-note">ناظران در تمام ساعات شبانه‌روز آنلاین هستند</div>
            </div>
          </div>

          <div className="map-frame" style={{ marginTop: '1.4rem', minHeight: 280 }}>
            <iframe
              title="نقشه منطقه مرکزی لس آنجلس، مرجع طراحی لس سانتوس"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-118.2730%2C34.0360%2C-118.2230%2C34.0650&layer=mapnik&marker=34.0505%2C-118.2487"
              loading="lazy"
            />
          </div>
        </div>

        <div className="panel">
          <h2 className="panel__title">ارسال پیام</h2>
          <p className="panel__sub">
            بگویید در یک شهر دنبال چه هستید. ما با پاسخ صریح جواب می‌دهیم، نه با تبلیغ.
          </p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
