import { hero } from '../config';
import { BgVideo, Btn, PixelIcon } from './ui';

export function Hero() {
  return (
    <section className="fw-hero" id="top">
      {/* BoltGrad03 */}
      <BgVideo name="hero" className="fw-hero-video" />
      <div className="fw-hero-inner sc-on-dark">
        {/* Above the fold: no scroll reveal on the H1 (CLAUDE.md). */}
        {/* glass pill: pixel spark + label + a light sweep (no scramble) */}
        <span className="fw-hero-pill">
          <PixelIcon name="x" className="fw-hero-pill-icon" />
          <span className="section-eyebrow fw-hero-eyebrow">{hero.eyebrow}</span>
        </span>
        <h1 className="fw-hero-h1">
          <span className="fw-serif">{hero.titleSerif}</span>
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
