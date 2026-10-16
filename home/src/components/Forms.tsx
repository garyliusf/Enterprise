import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { BOLT_URL, TERMS_PATH, THANKS_PATH } from '../config';
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

/* Submission window, from the rules: Oct 13 00:00 to Oct 20 23:59 PT (PDT = UTC-7). */
const CLOSES_AT = Date.parse('2026-10-21T06:59:59Z');
const JUDGING_ENDS = Date.parse('2026-10-31T06:59:59Z');

/* Review override, never on bolt.new: ?entries=closed or ?entries=done shows
   that state without waiting for the date or submitting. */
export function reviewState(): 'closed' | 'done' | null {
  if (typeof window === 'undefined' || /(^|\.)bolt\.new$/.test(window.location.hostname)) return null;
  const v = new URLSearchParams(window.location.search).get('entries');
  return v === 'closed' || v === 'done' ? v : null;
}

/* 'open' on the server and first paint (the page is prerendered), then the real
   clock. Exported so the entry panel beside the form flips with it. */
export function useEntriesClosed() {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const check = () => setClosed(reviewState() === 'closed' || Date.now() > CLOSES_AT);
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);
  return closed;
}

/* What happens after you enter: three dated steps, the current one lit. */
export function NextSteps({ closed }: { closed: boolean }) {
  const judging = closed && Date.now() < JUDGING_ENDS;
  const steps = [
    { when: 'Oct 20', what: 'Submissions close', state: closed ? 'done' : 'now' },
    { when: 'Oct 21–31', what: 'Judges review every entry', state: judging ? 'now' : closed ? 'done' : 'next' },
    { when: '~Oct 31', what: 'Winners announced here and on social', state: closed && !judging ? 'now' : 'next' },
  ];
  return (
    <ol className="fw-next">
      {steps.map((st) => (
        <li key={st.what} className={`fw-next-step is-${st.state}`}>
          <span className="fw-next-dot" aria-hidden="true" />
          <span className="fw-next-when">{st.when}</span>
          <span className="fw-next-what">{st.what}</span>
        </li>
      ))}
    </ol>
  );
}

export function GhostLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="hero-btn-ghost fw-state-ghost" href={href} target="_blank" rel="noopener">
      <div className="btn-bg-hover" />
      <div className="btn-text-wrap">
        <div className="btn-text-inner">
          <span>{children}</span>
          <span>{children}</span>
        </div>
      </div>
    </a>
  );
}

/* After a successful entry. */
function EntryDone({ name, project, url, email }: { name: string; project: string; url: string; email: string }) {
  const first = name.trim().split(/\s+/)[0];
  const share =
    'https://x.com/intent/post?text=' +
    encodeURIComponent(`I just entered ${project} in @boltdotnew Builders Week. Built in Bolt. 🚀`) +
    (url ? '&url=' + encodeURIComponent(url) : '');
  return (
    <div className="fw-state fw-state--done" role="status">
      <div className="fw-progress fw-progress--full" aria-hidden="true">
        <div className="fw-progress-bar"><span style={{ width: '100%' }} /></div>
        <span className="fw-progress-label">Submitted</span>
      </div>
      <div className="fw-state-body">
        <svg className="fw-state-check" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="22" />
          <path d="M14 24.5l7 7 13-14" />
        </svg>
        <p className="fw-state-eyebrow">Entry received</p>
        <h3 className="fw-state-title">You’re in{first ? `, ${first}` : ''}.</h3>
        <p className="fw-state-sub">
          <strong>{project}</strong> is entered in Builders Week. We’ll email <strong>{email}</strong> if we have
          questions.
        </p>
        <p className="fw-state-label">What happens next</p>
        <NextSteps closed={false} />
        <div className="fw-state-actions">
          <a className="hero-btn-primary fw-state-primary" href={share} target="_blank" rel="noopener">
            <div className="btn-bg-hover" />
            <div className="btn-text-wrap">
              <div className="btn-text-inner">
                <span>Share Your Entry</span>
                <span>Share Your Entry</span>
              </div>
            </div>
          </a>
          <GhostLink href={BOLT_URL}>Keep Building</GhostLink>
        </div>
      </div>
    </div>
  );
}

/* After Oct 20 23:59 PT the form gives way to this. */
function EntriesClosed() {
  return (
    <div className="fw-state fw-state--closed" role="status">
      <div className="fw-state-strip">
        <span className="fw-state-strip-dot" aria-hidden="true" />
        Submissions closed Oct 20
      </div>
      <div className="fw-state-body">
        <svg className="fw-state-lock" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="11" y="21" width="26" height="20" rx="3" />
          <path d="M17 21v-5a7 7 0 0 1 14 0v5" />
          <circle cx="24" cy="31" r="2" />
        </svg>
        <p className="fw-state-eyebrow">Submissions are closed</p>
        <h3 className="fw-state-title">Thanks to everyone who entered.</h3>
        <p className="fw-state-sub">
          Every entry is with the judges now. Winners are announced on or about Oct 31, here and on social.
        </p>
        <p className="fw-state-label">Where things stand</p>
        <NextSteps closed />
        <div className="fw-state-actions">
          <GhostLink href={BOLT_URL}>Keep Building</GhostLink>
          <a className="fw-text-link" href={TERMS_PATH} target="_blank" rel="noopener">
            Read the official rules <i className="fw-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

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
    /* demo video is optional: not counted toward progress */
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
    if (!v.product_name.trim()) n.product_name = 'Name your project.';
    if (!URL_RE.test(v.product_url.trim())) n.product_url = 'Add the live link, starting with https://';
    if (!URL_RE.test(v.bolt_project_url.trim())) n.bolt_project_url = 'Add the Bolt project link, starting with https://';
    if (v.demo_video_url.trim() && !VIDEO_RE.test(v.demo_video_url.trim())) n.demo_video_url = 'Use a public YouTube or X link.';
    if (!v.tagline.trim()) n.tagline = 'Describe it in one line.';
    if (!v.description.trim()) n.description = 'Tell us about your business.';
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
        demo_video_url: v.demo_video_url.trim() || undefined,
        tagline: v.tagline.trim(),
        description: v.description.trim(),
        team_name: v.team_name.trim() || undefined,
        social_handle: v.social_handle.trim() || undefined,
      });
      /* the thank-you page reads this back (a real URL: refresh-safe, trackable) */
      try {
        sessionStorage.setItem(
          'bw-entry',
          JSON.stringify({ name: v.name.trim(), project: v.product_name.trim(), url: v.product_url.trim(), email: v.email.trim(), at: Date.now() }),
        );
      } catch {
        /* storage blocked: the page falls back to a generic thank-you */
      }
      window.location.assign(THANKS_PATH);
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

  const closed = useEntriesClosed();
  const [review, setReview] = useState<'closed' | 'done' | null>(null);
  useEffect(() => setReview(reviewState()), []);

  if (status === 'done' || review === 'done') {
    return review === 'done' && status !== 'done' ? (
      <EntryDone name="Ada Lovelace" project="Ledger Studio" url="https://ledger-studio.bolt.host" email="ada@example.com" />
    ) : (
      <EntryDone name={v.name} project={v.product_name.trim()} url={v.product_url.trim()} email={v.email.trim()} />
    );
  }
  if (closed) return <EntriesClosed />;

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

      <div className="fw-step" role="group" aria-labelledby="fw-step-1">
        <div className="fw-step-head" id="fw-step-1">
          <span className="fw-step-num">01</span>
          <span className="fw-step-title">About you</span>
        </div>
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
      </div>

      <div className="fw-step" role="group" aria-labelledby="fw-step-2">
        <div className="fw-step-head" id="fw-step-2">
          <span className="fw-step-num">02</span>
          <span className="fw-step-title">About your business</span>
        </div>
        <div className="fw-form-row">
          <Field label="Project name" error={errors.product_name}>
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
          label="Tell us about your business"
          error={errors.description}
          hint="Your business idea, who it’s for and the problem it solves. List any tools besides Bolt you used, as the rules require."
        >
          <textarea value={v.description} onChange={set('description')} rows={4} maxLength={1200} />
        </Field>
      </div>

      <div className="fw-step" role="group" aria-labelledby="fw-step-3">
        <div className="fw-step-head" id="fw-step-3">
          <span className="fw-step-num">03</span>
          <span className="fw-step-title">Your demo</span>
        </div>
        <div className="fw-form-row">
          <Field label="Bolt project link" error={errors.bolt_project_url} hint="Where you built it in Bolt.">
            <input type="url" value={v.bolt_project_url} onChange={set('bolt_project_url')} placeholder="https://bolt.new/~/" />
          </Field>
          <Field label="Demo video" optional error={errors.demo_video_url} hint="Up to five minutes, public on YouTube or X.">
            <input type="url" value={v.demo_video_url} onChange={set('demo_video_url')} placeholder="https://youtube.com/…" />
          </Field>
        </div>
      </div>

      <label className={`fw-check${errors.agree ? ' has-error' : ''}`}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          I am 18 or older, I built this project primarily in Bolt during the contest period, and I accept the{' '}
          <a className="fw-text-link" href={TERMS_PATH} target="_blank" rel="noopener">
            official rules
          </a>
          .
        </span>
      </label>
      {errors.agree && <span className="fw-field-error">{errors.agree}</span>}
      <div className="fw-form-foot">
        <Submit status={status}>Submit Your Project</Submit>
        {status === 'error' && <p className="fw-form-error" role="alert">{message}</p>}
      </div>
      <PreviewNote />
    </form>
  );
}
