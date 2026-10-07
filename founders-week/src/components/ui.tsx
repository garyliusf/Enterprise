import { useEffect, useRef, type ReactNode } from 'react';

/* Bolt wordmark, inked with currentColor so it follows the theme. */
export function BoltLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 43" fill="currentColor" aria-label="Bolt" role="img">
      <path d="M47.3242 37.9289C38.1648 37.9289 33.5047 32.5887 33.5047 25.9133C33.5047 18.0097 39.8253 10.8537 48.9847 10.8537C58.1441 10.8537 62.8041 16.194 62.8041 22.8693C62.8041 30.773 56.4836 37.9289 47.3242 37.9289ZM47.6991 29.4379C50.913 29.4379 52.9484 26.5541 52.9484 23.35C52.9484 20.7866 51.2879 19.3447 48.6097 19.3447C45.3959 19.3447 43.3605 22.2285 43.3605 25.4327C43.3605 27.996 45.021 29.4379 47.6991 29.4379Z" />
      <path d="M72.5607 37.2881H62.9192L70.7931 1.66838H80.4346L72.5607 37.2881Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M18.8977 37.9289C15.9517 37.9289 13.0593 36.8609 11.3988 34.5646L10.8131 37.2728L0 43L1.16732 37.2728L9.04198 1.66838H18.6835L15.8981 14.2181C18.1478 11.7615 20.2368 10.8537 22.915 10.8537C28.6999 10.8537 32.5565 14.6453 32.5565 21.5877C32.5565 28.7436 28.1107 37.9289 18.8977 37.9289ZM22.5936 23.617C22.5936 26.9279 20.2368 29.4379 17.1837 29.4379C15.4696 29.4379 13.9163 28.797 12.8986 27.6756L14.3984 21.107C15.5232 19.9856 16.8087 19.3447 18.3085 19.3447C20.6118 19.3447 22.5936 21.0536 22.5936 23.617Z" />
      <path d="M90.4656 37.9289C84.895 37.9289 80.9313 35.8996 80.9313 31.4138C80.9313 31.04 80.9849 30.1321 81.1455 29.3845L83.2345 19.8254H78.9494L80.8242 11.4945H85.1093L86.6626 4.44533L97.4562 0L96.3043 4.4562L94.7508 11.4945H100L98.1253 19.8254H92.876L91.4834 26.1269C91.3762 26.6075 91.3227 27.1416 91.3227 27.3552C91.3227 28.5834 92.0726 29.4379 93.733 29.4379C94.2151 29.4379 94.9114 29.2777 95.0721 29.1709V36.8609C94.0544 37.5551 92.2333 37.9289 90.4656 37.9289Z" />
    </svg>
  );
}

/* The shared button markup (CLAUDE.md): slide-up layer + doubled label as the
   CSS-only hover, upgraded to the pixel fill by shared-components.js. */
export function Btn({
  href,
  children,
  variant = 'primary',
  className = '',
  external = false,
}: {
  href: string;
  children: string;
  variant?: 'primary' | 'ghost';
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={`hero-btn-${variant} ${className}`.trim()}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
    >
      <div className="btn-bg-hover" />
      <div className="btn-text-wrap">
        <div className="btn-text-inner">
          <span>{children}</span>
          <span>{children}</span>
        </div>
      </div>
    </a>
  );
}

export function Tbc() {
  return <span className="fw-tbc" title="Placeholder: waiting on a decision">TBC</span>;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = false,
  reveal = true,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
  reveal?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`section-header${center ? ' section-header--center' : ''}`}>
      <span className="section-eyebrow eyebrow-scramble">{eyebrow}</span>
      {reveal ? (
        <div className="dsa-reveal">
          <h2 className="sc-section-h2">{title}</h2>
        </div>
      ) : (
        <h2 className="sc-section-h2">{title}</h2>
      )}
      {subtitle && <p className="section-sub">{subtitle}</p>}
      {children}
    </div>
  );
}

/* ── Pixel field ─────────────────────────────────────────────────────────
   React port of the sandbox's makePixelCanvas: a grid of dots whose opacity
   comes from a wave function. Colour follows --sc-dot-rgb unless a fixed
   triplet is passed, so it themes with the page. Pauses off-screen. */
export type WaveFn = (c: number, r: number, t: number, phase: number, cols: number, rows: number) => number;

export function PixelField({
  wave,
  spacing = 9,
  dot = 2,
  opacity = 1,
  color,
  className = '',
}: {
  wave: WaveFn;
  spacing?: number;
  dot?: number;
  opacity?: number;
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef(wave);
  waveRef.current = wave;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rgb = color || '20,136,252';
    let phases: number[][] = [];
    let raf = 0;
    let visible = true;

    const readColor = () => {
      if (color) return;
      const v = getComputedStyle(canvas).getPropertyValue('--sc-dot-rgb').trim();
      if (v) rgb = v;
    };
    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      const w = p.offsetWidth;
      const h = p.offsetHeight;
      if (!w || !h) return;
      canvas.width = w;
      canvas.height = h;
      readColor();
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);
      phases = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() * Math.PI * 2));
    };
    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const op = waveRef.current(c, r, t, phases[r]?.[c] ?? 0, cols, rows) * opacity;
          if (op < 0.04) continue;
          ctx.fillStyle = `rgba(${rgb},${op.toFixed(3)})`;
          ctx.fillRect(c * spacing, r * spacing, dot, dot);
        }
      }
    };
    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', readColor);
    if (reduce) requestAnimationFrame((t) => draw(t));
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener('change', readColor);
    };
  }, [spacing, dot, opacity, color]);

  return <canvas ref={ref} className={`fw-pixel-field ${className}`.trim()} aria-hidden="true" />;
}
