#!/usr/bin/env python3
"""Port the home page (home/src) into bolt-public-pages as ONE page-builder
section, `home-page`, so the CMS can publish it at any path (first use:
bolt.new/lp/home for Alberto's organic-traffic test, 2026-11-16).

What it writes into the production checkout given as argv[1]:

  src/sections/home-page/
    meta.ts            label + Zod props: every block's copy is editable (hero,
                       showcase cards, stats, use cases, stories, steps,
                       templates, enterprise, closing); an empty field or list
                       renders the reviewed copy from app/home.ts
    index.astro        <HomePage client:load> wrapper + the stylesheet
    HomePage.tsx       the page body: Hero → Showcase → Stats → Use cases →
                       Stories → Steps → Templates → Enterprise → closing band
    copy.tsx           React context: CMS props merged over the reviewed copy
    styles.css         home/src/styles/page.css scoped under .hm-root
    app/               home/src components + data, lightly rewritten:
                       asset() → /public-page-assets/home/, the review-only
                       variant/theme switches gone, the hero reads its copy
                       from the context
  public/public-page-assets/home/…   only the assets the page references
  src/content/pages/lp-home.json + src/pages/lp/home.astro   the page itself
  src/components/builder/BuiltPage.astro   darkFooter also keys on home-page

The sandbox stays the design source: change home/src, re-run this.

    python3 tools/port-home-section.py ~/Projects/bpp-lp-home
"""
import pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
HOME = ROOT / 'home'
SRC = HOME / 'src'
DEST = pathlib.Path(sys.argv[1]).expanduser().resolve()
SEC = DEST / 'src/sections/home-page'
APP = SEC / 'app'
ASSETS = DEST / 'public/public-page-assets/home'
ASSET_BASE = '/public-page-assets/home/'
PFX = '.hm-root.hm-root.hm-root.hm-root'   # (0,4,0) + descendant: outranks the builder light kit's `.use-case-page.use-case-page[data-light-kit] .x` (0,4,0) — it shares class names with the home kit (.hm-closing, .card-strip-sub, .section-header) and would restyle them

# ───────────────────────── 1. the app (components + data) ─────────────────
(APP / 'components').mkdir(parents=True, exist_ok=True)

def copy_src(rel, transforms=()):
    text = (SRC / rel).read_text()
    for a, b in transforms:
        if a not in text:
            sys.exit(f'port-home-section: expected text missing in {rel}:\n  {a[:90]}')
        text = text.replace(a, b)
    (APP / rel).write_text(text)

copy_src('config.ts', [
    ("export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\\//, '');",
     f"export const asset = (p: string) => '{ASSET_BASE}' + p.replace(/^\\//, '');"),
])
copy_src('home.ts')
copy_src('components/ui.tsx')
copy_src('components/Story.tsx')
copy_src('components/Sections.tsx')
# every section reads its copy from the context (copy.tsx) instead of the
# module: the CMS can replace any block, empty blocks fall back to home.ts
def reads(fn_head, names):
    return (fn_head, fn_head + '\n  const { ' + ', '.join(names) + ' } = useHomeCopy();')
copy_src('components/Home.tsx', [
    ("import { closing, enterprise, showcase, stats, steps, stories, platform, templatesHome, useCases, type ShowcaseCard } from '../home';",
     "import { platform, type ShowcaseCard } from '../home';\nimport { useHomeCopy } from '../../copy';"),
    reads('function ShowcaseCoverflow() {', ['showcase']),
    reads('export function Showcase() {', ['showcase']),
    reads('export function Stats() {', ['stats']),
    reads('export function UseCases() {', ['useCases']),
    reads('export function Stories() {', ['stories']),
    reads('export function Steps() {', ['steps']),
    reads('export function TemplatesHome() {', ['templatesHome']),
    reads('export function Enterprise() {', ['enterprise']),
    reads('export function Closing() {', ['closing']),
])
# the variant switch is review-only: E is the home page, nothing else ships
(APP / 'components/VariantSwitch.tsx').write_text('''/* The sandbox's review-only variant switch, reduced to its answer: E is the
   home page (Gary, 2026-10-23). html[data-variant="e"] is stamped by the
   section's index.astro before first paint. */
export type Variant = 'a' | 'b' | 'c' | 'd' | 'e';
export function useVariant(): Variant {
  return 'e';
}
''')
copy_src('components/Hero.tsx', [
    ("import { hero } from '../config';", "import { hero } from '../config';\nimport { useHomeCopy } from '../../copy';"),
    ("const EXAMPLES = hero.promptPills.map((p) => p.prompt);\nfunction useTypewriter(active: boolean) {",
     "function useTypewriter(active: boolean, EXAMPLES: string[]) {"),
    ("  const { full: example, shown } = useTypewriter(text === '');",
     "  const copy = useHomeCopy();\n  const { full: example, shown } = useTypewriter(text === '', copy.promptExamples);"),
    ("            placeholder={hero.promptExample}", "            placeholder={copy.promptExamples[0]}"),
    ("            {hero.promptCta}", "            {copy.promptCta}"),
    ("  const send = () => { goToBolt(text || example, picked?.instruction); setIntent(undefined); };",
     "  const send = () => { goToBolt(text || example, picked?.instruction, copy.promptUrl); setIntent(undefined); };"),
    ("export function Hero() {\n  return (", "export function Hero() {\n  const copy = useHomeCopy();\n  return ("),
    ("          <span className=\"fw-serif\">{hero.titleSerif}</span>\n          <span>{hero.titleSans}</span>",
     "          <span className=\"fw-serif\">{copy.titleSerif}</span>\n          <span>{copy.titleSans}</span>"),
])

(SEC / 'copy.tsx').write_text('''import { createContext, useContext, type ReactNode } from 'react';
import type { z } from 'zod';
import { hero } from './app/config';
import * as reviewed from './app/home';
import type { propsSchema } from './meta';

/* The page copy the CMS can edit (meta.ts), merged over the reviewed copy in
   app/home.ts + app/config.ts: an empty field or an empty list falls back to
   the reviewed value, a filled list REPLACES the reviewed one (items missing
   their essentials are dropped first). Home.tsx reads this tree through
   useHomeCopy() exactly as the sandbox reads the home.ts module. */
export type HomeProps = z.input<typeof propsSchema>;

export type StepKind = 'prompt' | 'build' | 'wired' | 'secure' | 'deploy';
export interface ShowcaseItem { shot: string; prompt: string; url: string; preview?: string; name?: string; tag?: string }
export interface Stat { value: string; label: string }
export interface UseCase { tag: string; title: string; body: string; photo: string; focus?: string; href?: string }
export interface Story { quote: string; name: string; role: string; logo?: string; plate?: boolean }
export interface Step { kicker: string; title: string; body: string; visual: StepKind }
export interface Template { name: string; tag: string; shot: string; url: string; preview?: string; w?: number; h?: number }
export interface Feature { icon: string; title: string; body: string }
export interface Link { label: string; href: string }

export interface HomeCopy {
  titleSerif: string;
  titleSans: string;
  promptExamples: string[];
  promptCta: string;
  promptUrl: string;
  showcase: { rowA: ShowcaseItem[]; rowB: ShowcaseItem[] };
  stats: Stat[];
  useCases: { eyebrow: string; title: string; subtitle: string; more: Link; items: UseCase[] };
  stories: { eyebrow: string; title: string; subtitle: string; items: Story[] };
  steps: { eyebrow: string; title: string; subtitle: string; items: Step[] };
  templatesHome: { eyebrow: string; title: string; subtitle: string; more: Link; items: Template[] };
  enterprise: {
    eyebrow: string; title: string; body: string; logosLabel: string;
    logos: { src: string; alt: string }[];
    features: Feature[];
    panelKicker: string; panelNote: string;
    strip: { lead: string; placeholder: string; cta: string; action: string };
    more: Link;
  };
  closing: { eyebrow: string; title: string };
}

export const DEFAULT_COPY: HomeCopy = {
  titleSerif: hero.titleSerif,
  titleSans: hero.titleSans,
  promptExamples: hero.promptPills.map((p) => p.prompt),
  promptCta: hero.promptCta,
  promptUrl: hero.promptUrl,
  showcase: reviewed.showcase,
  stats: reviewed.stats,
  useCases: reviewed.useCases,
  stories: reviewed.stories,
  steps: reviewed.steps,
  templatesHome: reviewed.templatesHome,
  enterprise: reviewed.enterprise,
  closing: reviewed.closing,
};

const Ctx = createContext<HomeCopy>(DEFAULT_COPY);
export const useHomeCopy = () => useContext(Ctx);

const str = (v: string | undefined | null, d: string) => (v && v.trim() ? v.trim() : d);
const opt = (v: string | undefined | null) => (v && v.trim() ? v.trim() : undefined);
/* a filled list replaces the reviewed one; items without their essentials
   (mapper returns null) are dropped; nothing left = the reviewed list */
function list<T, R>(v: T[] | undefined | null, map: (t: T) => R | null, d: R[]): R[] {
  const out = (v ?? []).map(map).filter((x): x is R => x !== null);
  return out.length ? out : d;
}

type In = NonNullable<HomeProps>;
type G<K extends keyof In> = NonNullable<In[K]>;

export function mergeCopy(p: HomeProps | undefined): HomeCopy {
  const v = (p ?? {}) as In;
  const D = DEFAULT_COPY;
  const uc = (v.useCases ?? {}) as G<'useCases'>;
  const st = (v.stories ?? {}) as G<'stories'>;
  const sp = (v.steps ?? {}) as G<'steps'>;
  const tp = (v.templates ?? {}) as G<'templates'>;
  const en = (v.enterprise ?? {}) as G<'enterprise'>;
  const cl = (v.closing ?? {}) as G<'closing'>;
  const cards = list(v.showcase, (c) => {
    const prompt = opt(c.prompt), shot = opt(c.image), url = opt(c.openUrl);
    return prompt && shot && url ? { shot, prompt, url, preview: opt(c.previewUrl), name: opt(c.name), tag: opt(c.tag) } : null;
  }, [] as ShowcaseItem[]);
  return {
    titleSerif: str(v.titleSerif, D.titleSerif),
    titleSans: str(v.titleSans, D.titleSans),
    promptExamples: list(v.promptExamples, (s) => opt(s) ?? null, D.promptExamples),
    promptCta: str(v.promptCta, D.promptCta),
    promptUrl: str(v.promptUrl, D.promptUrl),
    showcase: cards.length ? { rowA: cards, rowB: [] } : D.showcase,
    stats: list(v.stats, (s) => { const value = opt(s.value), label = opt(s.label); return value && label ? { value, label } : null; }, D.stats),
    useCases: {
      eyebrow: str(uc.eyebrow, D.useCases.eyebrow),
      title: str(uc.title, D.useCases.title),
      subtitle: str(uc.subtitle, D.useCases.subtitle),
      more: { label: str(uc.moreLabel, D.useCases.more.label), href: str(uc.moreHref, D.useCases.more.href) },
      items: list(uc.items, (u) => {
        const title = opt(u.title), photo = opt(u.image);
        return title && photo ? { tag: str(u.tag, ''), title, body: str(u.body, ''), photo, focus: opt(u.focus) ?? '50% 30%', href: opt(u.href) } : null;
      }, D.useCases.items),
    },
    stories: {
      eyebrow: str(st.eyebrow, D.stories.eyebrow),
      title: str(st.title, D.stories.title),
      subtitle: str(st.subtitle, D.stories.subtitle),
      items: list(st.items, (s) => {
        const quote = opt(s.quote), name = opt(s.name);
        return quote && name ? { quote, name, role: str(s.role, ''), logo: opt(s.logo), plate: !!s.plate } : null;
      }, D.stories.items),
    },
    steps: {
      eyebrow: str(sp.eyebrow, D.steps.eyebrow),
      title: str(sp.title, D.steps.title),
      subtitle: str(sp.subtitle, D.steps.subtitle),
      items: list(sp.items, (s) => {
        const title = opt(s.title);
        return title ? { kicker: title, title, body: str(s.body, ''), visual: (s.visual ?? 'prompt') as StepKind } : null;
      }, D.steps.items),
    },
    templatesHome: {
      eyebrow: str(tp.eyebrow, D.templatesHome.eyebrow),
      title: str(tp.title, D.templatesHome.title),
      subtitle: str(tp.subtitle, D.templatesHome.subtitle),
      more: { label: str(tp.moreLabel, D.templatesHome.more.label), href: str(tp.moreHref, D.templatesHome.more.href) },
      items: list(tp.items, (t) => {
        const name = opt(t.name), shot = opt(t.image), url = opt(t.openUrl);
        return name && shot && url ? { name, tag: str(t.tag, ''), shot, url, preview: opt(t.previewUrl) } : null;
      }, D.templatesHome.items),
    },
    enterprise: {
      eyebrow: str(en.eyebrow, D.enterprise.eyebrow),
      title: str(en.title, D.enterprise.title),
      body: str(en.body, D.enterprise.body),
      logosLabel: str(en.logosLabel, D.enterprise.logosLabel),
      logos: list(en.logos, (l) => { const src = opt(l.image); return src ? { src, alt: str(l.name, '') } : null; }, D.enterprise.logos),
      features: list(en.features, (f) => { const title = opt(f.title); return title ? { icon: f.icon ?? 'users', title, body: str(f.body, '') } : null; }, D.enterprise.features),
      panelKicker: str(en.panelKicker, D.enterprise.panelKicker),
      panelNote: str(en.panelNote, D.enterprise.panelNote),
      strip: {
        lead: str(en.stripLead, D.enterprise.strip.lead),
        placeholder: str(en.stripPlaceholder, D.enterprise.strip.placeholder),
        cta: str(en.stripCta, D.enterprise.strip.cta),
        action: D.enterprise.strip.action,
      },
      more: D.enterprise.more,
    },
    closing: { eyebrow: str(cl.eyebrow, D.closing.eyebrow), title: str(cl.title, D.closing.title) },
  };
}

export function HomeCopyProvider({ value, children }: { value: HomeProps | undefined; children: ReactNode }) {
  return <Ctx.Provider value={mergeCopy(value)}>{children}</Ctx.Provider>;
}
''')

(APP / 'pixelize.ts').write_text("""/* The pixel-fill button hover, as section-page.js does it (public/
   public-page-assets/sections/section-page.js, "Pixel-fill button hover"),
   run from the island after hydration — see index.astro for why. */
type PixelBtn = HTMLElement & { __pixelized?: boolean; __hmPixelized?: boolean };

function attach(btn: PixelBtn, color: string) {
  if (btn.__hmPixelized) return;
  btn.__hmPixelized = true;
  btn.__pixelized = true;
  btn.classList.add('btn-pixelized');
  const canvas = document.createElement('canvas');
  canvas.className = 'btn-pixel-canvas';
  btn.insertBefore(canvas, btn.firstChild);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const spacing = 4, dot = 2;
  let cols = 0, rows = 0, noise: number[][] = [];
  function resize() {
    const r = btn.getBoundingClientRect();
    if (!r.width || !r.height) return;
    canvas.width = Math.round(r.width);
    canvas.height = Math.round(r.height);
    cols = Math.ceil(canvas.width / spacing);
    rows = Math.ceil(canvas.height / spacing);
    noise = [];
    for (let y = 0; y < rows; y++) {
      noise[y] = [];
      for (let x = 0; x < cols; x++) {
        const bias = 1 - y / Math.max(1, rows - 1);
        noise[y][x] = bias * 0.55 + Math.random() * 0.55;
      }
    }
    draw();
  }
  try { new ResizeObserver(resize).observe(btn); } catch (e) { /* no RO */ }
  window.addEventListener('resize', resize);
  requestAnimationFrame(resize);
  let progress = 0, target = 0, raf: number | null = null, last = 0;
  function tick(t: number) {
    if (!last) last = t;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    progress += (target - progress) * Math.min(1, dt * 8);
    if (Math.abs(target - progress) < 0.003) progress = target;
    draw();
    if (progress !== target) { raf = requestAnimationFrame(tick); }
    else { raf = null; last = 0; if (target === 1) flickerLoop(); }
  }
  function flickerLoop() {
    requestAnimationFrame(function step() {
      if (target !== 1) return;
      draw(true);
      setTimeout(() => requestAnimationFrame(step), 120);
    });
  }
  function draw(flicker = false) {
    if (!canvas.width || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    const threshold = progress * 1.3;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const n = noise[y][x];
        if (n < threshold) {
          if (flicker && target === 1 && Math.random() < 0.015) continue;
          const edge = threshold - n;
          if (edge < 0.08 && Math.random() < 0.45) continue;
          ctx.fillRect(x * spacing, y * spacing, dot, dot);
        }
      }
    }
  }
  btn.addEventListener('mouseenter', () => { target = 1; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } });
  btn.addEventListener('mouseleave', () => { target = 0; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } });
}

export function pixelize(root: HTMLElement) {
  /* an island still carrying `ssr` has not hydrated: leave it to a later call */
  const hydrated = (b: Element) => { const i = b.closest('astro-island'); return !i || !i.hasAttribute('ssr'); };
  root.querySelectorAll<PixelBtn>('.hero-btn-primary').forEach((b) => hydrated(b) && attach(b, '#0a5aa8'));
  root.querySelectorAll<PixelBtn>('.hero-btn-ghost').forEach((b) => hydrated(b) && attach(b, 'rgba(255,255,255,0.18)'));
  root.querySelectorAll<PixelBtn>('.hero-cta-button').forEach((b) => hydrated(b) && attach(b, '#0a5aa8')); /* the form submits (the sandbox's shared script covers them; section-page.js does not) */
}
""")

(SEC / 'HomePage.tsx').write_text('''import { useEffect, useRef } from 'react';
import { HomeCopyProvider, type HomeProps } from './copy';
import { pixelize } from './app/pixelize';
import { Hero } from './app/components/Hero';
import { FooterZone } from './app/components/Sections';
import { Closing, Enterprise, Showcase, Stats, Steps, Stories, TemplatesHome, UseCases } from './app/components/Home';

/* The home page as one section (generated by the sandbox's
   tools/port-home-section.py — edit home/src there, not here). The site
   chrome (nav + footer) comes from BuiltPage; the closing band at the foot
   expects the dark footer pulled up onto it (BuiltPage keys darkFooter on
   this section type). */
export default function HomePage(props: HomeProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    /* belt and braces for the inline stamp in index.astro (client-side
       navigations, the builder canvas) */
    document.documentElement.dataset.variant = 'e';
    /* the pixel-fill hover, after hydration (see index.astro). The nav's CTA
       too: its island hydrates in a React transition that this page's heavy
       island pushes past section-page.js's wait, so it is flagged there and
       taken here, once everything has settled. */
    if (root.current) pixelize(root.current);
    const nav = document.querySelector<HTMLElement>('.mkt-nav');
    const later = () => { if (nav) pixelize(nav); };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(later, { timeout: 1500 }); else window.setTimeout(later, 600);
  }, []);
  return (
    <HomeCopyProvider value={props}>
      <div className="hm-root" ref={root}>
        <Hero />
        <Showcase />
        <Stats />
        <UseCases />
        <Stories />
        <Steps />
        <TemplatesHome />
        <Enterprise />
        <FooterZone>
          <Closing />
        </FooterZone>
      </div>
    </HomeCopyProvider>
  );
}
''')

(SEC / 'meta.ts').write_text('''import { z } from 'zod';
import type { SectionMeta } from '../types';

/* The new bolt.new home page as one section (the Enterprise sandbox's
   home/ app, ported by tools/port-home-section.py there). First use:
   /lp/home for the organic-traffic test (Alberto, 2026-11-16). One per page:
   it is the whole page, closing band included.

   Every block is optional: an empty field or an empty list renders the
   reviewed copy (app/home.ts); a filled list replaces the reviewed one. */
export const meta: SectionMeta = {
  label: 'Home page (full)',
  category: 'Hero',
  theme: 'classic',
  maxPerPage: 1,
};

const text = (help: string) => z.string().describe(`help: ${help}`).optional();
const long = (help: string) => z.string().describe(`multiline help: ${help}`).optional();
const image = (help: string) => z.string().describe(`image help: ${help}`).optional();
const header = (what: string) => ({
  eyebrow: text(`The small blue label above the headline. Empty = the reviewed ${what} eyebrow.`),
  title: text(`The headline. Empty = the reviewed ${what} headline.`),
  subtitle: long(`The line under the headline. Empty = the reviewed one.`),
});

export const propsSchema = z.object({
  /* ── hero ── */
  titleSerif: z.string().describe('help: The serif first line of the headline. Empty = "Describe it."').optional(),
  titleSans: z.string().describe('help: The second line. Empty = "Bolt builds it."').optional(),
  promptExamples: z
    .array(z.string())
    .default([])
    .describe('help: The example prompts typed into the box, in order. Empty = the reviewed three.'),
  promptCta: z.string().describe('help: The submit button label. Empty = "Build now".').optional(),
  promptUrl: z
    .string()
    .describe('help: Where the submit button sends the prompt. Query params are kept (?get_started=1 opens the sign-up box); the prompt is added for you. Empty = https://bolt.new/?get_started=1')
    .optional(),

  /* ── showcase: the coverflow under the hero ── */
  showcase: z
    .array(
      z.object({
        prompt: long('The prompt that built it, shown on the card ("An online store for my soda brand…").'),
        tag: text('The kind of app, in the card\\'s corner ("Retail").'),
        name: text('A short name, read out by screen readers on the dots ("Soda Shop").'),
        image: image('A landscape screenshot of the finished site (about 1200×750).'),
        openUrl: text('The "Open in Bolt" link: https://bolt.new/fork/<id>.'),
        previewUrl: text('The "Preview" link to the live site. Empty = no Preview button.'),
      }),
    )
    .default([])
    .describe('help: The cards in the coverflow, in order. Any list here replaces the reviewed ten; a card needs a prompt, an image and an Open link to show.'),

  /* ── stats ── */
  stats: z
    .array(z.object({ value: text('The big number ("10M+").'), label: text('The line under it ("builders on Bolt.new").') }))
    .default([])
    .describe('help: Three read best. Empty = the reviewed three.'),

  /* ── build anything ── */
  useCases: z
    .object({
      ...header('"Build anything"'),
      moreLabel: text('The bordered button under the grid. Empty = "See all use cases".'),
      moreHref: text('Where it goes. Empty = bolt.new/use-cases.'),
      items: z
        .array(
          z.object({
            tag: text('The glass pill in the corner ("Landscaping").'),
            title: text('The card title ("Take quote requests with photos").'),
            body: long('One line under the title.'),
            image: image('The photo that fills the card (portrait or square, about 900px).'),
            focus: text('Which part of the photo to keep in view, as CSS object-position ("50% 30%"). Empty = 50% 30%.'),
            href: text('Where the card links. Empty = the "See all" link.'),
          }),
        )
        .default([])
        .describe('help: The first card is the large one; one feature + four standard cards fills the grid exactly. A card needs a title and an image.'),
    })
    .default({}),

  /* ── customer stories ── */
  stories: z
    .object({
      ...header('"Customer stories"'),
      items: z
        .array(
          z.object({
            quote: long('The quote, without quotation marks (they are added).'),
            name: text('Who said it ("Paul Laviolette").'),
            role: text('Role and company ("Founder, TradeWeave") — the company name is also the fallback initial when there is no logo.'),
            logo: image('The company mark, square (96×96). Empty = an initial.'),
            plate: z.boolean().default(false).describe('help: Give a dark logo a white plate in dark mode.'),
          }),
        )
        .default([])
        .describe('help: The rail of quote cards. A card needs a quote and a name.'),
    })
    .default({}),

  /* ── how it works ── */
  steps: z
    .object({
      ...header('"How it works"'),
      items: z
        .array(
          z.object({
            title: text('The step\\'s one-line header ("Explain in your own words").'),
            body: long('The line that shows while the step is open.'),
            visual: z
              .enum(['prompt', 'build', 'wired', 'secure', 'deploy'])
              .default('prompt')
              .describe('help: Which animated scene plays beside the step: prompt (typing), build (the app assembling), wired (backend connecting), secure (the security check), deploy (publish).'),
          }),
        )
        .default([])
        .describe('help: Five steps, each with one of the five scenes. Empty = the reviewed five.'),
    })
    .default({}),

  /* ── templates ── */
  templates: z
    .object({
      ...header('"Templates"'),
      moreLabel: text('The bordered button under the rail. Empty = "Browse all templates".'),
      moreHref: text('Where it goes. Empty = bolt.new/resources/templates.'),
      items: z
        .array(
          z.object({
            name: text('The template name ("Architect Portfolio").'),
            tag: text('The category ("Portfolio").'),
            image: image('A full-page capture, portrait, 800px wide — it drifts up on hover.'),
            openUrl: text('The "Open in Bolt" link: https://bolt.new/fork/<id>.'),
            previewUrl: text('The "Preview" link to the live template. Empty = no Preview button.'),
          }),
        )
        .default([])
        .describe('help: The scrolling rail of template cards. A card needs a name, an image and an Open link.'),
    })
    .default({}),

  /* ── enterprise band ── */
  enterprise: z
    .object({
      eyebrow: text('Empty = "For enterprise".'),
      title: text('Empty = "Bolt works for teams".'),
      body: long('The line under the headline.'),
      features: z
        .array(
          z.object({
            icon: z.enum(['users', 'list', 'shield', 'cloud', 'chat', 'key']).default('users').describe('help: The small line icon on the cell.'),
            title: text('The cell title ("Customize your plan").'),
            body: long('One or two lines under it.'),
          }),
        )
        .default([])
        .describe('help: The numbered cells. Five fills the grid. Empty = the reviewed five.'),
      logosLabel: text('The small line above the logo train. Empty = "Trusted by teams shipping with AI".'),
      logos: z
        .array(z.object({ image: image('A wordmark SVG with WHITE artwork (shown dark in light mode, white in dark mode).'), name: text('Company name, for screen readers.') }))
        .default([])
        .describe('help: The logo train. Empty = the reviewed six.'),
      panelKicker: text('The small label on the 1:1 panel. Empty = "Talk to us".'),
      stripLead: text('The panel\\'s lead line. Empty = "Schedule a 1:1".'),
      panelNote: long('The note under the lead.'),
      stripPlaceholder: text('The email field\\'s placeholder. Empty = "Your work email".'),
      stripCta: text('The submit button. Empty = "Book a 1:1".'),
    })
    .default({}),

  /* ── closing band ── */
  closing: z
    .object({
      eyebrow: text('Empty = "Start building".'),
      title: text('Empty = "Try Bolt now". The prompt box under it is the hero\\'s.'),
    })
    .default({}),
});

export const previewProps = {
  titleSerif: 'Describe it.',
  titleSans: 'Bolt builds it.',
  promptExamples: ['Create a client dashboard for my design studio that includes files and messaging'],
  promptCta: 'Build now',
  promptUrl: 'https://bolt.new/?get_started=1',
};
''')

(SEC / 'index.astro').write_text('''---
// Home page (full) — the sandbox home app as one React island. See meta.ts.
import HomePage from './HomePage';
import './styles.css';

import type { z } from 'zod';
import { propsSchema } from './meta';

type Props = z.input<typeof propsSchema>;
const props = Astro.props;
---

{/* the page's variant hook (html[data-variant="e"]) before the island paints:
    the stylesheet keys the showcase + closing band on it */}
<script is:inline>document.documentElement.setAttribute('data-variant', 'e');</script>
<HomePage client:load {...props} />
{/* section-page.js pixelizes every .hero-btn-* at parse time; inside this
    island that lands BEFORE React has hydrated (its ssr-attribute wait fires
    too early for a big tree) and React then sees a <canvas> it never rendered
    (hydration mismatch, the subtree re-renders). Flag the island's buttons as
    taken here; HomePage pixelizes them itself once mounted. */}
<script is:inline>document.querySelectorAll('.hm-root .hero-btn-primary, .hm-root .hero-btn-ghost, .mkt-nav .hero-btn-primary').forEach(function (b) { b.__pixelized = true; });</script>
''')

# ───────────────────────── 2. the stylesheet, scoped ──────────────────────
css = (SRC / 'styles/page.css').read_text()

def parse(src):
    items, i, n = [], 0, len(src)
    while i < n:
        j = src.find('{', i)
        if j == -1: break
        head = src[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if src[k] == '{': depth += 1
            elif src[k] == '}': depth -= 1
            k += 1
        items.append((head, src[j + 1:k - 1])); i = k
    return items

DROP = re.compile(r'\.home-chrome|\.sc-theme-switch|\.hm-variant-switch|mkt-nav|\[data-fx|\.site-footer-divider|^main$|~ main$')
ELEMENT = re.compile(r'^(h1|h2|h3|h4|p|a|img|svg|button|ul|ol|li)$')

def scope(sel, drop_root=False):
    sel = sel.strip()
    if sel == 'html' or sel == 'body': return None
    if sel == 'html body': return PFX
    if sel.startswith(':root') and ' ' not in sel: return None if drop_root else PFX   # :root { --tokens }: page.css keeps its own, shared's are production's sc-tokens.css
    m = re.match(r'^(:root(?:\[[^\]]+\]|:not\([^)]*\))?|html\[data-variant="[a-e]"\]|html\[data-theme="[a-z]+"\]|html)\s+(.*)$', sel)
    if m: return f'{m.group(1)} {PFX} {m.group(2)}'
    if ELEMENT.match(sel): return f'{PFX} {sel}'
    return f'{PFX} {sel}'

def emit(items, depth=0, drop_root=False):
    out = []
    for head, body in items:
        h = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()
        if h.startswith('@keyframes') or h.startswith('@property') or h.startswith('@font-face'):
            out.append(f'{h} {{{body}}}'); continue
        if h.startswith('@media') or h.startswith('@supports') or h.startswith('@container'):
            inner = emit(parse(body), depth + 1, drop_root)
            if inner.strip(): out.append(f'{h} {{\n{inner}\n}}')
            continue
        if h.startswith('@') or not h: continue
        sels = []
        for s in h.split(','):
            s = s.strip()
            if not s or DROP.search(s): continue
            sc = scope(s, drop_root)
            if sc: sels.append(sc)
        if not sels: continue
        out.append(', '.join(sels) + ' {' + body + '}')
    return '\n'.join(out)

strip = lambda t: re.sub(r'/\*.*?\*/', lambda m: m.group(0) if '\n' not in m.group(0) and len(m.group(0)) < 200 else '', t, flags=re.S)
scoped = emit(parse(strip(css)))
# the sandbox loads shared-components.css LAST (it wins the cascade: section
# headers, H2 canon, buttons, FAQ); same order here, scoped, tokens dropped
shared = emit(parse(strip((SRC / 'styles/shared-components.css').read_text())), drop_root=True)

PAGE = '.use-case-page.use-case-page:has(.hm-root)'   # the built page that carries this section (any path)
NAV_AT_REST = PAGE + ' .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open)'
TAIL = f'''
/* ═══ Page plumbing (hand-written) ═══════════════════════════════════════ */
/* the section is the whole page: no gutter above/below from the built-page shell */
.hm-root {{ display: block; }}
/* the page skips the builder light kit (src/lib/builder/light-kit.ts), so the
   over-hero nav chrome the kit supplies is restated here — the same block the
   hand-ported route sheets carry (use-case-route.css "Chrome + route plumbing") */
{PAGE} {{ --sc-nav-overlap: 69px; line-height: normal; }}
{PAGE} .mkt-nav-shell {{ margin-bottom: calc(-1 * var(--sc-nav-overlap, 68px)); }}
html[data-theme="light"] {NAV_AT_REST} {{ background: var(--sc-nav-over-bg); border-bottom-color: var(--sc-nav-over-hairline); -webkit-backdrop-filter: var(--sc-nav-over-blur); backdrop-filter: var(--sc-nav-over-blur); }}
html[data-theme="light"] {NAV_AT_REST} .mkt-nav-link, html[data-theme="light"] {NAV_AT_REST} .mkt-nav-signin {{ color: var(--sc-nav-over-ink); }}
html[data-theme="light"] {NAV_AT_REST} .mkt-nav-link:hover, html[data-theme="light"] {NAV_AT_REST} .mkt-nav-link.is-open, html[data-theme="light"] {NAV_AT_REST} .mkt-nav-link[data-state="open"] {{ color: var(--sc-nav-over-ink-hover); background: var(--sc-nav-over-ink-hover-bg); }}
html[data-theme="light"] {NAV_AT_REST} .mkt-nav-signin:hover {{ color: var(--sc-nav-over-ink-hover); }}
html[data-theme="light"] {NAV_AT_REST} .mkt-nav-logo svg path {{ fill: var(--sc-nav-over-logo); }}
html[data-theme="light"] {NAV_AT_REST} .mkt-nav-burger span {{ background: var(--sc-nav-over-logo); }}
{PAGE} .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded).is-scrolled:not(.has-menu-open) {{ background: var(--sc-nav-over-bg-scrolled); -webkit-backdrop-filter: none; backdrop-filter: none; }}
html {PAGE} .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded).has-menu-open {{ background: var(--sc-nav-bg-solid); -webkit-backdrop-filter: none; backdrop-filter: none; }}
{PAGE} .mkt-nav {{ transition: background-color 0.12s ease; }}
{PAGE} .mkt-nav-logo svg path {{ transition: fill 0.12s ease; }}
/* every section's styles.css is bundled into every built page, and the
   closing-band section (derived from this home) shares class names with it:
   its `.hm-closing {{ display: flex; align-items: center }}` shrank the prompt box
   to its content on phones. The home's closing is a plain block. */
{PFX} .hm-closing {{ display: block; }}
/* the dark site footer is pulled 670px up onto the closing band's floor, as on
   the sandbox home (its .home-chrome rules) — BuiltPage sets Footer dark for
   this section, marketing-nav-footer.css paints it black, this does the pull */
.site-footer.site-footer--dark {{ position: relative; z-index: 3; margin-top: -670px; border-top: 0; background: linear-gradient(to bottom, transparent 0, transparent 150px, #000 420px) !important; }}
@media (max-width: 768px) {{ .site-footer.site-footer--dark {{ margin-top: -610px; }} }}
.site-footer.site-footer--dark .site-footer-label {{ color: rgba(255, 255, 255, 0.55) !important; }}
.site-footer.site-footer--dark .site-footer-links a {{ color: rgba(255, 255, 255, 0.82) !important; }}
.site-footer.site-footer--dark .site-footer-links a:hover {{ color: #fff !important; }}
.site-footer.site-footer--dark .site-footer-social a {{ background: rgba(255, 255, 255, 0.08) !important; color: rgba(255, 255, 255, 0.85) !important; }}
'''
(SEC / 'styles.css').write_text(
    '/* GENERATED from the Enterprise sandbox home/src/styles/page.css by\n'
    '   tools/port-home-section.py — every rule scoped under .hm-root. Do not\n'
    '   hand-edit: change the sandbox and re-run. */\n' + scoped + '\n\n/* ── shared-components.css (the sandbox canon), scoped the same way ── */\n' + shared + '\n' + TAIL)

# ───────────────────────── 3. assets ──────────────────────────────────────
refs = set()
for f in list((SRC / 'components').glob('*.tsx')) + [SRC / 'home.ts', SRC / 'config.ts']:
    refs.update(re.findall(r"asset\('(/[^']+)'\)", f.read_text()))
for name in re.findall(r'BgVideo name="([a-z-]+)"', '\n'.join(p.read_text() for p in (SRC / 'components').glob('*.tsx'))):
    refs.update({f'/hero/{name}.webm', f'/hero/{name}.mp4', f'/hero/{name}-poster.jpg'})
for n in range(1, 6):
    refs.update({f'/story/grad-{n}.webp', f'/story/grad-light-{n}.webp'})
refs = {r for r in refs if not r.startswith('/footer/')}   # the site footer is production's
copied = 0
for r in sorted(refs):
    s = HOME / 'public' / r.lstrip('/')
    if not s.exists():
        print(f'  (missing in sandbox, skipped) {r}'); continue
    d = ASSETS / r.lstrip('/')
    d.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(s, d); copied += 1

# ───────────────────────── 4. the page + stub + footer hook ───────────────
page = DEST / 'src/content/pages/lp-home.json'
if not page.exists():
    page.write_text('''{
  "internalName": "Home page test (/lp/home)",
  "title": "Bolt.new — Describe it. Bolt builds it.",
  "metaDescription": "Describe your idea in your own words and get a real website or app you can publish today. No code. No developer.",
  "ogImage": "/public-page-assets/og-image-default-centred.jpg",
  "path": "/lp/home",
  "theme": "classic",
  "colorScheme": "light",
  "noindex": true,
  "draft": false,
  "sections": [
    {
      "type": "home-page",
      "id": "s-home",
      "hidden": false,
      "props": {
        "titleSerif": "",
        "titleSans": "",
        "promptExamples": [],
        "promptCta": "",
        "promptUrl": ""
      }
    }
  ],
  "tags": ["lp", "home"]
}
''')
stub = DEST / 'src/pages/lp/home.astro'
stub.parent.mkdir(parents=True, exist_ok=True)
stub.write_text('''---
// @cms-builder-page:lp-home — generated by the CMS page builder. Do not
// edit; the page is defined in src/content/pages/lp-home.json (edit via
// `npm run cms`). Nothing may render around <BuiltPage> — it owns the
// response status and headers.
export const prerender = false;
import BuiltPage from "src/components/builder/BuiltPage.astro";
---

<BuiltPage pageId="lp-home" />
''')

# the page ships its own full design (page.css + shared), so it skips the
# builder light kit like the other hand-ported pages
lk = DEST / 'src/lib/builder/light-kit.ts'
t = lk.read_text()
if "'lp-home'" not in t:
    t = t.replace("  'glossary',\n];", "  'glossary',\n  'lp-home', // the home page as one section: its own design, see src/sections/home-page\n];")
    assert "'lp-home'" in t, 'light-kit.ts list not found'
    lk.write_text(t)

bp = DEST / 'src/components/builder/BuiltPage.astro'
t = bp.read_text()
old = "const darkFooter = prepared.some((sec) => sec.ok && sec.type === 'closing-band');"
new = "const darkFooter = prepared.some((sec) => sec.ok && (sec.type === 'closing-band' || sec.type === 'home-page'));"
if old in t:
    bp.write_text(t.replace(old, new))
elif new not in t:
    sys.exit('port-home-section: BuiltPage darkFooter line not found')
# the CMS builder canvas makes the same decision for its preview (else editing
# lp-home previews a light footer without the pull-up)
cr = DEST / 'src/pages/solutions/cms-builder-render.astro'
t = cr.read_text()
old_cr = "sec.ok && sec.type === 'closing-band');"   # (the canvas types its callback param, so match the tail only)
new_cr = "sec.ok && (sec.type === 'closing-band' || sec.type === 'home-page'));"
if old_cr in t:
    cr.write_text(t.replace(old_cr, new_cr))
elif new_cr not in t:
    sys.exit('port-home-section: cms-builder-render darkFooter line not found')

# the hosted CMS worker bundles a static barrel of every meta.ts (CI fails on a stale one)
import subprocess
subprocess.run(['node', 'scripts/gen-section-registry.mjs'], cwd=DEST, check=False)

print(f'home-page section written to {SEC}; {copied} assets → {ASSETS}')
