import { useEffect, useState } from 'react';
import { hero } from '../config';
import { getParticipantCount } from '../lib/api';
import { BgVideo, Btn, PixelIcon } from './ui';

export function Hero() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    getParticipantCount().then(setCount);
  }, []);

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
          <Btn href="#join">{hero.primaryCta}</Btn>
          <Btn href="#compete" variant="ghost">
            {hero.secondaryCta}
          </Btn>
        </div>
        {count !== null && count > 0 && (
          <p className="fw-hero-count">
            <span className="fw-live-dot" aria-hidden="true" />
            {count.toLocaleString()} founders are in
          </p>
        )}
      </div>
      <p className="fw-hero-fine">{hero.finePrint}</p>
    </section>
  );
}
