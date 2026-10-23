import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { asset } from '../config';

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
/* The family's ordered Bayer dither (the 404 / bolt-cli hero field, ported):
   2px squares on a 5px grid, thresholded against a 4×4 Bayer matrix by two
   slow drifting waves, so the pattern breathes. `fade` = how far down the box
   it reaches before dying out (0–1). Paused off screen and with reduced motion. */
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
export function BayerDither({ className, rgb = '255,255,255', fade = 0.9, strength = 1 }: { className?: string; rgb?: string; fade?: number; strength?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const CELL = 5, SQ = 2;
    let cols = 0, rows = 0, start = 0, raf = 0, vis = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const init = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; cols = Math.ceil(canvas.width / CELL) + 1; rows = Math.ceil(canvas.height / CELL) + 1; };
    const draw = (ts: number) => {
      raf = 0;
      if (!start) start = ts;
      const t = reduce ? 0 : (ts - start) / 1000, W = canvas.width, H = canvas.height;
      if (!W || !H) { init(); }
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        const gy = r / rows;
        let base = 1 - gy / fade;
        if (base <= 0) continue;
        base = Math.pow(base, 0.75) * strength;
        for (let c = 0; c < cols; c++) {
          const gx = c / cols;
          const wave = Math.sin(gx * 4.1 + gy * 6.3 - t * 0.95) * 0.5 + Math.sin(gx * 7.7 - gy * 3.1 + t * 0.62) * 0.28;
          if (base + wave * 0.38 <= (BAYER[r & 3][c & 3] + 0.5) / 16) continue;
          ctx.fillStyle = `rgba(${rgb},${(0.085 + base * 0.13).toFixed(3)})`;
          ctx.fillRect(c * CELL, r * CELL, SQ, SQ);
        }
      }
      if (vis && !reduce) raf = requestAnimationFrame(draw);
    };
    init();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(draw); });
    io.observe(canvas);
    const onResize = () => { init(); if (!raf) raf = requestAnimationFrame(draw); };
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(draw);
    return () => { io.disconnect(); window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); };
  }, [rgb, fade, strength]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

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
    /* the theme resolver (index.html) fires this when the OS theme flips */
    document.addEventListener('sc-themechange', readColor);
    if (reduce) requestAnimationFrame((t) => draw(t));
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('sc-themechange', readColor);
    };
  }, [spacing, dot, opacity, color]);

  return <canvas ref={ref} className={`fw-pixel-field ${className}`.trim()} aria-hidden="true" />;
}

/* ── Background video ────────────────────────────────────────────────────
   Muted looping gradient video (hero, footer). Files live in public/hero/:
   <name>.webm, <name>.mp4 and <name>-poster.jpg (first frame, so nothing
   changes when playback starts). Plays only while on screen; `lazy` also
   holds the download until it is near. Reduced motion: stays on the poster. */
export function BgVideo({ name, className, lazy = false, startAt = 0 }: { name: string; className?: string; lazy?: boolean; startAt?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    /* startAt: seconds into the loop, so several copies of one clip never move in step */
    if (startAt) v.addEventListener('loadedmetadata', () => { v.currentTime = startAt % (v.duration || 1); }, { once: true });
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    const sync = () => {
      if (!mq.matches && inView) {
        if (v.preload === 'none') {
          v.preload = 'auto';
          v.load();
        }
        v.play().catch(() => {});
      } else v.pause();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        sync();
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(v);
    mq.addEventListener('change', sync);
    return () => {
      io.disconnect();
      mq.removeEventListener('change', sync);
    };
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload={lazy ? 'none' : 'auto'}
      poster={asset(`/hero/${name}-poster.jpg`)}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={asset(`/hero/${name}.webm`)} type="video/webm" />
      <source src={asset(`/hero/${name}.mp4`)} type="video/mp4" />
    </video>
  );
}

/* ── Pixel icons ─────────────────────────────────────────────────────────
   The deck's X-gradient language: a 5x5 grid of square pixels; the focus
   cell is full brand blue and every other lit cell fades by its distance
   from it (Chebyshev rings 0 / 1 / 2 / 3+). On card hover the fade lifts
   so the whole shape lights up. */
export type PixelIconName = 'x' | 'plus' | 'clock' | 'up' | 'rocket' | 'speak' | 'chat';

const PIXEL_ICONS: Record<PixelIconName, { rows: string[]; focus: [number, number] }> = {
  x: { rows: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'], focus: [2, 2] },
  plus: { rows: ['..#..', '..#..', '#####', '..#..', '..#..'], focus: [2, 2] },
  /* ring + centre only; the minute hand is drawn and animated separately */
  clock: { rows: ['.###.', '#...#', '#.#.#', '#...#', '.###.'], focus: [2, 2] },
  up: { rows: ['..#..', '.###.', '#.#.#', '..#..', '..#..'], focus: [0, 2] },
  /* growth workshop: a rocket (nose, window, body, fins); exhaust drawn separately */
  rocket: { rows: ['...#...', '..###..', '..#.#..', '..###..', '.#####.', '.#.#.#.', '.......'], focus: [0, 3] },
  /* AMA: a megaphone on a finer 7x7 grid (5x5 was too coarse to read):
     handle, flaring cone, wide mouth; sound waves drawn separately */
  speak: { rows: ['....#..', '...##..', '#####..', '#####..', '#####..', '...##..', '....#..'], focus: [3, 4] },
  /* feedback: a chat bubble (outline + tail); typing dots drawn separately */
  chat: { rows: ['#####', '#...#', '#####', '.#...', '#....'], focus: [1, 2] },
};
const RING_OPACITY = [1, 0.55, 0.28, 0.16];
/* stroke order for the self-drawing icons, as "y,x" → step */
const DRAW_ORDER: Partial<Record<PixelIconName, Record<string, number>>> = {
};
/* rocket exhaust: centre flame + two side sparks */
const EXHAUST: [number, number, number][] = [
  [3, 6, 0],
  [2, 6, 1],
  [4, 6, 2],
];
/* megaphone sound waves: near pair, then the far pair */
const SOUND_WAVES: [number, number, number][] = [
  [6, 3, 0],
  [6, 2, 1],
  [6, 4, 1],
  [6, 1, 2],
  [6, 5, 2],
];
const TYPING_DOTS: [number, number][] = [
  [1, 1],
  [2, 1],
  [3, 1],
];
/* minute-hand cells around the centre: 12, 1:30, 3, 4:30, 6 */
const CLOCK_HAND: [number, number][] = [
  [2, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
];

export function PixelIcon({ name, className = '', index = 0 }: { name: PixelIconName; className?: string; index?: number }) {
  const { rows, focus } = PIXEL_ICONS[name];
  /* 5x5 → 4px squares on a 6px pitch; 7x7 → 3px on a 4px pitch (both ≈28px) */
  const P = rows.length === 7 ? 4 : 6;
  const S = rows.length === 7 ? 3 : 4;
  const cells: { x: number; y: number; o: number; d: number }[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== '#') return;
      const d = Math.min(3, Math.max(Math.abs(y - focus[0]), Math.abs(x - focus[1])));
      /* megaphone: a left-to-right ramp, handle soft → mouth full;
         rocket: nose full, softening toward the fins */
      const o = name === 'speak' ? 0.38 + 0.62 * (x / 4) : name === 'rocket' ? 1 - y * 0.09 : RING_OPACITY[d];
      cells.push({ x, y, o: Math.min(1, o), d });
    }),
  );
  /* 4px pixels on a 6px pitch → 28px icon */
  return (
    <svg
      className={`fw-pixel-icon fw-pi-${name} ${className}`.trim()}
      viewBox="0 0 28 28"
      width="28"
      height="28"
      aria-hidden="true"
      style={{ '--k': index } as CSSProperties}
    >
      {/* icons with their own motion (clock hand, rising arrow) keep their
          gradient still; the rest run the ring-by-ring in/out loop */}
      <g>
        {cells.map((c) => (
          <rect
            key={`${c.x}-${c.y}`}
            x={c.x * P}
            y={c.y * P}
            width={S}
            height={S}
            className={
              DRAW_ORDER[name] ? 'is-path' : name === 'chat' || name === 'speak' || name === 'rocket' ? 'is-static is-solid' : name === 'clock' || name === 'up' ? 'is-static' : undefined
            }
            style={{ '--o': c.o, '--d': c.d, '--seq': DRAW_ORDER[name]?.[`${c.y},${c.x}`] ?? 0 } as CSSProperties}
          />
        ))}
      </g>
      {/* rocket: exhaust flickers under it */}
      {name === 'rocket' &&
        EXHAUST.map(([x, y, n], k) => (
          <rect key={`e${k}`} x={x * P} y={y * P} width={S} height={S} className="fw-exhaust" style={{ '--seq': n } as CSSProperties} />
        ))}
      {/* megaphone: sound waves pulse outward from the bell */}
      {name === 'speak' &&
        SOUND_WAVES.map(([x, y, n], k) => (
          <rect key={`w${k}`} x={x * P} y={y * P} width={S} height={S} className="fw-wave" style={{ '--seq': n } as CSSProperties} />
        ))}
      {/* chat: three typing dots bounce in a wave inside the bubble */}
      {name === 'chat' &&
        TYPING_DOTS.map(([x, y], n) => (
          <rect key={`t${n}`} x={x * 6} y={y * 6} width="4" height="4" className="fw-typing" style={{ '--seq': n } as CSSProperties} />
        ))}
      {/* clock: the minute hand sweeps 12 → 3 → 6, one cell per step */}
      {name === 'clock' &&
        CLOCK_HAND.map(([x, y], h) => (
          <rect key={`h${h}`} x={x * 6} y={y * 6} width="4" height="4" className={`fw-hand fw-hand-${h}`} />
        ))}
    </svg>
  );
}

/* ── Card hover dot field ────────────────────────────────────────────────
   React port of attachHoverField (solutions/_template, from compliance.html):
   a rotating blue dot field that grows toward the card's right edge, drawn
   only while the card is hovered, faded in by CSS. Mount it as the card's
   first child; the card needs position: relative + overflow: hidden. */
export function HoverField({
  index = 0,
  color = '60,140,235',
  dot = 2,
  strength = 0.55,
  edgeFade = true,
}: {
  index?: number;
  /* one 'r,g,b', or several — each dot keeps one colour from the set */
  color?: string | string[];
  dot?: number;
  strength?: number;
  /* true: dots grow toward the right edge (cards); false: even across */
  edgeFade?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const tile = canvas?.parentElement;
    if (!canvas || !tile) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const SPACING = dot >= 3 ? 10 : 9;
    const DOT = dot;
    const palette = Array.isArray(color) ? color : [color];
    const phase = index * 1.7;
    let cols = 0;
    let rows = 0;
    let phases: number[][] = [];
    let hovered = false;
    let t = 0;
    let raf = 0;
    const resize = () => {
      const w = tile.offsetWidth;
      const h = tile.offsetHeight;
      if (!w || !h) return;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / SPACING) + 1;
      rows = Math.ceil(h / SPACING) + 1;
      phases = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() * Math.PI * 2));
    };
    const draw = () => {
      raf = 0;
      if (!hovered || !cols) return;
      t += 0.03;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const angle = t * 0.16 + phase;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const px = c * SPACING;
          const py = r * SPACING;
          const ph = phases[r]?.[c] ?? 0;
          const wave = Math.sin((px * ca + py * sa) / 58 + t + ph) * Math.cos((px * -sa + py * ca) / 90 + t * 0.6);
          const op = Math.max(0, wave) * strength * (edgeFade ? px / W : 0.55 + 0.45 * (px / W));
          if (op < 0.04) continue;
          const rgb = palette[Math.floor(ph * 10) % palette.length];
          ctx.fillStyle = `rgba(${rgb},${op.toFixed(3)})`;
          ctx.fillRect(px, py, DOT, DOT);
        }
      raf = requestAnimationFrame(draw);
    };
    const enter = () => {
      hovered = true;
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const leave = () => {
      hovered = false;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(tile);
    resize();
    tile.addEventListener('mouseenter', enter);
    tile.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      tile.removeEventListener('mouseenter', enter);
      tile.removeEventListener('mouseleave', leave);
    };
  }, [index, Array.isArray(color) ? color.join('|') : color, dot, strength, edgeFade]);
  return <canvas ref={ref} className="fw-hover-field" aria-hidden="true" />;
}

/* ── Pixel rise ──────────────────────────────────────────────────────────
   The button pixel-fill hover (shared-components.js attach()) scaled up for
   photos: each cell gets a noise value biased toward the bottom; on hover a
   threshold climbs so pixels fill in from the bottom up, flickering at the
   edge; on leave it drops and they fall back down. Sparse, translucent,
   white + light blue so the photo stays visible through it. */
export function PixelRise({
  colors = ['255,255,255', '255,255,255', '160,210,255', '100,175,255'],
  spacing = 9,
  dot = 2,
  alpha = 0.5,
}: {
  colors?: string[];
  spacing?: number;
  dot?: number;
  alpha?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const tile = canvas?.parentElement;
    if (!canvas || !tile) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cols = 0;
    let rows = 0;
    let noise: number[][] = [];
    let tint: number[][] = [];
    let progress = 0;
    let target = 0;
    let raf = 0;
    let last = 0;
    let flickerTimer = 0;

    const resize = () => {
      const r = tile.getBoundingClientRect();
      if (!r.width || !r.height) return;
      canvas.width = Math.round(r.width);
      canvas.height = Math.round(r.height);
      cols = Math.ceil(canvas.width / spacing);
      rows = Math.ceil(canvas.height / spacing);
      noise = [];
      tint = [];
      for (let y = 0; y < rows; y++) {
        noise[y] = [];
        tint[y] = [];
        for (let x = 0; x < cols; x++) {
          /* bottom rows get low values, so they light first (button: bias from top) */
          const bias = y / Math.max(1, rows - 1);
          noise[y][x] = (1 - bias) * 0.55 + Math.random() * 0.55;
          tint[y][x] = Math.floor(Math.random() * colors.length);
        }
      }
      draw();
    };
    const draw = (flicker = false) => {
      if (!canvas.width) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const threshold = progress * 1.15;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const n = noise[y][x];
          if (n >= threshold) continue;
          if (flicker && Math.random() < 0.03) continue;
          const edge = threshold - n;
          if (edge < 0.08 && Math.random() < 0.45) continue;
          /* fresher pixels at the rising edge are brighter; settled ones dim */
          const a = alpha * (edge < 0.25 ? 1 : 0.4);
          ctx.fillStyle = `rgba(${colors[tint[y][x]]},${a})`;
          ctx.fillRect(x * spacing, y * spacing, dot, dot);
        }
    };
    const tick = (t: number) => {
      if (!last) last = t;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      progress += (target - progress) * Math.min(1, dt * 6);
      if (Math.abs(target - progress) < 0.003) progress = target;
      draw();
      if (progress !== target) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        last = 0;
        if (target === 1) flick();
      }
    };
    const flick = () => {
      if (target !== 1) return;
      draw(true);
      flickerTimer = window.setTimeout(() => requestAnimationFrame(flick), 140);
    };
    const go = (to: number) => {
      target = to;
      if (reduce) {
        progress = to;
        draw();
        return;
      }
      clearTimeout(flickerTimer);
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const enter = () => go(1);
    const leave = () => go(0);
    const ro = new ResizeObserver(resize);
    ro.observe(tile);
    resize();
    tile.addEventListener('mouseenter', enter);
    tile.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(flickerTimer);
      ro.disconnect();
      tile.removeEventListener('mouseenter', enter);
      tile.removeEventListener('mouseleave', leave);
    };
  }, [colors.join('|'), spacing, dot, alpha]);
  return <canvas ref={ref} className="fw-pixel-rise" aria-hidden="true" />;
}
