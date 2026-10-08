import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { TERMS_PATH } from '../config';
import { DuplicateError, isPreview, joinFoundersWeek, submitEntry, type Stage } from '../lib/api';

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

/* ── Join (sign-up to participate) ──────────────────────────────────────── */

const STAGES: { value: Stage; label: string }[] = [
  { value: 'idea', label: 'I have an idea' },
  { value: 'building', label: 'I am building' },
  { value: 'launched', label: 'I have launched' },
];

/* Join → entry hand-off: the entry form starts with the name and email the
   visitor already gave, and tells them so. Session-scoped, nothing else. */
const JOINED_KEY = 'fw-joined';
type Joined = { name: string; email: string };
function readJoined(): Joined | null {
  try {
    const raw = sessionStorage.getItem(JOINED_KEY);
    return raw ? (JSON.parse(raw) as Joined) : null;
  } catch {
    return null;
  }
}
function saveJoined(j: Joined) {
  try {
    sessionStorage.setItem(JOINED_KEY, JSON.stringify(j));
  } catch {
    /* storage blocked: the entry form just starts empty */
  }
  window.dispatchEvent(new Event('fw-joined'));
}

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
      saveJoined({ name: name.trim(), email: email.trim() });
      setStatus('done');
    } catch (err) {
      if (err instanceof DuplicateError) {
        saveJoined({ name: name.trim(), email: email.trim() });
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
          {message || 'Your session links and a reminder are on the way to your inbox before the weekend.'}
        </p>
        <p className="fw-done-next">
          Competing too? The contest is a separate entry, and we have already filled in your name and email.{' '}
          <a className="fw-text-link" href="#enter">
            Enter the contest <i className="fw-arrow" aria-hidden="true" />
          </a>
        </p>
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
        <Submit status={status}>Get Session Links</Submit>
        {status === 'error' && <p className="fw-form-error" role="alert">{message}</p>}
      </div>
      <p className="fw-form-aside">
        Want to compete for the $17,500 in prizes? That is a separate entry with your app.{' '}
        <a className="fw-text-link" href="#enter">
          Go to the contest <i className="fw-arrow" aria-hidden="true" />
        </a>
      </p>
      <PreviewNote />
    </form>
  );
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
  const [prefilled, setPrefilled] = useState(false);
  /* pick up a join that happened on this visit (or earlier this session) */
  useEffect(() => {
    const apply = () => {
      const j = readJoined();
      if (!j) return;
      setV((cur) => (cur.name || cur.email ? cur : { ...cur, name: j.name, email: j.email }));
      setPrefilled(true);
    };
    apply();
    window.addEventListener('fw-joined', apply);
    return () => window.removeEventListener('fw-joined', apply);
  }, []);
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
          Your entry shows up in the gallery once it has been reviewed. Judging runs Oct 21 to 31, and winners are announced on or about Oct 31.
        </p>
      </div>
    );
  }

  return (
    <form className="fw-form fw-entry" onSubmit={onSubmit} noValidate>
      {prefilled && <p className="fw-prefill-note">We filled in your name and email from your Founders Week sign-up.</p>}
      <div className="fw-form-row">
        <Field label="Your name" error={errors.name}>
          <input value={v.name} onChange={set('name')} autoComplete="name" maxLength={120} />
        </Field>
        <Field label="Email" error={errors.email} hint="Only used to contact you about your entry.">
          <input type="email" value={v.email} onChange={set('email')} autoComplete="email" />
        </Field>
      </div>
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
        <textarea value={v.description} onChange={set('description')} rows={5} maxLength={1200} />
      </Field>
      <div className="fw-form-row">
        <Field label="Bolt project link" error={errors.bolt_project_url} hint="The project you built the app in.">
          <input type="url" value={v.bolt_project_url} onChange={set('bolt_project_url')} placeholder="https://bolt.new/~/" />
        </Field>
        <Field label="Demo video" error={errors.demo_video_url} hint="Up to five minutes, public on YouTube or X.">
          <input type="url" value={v.demo_video_url} onChange={set('demo_video_url')} placeholder="https://youtube.com/…" />
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
