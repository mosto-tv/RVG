import { useMemo, useState } from 'react';
import { CheckCircle2, CalendarCheck, Send } from 'lucide-react';
import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TIMES = ['09:00', '10:30', '12:00', '14:00', '16:00', '17:30', '19:00'];
const today = () => new Date().toISOString().slice(0, 10);
const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export function BookingForm({ property = null, onDone }) {
  const { user } = useAuth();
  const { push } = useToast();
  const { data } = useFetch('/properties?limit=48');
  const options = useMemo(() => data?.items || [], [data]);

  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    propertyId: property?.id || '',
    date: '',
    time: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const update = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = 'نام و نام خانوادگی خود را وارد کنید.';
    if (!emailOk(values.email)) next.email = 'یک نشانی ایمیل معتبر وارد کنید.';
    if (values.phone.replace(/\D/g, '').length < 7) next.phone = 'شماره‌ای وارد کنید که در دسترس باشد.';
    if (!values.date) next.date = 'تاریخ مورد نظر را انتخاب کنید.';
    if (!values.time) next.time = 'ساعت مورد نظر را انتخاب کنید.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const selected = options.find((item) => item.id === values.propertyId);
      const receipt = await api.post('/bookings', {
        ...values,
        propertyTitle: property?.title || selected?.title || '',
      });
      setConfirmation(receipt);
      push('درخواست شما دریافت شد.', 'success');
      onDone?.(receipt);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (confirmation) {
    return (
      <div className="form-alert form-alert--success" style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <CheckCircle2 size={17} /> درخواست دریافت شد
        </span>
        <span>
          {confirmation.message} شماره پیگیری شما <b>{confirmation.reference}</b> است.
        </span>
        <button type="button" className="link-arrow" onClick={() => setConfirmation(null)}>
          ثبت درخواست دیگر
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label className="field__label" htmlFor="bk-name">
            نام و نام خانوادگی
          </label>
          <input
            id="bk-name"
            className="field__control"
            value={values.name}
            onChange={update('name')}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
          />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bk-email">
            نشانی ایمیل
          </label>
          <input
            id="bk-email"
            type="email"
            className="field__control"
            value={values.email}
            onChange={update('email')}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bk-phone">
            شماره تماس
          </label>
          <input
            id="bk-phone"
            className="field__control"
            value={values.phone}
            onChange={update('phone')}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            placeholder="+98 912 555 0142"
          />
          {errors.phone && <span className="field__error">{errors.phone}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bk-property">
            امکان مورد علاقه
          </label>
          <select
            id="bk-property"
            className="field__control"
            value={values.propertyId}
            onChange={update('propertyId')}
            disabled={Boolean(property)}
          >
            <option value="">هر امکانی / درخواست عمومی</option>
            {(property ? [{ id: property.id, title: `${property.title} — ${property.city}` }] : options).map(
              (item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bk-date">
            تاریخ مصاحبه
          </label>
          <input
            id="bk-date"
            type="date"
            min={today()}
            className="field__control"
            value={values.date}
            onChange={update('date')}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && <span className="field__error">{errors.date}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bk-time">
            ساعت مصاحبه
          </label>
          <select
            id="bk-time"
            className="field__control"
            value={values.time}
            onChange={update('time')}
            aria-invalid={Boolean(errors.time)}
          >
            <option value="">انتخاب ساعت</option>
            {TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.time && <span className="field__error">{errors.time}</span>}
        </div>

        <div className="field form-grid--full">
          <label className="field__label" htmlFor="bk-message">
            توضیحات تکمیلی
          </label>
          <textarea
            id="bk-message"
            className="field__control"
            value={values.message}
            onChange={update('message')}
            placeholder="تجربه رول‌پلی شما، شهرهایی که قبلاً بازی کرده‌اید و دوستانی که همراهتان درخواست می‌دهند."
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? <span className="btn__spinner" /> : <CalendarCheck size={15} />}
          {busy ? 'در حال ارسال' : 'ارسال درخواست'}
        </button>
        <span className="form-note">درخواست‌ها حداکثر تا یک روز کاری بررسی می‌شوند.</span>
      </div>
    </form>
  );
}

export function ContactForm() {
  const { user } = useAuth();
  const { push } = useToast();
  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    subject: 'ورود به سرور',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = 'نام خود را وارد کنید.';
    if (!emailOk(values.email)) next.email = 'یک نشانی ایمیل معتبر وارد کنید.';
    if (values.message.trim().length < 12) next.message = 'کمی بیشتر توضیح دهید (حداقل ۱۲ کاراکتر).';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const data = await api.post('/contact', values);
      push(data.message, 'success');
      setSent(true);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="form-alert form-alert--success" style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <CheckCircle2 size={17} /> پیام دریافت شد
        </span>
        <span>
          تیم مدیریت حداکثر تا یک روز کاری پاسخ می‌دهد. برای موارد فوری، در دیسکورد ما حاضر شوید.
        </span>
        <button type="button" className="link-arrow" onClick={() => setSent(false)}>
          ارسال پیام دیگر
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label className="field__label" htmlFor="ct-name">
            نام و نام خانوادگی
          </label>
          <input
            id="ct-name"
            className="field__control"
            value={values.name}
            onChange={update('name')}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ct-email">
            نشانی ایمیل
          </label>
          <input
            id="ct-email"
            type="email"
            className="field__control"
            value={values.email}
            onChange={update('email')}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ct-phone">
            نام کاربری دیسکورد (اختیاری)
          </label>
          <input id="ct-phone" className="field__control" value={values.phone} onChange={update('phone')} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ct-subject">
            موضوع
          </label>
          <select id="ct-subject" className="field__control" value={values.subject} onChange={update('subject')}>
            <option>ورود به سرور</option>
            <option>درخواست وایت‌لیست</option>
            <option>گزارش یک بازیکن</option>
            <option>همکاری تجاری</option>
            <option>رسانه و تولیدکننده محتوا</option>
          </select>
        </div>
        <div className="field form-grid--full">
          <label className="field__label" htmlFor="ct-message">
            متن پیام
          </label>
          <textarea
            id="ct-message"
            className="field__control"
            value={values.message}
            onChange={update('message')}
            aria-invalid={Boolean(errors.message)}
            placeholder="از شخصیت یا شهری که دنبالش هستید برایمان بگویید."
          />
          {errors.message && <span className="field__error">{errors.message}</span>}
        </div>
      </div>
      <div style={{ marginTop: '1.2rem' }}>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? <span className="btn__spinner" /> : <Send size={15} />}
          {busy ? 'در حال ارسال' : 'ارسال پیام'}
        </button>
      </div>
    </form>
  );
}
