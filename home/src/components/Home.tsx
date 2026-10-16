import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { closing, enterprise, showcase, stats, steps, stories, templatesHome, useCases, whatsNew, type ShowcaseCard } from '../home';
import { PromptBox, TrustPills } from './Hero';
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
  return (
    <section className="fw-section fw-section--band hm-stories">
      <div className="fw-inner">
        <SectionHeader center eyebrow={stories.eyebrow} title={stories.title} subtitle={stories.subtitle} />
        <div className="hm-story-row">
          {stories.items.map((s, i) => (
            <figure key={i} className="hm-story">
              <span className="hm-story-kicker">Customer story</span>
              <blockquote className="hm-story-quote fw-serif">“{s.quote}”</blockquote>
              <figcaption className="hm-story-who">
                <span className="hm-story-avatar" aria-hidden="true" />
                <span>
                  <span className="hm-story-name">{s.name}</span>
                  <span className="hm-story-role">{s.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works: five moves, each with a small live-ish visual ───────── */
function StepVisual({ kind }: { kind: (typeof steps.items)[number]['visual'] }) {
  if (kind === 'prompt') {
    return (
      <div className="hm-vis hm-vis--prompt">
        <div className="hm-vis-input">A booking site for my dog walking business, with a calendar and deposits</div>
      </div>
    );
  }
  if (kind === 'build') {
    return (
      <div className="hm-vis hm-vis--build">
        <div className="hm-vis-window">
          <div className="hm-vis-bar"><i /><i /><i /><span>Building</span></div>
          <div className="hm-vis-lines">
            <span style={{ width: '36%' }} />
            <span className="is-box" style={{ width: '68%' }} />
            <span style={{ width: '50%' }} />
            <span className="is-btn" />
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'wired') {
    return (
      <div className="hm-vis hm-vis--wired">
        {['Hosting', 'Database', 'Payments', 'Auth'].map((w, i) => (
          <span key={w} className="hm-vis-check" style={{ '--i': i } as React.CSSProperties}>
            <i className="hm-vis-box" />
            {w}
          </span>
        ))}
      </div>
    );
  }
  if (kind === 'secure') {
    return (
      <div className="hm-vis hm-vis--secure">
        {[88, 60, 46].map((w, i) => (
          <span key={i} className="hm-vis-scan" style={{ '--i': i } as React.CSSProperties}>
            <i className="hm-vis-tick" />
            <span style={{ width: `${w}%` }} />
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="hm-vis hm-vis--deploy">
      <div className="hm-vis-url">
        <span>yourbusiness.com</span>
        <span className="hm-vis-deploy">Deploy</span>
      </div>
    </div>
  );
}

export function Steps() {
  return (
    <section className="fw-section hm-steps" id="how-it-works">
      <div className="fw-inner">
        <SectionHeader center eyebrow={steps.eyebrow} title={steps.title} subtitle={steps.subtitle} />
        <ol className="hm-step-list">
          {steps.items.map((s, i) => (
            <li key={s.title} className={`hm-step${i % 2 ? ' hm-step--flip' : ''}`}>
              <div className="hm-step-copy">
                <span className="hm-step-kicker">
                  <span className="hm-step-num">{String(i + 1).padStart(2, '0')}</span>
                  {s.kicker}
                </span>
                <h3 className="hm-step-title">{s.title}</h3>
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

/* ── Templates: three cards on a tinted panel ──────────────────────────── */
export function TemplatesHome() {
  return (
    <section className="fw-section hm-templates" id="templates">
      <div className="fw-inner">
        <div className="hm-panel">
          <SectionHeader center eyebrow={templatesHome.eyebrow} title={templatesHome.title} subtitle={templatesHome.subtitle} />
          <div className="hm-tpl-grid">
            {templatesHome.items.map((t) => (
              <a key={t.name} className="hm-tpl" href={t.url} target="_blank" rel="noopener">
                <span className="hm-tpl-shot">
                  <img src={t.shot} alt={`Preview of the ${t.name} template`} loading="lazy" decoding="async" className={t.fill ? 'is-fill' : undefined} />
                </span>
                <span className="hm-tpl-name">{t.name}</span>
                <span className="hm-tpl-meta">{t.meta}</span>
              </a>
            ))}
          </div>
          <div className="hm-more-row">
            <MoreLink {...templatesHome.more} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── New this month: a feature list, the active item lit, one visual ──── */
const newWave: WaveFn = (c, r, t, phase, cols, rows) => {
  const x = c / cols - 0.5;
  const y = r / rows - 0.5;
  const d = Math.max(0, 1 - Math.hypot(x * 1.6, y * 1.6));
  return d * d * (Math.sin((x + y) * 10 - t / 600 + phase) * 0.5 + 0.5);
};

export function WhatsNew() {
  const [active, setActive] = useState(0);
  const timer = useRef<number | null>(null);
  /* rotates on its own every 5s; hovering an item pins it */
  useEffect(() => {
    timer.current = window.setInterval(() => setActive((a) => (a + 1) % whatsNew.items.length), 5000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, []);
  return (
    <section className="fw-section hm-new" id="whats-new">
      <div className="fw-inner">
        <SectionHeader center eyebrow={whatsNew.eyebrow} title={whatsNew.title} subtitle={whatsNew.subtitle} />
        <div className="hm-new-layout">
          <ul className="hm-new-list">
            {whatsNew.items.map((n, i) => (
              <li key={n.title} className={`hm-new-item${active === i ? ' is-active' : ''}`} onMouseEnter={() => setActive(i)}>
                <button type="button" className="hm-new-head" onClick={() => setActive(i)} aria-expanded={active === i}>
                  {n.title}
                </button>
                <p className="hm-new-body">{n.body}</p>
                <a className="fw-text-link hm-new-link" href={n.link.href}>
                  {n.link.label} <i className="fw-arrow" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="hm-new-visual" aria-hidden="true">
            <PixelField wave={newWave} spacing={9} dot={2} opacity={0.35} className="hm-new-field" color="20,136,252" />
            <div className="hm-new-slides">
              {[0, 1, 2].map((k) => (
                <span key={k} className={`hm-new-slide${k === 1 ? ' is-lead' : ''}`} style={{ '--k': k, '--a': active } as React.CSSProperties} />
              ))}
            </div>
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
