import type React from 'react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { sessions, templates, weekend, type Session } from '../config';
import { BgVideo, Btn, HoverField, PixelField, PixelIcon, PixelRise, SectionHeader, Tbc, type WaveFn } from './ui';

/* Bold the free weekend model wherever it's named (Gary, 2026-10-13). */
const MODEL = 'GLM 5.3 Flash';
function boldModel(text: string): ReactNode {
  const parts = text.split(MODEL);
  if (parts.length === 1) return text;
  return parts.flatMap((p, i) => (i ? [<strong key={i} className="fw-model">{MODEL}</strong>, p] : [p]));
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
        <SectionHeader center eyebrow={weekend.eyebrow} title={weekend.title} subtitle={boldModel(weekend.subtitle)} reveal={false} />
        <div className="fw-mosaic" ref={mosaic}>
          {MOSAIC.map((t, n) => {
            const style = { '--n': n } as React.CSSProperties;
            if (t.k === 'p') {
              const ph = photos[t.i % photos.length];
              return (
                <figure key={n} className="fw-mosaic-photo" style={style}>
                  {/* the button pixel-fill hover, scaled up: rises on hover, falls on leave */}
                  <PixelRise />
                  <img
                    src={ph.src}
                    alt={ph.alt}
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
        <p className="fw-fine">{boldModel(weekend.finePrint)}</p>
      </div>
    </section>
  );
}

/* ── Schedule ─────────────────────────────────────────────────────────────── */
/* "Starts in 12d 04h 31m" → "Live now" → "Ended", ticking once a minute */
function useCountdown(start?: string, end?: string) {
  /* 0 on the server and first paint (the page is prerendered, so the build
     time must not leak into the markup); the real clock lands right after */
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!start) return;
    setNow(Date.now());
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
    `&details=${encodeURIComponent(`${s.blurb}\n\nBuilders Week on Bolt.`)}`
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
        {cd?.state !== 'ended' && (s.url || cal) && (
          <div className="fw-feature-cta">
            {/* Luma handles the RSVP and the calendar invite */}
            <Btn href={s.url ?? cal!} variant="ghost" external>
              {s.url ? 'RSVP' : 'Add to Calendar'}
            </Btn>
          </div>
        )}
        </div>
      </div>
      {s.photo && (
        <figure className="fw-feature-photo-wrap">
          <div className="fw-feature-photo">
            <img src={s.photo} alt={s.photoCaption ? `${s.photoCaption}, Bolt’s co-founders` : ''} loading="lazy" decoding="async" />
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

/* host row on a session card: avatar (photo or initials), name over role */
function SessionHost({ s }: { s: Session }) {
  const [name, ...role] = s.host.split(', ');
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <span className="fw-session-host">
      <span className="fw-host-avatar" aria-hidden={s.hostPhoto ? undefined : true}>
        {s.hostPhoto ? <img src={s.hostPhoto} alt={`Photo of ${name}`} loading="lazy" decoding="async" /> : initials}
      </span>
      <span className="fw-host-text">
        <span className="fw-host-name">{name}</span>
        {role.length > 0 && <span className="fw-host-role">{role.join(', ')}</span>}
      </span>
    </span>
  );
}

export function Schedule() {
  /* the session with hosts' photo leads; the rest are cards in date order */
  const featured = sessions.find((s) => s.photo);
  const rest = sessions.filter((s) => s !== featured);
  return (
    <section className="fw-section fw-section--schedule" id="schedule">
      <div className="fw-inner">
        <SectionHeader
          eyebrow="Live sessions · Oct 20–23"
          title="Grow what you’ve built"
          subtitle="A founder Q&A and live workshops on SEO, growth and design, all about growing a business on Bolt."
        />
        {featured && <FeaturedSession s={featured} />}
        <div className="fw-grid fw-grid--3 fw-session-cards">
          {rest.map((s, i) => {
            const inner = (
              <>
                {/* the footer gradient clip, each card a different crop / flip / tint / moment */}
                <BgVideo name="cards" className={`fw-session-video fw-session-video--${(i % 3) + 1}`} lazy startAt={i * 6.5} />
                <HoverField index={i + 3} />
                <PixelIcon name={s.icon ?? 'x'} index={i} />
                <span className="fw-session-when">{s.day} · {s.time}</span>
                <h3 className="fw-card-title">{s.title}</h3>
                <p className="fw-card-desc">{s.blurb}</p>
                {/* one bottom row: speaker left, RSVP right */}
                <div className="fw-session-foot">
                  <SessionHost s={s} />
                  {s.url && (
                    <span className="fw-text-link fw-session-rsvp">
                      RSVP <i className="fw-arrow" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </>
            );
            /* whole card links to the Luma event */
            return s.url ? (
              <a key={s.title} className="fw-card fw-session-card" href={s.url} target="_blank" rel="noopener">
                {inner}
              </a>
            ) : (
              <article key={s.title} className="fw-card fw-session-card">{inner}</article>
            );
          })}
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
              <div className="fw-tcard-preview">
                {t.shot && t.fill ? (
                  <img className="fw-tcard-fill" src={t.shot} alt={`Preview of the ${t.name} template`} loading="eager" decoding="async" />
                ) : t.shot ? (
                  <div className="fw-tcard-shot-wrap">
                    <img
                      className="fw-tcard-shot"
                      src={t.shot}
                      alt={`Preview of the ${t.name} template`}
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

/* The closing CTA and the site footer share one video ground (BoltGrad02).
   Its top fades in from the page so the section has no hard top edge. */
const ditherWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols, y = r / rows;
  const lit = Math.max(0, 1 - y * 1.05); // fades out toward the band's dark bottom
  const shimmer = Math.sin(x * 22 + y * 14 - t / 1400 + phase) * 0.5 + 0.5;
  const grain = ((c * 73 + r * 151) % 7) / 7; // a fixed halftone jitter
  return lit * (0.45 + shimmer * 0.45) * (0.65 + grain * 0.4); // between the two earlier strengths (Gary)
};

export function FooterZone({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={`fw-footer-zone sc-on-dark${compact ? ' fw-footer-zone--compact' : ''}`}>
      <BgVideo name="footer" className="fw-footer-video" lazy />
      <span className="fw-grain fw-grain--footer" aria-hidden="true" />
      {/* the mockup's dither (Gary, 2026-10-23): a fine, slowly shimmering dot
          screen over the gradient, strongest where the gradient is lit */}
      <PixelField wave={ditherWave} spacing={4} dot={1.6} opacity={0.85} className="fw-footer-dither" color="255,255,255" />
      {children}
    </div>
  );
}

