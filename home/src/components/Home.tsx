import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { closing, enterprise, showcase, stats, steps, stories, platform, templatesHome, useCases, type ShowcaseCard } from '../home';
import { PromptBox, TrustPills } from './Hero';
import { StepVisual } from './Story';
import { BgVideo, Btn, HoverField, PixelField, SectionHeader, type WaveFn } from './ui';
import { useVariant } from './VariantSwitch';

/* ── Showcase: two rows of "Tell bolt" cards drifting in opposite directions ─
   Each row is duplicated so the drift loops seamlessly; it pauses on hover. */
function ShowcaseRow({ cards, reverse = false }: { cards: ShowcaseCard[]; reverse?: boolean }) {
  const loop = [...cards, ...cards];
  return (
    <div className={`hm-show-row${reverse ? ' hm-show-row--rev' : ''}`}>
      <div className="hm-show-track">
        {loop.map((c, i) => {
          const dupe = i >= cards.length;
          return (
            <div key={i} className="hm-show-card" aria-hidden={dupe ? true : undefined}>
              <a className="hm-show-shot" href={(SHOW_PREVIEW && c.preview) || c.url} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
                <img src={c.shot} alt="" loading="lazy" decoding="async" />
              </a>
              <span className="hm-show-foot">
                <span className="hm-show-kicker">Tell bolt</span>
                <span className="hm-show-prompt">{c.prompt}</span>
                <CardActions open={c.url} preview={c.preview} label={c.prompt} tabIndex={dupe ? -1 : undefined} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* the template card action pair (production's catalog cards): Open in Bolt
   forks the project, Preview opens the live site — two different jobs, so
   both are shown when a live site exists.
   OFF since 2026-10-20 (Gary): every template-*.bolt.host site is down (no
   site at the name, last seen up 2026-08-28). The URLs stay in home.ts; flip
   this back to true once they are republished. */
const SHOW_PREVIEW = true; // back on 2026-10-21: the template-*.bolt.host sites answer 200 again
function CardActions({ open, preview, label, tabIndex }: { open: string; preview?: string; label: string; tabIndex?: number }) {
  return (
    <span className="hm-card-actions">
      <a className="hm-card-cta" href={open} target="_blank" rel="noopener" tabIndex={tabIndex} aria-label={`Open ${label} in Bolt`}>Open in Bolt</a>
      {SHOW_PREVIEW && preview && (
        <a className="hm-card-demo" href={preview} target="_blank" rel="noopener" tabIndex={tabIndex} aria-label={`Preview ${label}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" /></svg>
          Preview
        </a>
      )}
    </span>
  );
}

/* VARIANT C (review): a "Star Wars" crawl (Gary) — the showcase as a wall of
   sites tilted back in perspective, scrolling away toward a faded horizon;
   hover pauses it. Each tile is the site with its prompt as a caption, and
   opens the project in Bolt. */
function CrawlActions({ c, tabIndex }: { c: ShowcaseCard; tabIndex?: number }) {
  return (
    <span className="hm-crawl-open">
      <a className="hm-crawl-btn hm-crawl-btn--primary" href={c.url} target="_blank" rel="noopener" tabIndex={tabIndex} aria-label={`Open ${c.prompt} in Bolt`}>Open in Bolt</a>
      <a
        className="hm-crawl-btn hm-crawl-btn--ghost"
        href={c.preview ?? c.url}
        target="_blank"
        rel="noopener"
        tabIndex={tabIndex}
        aria-label={`Preview ${c.prompt}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" /></svg>
        Preview
      </a>
    </span>
  );
}
function CrawlTile({ c, dupe, onHover }: { c: ShowcaseCard; dupe: boolean; onHover: (c: ShowcaseCard, e: React.MouseEvent<HTMLElement>) => void }) {
  return (
    <div className="hm-crawl-tile" aria-hidden={dupe ? true : undefined} onMouseEnter={(e) => onHover(c, e)} onMouseMove={(e) => onHover(c, e)}>
      <img src={c.shot} alt="" loading="lazy" decoding="async" />
      <span className="hm-crawl-cap">{c.prompt}</span>
    </div>
  );
}
/* hover action card (Gary). It is ANCHORED TO THE HOVERED TILE — bottom
   centre, inside the tile's own footprint — not to the cursor: moving around a
   tile never moves it, moving down slides over it and off the tile's edge onto
   the next one, and it never covers a neighbouring tile (a cursor-following
   card got in the way of simply browsing down). It glides between tiles (rAF
   lerp on transform, no React render per frame); hiding waits 300ms so the
   gaps never blink it; the wall stays paused while it's up. */
function CrawlWall({ all }: { all: ShowcaseCard[] }) {
  const loop = [...all, ...all, ...all, ...all];
  const wrap = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [c, setC] = useState<ShowcaseCard | null>(null);
  const st = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0, onRow: false, shown: false, tile: null as HTMLElement | null });
  const hideT = useRef<number>(0);
  const tick = () => {
    const s = st.current, el = row.current;
    s.raf = 0;
    if (!el) return;
    s.x += (s.tx - s.x) * 0.22; s.y += (s.ty - s.y) * 0.22;
    el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translateX(-50%)`;
    if (Math.abs(s.tx - s.x) > 0.3 || Math.abs(s.ty - s.y) > 0.3) s.raf = requestAnimationFrame(tick);
  };
  useEffect(() => () => { cancelAnimationFrame(st.current.raf); window.clearTimeout(hideT.current); }, []);
  const onHover = (card: ShowcaseCard, e: React.MouseEvent<HTMLElement>) => {
    const s = st.current, w = wrap.current;
    if (!w) return;
    window.clearTimeout(hideT.current);
    const tile = e.currentTarget;
    if (s.shown && s.tile === tile) return;
    const first = !s.shown;
    s.tile = tile; s.shown = true;
    if (c !== card) setC(card);
    const r = w.getBoundingClientRect(), t = tile.getBoundingClientRect();
    const h = Math.max(row.current?.offsetHeight ?? 0, 130); // empty before its first render
    s.tx = Math.min(Math.max(t.left + t.width / 2 - r.left, 156), r.width - 156);
    s.ty = Math.min(t.bottom - r.top, r.height) - h - 14;
    if (first) { s.x = s.tx; s.y = s.ty; }
    if (!s.raf) s.raf = requestAnimationFrame(tick);
  };
  const hideSoon = () => {
    window.clearTimeout(hideT.current);
    hideT.current = window.setTimeout(() => { if (!st.current.onRow) { st.current.shown = false; st.current.tile = null; setC(null); } }, 300);
  };
  return (
    <div
      className={`hm-crawl-wrap${c ? ' is-popped' : ''}`}
      ref={wrap}
      onMouseMove={(e) => { if (!(e.target as HTMLElement).closest('.hm-crawl-tile, .hm-crawl-float')) hideSoon(); }}
      onMouseLeave={() => { st.current.onRow = false; hideSoon(); }}
    >
      <div className="hm-crawl">
        <div className="hm-crawl-plane">
          <div className="hm-crawl-track">{loop.map((card, i) => <CrawlTile key={i} c={card} dupe={i >= all.length} onHover={onHover} />)}</div>
        </div>
      </div>
      <div
        ref={row}
        className={`hm-crawl-float${c ? ' is-on' : ''}`}
        aria-hidden={c ? undefined : true}
        onMouseEnter={() => { st.current.onRow = true; window.clearTimeout(hideT.current); }}
        onMouseLeave={() => { st.current.onRow = false; }}
      >
        {c && (
          /* keyed: a new card's contents fade/settle in on their own */
          <div key={c.prompt} className="hm-crawl-float-in">
            {/* which project this row belongs to (Gary): thumb, title, category */}
            <span className="hm-crawl-float-thumb" aria-hidden="true"><img src={c.shot} alt="" /></span>
            <span className="hm-crawl-float-copy">
              <span className="hm-crawl-float-name">{c.name ?? c.prompt}</span>
              {c.tag && <span className="hm-crawl-float-tag">{c.tag}</span>}
            </span>
            <CrawlActions c={c} />
          </div>
        )}
      </div>
    </div>
  );
}

/* VARIANT E (review): the showcase as a coverflow (Gary's reference). One
   card flat in the centre with its prompt + actions; neighbours turn away a
   little (2.5D, not full 3D). Position is continuous and eases smoothly to
   each card (no overshoot); the row can be dragged with mouse or touch, and a
   flick travels a little further before easing onto the nearest card. Auto-advances every 3s (paused on hover, drag or off screen);
   clicking a side card or a dot brings it to the centre. Per-frame updates
   write CSS vars straight to the cards (no React render per frame). */
const COVER_MS = 3000;
function ShowcaseCoverflow() {
  const all = [...showcase.rowA, ...showcase.rowB];
  const n = all.length;
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const st = useRef({ pos: 0, v: 0, target: 0, raf: 0, drag: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, vel: 0, moved: 0, hover: false, vis: false });
  const wrapD = (d: number) => { d = ((d % n) + n) % n; return d > n / 2 ? d - n : d; };
  const paint = () => {
    const s = st.current;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const d = wrapD(i - s.pos);
      el.style.setProperty('--d', d.toFixed(4));
      el.style.setProperty('--ad', Math.abs(d).toFixed(4));
      el.toggleAttribute('data-off', Math.abs(d) > 2.6);
    });
    const a = ((Math.round(s.pos) % n) + n) % n;
    setActive((p) => (p === a ? p : a));
  };
  const tick = () => {
    const s = st.current;
    s.raf = 0;
    if (!s.drag) {
      /* smooth ease-out toward the target, no overshoot (Gary: the spring felt
         jerky); frame-rate independent */
      const now = performance.now(), dt = Math.min(now - (s.lastT || now), 50); s.lastT = now;
      s.pos += (s.target - s.pos) * (1 - Math.exp(-dt / 140));
      if (Math.abs(s.target - s.pos) < 0.001) { s.pos = s.target; paint(); s.lastT = 0; return; }
    }
    paint();
    s.raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!st.current.raf) st.current.raf = requestAnimationFrame(tick); };
  const go = (t: number) => { st.current.target = t; st.current.lastT = 0; kick(); };
  useEffect(() => { paint(); return () => cancelAnimationFrame(st.current.raf); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  /* each card's caption space = its own caption's height, so a one-line name
     leaves no gap under the buttons (Gary) */
  useEffect(() => {
    const fit = () => cards.current.forEach((el) => {
      const foot = el?.querySelector<HTMLElement>('.hm-cover-foot');
      if (el && foot) el.style.setProperty('--cap', `${foot.offsetHeight + 14}px`);
    });
    /* the stage is as tall as its tallest card (+ the fan's drop and shadow), so
       the pagination sits right under the cards (Gary: it floated far below) */
    const tallest = Math.max(...cards.current.map((el) => el?.offsetHeight ?? 0));
    if (root.current && tallest) root.current.style.height = `${tallest + 40}px`;
    fit();
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { st.current.vis = e.isIntersecting; }, { threshold: 0.3 });
    io.observe(el);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setInterval(() => {
      const s = st.current;
      if (reduce || s.hover || s.drag || !s.vis || Math.abs(s.target - s.pos) > 0.05) return;
      go(Math.round(s.target) + 1);
    }, COVER_MS);
    return () => { io.disconnect(); window.clearInterval(id); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const spacing = () => (cards.current[0]?.offsetWidth ?? 500) * 0.62;
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const s = st.current;
    s.drag = true; s.moved = 0; s.startX = s.lastX = e.clientX; s.startPos = s.pos; s.lastT = e.timeStamp; s.vel = 0; s.v = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    kick();
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag) return;
    const dx = e.clientX - s.startX;
    s.moved = Math.max(s.moved, Math.abs(dx));
    s.pos = s.startPos - dx / spacing();
    const dt = e.timeStamp - s.lastT;
    if (dt > 0) s.vel = s.vel * 0.7 + (-(e.clientX - s.lastX) / spacing() / dt) * 0.3;
    s.lastX = e.clientX; s.lastT = e.timeStamp;
  };
  const onUp = () => {
    const s = st.current;
    if (!s.drag) return;
    s.drag = false;
    /* a flick moves further (up to 3 cards), then eases onto a card */
    const extra = Math.max(-3, Math.min(3, s.vel * 220));
    s.lastT = 0;
    go(Math.round(s.pos + extra));
  };
  return (
    <section className="hm-showcase hm-showcase--cover" aria-label="Apps built on Bolt">
      <div
        className="hm-cover"
        ref={root}
        onMouseEnter={() => { st.current.hover = true; }}
        onMouseLeave={() => { st.current.hover = false; }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={(e) => { if (st.current.moved > 6) { e.preventDefault(); e.stopPropagation(); } }}
        onDragStart={(e) => e.preventDefault()}
      >
        {all.map((c, i) => (
          <div
            key={c.prompt}
            ref={(el) => { cards.current[i] = el; }}
            className={`hm-cover-card${i === active ? ' is-active' : ''}`}
            aria-hidden={i !== active ? true : undefined}
            onClick={() => { const d = wrapD(i - st.current.target); if (Math.abs(d) > 0.5) go(Math.round(st.current.target + d)); }}
          >
            <span className="hm-cover-shot"><img src={c.shot} alt="" loading="lazy" decoding="async" draggable={false} /></span>
            <span className="hm-cover-foot">
              {/* the regular template card's head (Gary): the name on the left, the
                  type of app in the right corner */}
              <span className="hm-cover-head">
                <span className="hm-cover-prompt">{c.prompt}</span>
                {c.tag && <span className="hm-cover-kicker">{c.tag}</span>}
              </span>
              <CardActions open={c.url} preview={c.preview} label={c.prompt} tabIndex={i === active ? undefined : -1} />
            </span>
          </div>
        ))}
      </div>
      <div className="hm-cover-dots" role="tablist" aria-label="Choose a site">
        {all.map((c, i) => (
          <button key={c.prompt} type="button" role="tab" aria-selected={i === active} aria-label={c.name ?? c.prompt}
            onClick={() => go(Math.round(st.current.target + wrapD(i - st.current.target)))} />
        ))}
      </div>
    </section>
  );
}

export function Showcase() {
  const variant = useVariant();
  if (variant === 'e') return <ShowcaseCoverflow />;
  if (variant === 'c' || variant === 'd') { /* D builds on C: the crawl + the blended closing band */
    /* 9 sites = three even rows of 3 (Gary: 3 across, bigger; "if they don't split
       evenly take out any" — construction is the one left out) */
    const all = [...showcase.rowA, ...showcase.rowB.slice(0, 4)];
    return (
      <section className="hm-showcase hm-showcase--crawl" aria-label="Apps built on Bolt">
        <CrawlWall all={all} />
      </section>
    );
  }
  return (
    <section className="hm-showcase" aria-label="Apps built on Bolt">
      <ShowcaseRow cards={showcase.rowA} />
      <ShowcaseRow cards={showcase.rowB} reverse />
    </section>
  );
}

/* ── Stats bar ─────────────────────────────────────────────────────────── */
/* The template pages' stat char reveal (solutions/_template, from
   microsoft.html): each character tumbles in from a random direction with a
   blur, staggered ~60ms, once the bar is half in view. */
const CHAR_FROMS = [
  'translateY(-24px) rotate(-8deg)', 'translateY(24px) rotate(8deg)',
  'translateX(-20px) translateY(-16px) rotate(12deg)', 'translateX(20px) translateY(-16px) rotate(-12deg)',
  'scale(0.4) rotate(20deg)', 'scale(0.4) rotate(-20deg)', 'translateY(-30px)', 'translateY(30px)',
];
function useStatReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>('.hm-char');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      chars.forEach((c) => c.classList.add('is-revealed'));
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        chars.forEach((c, i) => {
          c.style.setProperty('--char-from', CHAR_FROMS[Math.floor(Math.random() * CHAR_FROMS.length)]);
          timers.push(window.setTimeout(() => c.classList.add('is-revealed'), (i * 0.06 + Math.random() * 0.04) * 1000));
        });
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, []);
  return ref;
}

export function Stats() {
  const ref = useStatReveal<HTMLDListElement>();
  return (
    <section className="fw-section hm-stats-section" aria-label="Bolt by the numbers">
      <div className="fw-inner">
        <dl className="hm-stats" ref={ref}>
          {stats.map((s) => (
            <div key={s.label} className="hm-stat">
              <dt className="hm-stat-value" aria-label={s.value}>
                {s.value.split('').map((ch, i) => (
                  ch === ' ' ? ' ' : <span key={i} className="hm-char" aria-hidden="true">{ch}</span>
                ))}
              </dt>
              <dd className="hm-stat-label">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── Build anything: use-case cards ────────────────────────────────────── */
/* secondary "see all" actions = the standard bordered (ghost) button (Gary) */
function MoreLink({ label, href }: { label: string; href: string }) {
  return <Btn href={href} variant="ghost" className="hm-more">{label}</Btn>;
}

/* ── Build anything: photo-filled cards. The photo is the card; the copy
   sits on a bottom scrim, the tag is a glass pill (Gary, 2026-10-16: the
   bordered photo + copy cards were too basic; the floating product chip
   was tried and removed the same day). */
export function UseCases() {
  return (
    <section className="fw-section hm-usecases" id="use-cases">
      <div className="fw-inner">
        <SectionHeader center eyebrow={useCases.eyebrow} title={useCases.title} subtitle={useCases.subtitle} />
        <div className="hm-uc-grid">
          {useCases.items.map((u, i) => (
            <a key={u.title} className={`hm-uc-card${i === 0 ? ' hm-uc-card--feature' : ''}`} href={useCases.more.href} style={{ '--i': i } as React.CSSProperties}>
              <img className="hm-uc-img" src={u.photo} alt={`${u.tag}: ${u.title}`} loading="lazy" decoding="async" style={{ objectPosition: u.focus }} />
              <span className="hm-uc-scrim" aria-hidden="true" />
              {/* the Founders Week cards' hover: the rotating pixel field, fading in over the photo */}
              <HoverField index={i} color="140,195,255" strength={0.9} />
              <span className="hm-uc-tag">{u.tag}</span>
              <span className="hm-uc-copy">
                <span className="hm-uc-title">{u.title}</span>
                <span className="hm-uc-desc">{u.body}</span>
                <span className="hm-uc-more">See How <i className="fw-arrow" aria-hidden="true" /></span>
              </span>
            </a>
          ))}
        </div>
        <div className="hm-more-row">
          <MoreLink {...useCases.more} />
        </div>
      </div>
    </section>
  );
}

/* ── Customer stories ──────────────────────────────────────────────────── */
export function Stories() {
  /* the get-started / enterprise testimonial rail: hairline-separated quote
     cards in a track that drifts left and pauses on hover; the row is
     duplicated so the loop is seamless. No icons (Gary): name + company
     under the hairline. The trailing card carries the pixel field. */
  const loop = [...stories.items, ...stories.items, ...stories.items];
  return (
    <section className="fw-section hm-stories">
      <div className="fw-inner">
        <SectionHeader eyebrow={stories.eyebrow} title={stories.title} subtitle={stories.subtitle} />
        <div className="hm-rail">
          {/* light-blue pixels gathering in the rail's bottom-right corner (the
              get-started rail's corner field), fixed to the rail, not a card */}
          <PixelField wave={railWave} spacing={9} dot={2.5} opacity={0.55} className="hm-rail-field" color="120,180,252" />
          <div className="hm-rail-clip">
          <div className="hm-rail-track">
            {loop.map((s, i) => (
              <figure key={i} className="hm-rail-card" aria-hidden={i >= stories.items.length ? true : undefined}>
                <blockquote className="hm-rail-quote fw-serif">“{s.quote}”</blockquote>
                <figcaption className="hm-rail-who">
                  <span className="hm-rail-name">{s.name}</span>
                  <span className="hm-rail-role">{s.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const railWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols;
  const y = r / rows;
  /* a triangle of dots in the bottom-right corner that thickens toward it */
  const d = Math.max(0, 1 - Math.hypot((1 - x) * 3.2, (1 - y) * 1.6));
  return d * d * (Math.sin(x * 12 - y * 6 - t / 700 + phase) * 0.35 + 0.65);
};

/* How it works panel corner (Gary): the subtle pixel field, a quarter-circle of
   dots in the bottom-LEFT corner (the visual owns the right), drifting slowly */
const stepsCornerWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols;
  const y = r / rows;
  const d = Math.max(0, 1 - Math.hypot(x * 2.6, (1 - y) * 1.9));
  return d * d * (Math.sin(x * 10 + y * 7 - t / 900 + phase) * 0.35 + 0.65);
};

/* ── How it works: five moves; the visuals are one animated story (Story.tsx) */
/* How it works = the showcase-B stage (Gary, 2026-10-20): the five steps as
   a numbered list that auto-advances (fill bar, click to jump; no hover
   pause and nothing changes height: every body is always there, the
   inactive ones just dim, Gary 2026-10-20: the opening/closing read
   clunky), and the active step's animated
   scene large on the right. The scene is keyed by step, so it remounts and
   replays each time its step comes round. Only cycles while on screen. */
const STEP_MS = 7000;
export function Steps() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const running = inView && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* pause keeps the time already spent: resuming finishes the step instead of
     restarting it (the bar holds its place too) */
  const left = useRef(STEP_MS);
  const started = useRef(0);
  useEffect(() => { left.current = STEP_MS; }, [active]);
  useEffect(() => {
    if (!running) return;
    started.current = performance.now();
    const id = window.setTimeout(() => setActive((a) => (a + 1) % steps.items.length), left.current);
    return () => {
      window.clearTimeout(id);
      left.current = Math.max(0, left.current - (performance.now() - started.current));
    };
  }, [active, running]);
  const cur = steps.items[active];
  const timed = { animationDuration: `${STEP_MS}ms`, animationPlayState: running ? 'running' : 'paused' } as const;
  return (
    <section className="fw-section hm-steps" id="how-it-works">
      <div className="fw-inner">
        <SectionHeader center eyebrow={steps.eyebrow} title={steps.title} subtitle={steps.subtitle} />
        <div className="hm-stage hm-stage--steps" ref={root}>
          <PixelField wave={stepsCornerWave} spacing={9} dot={2} opacity={0.9} className="hm-steps-field" color="100,170,255" />
          <ol className="hm-stage-list">
            {steps.items.map((st, i) => (
              <li key={st.title} className={`hm-stage-item${i === active ? ' is-active' : ''}`}>
                <button type="button" className="hm-stage-btn" onClick={() => i !== active && setActive(i)} aria-pressed={i === active}>
                  <span className="hm-stage-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="hm-stage-copy">
                    {/* one slot: the eyebrow while idle, the title rolls up into
                        its place when the step opens (both stacked, so the row
                        never changes height) */}
                    <span className="hm-stage-swap">
                      <span className="hm-stage-kicker">{st.kicker}</span>
                      <span className="hm-stage-prompt">{st.title}</span>
                    </span>
                    <span className="hm-stage-body"><span>{st.body}</span></span>
                  </span>
                  {/* the timer: a 1px thread under the numeral fills down the open row */}
                  <span className="hm-stage-bar" aria-hidden="true"><i key={active} style={timed} /></span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hm-stage-view">
            <div key={active} className="hm-stage-scene"><StepVisual kind={cur.visual} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Templates: the solutions page's template rail ───────────────────────
   Portrait cards in a horizontally scrolling track that bleeds to the
   viewport's right edge, with a right-edge fade that hides once scrolled to
   the end, click-and-drag panning with a momentum glide for mouse users, and
   the catalog hover (scrim + "Open in Bolt", the shot drifts up 40px). */
function useTemplateRail() {
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = rail.current;
    const track = r?.querySelector<HTMLDivElement>('.hm-tr-track');
    if (!r || !track) return;
    const update = () => {
      r.classList.toggle('at-end', track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
      r.classList.toggle('is-scrolled', track.scrollLeft > 4);
    };
    /* open already full width (Gary): start scrolled by the left gutter, so
       the row runs edge to edge instead of starting on the content line */
    track.scrollLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    /* click-and-drag; touch keeps the browser's own momentum scrolling */
    let down = false, startX = 0, startLeft = 0, moved = 0, captured = false, lastX = 0, lastT = 0, vel = 0, momentum: number | null = null;
    const stop = () => { if (momentum) cancelAnimationFrame(momentum); momentum = null; track.classList.remove('is-dragging'); };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      stop(); down = true; moved = 0; captured = false; vel = 0;
      startX = e.clientX; startLeft = track.scrollLeft; lastX = e.clientX; lastT = e.timeStamp;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > moved) moved = Math.abs(dx);
      if (moved > 6 && !captured) { captured = true; track.classList.add('is-dragging'); try { track.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
      if (captured) {
        track.scrollLeft = startLeft - dx;
        const dt = e.timeStamp - lastT;
        if (dt > 0) vel = vel * 0.8 + ((e.clientX - lastX) / dt) * 0.2;
        lastX = e.clientX; lastT = e.timeStamp;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      try { track.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      if (!captured) { stop(); return; }
      let v = -vel * 16;
      if (Math.abs(v) < 2) { stop(); return; }
      const max = track.scrollWidth - track.clientWidth;
      const glide = () => { track.scrollLeft += v; v *= 0.94; if (Math.abs(v) < 0.4 || track.scrollLeft >= max) { stop(); pos = track.scrollLeft; return; } momentum = requestAnimationFrame(glide); };
      glide();
    };
    /* slow auto-drift to the left (Gary), paused while hovered, dragged,
       touched or off screen. The items are rendered twice; crossing one set's
       width wraps by exactly that width, so it loops forever in both directions */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SPEED = 0.03; // px per ms ≈ 30px/s
    const base = track.scrollLeft;
    const setW = () => {
      const cards = track.querySelectorAll<HTMLElement>('.hm-tr-card');
      const half = cards.length / 2;
      return half >= 1 ? cards[half].offsetLeft - cards[0].offsetLeft : 0;
    };
    let pos = track.scrollLeft, hovered = false, touchHold = 0, visible = false, raf = 0, last = 0, ours = false;
    const wrapPos = () => {
      const w = setW();
      if (!w) return;
      if (track.scrollLeft >= base + w) { ours = true; track.scrollLeft -= w; }
      else if (track.scrollLeft < base - 1) { ours = true; track.scrollLeft += w; }
    };
    const onScrollSync = () => { if (ours) { ours = false; } else { pos = track.scrollLeft; } wrapPos(); };
    track.addEventListener('scroll', onScrollSync, { passive: true });
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(t - last, 50) : 0;
      last = t;
      if (reduce || hovered || down || momentum || touchHold || !visible) return;
      pos += SPEED * dt;
      ours = true;
      track.scrollLeft = pos;
      if (Math.abs(track.scrollLeft - pos) > 2) pos = track.scrollLeft; // wrapped
    };
    raf = requestAnimationFrame(tick);
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; pos = track.scrollLeft; };
    const onTouchStart = () => { window.clearTimeout(touchHold); touchHold = window.setTimeout(() => {}, 1e9); };
    const onTouchEnd = () => { window.clearTimeout(touchHold); touchHold = window.setTimeout(() => { touchHold = 0; pos = track.scrollLeft; }, 2500); };
    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = 0; });
    io.observe(track);
    const onClick = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } };
    const noGhost = (e: Event) => e.preventDefault();
    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);
    track.addEventListener('click', onClick, true);
    track.querySelectorAll('img').forEach((img) => img.addEventListener('dragstart', noGhost));
    return () => {
      track.removeEventListener('scroll', update); window.removeEventListener('resize', update);
      track.removeEventListener('pointerdown', onDown); track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp); track.removeEventListener('pointercancel', onUp);
      track.removeEventListener('click', onClick, true); stop();
      cancelAnimationFrame(raf); io.disconnect(); window.clearTimeout(touchHold);
      track.removeEventListener('scroll', onScrollSync);
      track.removeEventListener('mouseenter', onEnter); track.removeEventListener('mouseleave', onLeave);
      track.removeEventListener('touchstart', onTouchStart); track.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
  return rail;
}

export function TemplatesHome() {
  const rail = useTemplateRail();
  return (
    <section className="fw-section hm-templates" id="templates">
      <div className="fw-inner">
        <SectionHeader center eyebrow={templatesHome.eyebrow} title={templatesHome.title} subtitle={templatesHome.subtitle} />
        <div className="hm-tr" ref={rail}>
          <div className="hm-tr-track">
            {[...templatesHome.items, ...templatesHome.items].map((t, i) => {
              const dupe = i >= templatesHome.items.length;
              return (
              <article key={i} className="hm-tr-card" aria-hidden={dupe ? true : undefined}>
                <a className="hm-tr-preview" href={(SHOW_PREVIEW && t.preview) || t.url} target="_blank" rel="noopener" tabIndex={-1}>
                  <img className="hm-tr-shot" src={t.shot} alt={`${t.name} template`} width={t.w ?? 800} height={t.h ?? 2245} loading="lazy" decoding="async" />
                  <span className="hm-tr-overlay" aria-hidden="true"><span>{SHOW_PREVIEW && t.preview ? 'Preview' : 'Open in Bolt'}</span></span>
                </a>
                <span className="hm-tr-meta">
                  <span className="hm-tr-name">{t.name}</span>
                  <span className="hm-tr-tag">{t.tag}</span>
                </span>
                <CardActions open={t.url} preview={t.preview} label={t.name} />
              </article>
            );
            })}
          </div>
        </div>
        <div className="hm-more-row">
          <Btn href={templatesHome.more.href} variant="ghost" external>{templatesHome.more.label}</Btn>
        </div>
      </div>
    </section>
  );
}

/* ── New this month: the three features in the solutions page's tab slider ─
   Horizontal tab bar with the sliding underline, auto-advance every 7s,
   copy + bullets + link on the left, the feature's clip on the right
   (BgVideo: plays only while on screen, poster first). */
export function Platform() {
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(true);
  const bar = useRef<HTMLDivElement>(null);
  const pinned = useRef(false);
  /* auto-advance every 7s (a click restarts the clock) */
  useEffect(() => {
    const id = window.setTimeout(() => setActive((a) => (a + 1) % platform.tabs.length), 7000);
    return () => window.clearTimeout(id);
  }, [active, pinned.current]);
  /* right-edge fade on the scrolling phone tab bar: lifted at the end */
  useEffect(() => {
    const b = bar.current;
    if (!b) return;
    const update = () => setAtEnd(b.scrollWidth - b.clientWidth - b.scrollLeft <= 4);
    b.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { b.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return (
    <section className="fw-section hm-new" id="whats-new">
      <div className="fw-inner">
        <SectionHeader center eyebrow={platform.eyebrow} title={platform.title} subtitle={platform.subtitle} />
        <div className="plat-stage">
          <div className="plat-stage-black">
            <div className={`plat-tabbar-wrap${atEnd ? ' at-end' : ''}`}>
              <div className="plat-tabbar" role="tablist" ref={bar}>
                {platform.tabs.map((t, i) => (
                  <button key={t.label} type="button" role="tab" aria-selected={active === i} className={`plat-tab${active === i ? ' active' : ''}`} onClick={() => { pinned.current = !pinned.current; setActive(i); }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="plat-panels">
              {platform.tabs.map((t, i) => (
                <div key={t.label} role="tabpanel" className={`plat-panel${active === i ? ' active' : ''}`}>
                  <div className="plat-panel-grid">
                    <div className="plat-panel-left">
                      <h3 className="plat-h3">{t.title}</h3>
                      <p className="plat-body">{t.body}</p>
                      <ul className="plat-list">{t.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                    </div>
                    <div className="plat-vcard plat-vcard--video" aria-hidden="true">
                      <BgVideo name={t.video} className="plat-video" lazy />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Enterprise band: logos, a tiled feature grid, the 1:1 panel ─────── */
/* the standard marketing icon set (Feather / Lucide outline: 24 grid, 1.5
   stroke, round caps — the _template / use-case unlock cards), drawn at 20px */
const Fi = ({ children }: { children: React.ReactNode }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const entIcons: Record<string, React.ReactNode> = {
  key: <Fi><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></Fi>,
  list: <Fi><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></Fi>,
  shield: <Fi><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></Fi>,
  cloud: <Fi><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></Fi>,
  users: <Fi><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Fi>,
  chat: <Fi><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Fi>,
};
/* card flashlight (solutions.html / smb standard): a soft glow follows the cursor */
const flashlight = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
};
export function Enterprise() {
  return (
    <section className="fw-section fw-section--band hm-ent">
      <div className="fw-inner">
        <div className="hm-ent-head">
          <div className="hm-ent-copy hm-ent-copy--center">
            <span className="section-eyebrow eyebrow-scramble">{enterprise.eyebrow}</span>
            <div className="dsa-reveal">
              <h2 className="sc-section-h2">{enterprise.title}</h2>
            </div>
            <p className="section-sub">{enterprise.body}</p>
          </div>
        </div>
        <div className="hm-ent-layout">
          <ul className="hm-ent-grid">
            {enterprise.features.map((f, i) => (
              <li key={f.title} className="hm-ent-cell" onMouseMove={flashlight}>
                <HoverField index={i} />
                <span className="hm-ent-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="hm-ent-ic">{entIcons[f.icon]}</span>
                <span className="hm-ent-cell-title">{f.title}</span>
                <span className="hm-ent-cell-body">{f.body}</span>
              </li>
            ))}
          </ul>
          {/* the enterprise page's logo marquee, inside the container: the set
            three times per half, the wrapper loops by -50% so it's seamless */}
          <div className="hm-ent-logos">
          <p className="hm-ent-logos-label">{enterprise.logosLabel}</p>
          <div className="hm-ent-train" aria-hidden="true">
            <div className="hm-ent-train-wrap">
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <span key={k} className="hm-ent-train-set">
                  {enterprise.logos.map((l) => <img key={l.alt} src={l.src} alt="" loading="lazy" decoding="async" />)}
                </span>
              ))}
            </div>
          </div>
        </div>
          <div className="hm-ent-panel">
            <div className="hm-ent-panel-copy">
              <span className="hm-ent-panel-kicker">Talk to us</span>
              <p className="card-strip-sub">{enterprise.strip.lead} <span className="strip-name">{enterprise.strip.name}</span></p>
              <p className="hm-ent-panel-note">A 30-minute walkthrough with the enterprise team, no deck. Bring the project you want to ship.</p>
            </div>
            <div className="hm-ent-panel-actions">
              <form
                className="hm-ent-strip"
                action={enterprise.strip.action}
                method="get"
                target="_blank"
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement | null)?.value.trim() ?? '';
                  const url = new URL(enterprise.strip.action);
                  if (email) url.searchParams.set('email', email);
                  window.open(url.toString(), '_blank', 'noopener');
                }}
              >
                <div className="hero-form-row">
                  <label className="sr-only" htmlFor="ent-email">{enterprise.strip.placeholder}</label>
                  <input id="ent-email" name="email" type="email" className="hero-email-input" placeholder={enterprise.strip.placeholder} autoComplete="email" required />
                  <button type="submit" className="hero-cta-button" aria-label="Book a 1:1 with sales">
                    <div className="btn-bg-hover" />
                    <div className="btn-text-wrap"><div className="btn-text-inner"><span>{enterprise.strip.cta}</span><span>{enterprise.strip.cta}</span></div></div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Closing: the prompt box again, on the footer video band ───────────── */
export function Closing() {
  return (
    <section className="fw-footer-cta hm-closing">
      <div className="fw-footer-cta-inner">
        <span className="footer-eyebrow eyebrow-scramble">{closing.eyebrow}</span>
        <div className="dsa-reveal">
          <h2 className="sc-section-h2">{closing.title}</h2>
        </div>
        <p className="fw-footer-sub">{closing.subtitle}</p>
        <PromptBox id="closing" compact />
        <TrustPills items={closing.trust} />
      </div>
    </section>
  );
}
