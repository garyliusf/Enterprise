import { useState, type FormEvent, type ReactNode } from 'react';
import { TERMS_PATH } from '../config';
import { DuplicateError, isPreview, submitEntry } from '../lib/api';

type Status = 'idle' | 'sending' | 'done' | 'error';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const URL_RE = /^https?:\/\/\S+\.\S+/i;
const VIDEO_RE = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|x\.com|twitter\.com)\/\S+/i;

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
    /* the standard primary button markup, so shared-components.js gives it
       the pixel-fill hover (and the slide-up fallback) */
    <button type="submit" className="hero-btn-primary fw-submit" disabled={status === 'sending'}>
      <div className="btn-bg-hover" />
      <div className="btn-text-wrap">
        <div className="btn-text-inner">
          <span>{status === 'sending' ? 'Sending…' : children}</span>
          <span>{status === 'sending' ? 'Sending…' : children}</span>
        </div>
      </div>
    </button>
  );
}

function PreviewNote() {
  if (!isPreview) return null;
  return <p className="fw-preview-note">Preview mode: nothing is saved until the database is connected.</p>;
}

/* ── Contest entry ───────────────────────────────────────────────────── */

export function EntryForm() {
  const [v, setV] = useState({
    name: '',
    email: '',
    product_name: '',
    product_url: '',
    bolt_project_url: '',
    demo_video_url: '',
    tagline: '',
    description: '',
    team_name: '',
    social_handle: '',
  });
  const [agree, setAgree] = useState(false);
  const required = [
    v.name.trim(),
    EMAIL_RE.test(v.email.trim()),
    v.product_name.trim(),
    URL_RE.test(v.product_url.trim()),
    v.tagline.trim(),
    v.description.trim(),
    URL_RE.test(v.bolt_project_url.trim()),
    VIDEO_RE.test(v.demo_video_url.trim()),
    agree,
  ];
  const done = required.filter(Boolean).length / required.length;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!v.name.trim()) n.name = 'Add your name.';
    if (!EMAIL_RE.test(v.email.trim())) n.email = 'Add a valid email address.';
    if (!v.product_name.trim()) n.product_name = 'Name your app.';
    if (!URL_RE.test(v.product_url.trim())) n.product_url = 'Add the live link, starting with https://';
    if (!URL_RE.test(v.bolt_project_url.trim())) n.bolt_project_url = 'Add the Bolt project link, starting with https://';
    if (!VIDEO_RE.test(v.demo_video_url.trim())) n.demo_video_url = 'Add a public YouTube or X link.';
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
        bolt_project_url: v.bolt_project_url.trim(),
        demo_video_url: v.demo_video_url.trim(),
        tagline: v.tagline.trim(),
        description: v.description.trim(),
        team_name: v.team_name.trim() || undefined,
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
          We will email you if we have questions. Judging runs Oct 21 to 31, and winners are announced on or about Oct 31.
        </p>
      </div>
    );
  }

  return (
    <form className="fw-form fw-entry" onSubmit={onSubmit} noValidate>
      {/* live completion: required fields filled + rules accepted */}
      <div className="fw-progress" aria-hidden="true">
        <div className="fw-progress-bar">
          {/* starts with a 5% sliver so the meter reads as a meter before typing */}
          <span style={{ width: `${Math.round(5 + done * 95)}%` }} />
        </div>
        <span className="fw-progress-label">{done >= 1 ? 'Ready to submit' : `${Math.round(done * 100)}% complete`}</span>
      </div>

      <fieldset className="fw-step">
        <legend className="fw-step-head">
          <span className="fw-step-num">01</span>
          <span className="fw-step-title">About you</span>
        </legend>
        <div className="fw-form-row">
          <Field label="Your name" error={errors.name}>
            <input value={v.name} onChange={set('name')} autoComplete="name" maxLength={120} />
          </Field>
          <Field label="Email" error={errors.email} hint="Only used to contact you about your entry.">
            <input type="email" value={v.email} onChange={set('email')} autoComplete="email" />
          </Field>
        </div>
        <div className="fw-form-row">
          <Field label="Team or organization" optional hint="If you are entering on behalf of one.">
            <input value={v.team_name} onChange={set('team_name')} maxLength={120} />
          </Field>
          <Field label="X or LinkedIn" optional>
            <input value={v.social_handle} onChange={set('social_handle')} maxLength={80} placeholder="@handle" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="fw-step">
        <legend className="fw-step-head">
          <span className="fw-step-num">02</span>
          <span className="fw-step-title">About your build</span>
        </legend>
        <div className="fw-form-row">
          <Field label="App name" error={errors.product_name}>
            <input value={v.product_name} onChange={set('product_name')} maxLength={80} />
          </Field>
          <Field label="Live link" error={errors.product_url} hint="Your bolt.host or custom domain.">
            <input type="url" value={v.product_url} onChange={set('product_url')} placeholder="https://" />
          </Field>
        </div>
        <Field label="One-line description" error={errors.tagline}>
          <input value={v.tagline} onChange={set('tagline')} maxLength={120} placeholder="What it does, for whom" />
        </Field>
        <Field
          label="Tell us about it"
          error={errors.description}
          hint="What it does and its features. List any tools besides Bolt you used, as the rules require."
        >
          <textarea value={v.description} onChange={set('description')} rows={4} maxLength={1200} />
        </Field>
      </fieldset>

      <fieldset className="fw-step">
        <legend className="fw-step-head">
          <span className="fw-step-num">03</span>
          <span className="fw-step-title">Your demo</span>
        </legend>
        <div className="fw-form-row">
          <Field label="Bolt project link" error={errors.bolt_project_url} hint="The project you built the app in.">
            <input type="url" value={v.bolt_project_url} onChange={set('bolt_project_url')} placeholder="https://bolt.new/~/" />
          </Field>
          <Field label="Demo video" error={errors.demo_video_url} hint="Up to five minutes, public on YouTube or X.">
            <input type="url" value={v.demo_video_url} onChange={set('demo_video_url')} placeholder="https://youtube.com/…" />
          </Field>
        </div>
      </fieldset>

      <label className={`fw-check${errors.agree ? ' has-error' : ''}`}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          I am 18 or older, I built this app primarily in Bolt during the contest period, and I accept the{' '}
          <a className="fw-text-link" href={TERMS_PATH} target="_blank" rel="noopener">
            official rules
          </a>
          .
        </span>
      </label>
      {errors.agree && <span className="fw-field-error">{errors.agree}</span>}
      <div className="fw-form-foot">
        <Submit status={status}>Submit Your App</Submit>
        {status === 'error' && <p className="fw-form-error" role="alert">{message}</p>}
      </div>
      <PreviewNote />
    </form>
  );
}
