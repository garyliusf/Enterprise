import type React from 'react';
import { useEffect, useRef, useState } from 'react';
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

/* the little site, reused by scenes 2, 4 and 5 */
function MiniSite({ stage }: { stage: 'build' | 'scan' | 'live' }) {
  return (
    <div className={`hm-ms hm-ms--${stage}`}>
      <div className="hm-ms-bar">
        <i /><i /><i />
        <span className="hm-ms-url">{stage === 'live' ? SITE : 'localhost:5173'}</span>
      </div>
      <div className="hm-ms-page">
        <div className="hm-ms-nav" style={{ '--i': 0 } as React.CSSProperties}>
          <b>Paws &amp; Paths</b>
          <span /><span /><span />
          <em>Book a walk</em>
        </div>
        <div className="hm-ms-hero" style={{ '--i': 1 } as React.CSSProperties}>
          <b>Dog walks you can book in a minute.</b>
          <span />
        </div>
        <div className="hm-ms-cal" style={{ '--i': 2 } as React.CSSProperties}>
          {Array.from({ length: 14 }, (_, k) => (
            <i key={k} className={k === 9 ? 'is-picked' : k === 3 || k === 11 ? 'is-busy' : undefined} style={{ '--k': k } as React.CSSProperties} />
          ))}
        </div>
        <div className="hm-ms-row" style={{ '--i': 3 } as React.CSSProperties}>
          <span className="hm-ms-field">30 min · $25</span>
          <em className="hm-ms-cta">Pay $10 deposit</em>
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
      <div className="hm-wire-core">
        <b>Paws &amp; Paths</b>
        <span>your project</span>
      </div>
      <div className="hm-wire-list">
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
      <MiniSite stage="scan" />
      <i className="hm-scan-line" />
      <span className="hm-scan-flag hm-scan-flag--found">1 issue found</span>
      <span className="hm-scan-flag hm-scan-flag--fixed">Fixed · safe to publish</span>
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
