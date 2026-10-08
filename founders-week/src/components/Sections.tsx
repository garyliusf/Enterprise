import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { BOLT_URL, competition, faqs, footerCta, sessions, templates, TERMS_PATH, timeline, weekend, type Session } from '../config';
import { getGallery, isPreview, type GalleryEntry } from '../lib/api';
import { EntryForm, JoinForm } from './Forms';
import { BgVideo, Btn, BoltLogo, HoverField, PixelField, PixelIcon, SectionHeader, Tbc, type WaveFn } from './ui';

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
   Flips down as its step reveals; the next upcoming date gets a tag. */
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
      {next && (
        <span className="fw-cal-next">
          <span className="fw-live-dot" aria-hidden="true" />
          Next up
        </span>
      )}
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
          subtitle="Builder’s Week runs Oct 17 to 24. Join once and you are in for all of it."
        />
        {/* The shared "How it works" step line (solutions/_template, bolt-cli):
            the line draws, a glow travels it, nodes pop and the copy rises in
            sequence once it scrolls into view. Four steps = bolt-cli's timing. */}
        <HowSteps>
          {timeline.map((m, i) => (
            <div key={m.title} className="how-step">
              <div className="how-step-node">
                <span className="how-step-number">{String(i + 1).padStart(2, '0')}</span>
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

/* ── Join ─────────────────────────────────────────────────────────────────── */
export function Join() {
  return (
    <section className="fw-section fw-section--band fw-section--join" id="join">
      {/* Stacked + centred (Gary). The section ground takes a background
          image later — see .fw-section--join in page.css. */}
      <div className="fw-inner fw-join-stack">
        <div className="fw-join-copy">
          <SectionHeader
            center
            eyebrow="Join Builder’s Week"
            title="Count yourself in"
            subtitle="Joining is free and takes ten seconds. We will send you the session links and a reminder before the build weekend starts."
          >
            <span className="fw-form-badge">For everyone · Free · 10 seconds</span>
          </SectionHeader>
          <ul className="fw-ticks">
            <li>Session links for the founder Q&A, workshops and feedback hours</li>
            <li>A reminder before the free build weekend on Oct 17 and 18</li>
            <li>No app needed. Entering the contest is a separate step</li>
          </ul>
        </div>
        <div className="fw-form-card">
          <JoinForm />
        </div>
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
  { k: 'p', i: 1 },
  { k: 'p', i: 4 },
  { k: 'c', i: 1 },
  { k: 'p', i: 3 },
  { k: 'c', i: 2 },
  { k: 'p', i: 5 },
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

function FeaturedSession({ s }: { s: Session }) {
  const cd = useCountdown(s.start, s.end);
  const cal = calendarLink(s);
  const [dow, mon, dayNum] = s.day.split(' ');
  return (
    <article className="fw-feature sc-on-dark">
      <PixelField wave={featureWave} spacing={8} dot={2} opacity={0.85} className="fw-feature-field" color="140,190,255" />
      <div className="fw-feature-date" aria-label={`${s.day}, ${s.time}`}>
        <span className="fw-feature-mon">{mon}</span>
        <span className="fw-feature-day">{dayNum}</span>
        <span className="fw-feature-dow">{dow} · {s.time}</span>
      </div>
      <div className="fw-feature-body">
        <span className="fw-feature-kicker">
          <span className="fw-live-dot" aria-hidden="true" />
          {cd?.state === 'live' ? 'Live now' : 'Confirmed'}
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
        <div className="fw-feature-photo" aria-hidden="true">
          <img src={s.photo} alt="" loading="lazy" decoding="async" />
        </div>
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
          eyebrow="Founder programming · Oct 19–23"
          title="A week of founder sessions"
          subtitle="Live Q&As, workshops and feedback hours. Join Builder’s Week and we will send you the links."
        />
        {featured && <FeaturedSession s={featured} />}
        <div className="fw-grid fw-grid--3 fw-session-cards">
          {rest.map((s, i) => (
            s && (
              <article key={s.title} className="fw-card fw-session-card">
                <HoverField index={i + 3} />
                <PixelIcon name={s.icon ?? 'x'} index={i} />
                <span className="fw-session-when">
                  {s.day === 'Date TBC' ? 'Date and time soon' : `${s.day} · ${s.time}`}
                  {s.tbc && <Tbc />}
                </span>
                <h3 className="fw-card-title">{s.title}</h3>
                <p className="fw-card-desc">{s.blurb}</p>
                <span className="fw-session-host">{s.host}</span>
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
          eyebrow="Founder templates"
          title={
            <>
              Templates to start from {templates.tbc && <Tbc />}
            </>
          }
          subtitle="A starter kit for founders, built in Bolt. Open one, make it yours, and start building on Saturday morning."
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
function Gallery() {
  const [entries, setEntries] = useState<GalleryEntry[] | null>(null);
  useEffect(() => {
    getGallery().then(setEntries);
  }, []);

  if (entries === null) return <div className="fw-gallery fw-gallery--loading" aria-busy="true" />;
  if (!entries.length) {
    return (
      <div className="fw-gallery-empty">
        <p>No entries yet. The first products show up here once they have been reviewed.</p>
        <a className="fw-text-link" href="#enter">
          Be the first to enter <i className="fw-arrow" aria-hidden="true" />
        </a>
      </div>
    );
  }
  return (
    <>
      {isPreview && <p className="fw-preview-note">Preview mode: these are sample entries.</p>}
      <div className="fw-gallery">
        {entries.map((e, i) => (
          <a key={e.id} className="fw-entry-card" href={e.product_url} target="_blank" rel="noopener">
            <span className="fw-entry-thumb" data-hue={i % 4} aria-hidden="true">
              <span>{e.product_name.replace(/^Sample:\s*/, '').charAt(0)}</span>
            </span>
            <span className="fw-entry-body">
              <span className="fw-entry-name">{e.product_name}</span>
              <span className="fw-entry-tagline">{e.tagline}</span>
              <span className="fw-entry-founder">by {e.founder_name}</span>
            </span>
          </a>
        ))}
      </div>
    </>
  );
}

export function Competition() {
  return (
    <section className="fw-section fw-section--band fw-section--compete" id="compete">
      <div className="fw-inner">
        <SectionHeader eyebrow={competition.eyebrow} title={competition.title} subtitle={competition.subtitle} />

        <div className="fw-prizes">
          {competition.prizes.map((p, i) => (
            <div key={p.place} className={`fw-prize${i === 0 ? ' is-first' : ''}`}>
              {i === 0 && <PixelField wave={cornerWave} spacing={8} dot={2} opacity={0.7} className="fw-card-field is-on" />}
              <span className="fw-prize-place">
                {p.place}
                {competition.prizesTbc && <Tbc />}
              </span>
              <span className="fw-prize-amount">{p.amount}</span>
              <p className="fw-card-desc">{p.extras}</p>
            </div>
          ))}
        </div>
        <p className="fw-fine">
          {competition.criteria} {competition.prizeFinePrint}{' '}
          <a className="fw-text-link" href={TERMS_PATH} target="_blank" rel="noopener">
            Read the official rules
          </a>
        </p>

        <div className="fw-subhead">
          <h3 className="fw-subhead-title">Entries</h3>
          <div className="hero-btn-group">
            <Btn href="#enter">Submit Yours</Btn>
          </div>
        </div>
        <Gallery />

        <div className="fw-enter" id="enter">
          <div className="fw-enter-head">
            <span className="fw-form-badge fw-form-badge--contest">Contest entrants only · Needs a live app</span>
            <h3 className="fw-subhead-title">Submit your app</h3>
            <p className="section-sub">Submissions are open Oct 13 to Oct 20. One entry per founder. Have these ready:</p>
            <ul className="fw-need">
              <li>A live link to the app, free for anyone to open</li>
              <li>The Bolt project you built it in</li>
              <li>A public demo video of 5 minutes or less on YouTube or X</li>
            </ul>
            <p className="fw-enter-alt">
              Not entering?{' '}
              <a className="fw-text-link" href="#join">
                Just join Builder’s Week <i className="fw-arrow" aria-hidden="true" />
              </a>
            </p>
          </div>
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
          <Btn href="#join">{footerCta.cta}</Btn>
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
