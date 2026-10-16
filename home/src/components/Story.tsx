import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { asset } from '../config';
import { BgVideo } from './ui';

/* ============================================================================
   HOW IT WORKS — one project, five scenes. Every panel is a piece of Bolt's
   REAL UI (the composer, the build log, integrations, the security audit,
   the publish dialog) for the SAME dog-walking booking site, sitting on the
   brand gradient with film grain and cropped off the bottom-right corner,
   like the product shots (Gary, 2026-10-16). Each panel plays once when it
   scrolls into view; under reduced motion it shows its finished state.
   ============================================================================ */

const PROMPT = 'A booking site for my dog walking business, with a calendar and deposits';
const SITE = 'pawsandpaths.com';
/* where the project lives while it's being built: Bolt's own hosting */
const PREVIEW = 'pawsandpaths.bolt.host';

/* the ground: the gradient clip full-bleed + grain. Each scene starts the
   clip at a different moment so the five panels never pulse in step. */
function SceneGround({ at }: { at: number }) {
  return (
    <>
      <BgVideo name="cards" className="hm-scene-video" lazy startAt={at} />
      <div className="fw-grain hm-scene-grain" aria-hidden="true" />
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

/* types `text` once `on`, after `delay` ms; reduced motion = instant */
function useTypewriter(text: string, on: boolean, delay: number, step: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(text.length);
      return;
    }
    let id = 0;
    const t = window.setTimeout(() => {
      let i = 0;
      id = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) window.clearInterval(id);
      }, step);
    }, delay);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, [on, text, delay, step]);
  return n;
}

/* Paws & Paths — the customer's site in the preview (its OWN brand: forest
   green + cream, Fraunces, a paw mark, a real photo). Nav + hero only. */
const PAW = asset('/story/paws-hero.webp');
function MiniSite() {
  return (
    <div className="pp">
      <div className="pp-nav">
        <span className="pp-logo">
          <svg className="pp-mark" viewBox="0 0 24 24" aria-hidden="true">
            <ellipse cx="7" cy="8" rx="2.3" ry="3" /><ellipse cx="12" cy="5.5" rx="2.3" ry="3" /><ellipse cx="17" cy="8" rx="2.3" ry="3" />
            <path d="M12 10.5c-3.6 0-6.5 3.2-6.5 6.3 0 2 1.4 3.2 3.2 3.2 1.2 0 2.1-.6 3.3-.6s2.1.6 3.3.6c1.8 0 3.2-1.2 3.2-3.2 0-3.1-2.9-6.3-6.5-6.3z" />
          </svg>
          Paws &amp; Paths
        </span>
        <span className="pp-links"><i>Walks</i><i>Pricing</i><i>About</i></span>
        <em className="pp-btn pp-btn--sm">Book a walk</em>
      </div>
      <div className="pp-hero">
        <div className="pp-hero-copy">
          <span className="pp-kicker">Dog walking · Portland, OR</span>
          <b>Happy dogs, every single day.</b>
          <p>Solo and group walks around the neighborhood, booked online in a minute.</p>
        </div>
        <img src={PAW} alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}

/* ── the Bolt UI vocabulary ──────────────────────────────────────────────── */
const d = (s: number) => ({ '--d': s } as React.CSSProperties);
function Help() {
  return (
    <svg className="hm-ui-help" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.8 8.1a2.2 2.2 0 1 1 3.1 2c-.6.3-.9.7-.9 1.3v.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.4" r="0.9" fill="currentColor" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.3l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
function Shield() {
  return (
    <svg className="hm-ui-ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.2l6.2 2.3v5c0 4-2.6 6.8-6.2 8.3-3.6-1.5-6.2-4.3-6.2-8.3v-5L10 2.2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7.4 10l1.8 1.8 3.4-3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
function Globe() {
  return (
    <svg className="hm-ui-ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M2.5 10h15M10 2.5c2.4 2.3 2.4 12.7 0 15M10 2.5c-2.4 2.3-2.4 12.7 0 15" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
  );
}
function Panel({ title, right, children, className = '' }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`hm-ui-sheet ${className}`.trim()}>
      <div className="hm-ui">
        <div className="hm-ui-head">
          <b>{title}</b>
          {right ?? <Help />}
        </div>
        {children}
      </div>
    </div>
  );
}
function Chip({ children, tone = 'blue', style }: { children: React.ReactNode; tone?: 'blue' | 'amber' | 'green' | 'grey'; style?: React.CSSProperties }) {
  return (
    <span className={`hm-ui-chip hm-ui-chip--${tone}`} style={style}>
      {tone !== 'amber' && tone !== 'grey' && <Check />}
      {children}
    </span>
  );
}

/* 01 — the composer: the prompt types itself, the send button lights */
function SceneDescribe() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const n = useTypewriter(PROMPT, on, 400, 28);
  const done = n >= PROMPT.length;
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--describe${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={0} />
      <div className="hm-ui-sheet">
        <p className="hm-ui-greet">What do you want to build?</p>
        <div className="hm-ui hm-ui--composer">
          <div className="hm-ui-typed">
            {PROMPT.slice(0, n)}
            <i className={`hm-sc-caret${done ? ' is-idle' : ''}`} />
          </div>
          <div className="hm-ui-composer-row">
            <span className="hm-ui-tool"><svg viewBox="0 0 16 16"><path d="M10.5 5.5l-4.6 4.6a1.5 1.5 0 0 0 2.1 2.1l5-5a3 3 0 0 0-4.2-4.2l-5 5a4.5 4.5 0 0 0 6.4 6.4l3.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
            <span className="hm-ui-tool"><svg viewBox="0 0 16 16"><rect x="5.5" y="1.5" width="5" height="8" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
            <span className="hm-ui-model">Claude Sonnet</span>
            <span className={`hm-ui-send${done ? ' is-on' : ''}`}>
              <svg viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 02 — the build log: files land one by one, status flips to Ready */
function SceneBuild() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const rows = [
    ['Create', 'src/App.tsx'],
    ['Create', 'components/BookingCalendar.tsx'],
    ['Add', 'Stripe deposits'],
    ['Start', 'preview server'],
  ];
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--build${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={4} />
      <Panel
        title="Building Paws & Paths"
        right={
          <span className="hm-ui-status">
            <i /><span className="hm-ui-status-a">Building</span><span className="hm-ui-status-b">Ready</span>
          </span>
        }
      >
        <div className="hm-ui-log">
          {rows.map(([verb, file], i) => (
            <div key={file} className="hm-ui-act" style={d(0.4 + i * 0.7)}>
              <span className="hm-ui-act-ic"><Check /></span>
              <span>{verb} <code>{file}</code></span>
            </div>
          ))}
        </div>
        <div className="hm-ui-btn hm-ui-btn--primary hm-ui-lit" style={d(3.6)}>Open preview</div>
      </Panel>
    </div>
  );
}

/* 03 — integrations: the four services connect, one by one */
function SceneWired() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const rows = [
    ['Hosting', 'Bolt Hosting'],
    ['Database', 'Supabase'],
    ['Payments', 'Stripe'],
    ['Auth', 'Supabase Auth'],
  ];
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--wired${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={8} />
      <Panel title="Integrations">
        <div className="hm-ui-list">
          {rows.map(([name, via], i) => (
            <div key={name} className="hm-ui-row hm-ui-row--line">
              <span className="hm-ui-box-ic" />
              <span className="hm-ui-row-copy"><b>{name}</b><small>{via}</small></span>
              <Chip style={d(0.4 + i * 0.6)}>Connected</Chip>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* 04 — the security audit: runs, finds one issue, fixes it, Publish lights */
function SceneSecure() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--secure${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={12} />
      <Panel title="Security audit">
        <div className="hm-ui-btn hm-ui-press" style={d(0.3)}><Shield />Run Security Audit</div>
        <div className="hm-ui-bar" style={d(0.5)}><i /></div>
        <div className="hm-ui-list">
          <div className="hm-ui-row hm-ui-in" style={d(2)}>
            <span className="hm-ui-act-ic is-done"><Check /></span>
            <span className="hm-ui-row-copy"><b>Scanned 24 files</b></span>
          </div>
          <div className="hm-ui-row hm-ui-in" style={d(2.4)}>
            <span className="hm-ui-act-ic is-warn">!</span>
            <span className="hm-ui-row-copy"><b>Deposit amount set by the client</b><small>checkout/deposit.ts</small></span>
            <span className="hm-ui-swap">
              <Chip tone="amber">1 issue</Chip>
              <Chip tone="green" style={d(3.6)}>Fixed</Chip>
            </span>
          </div>
        </div>
        <div className="hm-ui-btn hm-ui-btn--primary hm-ui-lit" style={d(4.3)}>Publish</div>
      </Panel>
    </div>
  );
}

/* 05 — publish: the preview dims and blurs, the dialog rises, the live
   domain fills in and connects */
function SceneDeploy() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const n = useTypewriter(SITE, on, 2000, 55);
  const typed = n >= SITE.length;
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--deploy${on ? ' is-on' : ''}${typed ? ' is-typed' : ''}`} aria-hidden="true">
      <SceneGround at={16} />
      {/* the preview, as it was: the site on bolt.host, about to be dimmed */}
      <div className="hm-ui-browser">
        <div className="hm-ms-bar"><i /><i /><i /><span className="hm-ms-url">{PREVIEW}</span></div>
        <MiniSite />
      </div>
      <Panel title="Publish your project" className="hm-ui-sheet--rise">
        <div className="hm-ui-row hm-ui-dom">
          <Globe />
          <span className="hm-ui-row-copy">
            <b className="hm-ui-dom-name">{typed ? SITE : PREVIEW}</b>
            <small>{typed ? 'Published just now' : 'Published 2 min ago'}</small>
          </span>
        </div>
        <div className="hm-ui-btn"><Shield />Run Security Audit</div>
        <div className="hm-ui-box">
          <div className="hm-ui-box-head"><b>Custom domain</b><svg viewBox="0 0 12 12"><path d="M2.5 7.5L6 4l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
          <div className="hm-ui-input">
            <span>{SITE.slice(0, n)}<i className={`hm-sc-caret${typed ? ' is-hidden' : ''}`} /></span>
            <Chip>Connected</Chip>
          </div>
        </div>
        <div className="hm-ui-btn hm-ui-btn--primary">Update</div>
      </Panel>
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
