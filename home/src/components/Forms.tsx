/* What's left of the Builders Week entry flow: the Thanks page's review
   override, dated next steps and ghost link (the entry form itself is gone). */

const JUDGING_ENDS = Date.parse('2026-10-31T06:59:59Z');

/* Review override, never on bolt.new: ?entries=closed or ?entries=done shows
   that state without waiting for the date or submitting. */
export function reviewState(): 'closed' | 'done' | null {
  if (typeof window === 'undefined' || /(^|\.)bolt\.new$/.test(window.location.hostname)) return null;
  const v = new URLSearchParams(window.location.search).get('entries');
  return v === 'closed' || v === 'done' ? v : null;
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
