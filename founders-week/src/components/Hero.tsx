import { useEffect, useRef, useState } from 'react';
import { hero } from '../config';
import { getParticipantCount } from '../lib/api';
import { Btn } from './ui';

/* Looping gradient video (BoltGrad03, re-encoded: WebM ~130 KB, MP4 ~0.9 MB).
   The poster is its first frame, so the hero looks the same before playback
   starts. Reduced motion: the video stays paused on that frame. */
function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (mq.matches) v.pause();
      else v.play().catch(() => {});
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return (
    <video
      ref={ref}
      className="fw-hero-video"
      muted
      loop
      playsInline
      preload="auto"
      poster="/hero/hero-poster.jpg"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/hero/hero.webm" type="video/webm" />
      <source src="/hero/hero.mp4" type="video/mp4" />
    </video>
  );
}

export function Hero() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    getParticipantCount().then(setCount);
  }, []);

  return (
    <section className="fw-hero" id="top">
      <HeroVideo />
      <div className="fw-hero-inner sc-on-dark">
        {/* Above the fold: no scroll reveal on the H1 (CLAUDE.md). */}
        <span className="section-eyebrow fw-hero-eyebrow eyebrow-scramble">{hero.eyebrow}</span>
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
