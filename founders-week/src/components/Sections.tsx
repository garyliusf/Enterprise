import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { BOLT_URL, competition, faqs, footerCta, sessions, templates, TERMS_PATH, timeline, weekend } from '../config';
import { getGallery, isPreview, type GalleryEntry } from '../lib/api';
import { EntryForm, JoinForm } from './Forms';
import { BgVideo, Btn, BoltLogo, PixelField, SectionHeader, Tbc, type WaveFn } from './ui';

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

/* ── Timeline ─────────────────────────────────────────────────────────────── */
export function Timeline() {
  return (
    <section className="fw-section fw-section--timeline" aria-label="How the week runs">
      <div className="fw-inner">
        {/* First section after the hero: static H2, no reveal (CLAUDE.md). */}
        <SectionHeader
          eyebrow="How the week runs"
          title="Build, learn, then show it off"
          subtitle="Founders Week runs Oct 17 to 24. Join once and you are in for all of it."
          reveal={false}
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
              <span className="how-step-date">
                {m.date}
                {m.tbc && <Tbc />}
              </span>
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
      <div className="fw-inner fw-split">
        <div className="fw-split-copy">
          <SectionHeader
            eyebrow="Join Founders Week"
            title="Count yourself in"
            subtitle="Joining is free and takes ten seconds. We will send you the session links and a reminder before the build weekend starts."
          />
          <ul className="fw-ticks">
            <li>Free unlimited building on Oct 17 and 18</li>
            <li>Live sessions with the founders and the Bolt team</li>
            <li>A shot at the $17,500 founder contest</li>
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
export function Weekend() {
  return (
    <section className="fw-section fw-section--weekend" id="weekend">
      <div className="fw-inner">
        <SectionHeader eyebrow={weekend.eyebrow} title={weekend.title} subtitle={weekend.subtitle} />
        <div className="fw-grid fw-grid--3">
          {weekend.points.map((p, i) => (
            <div key={p.title} className="fw-card">
              <PixelField wave={cornerWave} spacing={9} dot={2} opacity={0.5} className="fw-card-field" />
              <span className="fw-card-num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="fw-card-title">{p.title}</h3>
              <p className="fw-card-desc">{p.body}</p>
            </div>
          ))}
        </div>
        {weekend.partner.show && <p className="fw-partner">{weekend.partner.line}</p>}
        <p className="fw-fine">{weekend.finePrint}</p>
      </div>
    </section>
  );
}

/* ── Schedule ─────────────────────────────────────────────────────────────── */
export function Schedule() {
  return (
    <section className="fw-section fw-section--schedule" id="schedule">
      <div className="fw-inner">
        <SectionHeader
          eyebrow="Founder programming · Oct 19–23"
          title="A week of founder sessions"
          subtitle="Live Q&As, workshops and feedback hours. Join Founders Week and we will send you the links."
        />
        <div className="fw-sessions">
          {sessions.map((s) => (
            <div key={s.title} className={`fw-session${s.tbc ? ' is-tbc' : ''}`}>
              <div className="fw-session-when">
                <span className="fw-session-day">{s.day}</span>
                <span className="fw-session-time">{s.time}</span>
              </div>
              <div className="fw-session-what">
                <h3 className="fw-session-title">
                  {s.title}
                  {s.tbc && <Tbc />}
                </h3>
                <span className="fw-session-host">{s.host}</span>
              </div>
              <span className={`fw-session-tag${s.tbc ? '' : ' is-confirmed'}`}>{s.tbc ? 'Details soon' : 'Confirmed'}</span>
            </div>
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
                <span className="fw-tcard-tag">{t.tag || 'Founders'}</span>
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
            <h3 className="fw-subhead-title">Enter the contest</h3>
            <p className="section-sub">
              Submissions are open Oct 13 to Oct 20. You need the live app, its Bolt project link and a public demo video of up to
              five minutes on YouTube or X.
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
