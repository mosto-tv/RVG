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
    if (values.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!emailOk(values.email)) next.email = 'Enter a valid email address.';
    if (values.phone.replace(/\D/g, '').length < 7) next.phone = 'Enter a reachable phone number.';
    if (!values.date) next.date = 'Choose a preferred date.';
    if (!values.time) next.time = 'Choose a preferred time.';
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
      push('Viewing request received.', 'success');
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
          <CheckCircle2 size={17} /> Viewing requested
        </span>
        <span>
          {confirmation.message} Your reference is <b>{confirmation.reference}</b>.
        </span>
        <button type="button" className="link-arrow" onClick={() => setConfirmation(null)}>
          Arrange another viewing
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label className="field__label" htmlFor="bk-name">
            Full name
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
            Email address
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
            Phone number
          </label>
          <input
            id="bk-phone"
            className="field__control"
            value={values.phone}
            onChange={update('phone')}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            placeholder="+1 305 555 0142"
          />
          {errors.phone && <span className="field__error">{errors.phone}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="bk-property">
            Residence
          </label>
          <select
            id="bk-property"
            className="field__control"
            value={values.propertyId}
            onChange={update('propertyId')}
            disabled={Boolean(property)}
          >
            <option value="">Any residence / general tour</option>
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
            Preferred date
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
            Preferred time
          </label>
          <select
            id="bk-time"
            className="field__control"
            value={values.time}
            onChange={update('time')}
            aria-invalid={Boolean(errors.time)}
          >
            <option value="">Select a time</option>
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
            Additional message
          </label>
          <textarea
            id="bk-message"
            className="field__control"
            value={values.message}
            onChange={update('message')}
            placeholder="Anything we should prepare before your visit?"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? <span className="btn__spinner" /> : <CalendarCheck size={15} />}
          {busy ? 'Sending' : 'Request viewing'}
        </button>
        <span className="form-note">Private viewings are confirmed within one business day.</span>
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
    subject: 'Buying a residence',
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
    if (values.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!emailOk(values.email)) next.email = 'Enter a valid email address.';
    if (values.message.trim().length < 12) next.message = 'Tell us a little more (12 characters minimum).';
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
          <CheckCircle2 size={17} /> Message received
        </span>
        <span>An advisor will reply within one business day. For urgent matters call +971 4 555 0100.</span>
        <button type="button" className="link-arrow" onClick={() => setSent(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label className="field__label" htmlFor="ct-name">
            Full name
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
            Email address
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
            Phone (optional)
          </label>
          <input id="ct-phone" className="field__control" value={values.phone} onChange={update('phone')} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ct-subject">
            I am interested in
          </label>
          <select id="ct-subject" className="field__control" value={values.subject} onChange={update('subject')}>
            <option>Buying a residence</option>
            <option>Selling a residence</option>
            <option>Private viewings</option>
            <option>Investment advisory</option>
            <option>Press &amp; partnerships</option>
          </select>
        </div>
        <div className="field form-grid--full">
          <label className="field__label" htmlFor="ct-message">
            Message
          </label>
          <textarea
            id="ct-message"
            className="field__control"
            value={values.message}
            onChange={update('message')}
            aria-invalid={Boolean(errors.message)}
            placeholder="Tell us about the residence you are looking for."
          />
          {errors.message && <span className="field__error">{errors.message}</span>}
        </div>
      </div>
      <div style={{ marginTop: '1.2rem' }}>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? <span className="btn__spinner" /> : <Send size={15} />}
          {busy ? 'Sending' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
