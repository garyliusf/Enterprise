import { useEffect, useRef, useState } from 'react';
import { hero } from '../config';
import { getParticipantCount } from '../lib/api';
import { Btn } from './ui';

/* Ordered (Bayer 4x4) dither over the hero ramp — the family hero texture
   from security.html: square pixels, dense at the crown and thinning down,
   with a slow wave pushing the density field so squares wink in and out. */
function HeroDither() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const CELL = 5;
    const SQ = 2;
    const BAYER = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let visible = true;
    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.ceil(canvas.width / CELL) + 1;
      rows = Math.ceil(canvas.height / CELL) + 1;
    };
    const draw = (ts: number) => {
      const t = ts / 1000;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDark ? 'rgb(120,160,230)' : '#fff';
      for (let r = 0; r < rows; r++) {
        const gy = r / rows;
        let base = 1 - gy / (isDark ? 0.85 : 0.98);
        if (base <= 0) continue;
        base = isDark ? base * base : Math.pow(base, 0.75);
        const alpha = isDark ? 0.10 + 0.22 * base : 0.05 + 0.13 * base;
        ctx.globalAlpha = alpha;
        for (let c = 0; c < cols; c++) {
          const gx = c / cols;
          const wave = Math.sin(gx * 4.1 + gy * 6.3 - t * 0.95) * 0.5 + Math.sin(gx * 7.7 - gy * 3.1 + t * 0.62) * 0.28;
          const hm = 1 - Math.pow(Math.abs(gx - 0.5) * 2, 2.2) * 0.85;
          const level = base * hm + wave * 0.38;
          const th = (BAYER[r & 3][c & 3] + 0.5) / 16;
          if (level <= th) continue;
          ctx.fillRect(c * CELL, r * CELL, SQ, SQ);
        }
      }
      ctx.globalAlpha = 1;
    };
    const loop = (ts: number) => {
      if (visible) draw(ts);
      raf = requestAnimationFrame(loop);
    };
    init();
    window.addEventListener('resize', init);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', init);
      io.disconnect();
    };
  }, []);
  return <canvas ref={ref} className="fw-hero-dither" aria-hidden="true" />;
}

export function Hero() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    getParticipantCount().then(setCount);
  }, []);

  return (
    <section className="fw-hero" id="top">
      <HeroDither />
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
