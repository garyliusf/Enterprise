import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { asset } from '../config';
import { BgVideo, PixelField, type WaveFn } from './ui';

/* ============================================================================
   HOW IT WORKS — one project, five scenes. Every panel animates the SAME
   dog-walking booking site (the hero's example prompt), so the five moves
   read as one story: describe → build → wire up → secure → publish.
   Each panel plays once when it scrolls into view (and under reduced
   motion shows its finished state).
   ============================================================================ */

const PROMPT = 'A booking site for my dog walking business, with a calendar and deposits';
const SITE = 'pawsandpaths.com';
/* where the project lives while it's being built: Bolt's own hosting */
const PREVIEW = 'pawsandpaths.bolt.host';

/* brand ground for every scene panel: the small gradient clip (cards.*),
   blurred and masked to a corner glow like the session cards, with a blue
   pixel field drifting over it. Each scene starts the clip at a different
   moment so the five panels never pulse in step. */
const groundWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols;
  const y = r / rows;
  const d = Math.max(0, 1 - Math.hypot((1 - x) * 1.2, (1 - y) * 1.1));
  return d * d * (Math.sin(x * 8 - y * 4 - t / 650 + phase) * 0.5 + 0.5);
};
function SceneGround({ at }: { at: number }) {
  return (
    <>
      <BgVideo name="cards" className="hm-scene-video" lazy startAt={at} />
      <PixelField wave={groundWave} spacing={8} dot={2} opacity={0.45} className="hm-scene-field" color="20,136,252" />
    </>
  );
}

/* plays once: adds .is-on when ~45% visible */
function usePlayOnce<T extends HTMLElement>(threshold = 0.45) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, on };
}

/* 01 — the prompt types itself, then the cursor blinks */
function SceneDescribe() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(PROMPT.length);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= PROMPT.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [on]);
  const done = n >= PROMPT.length;
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--describe${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={0} />
      <div className="hm-sc-prompt">
        <span className="hm-sc-typed">
          {PROMPT.slice(0, n)}
          <i className={`hm-sc-caret${done ? ' is-idle' : ''}`} />
        </span>
        <span className={`hm-sc-send${done ? ' is-on' : ''}`}>
          Build now
          <svg viewBox="0 0 16 16"><path d="M1.5 2.2c0-.9.95-1.5 1.75-1.1l11.4 6.1a1 1 0 0 1 0 1.76L3.25 15.1c-.8.42-1.75-.18-1.75-1.08V9.7L9 8 1.5 6.3V2.2z" /></svg>
        </span>
      </div>
    </div>
  );
}

/* Paws & Paths — the business site the story builds. Its OWN brand, not
   Bolt's: forest green + cream, Fraunces display, a paw mark, a real photo.
   Reused by scenes 2, 4 and 5. `--i` orders the build-in. */
const PAW = asset('/story/paws-hero.webp');
function PawMark() {
  return (
    <svg className="pp-mark" viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="7" cy="8" rx="2.3" ry="3" /><ellipse cx="12" cy="5.5" rx="2.3" ry="3" /><ellipse cx="17" cy="8" rx="2.3" ry="3" />
      <path d="M12 10.5c-3.6 0-6.5 3.2-6.5 6.3 0 2 1.4 3.2 3.2 3.2 1.2 0 2.1-.6 3.3-.6s2.1.6 3.3.6c1.8 0 3.2-1.2 3.2-3.2 0-3.1-2.9-6.3-6.5-6.3z" />
    </svg>
  );
}
function MiniSite({ stage }: { stage: 'build' | 'scan' | 'live' }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const cells = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  return (
    <div className={`hm-ms hm-ms--${stage}`}>
      <div className="hm-ms-bar">
        <i /><i /><i />
        <span className="hm-ms-url">{stage === 'live' ? SITE : PREVIEW}</span>
      </div>
      <div className="pp">
        <div className="pp-nav" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="pp-logo"><PawMark />Paws &amp; Paths</span>
          <span className="pp-links"><i>Walks</i><i>Pricing</i><i>About</i></span>
          <em className="pp-btn pp-btn--sm">Book a walk</em>
        </div>
        <div className="pp-hero" style={{ '--i': 1 } as React.CSSProperties}>
          <div className="pp-hero-copy">
            <span className="pp-kicker">Dog walking · Portland, OR</span>
            <b>Happy dogs, every single day.</b>
            <p>Solo and group walks around the neighborhood, booked online in a minute.</p>
          </div>
          <img src={PAW} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="pp-book" style={{ '--i': 2 } as React.CSSProperties}>
          <div className="pp-cal">
            <span className="pp-cal-head"><b>October</b><i>‹ ›</i></span>
            <span className="pp-cal-days">{days.map((d, k) => <i key={k}>{d}</i>)}</span>
            <span className="pp-cal-grid">
              {cells.map((d, k) => (
                <i key={k} className={d === null ? 'is-blank' : d === 14 ? 'is-picked' : d === 8 || d === 11 ? 'is-full' : undefined} style={{ '--k': k } as React.CSSProperties}>{d ?? ''}</i>
              ))}
            </span>
          </div>
          <div className="pp-slot" style={{ '--i': 3 } as React.CSSProperties}>
            <span className="pp-slot-row"><b>Tue, Oct 14</b><i>4:00 pm · 30 min</i></span>
            <span className="pp-slot-row"><b>Solo walk</b><i>$25 · $10 deposit</i></span>
            <em className="pp-btn">Pay deposit &amp; book</em>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 02 — the site assembles piece by piece */
function SceneBuild() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--build${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={4} />
      <MiniSite stage="build" />
      <span className="hm-sc-status"><i />Building</span>
    </div>
  );
}

/* 03 — the four services wire into the site, one by one */
function SceneWired() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const items = ['Hosting', 'Database', 'Payments', 'Auth'];
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--wired${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={8} />
      <div className="hm-wire-core pp-core">
        <span className="pp-logo"><PawMark />Paws &amp; Paths</span>
        <span>pawsandpaths.com</span>
      </div>
      <div className="hm-wire-list">
        {/* the trunk: a vertical line the four branches hang off, with a stub
            from the project card into it */}
        <i className="hm-wire-trunk" />
        <i className="hm-wire-stub" />
        {items.map((w, i) => (
          <span key={w} className="hm-wire-item" style={{ '--i': i } as React.CSSProperties}>
            <i className="hm-wire-line" />
            <i className="hm-wire-box" />
            {w}
            <em>connected</em>
          </span>
        ))}
      </div>
    </div>
  );
}

/* 04 — a scan sweeps the site, finds one issue, fixes it */
function SceneSecure() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--secure${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={12} />
      {/* the site inside Bolt's own frame: a slim app bar with the project
          name and the Publish button. After the fix the page dims + blurs
          and Publish lights up (Gary: no green pill, the real button). */}
      <div className="hm-app">
        <div className="hm-app-bar">
          <span className="hm-app-logo"><i className="hm-app-b" />bolt</span>
          <span className="hm-app-proj">Paws &amp; Paths</span>
          <span className="hm-app-pub">
            <i className="hm-app-pub-dot" />Publish
          </span>
        </div>
        <div className="hm-app-page">
          <MiniSite stage="scan" />
          <i className="hm-scan-line" />
          <span className="hm-scan-flag hm-scan-flag--found">1 issue found</span>
          <span className="hm-scan-flag hm-scan-flag--fixed">Fixed</span>
        </div>
      </div>
    </div>
  );
}

/* 05 — the domain fills in, Deploy is pressed, Live */
function SceneDeploy() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(SITE.length);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= SITE.length) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [on]);
  const typed = n >= SITE.length;
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--deploy${on ? ' is-on' : ''}${typed ? ' is-typed' : ''}`} aria-hidden="true">
      <SceneGround at={16} />
      <div className="hm-dep-url">
        <span className="hm-dep-domain">
          {SITE.slice(0, n)}
          <i className={`hm-sc-caret${typed ? ' is-hidden' : ''}`} />
        </span>
        <em className="hm-dep-btn">
          <span className="hm-dep-btn-label">Deploy</span>
          <span className="hm-dep-btn-done">Live</span>
        </em>
      </div>
      <div className="hm-dep-site">
        <MiniSite stage="live" />
      </div>
      <span className="hm-dep-badge"><i />Live on {SITE}</span>
    </div>
  );
}

export function StepVisual({ kind }: { kind: 'prompt' | 'build' | 'wired' | 'secure' | 'deploy' }) {
  if (kind === 'prompt') return <SceneDescribe />;
  if (kind === 'build') return <SceneBuild />;
  if (kind === 'wired') return <SceneWired />;
  if (kind === 'secure') return <SceneSecure />;
  return <SceneDeploy />;
}
