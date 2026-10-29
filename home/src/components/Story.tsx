import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { asset } from '../config';
import { PixelField, type WaveFn } from './ui';

/* ============================================================================
   HOW IT WORKS — one project, five scenes. Every panel animates the SAME
   dog-walking booking site (the hero's example prompt), so the five moves
   read as one story: describe → build → wire up → secure → publish.
   Each panel plays once when it scrolls into view (and under reduced
   motion shows its finished state).
   ============================================================================ */

const PROMPT = 'A booking site for my dog walking business, with a calendar and deposits';
const SITE = 'pawsandpaths.com';

/* brand ground for every scene panel: a still from the BoltGrad03 clip
   (public/story/grad-N.webp, each a different moment + crop so the five
   cards vary), soft grain on the ground only, a faint dot field. */
const groundWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols;
  const y = r / rows;
  const d = Math.max(0, 1 - Math.hypot((1 - x) * 1.2, (1 - y) * 1.1));
  return d * d * (Math.sin(x * 8 - y * 4 - t / 650 + phase) * 0.5 + 0.5);
};
function SceneGround({ at }: { at: number }) {
  return (
    <>
      {/* light: a sky-blue remap of the still (grad-light-N); dark: the clip as shot */}
      <img src={asset(`/story/grad-light-${at}.webp`)} alt="" className="hm-scene-video hm-scene-video--light" loading="lazy" decoding="async" />
      <img src={asset(`/story/grad-${at}.webp`)} alt="" className="hm-scene-video hm-scene-video--dark" loading="lazy" decoding="async" />
      <div className="fw-grain hm-scene-grain" aria-hidden="true" />
      <PixelField wave={groundWave} spacing={8} dot={2} opacity={0.3} className="hm-scene-field" color="255,255,255" />
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
      <SceneGround at={1} />
      <div className="hm-sc-prompt">
        <span className="hm-sc-typed">
          {PROMPT.slice(0, n)}
          <i className={`hm-sc-caret${done ? ' is-idle' : ''}`} />
        </span>
        <span className={`hm-sc-send${done ? ' is-on' : ''}`}>
          Build Now
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
  return (
    <div className={`hm-ms hm-ms--${stage}`}>
      <div className="hm-ms-bar">
        <i /><i /><i />
        <span className="hm-ms-url">{SITE}</span>
      </div>
      <PawsSite />
    </div>
  );
}

/* Bolt's own workbench around the site (Gary, 2026-10-29: "less abstract,
   accurate to bolt's actual UI"): the app's top bar (breadcrumb, Preview /
   Code toggle, Share, Publish), the chat column (the prompt, Bolt's reply,
   follow-up chips, the composer with the model picker, Select, Plan, mic,
   send) and the preview pane holding the site. Decoration only. */
function BoltMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.4272 20.9491C8.80168 20.9491 7.20572 20.3592 6.28951 19.0909L5.96635 20.5867L0 23.75L0.644095 20.5867L4.9891 0.921487H10.309L8.77213 7.853C10.0134 6.49619 11.1661 5.99476 12.6438 5.99476C15.8358 5.99476 17.9637 8.08896 17.9637 11.9234C17.9637 15.8758 15.5107 20.9491 10.4272 20.9491ZM12.4665 13.0443C12.4665 14.873 11.1661 16.2593 9.48145 16.2593C8.53569 16.2593 7.6786 15.9053 7.11705 15.2859L7.94459 11.658C8.56524 11.0385 9.27456 10.6846 10.1021 10.6846C11.373 10.6846 12.4665 11.6285 12.4665 13.0443Z" fill="currentColor" />
    </svg>
  );
}
function BoltFrame({ children }: { children: React.ReactNode }) {
  const follow = ['Add group walks', 'Set up reminders', 'Refine pricing page'];
  return (
    <div className="hm-wb">
      <div className="hm-wb-bar">
        <BoltMark className="hm-wb-mark" />
        <i className="hm-wb-sep">/</i>
        <span className="hm-wb-avatar" />
        <i className="hm-wb-sep">/</i>
        <span className="hm-wb-proj">Paws &amp; Paths</span>
        <span className="hm-wb-toggle">
          <em className="is-on">
            <svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
            Preview
          </em>
          <em>
            <svg viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" /></svg>
          </em>
        </span>
        <span className="hm-wb-share">Share</span>
        <span className="hm-wb-publish">Publish</span>
      </div>
      <div className="hm-wb-body">
        <div className="hm-wb-chat">
          <span className="hm-wb-user">{PROMPT}</span>
          <span className="hm-wb-reply">
            <BoltMark className="hm-wb-reply-mark" />
            I've built the booking site: a hero, an availability calendar and a $10 deposit checkout. What would you like to work on next?
          </span>
          <span className="hm-wb-label">Follow up</span>
          <span className="hm-wb-chips">{follow.map((f) => <i key={f}>{f}</i>)}</span>
          <div className="hm-wb-composer">
            <span className="hm-wb-ph">How can Bolt help you today? (or /command)</span>
            <span className="hm-wb-tools">
              <i className="hm-wb-plus">+</i>
              <i>Plan</i>
              <i className="hm-wb-mic"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg></i>
              <i className="hm-wb-send"><svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" /></svg></i>
            </span>
          </div>
        </div>
        <div className="hm-wb-preview">{children}</div>
      </div>
    </div>
  );
}

function PawsSite() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const cells = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  return (
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
  );
}

/* 02 — the site reveals from a skeleton, block by block (no status pill — Gary) */
function SceneBuild() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--build${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={2} />
      <BoltFrame><PawsSite /></BoltFrame>
    </div>
  );
}

/* 03 — the four services wire into the site, one by one */
function SceneWired() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const items = ['Hosting', 'Database', 'Payments', 'Auth'];
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--wired${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={3} />
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

/* Bolt's slim app bar (scenes 4 + 5): wordmark, the site's URL, Publish */
function AppBar() {
  return (
    <div className="hm-app-bar">
      {/* the real bolt.new wordmark (the nav's SVG) + the site's real URL (Gary / website sync: show the .com, not the .host build URL) */}
      <svg viewBox="0 0 85 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="hm-app-logo">
              <path d="M26.1121 20.9491C21.0582 20.9491 18.4869 17.9995 18.4869 14.3126C18.4869 9.9472 21.9744 5.99476 27.0283 5.99476C32.0822 5.99476 34.6535 8.94434 34.6535 12.6313C34.6535 16.9967 31.166 20.9491 26.1121 20.9491ZM26.319 16.2593C28.0923 16.2593 29.2154 14.6665 29.2154 12.8968C29.2154 11.481 28.2992 10.6846 26.8214 10.6846C25.0481 10.6846 23.925 12.2774 23.925 14.0471C23.925 15.4629 24.8412 16.2593 26.319 16.2593Z" fill="#fff"/>
              <path d="M40.0368 20.5952H34.717L39.0615 0.921487H44.3814L40.0368 20.5952Z" fill="#fff"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M10.4272 20.9491C8.80168 20.9491 7.20572 20.3592 6.28951 19.0909L5.96635 20.5867L0 23.75L0.644095 20.5867L4.9891 0.921487H10.309L8.77213 7.853C10.0134 6.49619 11.1661 5.99476 12.6438 5.99476C15.8358 5.99476 17.9637 8.08896 17.9637 11.9234C17.9637 15.8758 15.5107 20.9491 10.4272 20.9491ZM12.4665 13.0443C12.4665 14.873 11.1661 16.2593 9.48145 16.2593C8.53569 16.2593 7.6786 15.9053 7.11705 15.2859L7.94459 11.658C8.56524 11.0385 9.27456 10.6846 10.1021 10.6846C11.373 10.6846 12.4665 11.6285 12.4665 13.0443Z" fill="#fff"/>
              <path d="M49.9163 20.9491C46.8426 20.9491 44.6555 19.8283 44.6555 17.3506C44.6555 17.1442 44.6851 16.6427 44.7737 16.2298L45.9264 10.9501H43.562L44.5964 6.34871H46.9608L47.8179 2.45527L53.7735 0L53.1378 2.46127L52.2807 6.34871H55.1771L54.1426 10.9501H51.2462L50.4778 14.4306C50.4187 14.696 50.3892 14.991 50.3892 15.109C50.3892 15.7874 50.8029 16.2593 51.7191 16.2593C51.9851 16.2593 52.3693 16.1708 52.458 16.1118V20.3592C51.8965 20.7427 50.8916 20.9491 49.9163 20.9491Z" fill="#fff"/>
              <path d="M56.461 21.0087C55.7527 21.0087 55.1886 20.4196 55.1886 19.7127C55.1886 18.8879 55.897 18.1941 56.7234 18.1941C57.4317 18.1941 57.9958 18.7832 57.9958 19.4901C57.9958 20.3149 57.2875 21.0087 56.461 21.0087Z" fill="#fff"/>
              <path d="M65.3576 20.8386H62.9964L63.7309 17.5133C63.7572 17.3955 63.8097 17.186 63.8097 17.0289C63.8097 16.5969 63.4292 16.4398 63.0488 16.4398C62.5372 16.4398 62.183 16.7016 61.9338 16.9242L61.068 20.8386H58.7068L60.1104 14.5153H62.4716L62.3011 15.2354C62.7602 14.8164 63.3374 14.3582 64.295 14.3582C65.6199 14.3582 66.3807 15.0783 66.3807 16.0209C66.3807 16.1256 66.3414 16.4136 66.3151 16.5314L65.3576 20.8386Z" fill="#fff"/>
              <path d="M70.256 20.9956C68.2096 20.9956 66.7929 19.9745 66.7929 18.1155C66.7929 16.0994 68.3408 14.3582 70.5577 14.3582C72.1319 14.3582 73.5223 15.3139 73.5223 17.2384C73.5223 17.6704 73.4436 18.1679 73.3781 18.4035H69.1279V18.4166C69.1279 18.5083 69.5083 19.2021 70.4265 19.2021C70.925 19.2021 71.5153 19.0843 71.8039 18.8879L72.5254 20.4196C71.8826 20.8255 71.0169 20.9956 70.256 20.9956ZM69.3509 16.9111H71.4366V16.8718C71.4366 16.6885 71.2136 16.1518 70.4659 16.1518C69.8363 16.1518 69.4296 16.6362 69.3509 16.9111Z" fill="#fff"/>
              <path d="M81.7599 20.8386H79.1888L78.9265 17.3038L77.1293 20.8386H74.5582L74.1254 14.5153H76.4866L76.5521 17.9977L78.4411 14.5153H80.5531L80.881 17.9977L82.4945 14.5153H85L81.7599 20.8386Z" fill="#fff"/>
            </svg>
      <span className="hm-app-proj">{SITE}</span>
      <span className="hm-app-pub">
        <i className="hm-app-pub-dot" />Publish
      </span>
    </div>
  );
}

/* 04 — a scan sweeps the site, finds one issue, fixes it */
function SceneSecure() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--secure${on ? ' is-on' : ''}`} aria-hidden="true">
      <SceneGround at={4} />
      {/* the site inside Bolt's own frame: a slim app bar with the project
          name and the Publish button. After the fix the page dims + blurs
          and Publish lights up (Gary: no green pill, the real button). */}
      <div className="hm-app">
        <AppBar />
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

/* 05 — Publish is clicked in Bolt, then the page is live: the app frame
   (scene 4's end state) fades to a Google search box with the domain
   typing in and the site in colour below it (Gary, 2026-10-29). */
function SceneDeploy() {
  const { ref, on } = usePlayOnce<HTMLDivElement>();
  const [phase, setPhase] = useState<'app' | 'aim' | 'click' | 'live'>('app');
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('live');
      setN(SITE.length);
      return;
    }
    const t1 = window.setTimeout(() => setPhase('aim'), 300);
    const t2 = window.setTimeout(() => setPhase('click'), 900);
    const t3 = window.setTimeout(() => setPhase('live'), 1300);
    let i = 0;
    let id = 0;
    const t4 = window.setTimeout(() => {
      id = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= SITE.length) window.clearInterval(id);
      }, 55);
    }, 1600);
    return () => { [t1, t2, t3, t4].forEach(window.clearTimeout); window.clearInterval(id); };
  }, [on]);
  const typed = n >= SITE.length;
  const live = phase === 'live';
  return (
    <div ref={ref} className={`hm-vis hm-scene hm-scene--deploy${on ? ' is-on' : ''}${live ? ' is-live' : ''}${typed ? ' is-typed' : ''}`} aria-hidden="true">
      <SceneGround at={5} />
      {/* beat 1: Bolt, with the site dimmed and Publish lit (how scene 4 ended);
          the cursor is already on Publish and presses it */}
      <div className={`hm-app hm-app--ready hm-dep-app hm-dep-app--${phase}`}>
        <AppBar />
        <div className="hm-app-page">
          <MiniSite stage="scan" />
        </div>
        <svg className="hm-dep-cursor" viewBox="0 0 24 24"><path d="M5 3l14 8.5-6.2 1.3L16 20l-2.6 1.2-3.2-7.2L5.6 18z" fill="#fff" stroke="#0b0c10" strokeWidth="1.5" strokeLinejoin="round" /></svg>
      </div>
      {/* beat 2: Google's search box: magnifier, the domain typing in, mic + Lens on
          the right. Once the domain is typed the site colours in and the Live toast rises */}
      <div className="hm-dep-stack">
        <div className="hm-dep-url">
          <svg className="hm-dep-glass" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <span className="hm-dep-domain">
            {SITE.slice(0, n)}
            <i className={`hm-sc-caret${typed ? ' is-hidden' : ''}`} />
          </span>
          <span className="hm-dep-icons" aria-hidden="true">
            {/* mic */}
            <svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" fill="#4285f4" /><path d="M17 11a5 5 0 0 1-10 0" fill="none" stroke="#34a853" strokeWidth="2" strokeLinecap="round" /><path d="M12 16v3" stroke="#fbbc05" strokeWidth="2" strokeLinecap="round" /><path d="M8.5 19h7" stroke="#ea4335" strokeWidth="2" strokeLinecap="round" /></svg>
            {/* lens */}
            <svg viewBox="0 0 24 24"><path d="M4 9V6a2 2 0 0 1 2-2h3" fill="none" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" /><path d="M15 4h3a2 2 0 0 1 2 2v3" fill="none" stroke="#ea4335" strokeWidth="2" strokeLinecap="round" /><path d="M20 15v3a2 2 0 0 1-2 2h-3" fill="none" stroke="#fbbc05" strokeWidth="2" strokeLinecap="round" /><path d="M9 20H6a2 2 0 0 1-2-2v-3" fill="none" stroke="#34a853" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="3.2" fill="#4285f4" /></svg>
          </span>
        </div>
        <div className="hm-dep-site">
          {/* two copies: the grey, blurred ghost underneath and the colour site
              on top, blooming out from the centre, over-bright for a beat */}
          <div className="hm-dep-ghost"><MiniSite stage="live" /></div>
          <div className="hm-dep-color"><MiniSite stage="live" /></div>
          {/* the same success toast as the audit's "Fixed" (Gary) */}
          <span className="hm-scan-flag hm-scan-flag--fixed hm-dep-live">Live</span>
        </div>
      </div>
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
