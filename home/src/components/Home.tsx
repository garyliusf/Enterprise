import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { asset } from '../config';
import { closing, enterprise, showcase, stats, steps, stories, platform, templatesHome, useCases, type ShowcaseCard } from '../home';
import { PromptBox, TrustPills } from './Hero';
import { StepVisual } from './Story';
import { BgVideo, Btn, HoverField, PixelField, SectionHeader, type WaveFn } from './ui';

/* ── Showcase: two rows of "Tell bolt" cards drifting in opposite directions ─
   Each row is duplicated so the drift loops seamlessly; it pauses on hover. */
function ShowcaseRow({ cards, reverse = false }: { cards: ShowcaseCard[]; reverse?: boolean }) {
  const loop = [...cards, ...cards];
  return (
    <div className={`hm-show-row${reverse ? ' hm-show-row--rev' : ''}`}>
      <div className="hm-show-track">
        {loop.map((c, i) => (
          <a
            key={i}
            className="hm-show-card"
            href={c.url}
            target="_blank"
            rel="noopener"
            aria-hidden={i >= cards.length ? true : undefined}
            tabIndex={i >= cards.length ? -1 : undefined}
          >
            <span className="hm-show-shot">
              <img src={c.shot} alt="" loading="lazy" decoding="async" />
            </span>
            <span className="hm-show-foot">
              <span className="hm-show-kicker">Tell bolt</span>
              <span className="hm-show-prompt">{c.prompt}</span>
              <span className="hm-show-cta">Build Now</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Showcase() {
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
    const update = () => r.classList.toggle('at-end', track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
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
      const glide = () => { track.scrollLeft += v; v *= 0.94; if (Math.abs(v) < 0.4 || track.scrollLeft <= 0 || track.scrollLeft >= max) { stop(); return; } momentum = requestAnimationFrame(glide); };
      glide();
    };
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
    };
  }, []);
  return rail;
}

export function TemplatesHome() {
  const rail = useTemplateRail();
  return (
    <section className="fw-section hm-templates" id="templates">
      <div className="fw-inner">
        <SectionHeader eyebrow={templatesHome.eyebrow} title={templatesHome.title} subtitle={templatesHome.subtitle} />
        <div className="hm-tr" ref={rail}>
          <div className="hm-tr-track">
            {templatesHome.items.map((t) => (
              <a key={t.name} className="hm-tr-card" href={t.url} target="_blank" rel="noopener">
                <span className="hm-tr-preview">
                  <img className="hm-tr-shot" src={t.shot} alt={`${t.name} template`} width={t.w ?? 800} height={t.h ?? 2245} loading="lazy" decoding="async" />
                  <span className="hm-tr-overlay" aria-hidden="true"><span>Open in Bolt</span></span>
                </span>
                <span className="hm-tr-meta">
                  <span className="hm-tr-name">{t.name}</span>
                  <span className="hm-tr-tag">{t.tag}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="hm-more-row">
          <Btn href={templatesHome.more.href} external>{templatesHome.more.label}</Btn>
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
const entIcons: Record<string, React.ReactNode> = {
  key: <svg viewBox="0 0 20 20"><circle cx="7" cy="10" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 10H17M14.5 10v2.5M17 10v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  list: <svg viewBox="0 0 20 20"><path d="M7 5.5h9M7 10h9M7 14.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="4" cy="5.5" r="1" fill="currentColor" /><circle cx="4" cy="10" r="1" fill="currentColor" /><circle cx="4" cy="14.5" r="1" fill="currentColor" /></svg>,
  shield: <svg viewBox="0 0 20 20"><path d="M10 2.2l6.2 2.3v5c0 4-2.6 6.8-6.2 8.3-3.6-1.5-6.2-4.3-6.2-8.3v-5L10 2.2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7.4 10l1.8 1.8 3.4-3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  cloud: <svg viewBox="0 0 20 20"><path d="M6 15.5a3.5 3.5 0 0 1-.4-7 4.5 4.5 0 0 1 8.7 1.2A2.9 2.9 0 0 1 14 15.5H6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  users: <svg viewBox="0 0 20 20"><circle cx="8" cy="7" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M3 16a5 5 0 0 1 10 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M13.5 9.5a2.5 2.5 0 1 0-1.2-4.7M14 12.2a4 4 0 0 1 3 3.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  chat: <svg viewBox="0 0 20 20"><path d="M4 4.5h12A1.5 1.5 0 0 1 17.5 6v6a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3H4A1.5 1.5 0 0 1 2.5 12V6A1.5 1.5 0 0 1 4 4.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
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
              <li key={f.title} className="hm-ent-cell">
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
