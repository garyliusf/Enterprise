import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/* Canonical bolt.new wordmark (images/bolt-new.svg in the sandbox — the same
   one the site nav inlines), inked with currentColor so it follows the theme. */
export function BoltLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 85 24" fill="currentColor" aria-label="bolt.new" role="img">
      <path d="M26.1121 20.9491C21.0582 20.9491 18.4869 17.9995 18.4869 14.3126C18.4869 9.9472 21.9744 5.99476 27.0283 5.99476C32.0822 5.99476 34.6535 8.94434 34.6535 12.6313C34.6535 16.9967 31.166 20.9491 26.1121 20.9491ZM26.319 16.2593C28.0923 16.2593 29.2154 14.6665 29.2154 12.8968C29.2154 11.481 28.2992 10.6846 26.8214 10.6846C25.0481 10.6846 23.925 12.2774 23.925 14.0471C23.925 15.4629 24.8412 16.2593 26.319 16.2593Z"/>
      <path d="M40.0368 20.5952H34.717L39.0615 0.921487H44.3814L40.0368 20.5952Z"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M10.4272 20.9491C8.80168 20.9491 7.20572 20.3592 6.28951 19.0909L5.96635 20.5867L0 23.75L0.644095 20.5867L4.9891 0.921487H10.309L8.77213 7.853C10.0134 6.49619 11.1661 5.99476 12.6438 5.99476C15.8358 5.99476 17.9637 8.08896 17.9637 11.9234C17.9637 15.8758 15.5107 20.9491 10.4272 20.9491ZM12.4665 13.0443C12.4665 14.873 11.1661 16.2593 9.48145 16.2593C8.53569 16.2593 7.6786 15.9053 7.11705 15.2859L7.94459 11.658C8.56524 11.0385 9.27456 10.6846 10.1021 10.6846C11.373 10.6846 12.4665 11.6285 12.4665 13.0443Z"/>
      <path d="M49.9163 20.9491C46.8426 20.9491 44.6555 19.8283 44.6555 17.3506C44.6555 17.1442 44.6851 16.6427 44.7737 16.2298L45.9264 10.9501H43.562L44.5964 6.34871H46.9608L47.8179 2.45527L53.7735 0L53.1378 2.46127L52.2807 6.34871H55.1771L54.1426 10.9501H51.2462L50.4778 14.4306C50.4187 14.696 50.3892 14.991 50.3892 15.109C50.3892 15.7874 50.8029 16.2593 51.7191 16.2593C51.9851 16.2593 52.3693 16.1708 52.458 16.1118V20.3592C51.8965 20.7427 50.8916 20.9491 49.9163 20.9491Z"/>
      <path d="M56.461 21.0087C55.7527 21.0087 55.1886 20.4196 55.1886 19.7127C55.1886 18.8879 55.897 18.1941 56.7234 18.1941C57.4317 18.1941 57.9958 18.7832 57.9958 19.4901C57.9958 20.3149 57.2875 21.0087 56.461 21.0087Z"/>
      <path d="M65.3576 20.8386H62.9964L63.7309 17.5133C63.7572 17.3955 63.8097 17.186 63.8097 17.0289C63.8097 16.5969 63.4292 16.4398 63.0488 16.4398C62.5372 16.4398 62.183 16.7016 61.9338 16.9242L61.068 20.8386H58.7068L60.1104 14.5153H62.4716L62.3011 15.2354C62.7602 14.8164 63.3374 14.3582 64.295 14.3582C65.6199 14.3582 66.3807 15.0783 66.3807 16.0209C66.3807 16.1256 66.3414 16.4136 66.3151 16.5314L65.3576 20.8386Z"/>
      <path d="M70.256 20.9956C68.2096 20.9956 66.7929 19.9745 66.7929 18.1155C66.7929 16.0994 68.3408 14.3582 70.5577 14.3582C72.1319 14.3582 73.5223 15.3139 73.5223 17.2384C73.5223 17.6704 73.4436 18.1679 73.3781 18.4035H69.1279V18.4166C69.1279 18.5083 69.5083 19.2021 70.4265 19.2021C70.925 19.2021 71.5153 19.0843 71.8039 18.8879L72.5254 20.4196C71.8826 20.8255 71.0169 20.9956 70.256 20.9956ZM69.3509 16.9111H71.4366V16.8718C71.4366 16.6885 71.2136 16.1518 70.4659 16.1518C69.8363 16.1518 69.4296 16.6362 69.3509 16.9111Z"/>
      <path d="M81.7599 20.8386H79.1888L78.9265 17.3038L77.1293 20.8386H74.5582L74.1254 14.5153H76.4866L76.5521 17.9977L78.4411 14.5153H80.5531L80.881 17.9977L82.4945 14.5153H85L81.7599 20.8386Z"/>
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
export function BgVideo({ name, className, lazy = false }: { name: string; className?: string; lazy?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
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
      poster={`/hero/${name}-poster.jpg`}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={`/hero/${name}.webm`} type="video/webm" />
      <source src={`/hero/${name}.mp4`} type="video/mp4" />
    </video>
  );
}

/* ── Pixel icons ─────────────────────────────────────────────────────────
   The deck's X-gradient language: a 5x5 grid of square pixels; the focus
   cell is full brand blue and every other lit cell fades by its distance
   from it (Chebyshev rings 0 / 1 / 2 / 3+). On card hover the fade lifts
   so the whole shape lights up. */
export type PixelIconName = 'x' | 'plus' | 'clock' | 'up' | 'rocket' | 'speak' | 'chat' | 'one' | 'two';

const PIXEL_ICONS: Record<PixelIconName, { rows: string[]; focus: [number, number] }> = {
  x: { rows: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'], focus: [2, 2] },
  plus: { rows: ['..#..', '..#..', '#####', '..#..', '..#..'], focus: [2, 2] },
  /* ring + centre only; the minute hand is drawn and animated separately */
  clock: { rows: ['.###.', '#...#', '#.#.#', '#...#', '.###.'], focus: [2, 2] },
  up: { rows: ['..#..', '.###.', '#.#.#', '..#..', '..#..'], focus: [0, 2] },
  /* growth workshop: a rocket (nose, window, body, fins); exhaust drawn separately */
  /* pixel numerals for numbered lists */
  one: { rows: ['..#..', '.##..', '..#..', '..#..', '.###.'], focus: [2, 2] },
  two: { rows: ['.###.', '#...#', '..##.', '.#...', '#####'], focus: [2, 2] },
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
