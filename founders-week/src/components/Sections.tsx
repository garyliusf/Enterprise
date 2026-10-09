import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { BOLT_URL, competition, faqs, footerCta, pastWinners, sessions, templates, TERMS_PATH, timeline, weekend, type Session } from '../config';
import { EntryForm } from './Forms';
import { BgVideo, Btn, BoltLogo, HoverField, PixelField, PixelIcon, PixelRise, SectionHeader, Tbc, type WaveFn } from './ui';

/* Wave functions for the section pixel fields (sandbox makePixelCanvas family). */
const cornerWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const dx = 1 - c / cols;
  const dy = r / rows;
  const d = Math.max(0, 1 - Math.hypot(dx, 1 - dy) * 1.25);
  const w = Math.sin(dx * 10 + dy * 6 - t / 800) * 0.5 + 0.5;
  return d * d * w * (Math.sin(t / 650 + phase) * 0.2 + 0.8);
};

/* Wrapper for the step line: adds .line-active once 30% of it is in view
   (same trigger as the template's script) and sets the glow's travel. */
function HowSteps({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    const setDist = () => wrap.style.setProperty('--glow-dist', wrap.offsetWidth + 'px');
    setDist();
    window.addEventListener('resize', setDist);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          wrap.classList.add('line-active');
          io.unobserve(wrap);
        }
      }),
      { threshold: 0.3 },
    );
    io.observe(wrap);
    return () => {
      io.disconnect();
      window.removeEventListener('resize', setDist);
    };
  }, []);
  return (
    <div className="how-steps-wrap" ref={ref}>
      <div className="how-line-track" />
      <div className="how-line-fill" />
      <div className="how-line-glow" />
      <div className="how-steps how-steps--four">{children}</div>
    </div>
  );
}

/* Tear-off calendar page for a timeline date ("Oct 13", "Oct 17–18").
   Flips down as its step reveals; the next upcoming date gets a blue edge
   (its step number glows, see Timeline). */
function CalendarDate({ label, next, tbc }: { label: string; next?: boolean; tbc?: boolean }) {
  const [mon, ...rest] = label.split(' ');
  const days = rest.join(' ');
  return (
    <span className={`how-step-date fw-cal${next ? ' is-next' : ''}`} aria-label={label}>
      <span className="fw-cal-rings" aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="fw-cal-mon">{mon}</span>
      <span className={`fw-cal-day${days.length > 3 ? ' is-range' : ''}`}>{days}</span>
      {tbc && <Tbc />}
    </span>
  );
}

/* index of the first milestone whose (last) day hasn't passed yet */
function nextMilestone(): number {
  const now = Date.now();
  return timeline.findIndex((m) => {
    const lastDay = Number((m.date.match(/(\d+)(?!.*\d)/) || [])[1]);
    return lastDay && new Date(2026, 9, lastDay, 23, 59).getTime() >= now;
  });
}

/* ── Timeline ─────────────────────────────────────────────────────────────── */
export function Timeline() {
  const nextIdx = nextMilestone();
  return (
    <section className="fw-section fw-section--timeline" aria-label="How the week runs">
      <div className="fw-inner">
        <SectionHeader
          eyebrow="How the week runs"
          title="Build, learn, then show it off"
          subtitle="Builder’s Week runs Oct 17 to 24: a free build weekend, a week of sessions, and a contest."
        />
        {/* The shared "How it works" step line (solutions/_template, bolt-cli):
            the line draws, a glow travels it, nodes pop and the copy rises in
            sequence once it scrolls into view. Four steps = bolt-cli's timing. */}
        <HowSteps>
          {timeline.map((m, i) => (
            <div key={m.title} className="how-step">
              <div className={`how-step-node${i === nextIdx ? ' is-next' : ''}`}>
                <span className="how-step-number">{String(i + 1).padStart(2, '0')}</span>
                {i === nextIdx && <span className="fw-sr">Next up</span>}
              </div>
              <CalendarDate label={m.date} next={i === nextIdx} tbc={m.tbc} />
              <h3 className="how-step-title">{m.title}</h3>
              <p className="how-step-desc">{m.body}</p>
            </div>
          ))}
        </HowSteps>
      </div>
    </section>
  );
}

/* ── Free build weekend ──────────────────────────────────────────────────── */
/* Mosaic: a canvas of uneven photo tiles with the three cards set into it.
   Tile order = DOM order; desktop placement is explicit per slot (page.css
   .fw-mosaic > :nth-child), tablet/phone fall back to spans + dense flow.
   'p' = photo (index into weekend.photos, wraps), 'c' = card (index). */
/* photo indices are arranged so a repeat never touches its twin; the
   workshop shot is cropped vertical in the tall top-right slot (Gary) */
const MOSAIC: ({ k: 'p'; i: number } | { k: 'c'; i: number })[] = [
  { k: 'p', i: 0 },
  { k: 'c', i: 0 },
  { k: 'p', i: 5 },
  { k: 'p', i: 4 },
  { k: 'c', i: 1 },
  { k: 'p', i: 3 },
  { k: 'c', i: 2 },
  { k: 'p', i: 1 },
  { k: 'p', i: 2 },
];

/* tiles rise in, staggered, the first time the mosaic scrolls into view */
function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Weekend() {
  const mosaic = useRevealOnce<HTMLDivElement>();
  const photos = weekend.photos;
  return (
    <section className="fw-section fw-section--weekend" id="weekend">
      <div className="fw-inner">
        {/* First section after the hero: static H2, no reveal (CLAUDE.md). */}
        <SectionHeader center eyebrow={weekend.eyebrow} title={weekend.title} subtitle={weekend.subtitle} reveal={false} />
        <div className="fw-mosaic" ref={mosaic}>
          {MOSAIC.map((t, n) => {
            const style = { '--n': n } as React.CSSProperties;
            if (t.k === 'p') {
              const ph = photos[t.i % photos.length];
              return (
                <figure key={n} className="fw-mosaic-photo" style={style} aria-hidden="true">
                  {/* the button pixel-fill hover, scaled up: rises on hover, falls on leave */}
                  <PixelRise />
                  <img
                    src={ph.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={'flip' in ph && ph.flip ? 'is-flipped' : undefined}
                    style={{ objectPosition: ph.focus }}
                  />
                </figure>
              );
            }
            const p = weekend.points[t.i];
            return (
              <div key={n} className="fw-card fw-mosaic-card" style={style}>
                <HoverField index={t.i} />
                <PixelIcon name={p.icon} index={t.i} />
                <div className="fw-mosaic-card-copy">
                  <h3 className="fw-card-title">{p.title}</h3>
                  <p className="fw-card-desc">{p.body}</p>
                </div>
              </div>
            );
          })}
        </div>
        {weekend.partner.show && <p className="fw-partner">{weekend.partner.line}</p>}
        <p className="fw-fine">{weekend.finePrint}</p>
      </div>
    </section>
  );
}

/* ── Schedule ─────────────────────────────────────────────────────────────── */
/* "Starts in 12d 04h 31m" → "Live now" → "Ended", ticking once a minute */
function useCountdown(start?: string, end?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [start]);
  if (!start || !end) return null;
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (now >= e) return { state: 'ended' as const, parts: [] };
  if (now >= s) return { state: 'live' as const, parts: [] };
  let m = Math.floor((s - now) / 60000);
  const d = Math.floor(m / 1440);
  m -= d * 1440;
  const h = Math.floor(m / 60);
  m -= h * 60;
  return { state: 'soon' as const, parts: [[d, 'd'], [h, 'h'], [m, 'm']] as [number, string][] };
}

const gcalDate = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function calendarLink(s: Session) {
  if (!s.start || !s.end) return null;
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(s.title)}` +
    `&dates=${gcalDate(s.start)}/${gcalDate(s.end)}` +
    `&details=${encodeURIComponent(`${s.blurb}\n\nBuilder’s Week on Bolt.`)}`
  );
}

const ordinal = (n: number) => {
  const t = n % 100;
  if (t >= 11 && t <= 13) return 'th';
  return ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
};

function FeaturedSession({ s }: { s: Session }) {
  const cd = useCountdown(s.start, s.end);
  const cal = calendarLink(s);
  const [dow, mon, dayNum] = s.day.split(' ');
  return (
    <article className="fw-feature sc-on-dark">
      <PixelField wave={featureWave} spacing={8} dot={2} opacity={0.85} className="fw-feature-field" color="140,190,255" />
      <div className="fw-feature-date" aria-label={`${s.day}, ${s.time}`}>
        <span className="fw-feature-mon">{mon}</span>
        <span className="fw-feature-day">
          {dayNum}
          {/* small raised ordinal: 20th */}
          <sup className="fw-feature-ord">{ordinal(Number(dayNum))}</sup>
        </span>
        <span className="fw-feature-dow">{dow} · {s.time}</span>
        {/* phones: one plain line instead of the stacked tile (reviewer, 2026-10-08) */}
        <span className="fw-feature-line">{dow}, {mon} {dayNum} · {s.time}</span>
      </div>
      <div className="fw-feature-body">
        <span className="fw-feature-kicker">
          <span className="fw-live-dot" aria-hidden="true" />
          {cd?.state === 'live' ? 'Live now' : 'Coming up'}
        </span>
        <h3 className="fw-feature-title">{s.title}</h3>
        <p className="fw-feature-blurb">{s.blurb}</p>
        <span className="fw-feature-host">{s.host}</span>
        <div className="fw-feature-side">
        {cal && cd?.state !== 'ended' && (
          <div className="fw-feature-cta">
            <Btn href={cal} variant="ghost" external>
              Add to Calendar
            </Btn>
          </div>
        )}
        </div>
      </div>
      {s.photo && (
        <figure className="fw-feature-photo-wrap">
          <div className="fw-feature-photo" aria-hidden="true">
            <img src={s.photo} alt="" loading="lazy" decoding="async" />
          </div>
          {s.photoCaption && <figcaption className="fw-feature-caption">{s.photoCaption}</figcaption>}
        </figure>
      )}
    </article>
  );
}

const featureWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols;
  const y = r / rows;
  const d = Math.max(0, 1 - Math.hypot((1 - x) * 1.1, y * 1.3));
  const w = Math.sin(x * 9 - y * 5 - t / 700) * 0.5 + 0.5;
  return d * d * w * (Math.sin(t / 600 + phase) * 0.25 + 0.75);
};

export function Schedule() {
  const [featured, ...rest] = sessions.some((s) => !s.tbc)
    ? [sessions.find((s) => !s.tbc)!, ...sessions.filter((s) => s.tbc)]
    : [undefined, ...sessions];
  return (
    <section className="fw-section fw-section--schedule" id="schedule">
      <div className="fw-inner">
        <SectionHeader
          eyebrow="Live sessions · Oct 19–23"
          title="Grow what you’ve built"
          subtitle="Q&As, workshops and feedback hours with the Bolt team, all about growing a business on Bolt."
        />
        {featured && <FeaturedSession s={featured} />}
        <div className="fw-grid fw-grid--3 fw-session-cards">
          {rest.map((s, i) => (
            s && (
              <article key={s.title} className="fw-card fw-session-card">
                <HoverField index={i + 3} />
                <PixelIcon name={s.icon ?? 'x'} index={i} />
                <h3 className="fw-card-title">{s.title}</h3>
                <p className="fw-card-desc">{s.blurb}</p>
              </article>
            )
          ))}
        </div>
      </div>
    </section>
  );
}

/* Placeholder page mock for a template card with no screenshot yet: a tall
   skeleton landing page, so the hover drift still reads as "scroll". */
function TemplateMock({ seed }: { seed: number }) {
  const accent = ['#1488FC', '#0a3f9e', '#3b82cf', '#072f86'][seed % 4];
  return (
    <div className="fw-tcard-shot-wrap">
      <div className="fw-tmock" style={{ '--acc': accent } as React.CSSProperties}>
        <div className="fw-tmock-nav"><i /><b /><b /><b /></div>
        <div className="fw-tmock-hero"><b className="w80" /><b className="w60" /><s /><em /></div>
        <div className="fw-tmock-img" />
        <div className="fw-tmock-row"><span /><span /><span /></div>
        <div className="fw-tmock-text"><b className="w70" /><s /><s /><s className="w50" /></div>
        <div className="fw-tmock-row"><span /><span /></div>
      </div>
    </div>
  );
}

/* ── Founder templates ───────────────────────────────────────────────────── */
export function Templates() {
  return (
    <section className="fw-section fw-section--templates" id="templates">
      <div className="fw-inner">
        <SectionHeader
          eyebrow="Get started"
          title={
            <>
              Templates to start from {templates.tbc && <Tbc />}
            </>
          }
          subtitle="A starter kit for builders, built in Bolt. Open one, make it yours, and start building on Saturday morning."
        />
        {/* Same card as the templates catalog (marketing/templates): portrait
            preview, full-page shot that drifts up on hover, name + tag foot. */}
        <div className="fw-templates">
          {templates.items.map((t, i) => (
            <a
              key={t.name}
              className="fw-tcard"
              href={t.url || '#'}
              target="_blank"
              rel="noopener"
              style={{ '--i': i } as React.CSSProperties}
            >
              <div className="fw-tcard-preview" aria-hidden="true">
                {t.shot && t.fill ? (
                  <img className="fw-tcard-fill" src={t.shot} alt="" loading="eager" decoding="async" />
                ) : t.shot ? (
                  <div className="fw-tcard-shot-wrap">
                    <img
                      className="fw-tcard-shot"
                      src={t.shot}
                      alt=""
                      width={t.w ?? 800}
                      height={t.h ?? 2245}
                      /* eager, like the catalog: a lazy shot inside a clipped,
                         absolutely positioned wrap can miss its load and leave
                         an empty card */
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <TemplateMock seed={i} />
                )}
                <div className="fw-tcard-overlay">
                  <span>Open in Bolt</span>
                </div>
              </div>
              <div className="fw-tcard-foot">
                <span className="fw-tcard-name">{t.name}</span>
                <span className="fw-tcard-tag">{t.tag || 'Builders'}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Competition: prizes → entries gallery → submission form ─────────────── */
/* pixel rosette seal for the Hall of Fame certificate tag (9x11 grid) */
function CertSeal() {
  return (
    <svg className="fw-cert-seal" viewBox="0 0 9 11" aria-hidden="true">
      <g className="fw-cert-seal-tails"><rect x="2" y="8" width="1" height="1" /><rect x="3" y="8" width="1" height="1" /><rect x="5" y="8" width="1" height="1" /><rect x="6" y="8" width="1" height="1" /><rect x="1" y="9" width="1" height="1" /><rect x="2" y="9" width="1" height="1" /><rect x="6" y="9" width="1" height="1" /><rect x="7" y="9" width="1" height="1" /><rect x="0" y="10" width="1" height="1" /><rect x="1" y="10" width="1" height="1" /><rect x="7" y="10" width="1" height="1" /><rect x="8" y="10" width="1" height="1" /></g>
      <g className="fw-cert-seal-disc"><rect x="2" y="0" width="1" height="1" /><rect x="3" y="0" width="1" height="1" /><rect x="4" y="0" width="1" height="1" /><rect x="5" y="0" width="1" height="1" /><rect x="6" y="0" width="1" height="1" /><rect x="1" y="1" width="1" height="1" /><rect x="2" y="1" width="1" height="1" /><rect x="3" y="1" width="1" height="1" /><rect x="4" y="1" width="1" height="1" /><rect x="5" y="1" width="1" height="1" /><rect x="6" y="1" width="1" height="1" /><rect x="7" y="1" width="1" height="1" /><rect x="0" y="2" width="1" height="1" /><rect x="1" y="2" width="1" height="1" /><rect x="2" y="2" width="1" height="1" /><rect x="6" y="2" width="1" height="1" /><rect x="7" y="2" width="1" height="1" /><rect x="8" y="2" width="1" height="1" /><rect x="0" y="3" width="1" height="1" /><rect x="1" y="3" width="1" height="1" /><rect x="7" y="3" width="1" height="1" /><rect x="8" y="3" width="1" height="1" /><rect x="0" y="4" width="1" height="1" /><rect x="1" y="4" width="1" height="1" /><rect x="7" y="4" width="1" height="1" /><rect x="8" y="4" width="1" height="1" /><rect x="0" y="5" width="1" height="1" /><rect x="1" y="5" width="1" height="1" /><rect x="2" y="5" width="1" height="1" /><rect x="6" y="5" width="1" height="1" /><rect x="7" y="5" width="1" height="1" /><rect x="8" y="5" width="1" height="1" /><rect x="1" y="6" width="1" height="1" /><rect x="2" y="6" width="1" height="1" /><rect x="3" y="6" width="1" height="1" /><rect x="4" y="6" width="1" height="1" /><rect x="5" y="6" width="1" height="1" /><rect x="6" y="6" width="1" height="1" /><rect x="7" y="6" width="1" height="1" /><rect x="2" y="7" width="1" height="1" /><rect x="3" y="7" width="1" height="1" /><rect x="4" y="7" width="1" height="1" /><rect x="5" y="7" width="1" height="1" /><rect x="6" y="7" width="1" height="1" /></g>
      <g className="fw-cert-seal-core"><rect x="3" y="2" width="1" height="1" /><rect x="4" y="2" width="1" height="1" /><rect x="5" y="2" width="1" height="1" /><rect x="2" y="3" width="1" height="1" /><rect x="3" y="3" width="1" height="1" /><rect x="4" y="3" width="1" height="1" /><rect x="5" y="3" width="1" height="1" /><rect x="6" y="3" width="1" height="1" /><rect x="2" y="4" width="1" height="1" /><rect x="3" y="4" width="1" height="1" /><rect x="4" y="4" width="1" height="1" /><rect x="5" y="4" width="1" height="1" /><rect x="6" y="4" width="1" height="1" /><rect x="3" y="5" width="1" height="1" /><rect x="4" y="5" width="1" height="1" /><rect x="5" y="5" width="1" height="1" /></g>
    </svg>
  );
}

function PastWinners() {
  return (
    <div className="fw-gallery">
      {pastWinners.items.map((w) => (
        <a key={w.name} className="fw-entry-card fw-winner" href={w.url} target="_blank" rel="noopener">
          <span className="fw-winner-shot" aria-hidden="true">
            <img src={w.img} alt="" loading="lazy" decoding="async" />
            {/* same hover as the template cards: wash + pill rising from the foot */}
            <span className="fw-tcard-overlay">
              <span>View App</span>
            </span>
          </span>
          <span className="fw-winner-foot">
            <span className="fw-entry-body">
              <span className="fw-winner-label">{pastWinners.label}</span>
              <span className="fw-entry-name">{w.name}</span>
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

export function Competition() {
  return (
    <section className="fw-section fw-section--band fw-section--compete" id="compete">
      <div className="fw-inner">
        <SectionHeader center eyebrow={competition.eyebrow} title={competition.title} subtitle={competition.subtitle} />

        {/* outline for the ghost rank numerals: the font's glyphs are built
            from overlapping shapes, so a text-stroke traced the hidden inner
            joins (broken "2"). Fill the numeral, erode it 1px and keep only
            what the erosion removed = a clean outer edge. */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
          <filter id="fw-rank-outline" x="0" y="0" width="100%" height="100%">
            <feMorphology in="SourceAlpha" operator="erode" radius="1" result="inner" />
            <feComposite in="SourceGraphic" in2="inner" operator="out" />
          </filter>
        </svg>
        {/* podium: 2nd | 1st | 3rd on desktop, 1-2-3 stacked on phones */}
        <div className="fw-prizes">
          {competition.prizes.map((p, i) => (
            <div key={p.place} className={`fw-prize sc-on-dark fw-prize--${i + 1}${i === 0 ? ' is-first' : ''}`}>
              <PixelField wave={cornerWave} spacing={8} dot={2} opacity={i === 0 ? 0.9 : 0.45} className="fw-card-field is-on" color="140,190,255" />
              {/* button-style pixel fill: rises on hover, falls on leave */}
              <PixelRise colors={['255,255,255', '200,228,255', '140,196,255', '77,166,255']} alpha={0.55} />
              <span className="fw-prize-rank" aria-hidden="true">{i + 1}</span>
              <span className="fw-prize-place">
                {p.place}
                {competition.prizesTbc && <Tbc />}
              </span>
              <span className="fw-prize-amount">{p.amount}</span>
              <p className="fw-card-desc">{p.extras}</p>
            </div>
          ))}
        </div>
        <p className="fw-fine fw-fine--center">
          {competition.criteria} {competition.prizeFinePrint}{' '}
          <a className="fw-text-link" href={TERMS_PATH} target="_blank" rel="noopener">
            Read the official rules
          </a>
        </p>

        {/* bridge: a pixel trail flows down from the grand prize into last round's winners */}
        <div className="fw-bridge" aria-hidden="true">
          <span className="fw-bridge-line" />
          <span className="fw-bridge-pill">
            Hall of Fame
            <CertSeal />
          </span>
          <span className="fw-bridge-line fw-bridge-line--short" />
        </div>
        <div className="fw-subhead fw-subhead--winners">
          <h3 className="fw-subhead-title">Past Winners</h3>
          <p className="fw-subhead-sub">Pi Day’s grand-prize builds. Yours could be next.</p>
        </div>
        <PastWinners />

        <div className="fw-enter" id="enter">
          <aside className="fw-enter-head sc-on-dark">
            <PixelField wave={cornerWave} spacing={8} dot={2} opacity={0.6} className="fw-card-field is-on" color="140,190,255" />
            <span className="fw-enter-badge">
              <span className="fw-live-dot" aria-hidden="true" />
              Entries open Oct 13 – Oct 20
            </span>
            <h3 className="fw-enter-title">Submit your project to compete for $10k</h3>
            <p className="fw-enter-sub">One entry per builder. A business idea or a business you run, built in Bolt.</p>
            {/* prize card removed: it pulled focus from "Have these ready";
                the prize lives in the title now (reviewer, 2026-10-08) */}
            <p className="fw-enter-ready">Have these ready</p>
            <ol className="fw-enter-list">
              <li>A live link anyone can open for free</li>
              <li>Your Bolt project link</li>
              {/* optional since 2026-10-09 (rules still say required — legal) */}
              <li>Optional: a short demo video on YouTube or X</li>
            </ol>
          </aside>
          <div className="fw-form-card fw-form-card--wide">
            <EntryForm />
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── FAQ (shared .ms-faq component; JS only toggles .is-open) ───────────── */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="fw-section fw-section--faq ms-faq-section" id="faq">
      <div className="fw-inner fw-faq-layout">
        <div className="fw-faq-head">
          <span className="ms-faq-eyebrow eyebrow-scramble">FAQ</span>
          <div className="dsa-reveal">
            <h2 className="ms-faq-headline">Questions, answered</h2>
          </div>
        </div>
        <div className="ms-faq-list">
          {faqs.map((f, i) => (
            <div key={f.q} className={`ms-faq-item${open === i ? ' is-open' : ''}`}>
              <button
                className="ms-faq-q"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                <span className="ms-faq-icon">
                  <svg className="ms-faq-icon-plus" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <svg className="ms-faq-icon-minus" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div className="ms-faq-a">
                <div className="ms-faq-a-inner">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer CTA + footer ─────────────────────────────────────────────────── */
export function FooterCta() {
  return (
    <section className="fw-footer-cta">
      <div className="fw-footer-cta-inner">
        <span className="footer-eyebrow eyebrow-scramble">{footerCta.eyebrow}</span>
        <div className="dsa-reveal">
          <h2 className="sc-section-h2">{footerCta.title}</h2>
        </div>
        <p className="fw-footer-sub">{footerCta.subtitle}</p>
        <div className="hero-btn-group fw-footer-btns">
          <Btn href="#compete">{footerCta.cta}</Btn>
        </div>
      </div>
    </section>
  );
}

/* The closing CTA and the site footer share one video ground (BoltGrad02).
   Its top fades in from the page so the section has no hard top edge. */
export function FooterZone({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={`fw-footer-zone sc-on-dark${compact ? ' fw-footer-zone--compact' : ''}`}>
      <BgVideo name="footer" className="fw-footer-video" lazy />
      <span className="fw-grain fw-grain--footer" aria-hidden="true" />
      {children}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="fw-site-footer">
      <div className="fw-inner fw-site-footer-row">
        <a href={BOLT_URL} className="fw-footer-logo" target="_blank" rel="noopener" aria-label="bolt.new">
          <BoltLogo />
        </a>
        <nav className="fw-footer-links" aria-label="Footer">
          <a href={TERMS_PATH}>Contest Rules</a>
          <a href="https://stackblitz.com/terms-of-service" target="_blank" rel="noopener">
            Terms of Use
          </a>
          <a href="https://stackblitz.com/privacy-policy" target="_blank" rel="noopener">
            Privacy Policy
          </a>
        </nav>
        <span className="fw-footer-copy">© 2026 StackBlitz</span>
      </div>
    </footer>
  );
}
