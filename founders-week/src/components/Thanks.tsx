import { useEffect, useState } from 'react';
import { BOLT_URL, HOME_PATH } from '../config';
import { GhostLink, NextSteps, reviewState } from './Forms';
import { PixelField, type WaveFn } from './ui';

type Entry = { name: string; project: string; url: string; email: string; at: number };

const SAMPLE: Entry = { name: 'Ada Lovelace', project: 'Ledger Studio', url: 'https://ledger-studio.bolt.host', email: 'ada@example.com', at: Date.parse('2026-10-16T21:42:00Z') };

/* pixels rising from the top edge, like a soft burst behind the check */
const burst: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols - 0.5;
  const y = r / rows;
  const d = Math.max(0, 1 - Math.hypot(x * 1.6, y * 1.4));
  const w = Math.sin(Math.hypot(x, y) * 18 - t / 500) * 0.5 + 0.5;
  return d * d * w;
};

/* Post-submission thank-you page (/thanks). The form stores a summary in
   sessionStorage before redirecting here; without one (opened directly, or
   storage blocked) it shows a generic thank-you. ?entries=done previews the
   filled version off bolt.new. */
export function Thanks() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let e: Entry | null = null;
    try {
      const raw = sessionStorage.getItem('bw-entry');
      if (raw) e = JSON.parse(raw);
    } catch {
      /* ignore */
    }
    if (!e && reviewState() === 'done') e = SAMPLE;
    setEntry(e);
    setReady(true);
  }, []);

  const first = entry?.name.split(/\s+/)[0];
  const share =
    'https://x.com/intent/post?text=' +
    encodeURIComponent(`I just entered ${entry?.project ?? 'my project'} in @boltdotnew Builders Week. Built in Bolt. 🚀`) +
    (entry?.url ? '&url=' + encodeURIComponent(entry.url) : '');
  const when = entry
    ? new Date(entry.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles', timeZoneName: 'short' })
    : '';

  return (
    <main className="fw-thanks">
      <PixelField wave={burst} spacing={9} dot={2} opacity={0.55} className="fw-thanks-field" color="20,136,252" />
      <div className={`fw-thanks-inner${ready ? ' is-ready' : ''}`}>
        <svg className="fw-state-check fw-thanks-check" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="22" />
          <path d="M14 24.5l7 7 13-14" />
        </svg>
        <p className="section-eyebrow fw-thanks-eyebrow">Entry received</p>
        <h1 className="fw-thanks-h1">{first ? `You’re in, ${first}.` : 'Thanks for entering.'}</h1>
        <p className="fw-thanks-sub">
          {entry ? (
            <>
              <strong>{entry.project}</strong> is entered in Builders Week. We’ll email <strong>{entry.email}</strong> if we
              have questions.
            </>
          ) : (
            'Your project is entered in Builders Week. We’ll email you if we have questions.'
          )}
        </p>

        <div className="fw-thanks-card">
          {entry && (
            <dl className="fw-thanks-receipt">
              <div>
                <dt>Project</dt>
                <dd>{entry.project}</dd>
              </div>
              {entry.url && (
                <div>
                  <dt>Live link</dt>
                  <dd>
                    <a className="fw-text-link" href={entry.url} target="_blank" rel="noopener">
                      {entry.url.replace(/^https?:\/\//, '')}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt>Submitted</dt>
                <dd>{when}</dd>
              </div>
            </dl>
          )}
          <p className="fw-state-label">What happens next</p>
          <NextSteps closed={false} />
        </div>

        <div className="fw-thanks-actions">
          <a className="hero-btn-primary" href={share} target="_blank" rel="noopener">
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

      <section className="fw-thanks-wait" aria-label="While you wait">
        <p className="fw-state-label">While you wait</p>
        <div className="fw-thanks-links">
          <a className="fw-thanks-link" href={HOME_PATH + '#schedule'}>
            <span className="fw-thanks-link-title">Join the live sessions</span>
            <span className="fw-thanks-link-desc">SEO, growth and design workshops with the Bolt team, Oct 20 to 23.</span>
            <i className="fw-arrow" aria-hidden="true" />
          </a>
          <a className="fw-thanks-link" href={HOME_PATH}>
            <span className="fw-thanks-link-title">Back to Builders Week</span>
            <span className="fw-thanks-link-desc">The free build weekend, the prizes and past winners.</span>
            <i className="fw-arrow" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
