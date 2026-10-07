import { useState, type FormEvent, type ReactNode } from 'react';
import { TERMS_PATH } from '../config';
import { DuplicateError, isPreview, joinFoundersWeek, submitEntry, type Stage } from '../lib/api';

type Status = 'idle' | 'sending' | 'done' | 'error';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const URL_RE = /^https?:\/\/\S+\.\S+/i;

function Field({
  label,
  hint,
  error,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`fw-field${error ? ' has-error' : ''}`}>
      <span className="fw-field-label">
        {label}
        {optional && <span className="fw-field-optional">Optional</span>}
      </span>
      {children}
      {error ? <span className="fw-field-error">{error}</span> : hint ? <span className="fw-field-hint">{hint}</span> : null}
    </label>
  );
}

function Submit({ status, children }: { status: Status; children: string }) {
  return (
    <button type="submit" className="fw-submit" disabled={status === 'sending'}>
      {status === 'sending' ? 'Sending…' : children}
    </button>
  );
}

function PreviewNote() {
  if (!isPreview) return null;
  return <p className="fw-preview-note">Preview mode: nothing is saved until the database is connected.</p>;
}

/* ── Join (sign-up to participate) ──────────────────────────────────────── */

const STAGES: { value: Stage; label: string }[] = [
  { value: 'idea', label: 'I have an idea' },
  { value: 'building', label: 'I am building' },
  { value: 'launched', label: 'I have launched' },
];

export function JoinForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('idea');
  const [building, setBuilding] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Add your name.';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Add a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus('sending');
    try {
      await joinFoundersWeek({ name: name.trim(), email, stage, building: building.trim() || undefined });
      setStatus('done');
    } catch (err) {
      if (err instanceof DuplicateError) {
        setStatus('done');
        setMessage('You were already on the list. See you on Saturday.');
        return;
      }
      setStatus('error');
      setMessage('Something went wrong. Try again in a moment.');
    }
  }

  if (status === 'done') {
    return (
      <div className="fw-form fw-form--done" role="status">
        <span className="fw-done-mark" aria-hidden="true" />
        <h3 className="fw-done-title">You are in, {name.trim().split(' ')[0] || 'founder'}.</h3>
        <p className="fw-done-body">
          {message || 'We will email you the session links before the weekend. Building something to show? Enter the competition below.'}
        </p>
        <a className="fw-text-link" href="#compete">
          Enter the competition <i className="fw-arrow" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <form className="fw-form" onSubmit={onSubmit} noValidate>
      <div className="fw-form-row">
        <Field label="Name" error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
      </div>
      <fieldset className="fw-field fw-choice">
        <legend className="fw-field-label">Where are you?</legend>
        <div className="fw-choice-row">
          {STAGES.map((s) => (
            <label key={s.value} className={`fw-chip${stage === s.value ? ' is-on' : ''}`}>
              <input type="radio" name="stage" value={s.value} checked={stage === s.value} onChange={() => setStage(s.value)} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="What are you building?" optional>
        <input
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          maxLength={280}
          placeholder="One line is plenty"
        />
      </Field>
      <div className="fw-form-foot">
        <Submit status={status}>Join Founders Week</Submit>
        {status === 'error' && <p className="fw-form-error" role="alert">{message}</p>}
      </div>
      <PreviewNote />
    </form>
  );
}

/* ── Competition entry ───────────────────────────────────────────────────── */

export function EntryForm() {
  const [v, setV] = useState({
    name: '',
    email: '',
    product_name: '',
    product_url: '',
    bolt_project_url: '',
    tagline: '',
    description: '',
    social_handle: '',
  });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!v.name.trim()) n.name = 'Add your name.';
    if (!EMAIL_RE.test(v.email.trim())) n.email = 'Add a valid email address.';
    if (!v.product_name.trim()) n.product_name = 'Name your product.';
    if (!URL_RE.test(v.product_url.trim())) n.product_url = 'Add the live link, starting with https://';
    if (v.bolt_project_url.trim() && !URL_RE.test(v.bolt_project_url.trim()))
      n.bolt_project_url = 'This needs to be a full link, starting with https://';
    if (!v.tagline.trim()) n.tagline = 'Describe it in one line.';
    if (!v.description.trim()) n.description = 'Tell us a little more.';
    if (!agree) n.agree = 'Accept the rules to enter.';
    setErrors(n);
    if (Object.keys(n).length) {
      /* after React paints the error state */
      setTimeout(() => {
        const first = document.querySelector('.fw-entry .has-error :is(input, textarea)') as HTMLElement | null;
        first?.focus();
      });
      return;
    }
    setStatus('sending');
    try {
      await submitEntry({
        name: v.name.trim(),
        email: v.email,
        product_name: v.product_name.trim(),
        product_url: v.product_url.trim(),
        bolt_project_url: v.bolt_project_url.trim() || undefined,
        tagline: v.tagline.trim(),
        description: v.description.trim(),
        social_handle: v.social_handle.trim() || undefined,
      });
      setStatus('done');
    } catch (err) {
      if (err instanceof DuplicateError) {
        setStatus('error');
        setMessage('An entry from this email is already in. Reach out on social if you need to change it.');
        return;
      }
      setStatus('error');
      setMessage('Something went wrong. Try again in a moment.');
    }
  }

  if (status === 'done') {
    return (
      <div className="fw-form fw-form--done fw-entry" role="status">
        <span className="fw-done-mark" aria-hidden="true" />
        <h3 className="fw-done-title">{v.product_name.trim()} is entered.</h3>
        <p className="fw-done-body">
          Your entry shows up in the gallery once it has been reviewed. Winners are announced the week after entries close on Oct 24.
        </p>
      </div>
    );
  }

  return (
    <form className="fw-form fw-entry" onSubmit={onSubmit} noValidate>
      <div className="fw-form-row">
        <Field label="Your name" error={errors.name}>
          <input value={v.name} onChange={set('name')} autoComplete="name" maxLength={120} />
        </Field>
        <Field label="Email" error={errors.email} hint="Only used to contact you about your entry.">
          <input type="email" value={v.email} onChange={set('email')} autoComplete="email" />
        </Field>
      </div>
      <div className="fw-form-row">
        <Field label="Product name" error={errors.product_name}>
          <input value={v.product_name} onChange={set('product_name')} maxLength={80} />
        </Field>
        <Field label="Live link" error={errors.product_url} hint="Your bolt.host or custom domain.">
          <input type="url" value={v.product_url} onChange={set('product_url')} placeholder="https://" />
        </Field>
      </div>
      <Field label="One-line description" error={errors.tagline}>
        <input value={v.tagline} onChange={set('tagline')} maxLength={120} placeholder="What it does, for whom" />
      </Field>
      <Field label="Tell us about it" error={errors.description} hint="Who uses it, what you are proud of, what is next.">
        <textarea value={v.description} onChange={set('description')} rows={5} maxLength={1200} />
      </Field>
      <div className="fw-form-row">
        <Field label="Bolt project link" optional error={errors.bolt_project_url} hint="Helps the judges see how it was built.">
          <input type="url" value={v.bolt_project_url} onChange={set('bolt_project_url')} placeholder="https://bolt.new/~/" />
        </Field>
        <Field label="X or LinkedIn" optional>
          <input value={v.social_handle} onChange={set('social_handle')} maxLength={80} placeholder="@handle" />
        </Field>
      </div>
      <label className={`fw-check${errors.agree ? ' has-error' : ''}`}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          I built this product in Bolt and I accept the{' '}
          <a className="fw-text-link" href={TERMS_PATH} target="_blank" rel="noopener">
            competition rules
          </a>
          .
        </span>
      </label>
      {errors.agree && <span className="fw-field-error">{errors.agree}</span>}
      <div className="fw-form-foot">
        <Submit status={status}>Submit Your Product</Submit>
        {status === 'error' && <p className="fw-form-error" role="alert">{message}</p>}
      </div>
      <PreviewNote />
    </form>
  );
}
