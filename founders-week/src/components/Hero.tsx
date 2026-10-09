import { hero } from '../config';
import { BgVideo, Btn } from './ui';

export function Hero() {
  return (
    <section className="fw-hero" id="top">
      {/* BoltGrad03 */}
      <BgVideo name="hero" className="fw-hero-video" />
      <span className="fw-grain" aria-hidden="true" />
      <div className="fw-hero-inner sc-on-dark">
        {/* Above the fold: no scroll reveal on the H1 (CLAUDE.md). */}
        {/* glass pill: pulsing live dot + label + a light sweep (no scramble).
            The pixel x read as a close button (reviewer, 2026-10-08). */}
        <span className="fw-hero-pill">
          <span className="fw-live-dot fw-hero-pill-dot" aria-hidden="true" />
          <span className="section-eyebrow fw-hero-eyebrow">{hero.eyebrow}</span>
        </span>
        <h1 className="fw-hero-h1">
          {/* all sans: the serif first line read out of place (reviewer, 2026-10-08) */}
          <span>{hero.titleSerif}</span>
          <span>{hero.titleSans}</span>
        </h1>
        <p className="fw-hero-sub">{hero.subtitle}</p>
        <div className="hero-btn-group fw-hero-ctas">
          {/* one CTA: straight to the contest + prizes */}
          <Btn href="#compete" className="fw-hero-cta">{hero.primaryCta}</Btn>
        </div>
      </div>
    </section>
  );
}
