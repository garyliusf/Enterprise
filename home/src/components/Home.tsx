import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { closing, enterprise, showcase, stats, steps, stories, templatesHome, useCases, whatsNew, type ShowcaseCard } from '../home';
import { PromptBox, TrustPills } from './Hero';
import { StepVisual } from './Story';
import { Btn, HoverField, PixelField, SectionHeader, type WaveFn } from './ui';

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
              <span className="hm-show-cta">Build now</span>
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

export function UseCases() {
  return (
    <section className="fw-section hm-usecases" id="use-cases">
      <div className="fw-inner">
        <SectionHeader center eyebrow={useCases.eyebrow} title={useCases.title} subtitle={useCases.subtitle} />
        {/* one large feature (photo beside the copy), five standard cards around it */}
        <div className="hm-uc-grid">
          {useCases.items.map((u, i) => (
            <a key={u.title} className={`fw-card hm-uc-card${i === 0 ? ' hm-uc-card--feature' : ''}`} href={useCases.more.href}>
              <HoverField index={i} />
              <span className="hm-uc-photo">
                <img src={u.photo} alt={`${u.tag}: ${u.title}`} loading="lazy" decoding="async" style={{ objectPosition: u.focus }} />
              </span>
              <span className="hm-uc-copy">
                <span className="hm-uc-tag">{u.tag}</span>
                <span className="fw-card-title">{u.title}</span>
                <span className="fw-card-desc">{u.body}</span>
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
export function Steps() {
  return (
    <section className="fw-section hm-steps" id="how-it-works">
      <div className="fw-inner">
        <SectionHeader center eyebrow={steps.eyebrow} title={steps.title} subtitle={steps.subtitle} />
        <ol className="hm-step-list">
          {steps.items.map((s, i) => (
            <li key={s.title} className={`hm-step${i % 2 ? ' hm-step--flip' : ''}`}>
              <div className="hm-step-copy">
                {/* same scroll-in as the section headers: the kicker scrambles,
                    the title reveals word by word, the body follows as a subtitle */}
                <span className="hm-step-kicker">
                  <span className="hm-step-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="eyebrow-scramble">{s.kicker}</span>
                </span>
                <div className="dsa-reveal">
                  <h3 className="hm-step-title">{s.title}</h3>
                </div>
                <p className="hm-step-body">{s.body}</p>
              </div>
              <StepVisual kind={s.visual} />
            </li>
          ))}
        </ol>
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

/* ── New this month: the enterprise page's timed feature tabs ──────────
   Left: stacked tabs, the active one lit with a noisy blue progress bar
   that auto-advances; right: the slide (visual only; the caption strip
   was dropped, Gary 2026-10-16).
   Shorter than enterprise's (tabs 150 / area 360 instead of 240 / 480).
   On phones it stacks as cards with no timer. Visuals are placeholders. */
const DURATION = 8000;
const newWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols - 0.5;
  const y = r / rows - 0.5;
  const d = Math.max(0, 1 - Math.hypot(x * 1.6, y * 1.6));
  return d * d * (Math.sin((x + y) * 10 - t / 600 + phase) * 0.5 + 0.5);
};
/* the enterprise bar: blue static that fills left→right (drawNoise) */
function drawBar(canvas: HTMLCanvasElement, progress: number) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.parentElement?.offsetWidth || 0;
  const w = Math.round(cssW * dpr);
  const h = Math.round(4 * dpr);
  if (!w || !h) return;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = cssW + 'px';
    canvas.style.height = '4px';
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const fill = Math.round(w * progress);
  const img = ctx.createImageData(w, h);
  for (let x = 0; x < fill; x++) {
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      const n = (Math.random() - 0.5) * 90;
      img.data[i] = Math.max(0, Math.min(255, 20 + n));
      img.data[i + 1] = Math.max(0, Math.min(255, 136 + n));
      img.data[i + 2] = Math.max(0, Math.min(255, 252 + n));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function WhatsNew() {
  const [active, setActive] = useState(0);
  const bars = useRef<(HTMLCanvasElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phone = window.matchMedia('(max-width: 768px)');
    let raf = 0;
    let start = 0;
    let inView = false;
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) { start = 0; } }, { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (!inView || phone.matches) return;
      if (!start) start = ts;
      const p = Math.min((ts - start) / DURATION, 1);
      const cv = bars.current[active];
      if (cv) drawBar(cv, p);
      if (p >= 1) {
        start = 0;
        setActive((a) => (a + 1) % whatsNew.items.length);
      }
    };
    bars.current.forEach((cv, i) => { if (cv && i !== active) cv.getContext('2d')?.clearRect(0, 0, cv.width, cv.height); });
    if (reduce) {
      const cv = bars.current[active];
      if (cv) drawBar(cv, 1);
      return () => io.disconnect();
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [active]);
  return (
    <section className="fw-section hm-new" id="whats-new">
      <div className="fw-inner">
        <SectionHeader center eyebrow={whatsNew.eyebrow} title={whatsNew.title} subtitle={whatsNew.subtitle} />
        <div className="hm-ft" ref={root}>
          <div className="hm-ft-nav">
            {whatsNew.items.map((n, i) => (
              <button key={n.title} type="button" className={`hm-ft-tab${active === i ? ' is-active' : ''}`} onClick={() => setActive(i)} aria-pressed={active === i}>
                <span className="hm-ft-bar" aria-hidden="true"><canvas ref={(el) => { bars.current[i] = el; }} /></span>
                <span className="hm-ft-title">{n.title}</span>
                <span className="hm-ft-desc">
                  {n.body}
                  <a className="fw-text-link hm-ft-link" href={n.link.href}>{n.link.label} <i className="fw-arrow" aria-hidden="true" /></a>
                </span>
                <span className="hm-ft-mobile" aria-hidden="true">
                  <span className="hm-ft-ph"><i /><i /><i /></span>
                </span>
              </button>
            ))}
          </div>
          <div className="hm-ft-area" aria-hidden="true">
            <PixelField wave={newWave} spacing={9} dot={2} opacity={0.4} className="hm-ft-field" />
            {whatsNew.items.map((n, i) => (
              <div key={n.title} className={`hm-ft-slide${active === i ? ' is-active' : ''}`}>
                <span className="hm-ft-ph"><i /><i /><i /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Enterprise band ───────────────────────────────────────────────────── */
export function Enterprise() {
  return (
    <section className="fw-section fw-section--band hm-ent">
      <div className="fw-inner hm-ent-layout">
        <div className="hm-ent-copy">
          <span className="section-eyebrow eyebrow-scramble">{enterprise.eyebrow}</span>
          <div className="dsa-reveal">
            <h2 className="sc-section-h2">{enterprise.title}</h2>
          </div>
          <p className="section-sub">{enterprise.body}</p>
          <ul className="hm-ent-pills" aria-label="Included">
            {enterprise.pills.map((p) => (
              <li key={p} className="hm-trust-pill">
                <span className="hm-trust-dot" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="hm-ent-actions">
          <Btn href={enterprise.cta.href} external>{enterprise.cta.label}</Btn>
          <a className="fw-text-link hm-more" href={enterprise.more.href}>
            {enterprise.more.label} <i className="fw-arrow" aria-hidden="true" />
          </a>
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
