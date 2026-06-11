# Enterprise Marketing Pages — Design Standards

## Reference: bolt.new/enterprise (canonical source of truth)

Extracted directly from the live site. All marketing pages should align with these patterns.

### Typography (from bolt.new/enterprise)
| Element | Size | Weight | Color | Line Height | Letter Spacing |
|---------|------|--------|-------|-------------|----------------|
| H1 | `66px` | `500` | `#fff` | `1.1` | `normal` |
| H2 | `52px` | `500` | `#fff` | `1.2` | `-1px` |
| H3 | `varies` | `500` | `#fff` | `1.2` | `-1px` |
| Font family | Inter, sans-serif | — | — | — | — |

### Buttons (from bolt.new/enterprise)
| Type | Height | Padding | Font size | Weight | Background | Border radius |
|------|--------|---------|-----------|--------|------------|---------------|
| Primary CTA | `~37px` | `8px 12px` | `14px` | `500` | `#1488FC` | `6px` |
| Form submit | `52px` | `0 24px` | `16px` | `600` | `#0f6fd0` | `0 2px 2px 0` |

---

## Our Marketing Page Button Standards

**Canonical source:** `marketing/shared-components.css` — edit button styling there, not per-page.

All buttons must use these exact specs. No inline overrides unless absolutely necessary.

### Primary Blue Button (`.hero-btn-primary`)
- **Height:** `52px`
- **Padding:** `0 28px`
- **Font size:** `15px`
- **Font weight:** `600`
- **Background:** `#1488FC`
- **Hover background:** `#0f6fd0` (via `.btn-bg-hover` slide-up layer)
- **Border radius:** `2px`
- **Color:** `#fff`
- **Hover animation:** Pixel-fill canvas effect (JS in `shared-components.js`). When `.btn-pixelized` class is applied by JS, the slide-up `.btn-bg-hover` is disabled and replaced with an animated pixel dot fill. Always include the `.btn-bg-hover` / `.btn-text-wrap` / `.btn-text-inner` HTML structure as a CSS-only fallback.

```html
<a href="…" class="hero-btn-primary">
  <div class="btn-bg-hover"></div>
  <div class="btn-text-wrap">
    <div class="btn-text-inner">
      <span>Button Label</span>
      <span>Button Label</span>
    </div>
  </div>
</a>
```

### Ghost Button (`.hero-btn-ghost`)
- **Height:** `52px`
- **Padding:** `0 28px`
- **Font size:** `15px`
- **Font weight:** `500`
- **Background:** `transparent`
- **Border:** `1px solid rgba(255,255,255,0.22)`
- **Hover border:** `1px solid rgba(255,255,255,0.4)`
- **Border radius:** `2px`
- **Color:** `rgba(255,255,255,0.8)`
- **Hover color:** `#fff`
- Also receives pixel-fill canvas effect from JS.

### Form Submit Button (`.hero-cta-button` / inline form combos)
- **Height:** `52px`
- **Padding:** `0 28px`
- **Font size:** `15px`
- **Font weight:** `600`
- **Background:** `#1488FC`
- **Hover background:** `#0f6fd0`
- **Border radius:** `0 2px 2px 0` (right side only, attached to input)

### Mobile (max-width: 768px)
- Height scales to `44px`
- Padding scales to `0 18px`
- Font size scales to `14px`
- Apply to: `.hero-btn-primary`, `.hero-btn-ghost`, `.hero-cta-button`, and form input height

---

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary blue | `#1488FC` | Button backgrounds |
| Hover blue | `#0f6fd0` | Button hover states, form submits |
| Brand blue | `#1488FC` | Eyebrows, labels, icons, badges, cursors |
| Body text | `#ABABAB` | Subtitles, secondary text |
| Muted text | `rgba(255,255,255,0.55)` | Descriptions, card text |
| Background | `#000` | Page background |
| Card background | `#111` | Card/panel backgrounds |

**Eyebrow color is always `#1488FC` — never use `rgba(20,136,252,0.7)` or any opacity variant.**

---

## Typography

| Element | Size | Weight | Color | Line Height |
|---------|------|--------|-------|-------------|
| Hero H1 | `66px` desktop / `51px` tablet (≤1024px) / `clamp(36px, 6.5vw, 51px)` mobile (≤768px) | `500` | `#fff` | `1.1` | `normal` (not `-1px` — that is H2 only) |
| Hero subtitle | `clamp(16px, 1.4vw, 20px)` desktop / `18px` tablet (≤1024px) / `16px` mobile (≤768px) | `400` | `#ABABAB` | `1.4` | — |
| Section headline (H2) | `clamp(32px, 4vw, 52px)` | `500` | `#fff` | `1.2` | `-1px` |
| Section subtitle | `clamp(15px, 1.1vw, 17px)` desktop / `16px` tablet / `15px` mobile | `400` | `rgba(255,255,255,0.5)` | `1.65` | — |
| Eyebrow | `16px` desktop / `13px` tablet+mobile | `400` | `#1488FC` | — | `2px` letter-spacing, `uppercase` |
| Card title | `18px` | `600` | `#fff` | `1.35` | `-0.2px` |
| Body/description | `14–15px` | `400` | `rgba(255,255,255,0.55)` | `1.55–1.65` | — |
| FAQ question | `18px` desktop / `17px` ≤1024px / `16px` ≤768px | `500` | `rgba(255,255,255,0.7)` default / `#fff` when open | — | — |
| FAQ answer | `15px` desktop / `13px` ≤768px | `400` | `rgba(255,255,255,0.65)` | `1.7` | — |
| Success pull-quote | `26px` | `300` | `#EDDCC6` (warm beige) | `1.55` | not italic |
| Stat number | `72px` | `300` | `#fff` | `0.85` | `-3px` |

---

## Global Spacing Standards (from bolt.new/enterprise)

### Section Vertical Padding
| Breakpoint | Section padding |
|------------|----------------|
| Desktop (>1024px) | `clamp(80px, 12vh, 140px) 0` |
| Tablet (≤1024px) | `64px 0` |
| Mobile (≤768px) | `40–48px 0` |

### Horizontal Padding (inner containers)
| Breakpoint | Value |
|------------|-------|
| Desktop | `min(1120px, calc(100vw - 160px))` — 80px each side |
| Tablet (≤1024px) | `min(900px, calc(100vw - 80px))` — 40px each side |
| Mobile (≤768px) | `calc(100vw - 32px)` — **16px each side** (matches enterprise `px-4`) |

**Never use less than 16px horizontal padding on any breakpoint.**

---

## FAQ Section Standards

**Canonical source:** `marketing/shared-components.css` + `marketing/shared-components.js`

### Structure
- Use `<div>` for `.ms-faq-list` and `.ms-faq-item` — **never `<ul>/<li>`** (causes browser bullet dots)
- Eyebrow + H2 always wrapped in `.dsa-reveal` for scroll animation
- H2 class: `ms-faq-headline` — `clamp(32px, 4vw, 52px)`, weight `500`, letter-spacing `-1px`
- Section needs `position: relative; overflow: hidden` for the pixel canvas

### Icon
SVG plus/minus — **not a text character**. Use two SVGs with opacity+transform transitions:
```html
<span class="ms-faq-icon">
  <svg class="ms-faq-icon-plus" width="10" height="10" viewBox="0 0 10 10" fill="none">
    <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
  <svg class="ms-faq-icon-minus" width="10" height="10" viewBox="0 0 10 10" fill="none">
    <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</span>
```
- `.ms-faq-icon` color is `#1488FC` (always brand blue)
- Default: plus visible, minus hidden (`opacity: 0; transform: rotate(-90deg)`)
- Open: plus fades out (`opacity: 0; transform: rotate(90deg)`), minus fades in (`opacity: 1; transform: rotate(0deg)`)

### Accordion expand
Uses `grid-template-rows: 0fr → 1fr` CSS transition — **not `max-height` JS**:
```css
.ms-faq-a { display: grid; grid-template-rows: 0fr; overflow: hidden; transition: grid-template-rows 0.38s cubic-bezier(0.4,0,0.2,1); }
.ms-faq-item.is-open .ms-faq-a { grid-template-rows: 1fr; }
.ms-faq-a-inner { overflow: hidden; padding: 0 16px; }
.ms-faq-item.is-open .ms-faq-a-inner { padding-bottom: 24px; }
```
Accordion JS only toggles `.is-open` class — no `style.maxHeight` manipulation.

### Open state
- Item background: `rgba(20,136,252,0.03)` — subtle blue tint
- Question text: `rgba(255,255,255,0.7)` default → `#fff` when open

### Pixel canvases
Two layers:
1. **Section-level `#faq-pixel-canvas`** — always animating, anchored below section (`cy = H * 1.22`), breathing + ripple wave, `SPACING = 9`. Color: **brand blue `rgba(20,136,252, op)`** for marketing pages. Do NOT use the salmon→mint→blue gradient — that is bolt.conf branding only.
2. **Per-item `.ms-faq-open-canvas`** (from `shared-components.js`) — fades in when item is open (`opacity: 0 → 1`, `transition: 0.5s ease`). Animated rotating wave pattern, horizontal right-side fade, dots `rgba(180,185,195,...)`, each item has `phase: idx * 1.7` offset.

### Typography
| Element | Value |
|---------|-------|
| Question font-size | `18px` desktop / `17px` ≤1024px / `16px` ≤768px |
| Question padding | `28px 16px` desktop / `22px 0` ≤768px |
| Answer font-size | `15px` desktop / `13px` ≤768px |
| Answer color | `rgba(255,255,255,0.65)` |
| Answer line-height | `1.7` |

---

## Shared Components

**`marketing/shared-components.css`** and **`marketing/shared-components.js`** are the canonical source of truth for:
- All button CSS (`.hero-btn-primary`, `.hero-btn-ghost`, `.hero-cta-button`)
- All eyebrow CSS (`.section-eyebrow`, `.feat-eyebrow`, `.ms-faq-eyebrow`, `.footer-eyebrow`, `.success-eyebrow`)
- Complete FAQ component CSS + accordion expand behavior
- FAQ per-item pixel canvas animation

Always link these on any new marketing page:
```html
<link rel="stylesheet" href="../marketing/shared-components.css">
<script src="../marketing/shared-components.js"></script>
```

---

## Cards

### Standard Stack Card
```css
border: 1px solid rgba(255,255,255,0.10);
border-radius: 4px;
padding: 24px 24px 28px;
background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%);
transition: border-color 0.3s ease;
/* hover */
border-color: rgba(255,255,255,0.22);
```
- Card title: `18px`, weight `600`, `#fff`, `line-height: 1.35`, `letter-spacing: -0.2px`
- Card description: `14px`, `rgba(255,255,255,0.55)`, `line-height: 1.55`
- Icon container: `44px × 44px`, `border-radius: 4px`, `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.08)`, SVG icons `20px × 20px`

### Tiled Deploy Grid
For a seamless grid with shared borders (no `gap`):
```css
.deploy-grid { border: 1px solid rgba(255,255,255,0.10); border-radius: 4px; overflow: hidden; }
.deploy-cell { border-right: 1px solid rgba(255,255,255,0.10); border-bottom: 1px solid rgba(255,255,255,0.10); }
.deploy-cell:nth-child(3n) { border-right: none; }
.deploy-cell:nth-last-child(-n+3) { border-bottom: none; }
```

---

## Scroll Animations
- **Word-reveal:** `.dsa-reveal` is a CONTAINER wrapping the H1/H2. **Never place `.dsa-reveal` directly on an H1/H2 element** — the JS uses `querySelectorAll('h1,h2')` on the container to wrap words. JS auto-wraps words in `.word` spans when the container scrolls into view.
- **Above-fold rule:** Hero H1s are above the fold — do NOT wrap them in `.dsa-reveal`. The blur animation is for scroll-triggered sections only. Reference pages (microsoft.html, bolt-cli.html) never use `.dsa-reveal` on the hero headline.
- **Eyebrow scramble:** `.eyebrow-scramble` class triggers letter scramble on scroll. Apply to ALL eyebrows including hero eyebrow, success eyebrow, footer eyebrow.
- **How It Works line:** `.how-steps-wrap` → `.line-active` class triggers node + text animations

---

## Reference: pricing.html (extracted from live page)

### Pricing Page Buttons
| Type | Height | Padding | Font size | Weight | Background | Border radius |
|------|--------|---------|-----------|--------|------------|---------------|
| Plan CTA (`.cta-primary`) | `42px` | `0` | `14px` | `500` | `#1488FC` | `2px` |
| Nav "Get Started" | `~37px` | `8px 12px` | `14px` | `500` | `#1488FC` | `6px` |
| Form submit | `52px` | `0 24px` | `16px` | `600` | `#0f6fd0` | `0 2px 2px 0` |
| Toggle (Yearly/Monthly) | `~26px` | `5px 22px` | `13px` | `500` | `#fff` | `999px` |

**Note:** Pricing plan buttons intentionally use `42px` height — they sit inside plan cards and are a different context from hero CTAs. Do not "fix" these to 52px.

### Pricing Page Eyebrows
- Color: `#1488FC` ✓ — consistent with brand standard

### Pricing Page Typography
- Matches bolt.new/enterprise: H1 `66px` weight `500`, H2 `52px` weight `500` letter-spacing `-1px`

---

## Pages
- `marketing/microsoft.html` — Microsoft Teams & Copilot landing page (ported to company repo `stackblitz/bolt-public-pages`, PR #54)
- `marketing/bolt-cli.html` — Bolt CLI landing page (ported to company repo `stackblitz/bolt-public-pages`, PR #54)
- `marketing/pricing.html` — Pricing page. **Canonical/correct version, NOT live yet (pending approval).** Its own track; will get its own port + PR when approved.
- `marketing/platform.html` — Platform overview (prototype)
- `marketing/shared-components.css` — **Canonical component CSS** (buttons, eyebrows, FAQ). Wins the cascade — linked at end of `<body>`. Edit here, not per-page.
- `marketing/shared-components.js` — **Canonical component JS** (FAQ per-item pixel canvas animation). Linked at end of `<body>`.
- `solutions/ai-for-real-estate/index.html` — AI for Real Estate solutions landing page. First solutions vertical page — template for future `/solutions/*` pages.
- `bolt.conf/index.html` — Bolt Conf event landing page — **Conference style** (keep in its own folder, separate from marketing)

### Solutions Page Template
`solutions/ai-for-real-estate/index.html` establishes the pattern for `/solutions/*` pages. **Self-contained: all CSS/JS is inlined (duplicated verbatim from `shared-components.*`), NOT linked** — this page deliberately does not `<link>` the shared files (edit inline here). Customer story pull-quote: `font-family: 'Cormorant Garamond', serif`, `26px`, `weight 300`, `color: #EDDCC6`, `font-style: normal`.

**Hero — centered "enterprise" variant (current).** This page now uses the **centered** enterprise-style hero, NOT the original left-aligned solutions hero:
- `height: 100vh`; `.hero-inner` is `flex-direction: column; align-items: center; max-width: 820px`.
- H1 `66px` weight `500` `line-height 1.1` `letter-spacing: normal`, **centered, `white-space: nowrap` on desktop** (one line) → `white-space: normal` at ≤1024px. Subtitle centered.
- Centered **video card** (`max-width: 820px`): poster image + canonical `.hero-play-btn` overlay (56px circle, exact microsoft.html spec) → opens a `.video-modal` that injects a **tella embed iframe** (`data-tella="<slug>"`, built on open, cleared on close). Modal `-inner` has the poster as `background` so there's no black flash while the iframe loads; `<link rel="preconnect">` to tella speeds it up.
- **Bottom strip** attached to the video card (`.hero-card-strip`, dark `#060606`, rounded only where it meets the card): green-dot social-proof line (`.hero-card-strip--social`, "Join the 1,000+ …") on the left + a **"Start Building" primary CTA on the right** (`.hero-strip-btn`), kept on one row (`flex-wrap: nowrap`, text wraps internally). The button links to `#templates` (smooth-scroll via `html { scroll-behavior: smooth }`). The card click→modal handler **guards** `e.target.closest('.hero-card-strip')` so strip clicks don't open the video.

**Sections:** hero → logo train → why (4-col stat grid) → templates → how it works → quote → FAQ → footer CTA → bolt wordmark.

**Template cards (`.template-card`) — clickable + hover pixel field:**
- **Whole card is clickable** via a stretched overlay `<a class="template-card-link">` (`position:absolute; inset:0; z-index:2`); image/body/footer sit at `z-index:1`, the visible "View Template" ghost button at `z-index:3`. All template links use `target="_blank" rel="noopener"`.
- **Animated pixel field on hover:** a per-card `.template-hover-canvas` (injected by JS, `z-index:0`, `opacity:0 → 1` on `:hover`) runs the FAQ open-canvas rotating-wave algo (`rgba(180,185,195,…)`), only drawing while hovered (mouseenter/leave flag).
- Template card radius is `8px` (its own component — not the `4px` standard stack card).

**"Create your own" prompt box** (below the template grid, `.template-create`, centered, `max-width: 700px`):
- **Bolt prompt box copied verbatim from `/use-cases/real-estate`** (`.re-prompt-shell`): dark `#333336` shell, `border-radius: 12px`, layered `box-shadow: 0 0 0 6px #1E1E21, 0 20px 48px rgba(0,0,0,.38)`; textarea placeholder "Describe what you want to build…"; pill **"Build now"** submit (`.re-prompt-submit`, `border-radius: 999px`, `#1488FC`, arrow SVG). JS carries the typed text to `bolt.new/?prompt=…` (Enter or click), opening in a **new tab**.
- H2 "Create your own" wrapped in `.dsa-reveal`. An animated `#create-pixel-canvas` (`makePixelCanvas`, center-fading wave, `220,230,245`) sits behind the heading + box (`z-index:0`; content `z-index:1`).

## Blog (company repo `stackblitz/bolt-public-pages`, `contentful-blog` branch)
Contentful-backed SSR blog. Key files: `src/layouts/BlogLayout.astro`, `src/styles/blog.css`, `src/pages/blog/`. **Light theme** (distinct from the dark marketing pages).

### Blog fonts
| Role | Family | Token |
|------|--------|-------|
| Headings / titles | **Cormorant Garamond** (serif), Georgia fallback | `--font-serif` |
| Body / UI | **Inter** | `--font-sans` |
| Eyebrows / labels (pixel style) | **Silkscreen** (mono) | `--font-mono` |

### Blog color tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F0EDE9` | Page background |
| `--surface` | `#E8E3DE` | Panels, cards, tag cells |
| `--card-bg` | `#D8D3CD` | Deeper card bg |
| `--border` | `rgba(0,0,0,0.09)` | Borders, neutral tag outlines |
| `--text-primary` | `#10100F` | Headings / titles (near-black) |
| `--text-secondary` | `#555` | **The grey** — body text, neutral tags, title-on-hover |
| `--text-muted` | `#999` | Meta (dates, read-time) |
| accents | mint `#0d9b7a`, salmon `#c05030`, blue `#1488FC` | Eyebrows = blue; accents now sparingly used |

### Blog conventions (established)
- **Masthead H1** "The Bolt Blog": serif `clamp(36px,5vw,64px)` weight 600.
- **Featured hero** (`.blog-hero-card`): whimsical **staggered 4-col grid** on a faint graph-paper background (`linear-gradient` grid, `46px` cells). Layout: image top-left (`grid-column: 1/3; grid-row: 1; aspect-ratio: 16/11`), content card bottom-right (`grid-column: 3/5; grid-row: 2`) **lifted with `margin-top: -140px`** into the image's vertical band for a tight diagonal stagger, filled `--surface` card (`padding: 32px 36px`, no border). Empty bottom-left cell holds a **mini subscribe** (`.blog-hero-subscribe`: "Stay in the loop" label + underlined email input with a `→` button). The card is a `<div>` grid (NOT an `<a>`) so the form is valid — image & content are separate `<a>` links inside.
- **Featured hero entrance animation** (on load, reduced-motion safe): heading "The Bolt Blog" does the `.dsa-reveal` word blur-reveal (same as H2s); the **grid draws in mint-green** then fades to the faint grey resting grid (vertical lines wipe L→R via `::before`, horizontals T→B via `::after` — mask-position keyframes `heroGridDrawX/Y`, lines `rgba(13,155,122,0.5)` fading out); the **image + content box + subscribe reveal via a clip-path wipe** L→R (`heroClipReveal`, `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, staggered 0.28/0.50/0.70s) — matches the grid sweep direction. Clip-path/mask composite on GPU (no blur jank). The faint resting grid lives on `.blog-hero-card` background; the animated draw is on the two pseudo-layers.
- **Card hover**: image → `filter: grayscale(1)` (NO scale); title → `--text-secondary`.
- **Category tags**: neutral — transparent bg, `1px solid var(--border)` outline, `--text-secondary` text (no mint/salmon/blue fills).
- **Film-grain noise** on ALL images (hero, thumbs, post-hero, related, inline body): grayscale `feTurbulence`, `mix-blend-mode: overlay`, opacity `0.38`, animated via `@keyframes grain`.
- **Tag-cloud canvas** = enterprise hero diagonal pixel-wave (`hero-pixel-dots` algo): `spacing 11`, 4px dots, `rgba(60,66,88, max(0,wave)*0.6)`; tag cells have solid `--surface` bg so pixels don't bleed behind text.
- **Filter bar** (sticky, below nav): original **beige band** — `background: rgba(240,237,233,0.92)` + blur, `var(--border)` hairline. Category tabs are **mono pills** (`.filter-btn`, `border-radius: 4px`, `padding: 8px 16px`): inactive = `--text-secondary`; hover = `--text-primary` (neutral, no fill); **active = filled green pill** `#BCE6D7` with `#0b6e57` text. (Tried a full mint band — reverted; only the active-selection green stays.) Pills center-align with the search. See the responsive section for the overflow fade.
- **Search**: live/instant (no reload); focus dims page (`rgba(16,16,15,0.32)`) with a small bright box around the controls; input uses `field-sizing: content` (grows, never shifts page); `scrollbar-gutter: stable` on `html`.
- **Newsletter**: eyebrow "You want more?", heading "Build smarter, every week", body capped to 2 lines (`max-width: 660px`).
- **No blog footer** (uses the company footer).

### Blog post page (`[slug].astro`) + CMS body (rich-text) styles
Post page order: breadcrumbs -> masthead (tag -> title -> subtitle) -> hero image -> byline (author . date . read time, **below** the image) -> article body -> tags -> author bio -> related ("Keep Reading") -> newsletter.

- **Header width**: `--hero-w` (1040px), aligns with the hero image. Title = Cormorant `clamp(38px,5vw,62px)` weight 600; subtitle 17px.
- **Reading column** (`.post-body`): `--article-w` = **880px** (80px gutter -> ~720px text measure).
- **Body text**: Inter **19px**, line-height 1.75, color `--text-secondary` (#555). Lead/first paragraph 20px, `--text-primary`.
- **Headings h2-h4: Cormorant serif, weight 600** (NOT Inter) - h2 34px, h3 26px, h4 21px.
- **Links**: `--accent-mint` (#0d9b7a) + 1px underline (`border-bottom: rgba(13,155,122,0.3)`).
- **Lists**: ul/ol 19px, nested supported.
- **Pull-quote** (`.post-quote`): centered Cormorant **italic** `clamp(24px,3vw,33px)` weight 500, framed by thin top/bottom `1px var(--border)` hairlines - no fill, no left bar.
- **Inline code**: Courier mono `0.9em`, green `#0d7a62` on `--surface`, radius 3px. **Code block** (`.post-code`): Courier 13px green on `--surface`, bordered.
- **Divider**: 1px `--border`. **Table**: bordered cells, `th` on `--surface`.
- **Inline image** (`.post-image`): borderless, radius 4px, film-grain overlay; caption 12px muted on `--surface`.
- **FAQ** = the marketing **`.ms-faq` component** + `.ms-faq--blog` combo (light theme): smooth `grid-template-rows` expand, blue `+/-` icons, per-item `.ms-faq-open-canvas` pixel field that fades in only when open. Eyebrow hidden on blog.
- **Reading progress** bar: canvas of animated blue static (slider `drawSliderNoise`), fills to scroll position.
- **Related posts** ("Keep Reading" eyebrow, scrambles once, no dot): 2 cards, 2-col grid at article width, no border, read time inside each card.
- **Subscribe/newsletter** component reused on the post page after related. Tag-pill hover fills bright mint `#7FDDC1` with dark text.
- **Table of contents** (post pages): a sticky left **`.post-toc` rail** (no heading — just the link rail) built client-side from the article's `<h2>`s. The article stays **page-centered** (`.post-shell` grid `1fr / minmax(0, --hero-w) / 1fr`, post in the centered column) and the rail **floats in the left margin** (`grid-column:1; justify-self:end; width:175px`), sticky at **`top:150px` with NO `margin-top`** (fold the offset into `top`, not a margin — a margin-top that exceeds `top` makes the resting position sit below the sticky point, so it doesn't pin until you've scrolled ~20px and then snaps = jerky; pinning from the first pixel keeps it perfectly steady). Shown only **≥1440px** (the rail needs margin room; hidden on iPad & narrower laptops, where the post is the normal centered single column). The post is identical to a no-TOC post — just with the floating rail. **Design**: an "On this page" mono eyebrow (Silkscreen), **numbered items** (`01`/`02` mono, active → mint), and a **mint rail that fills down to the current section** (`.post-toc-list::before`, height driven by `--toc-fill` set from the scroll-spy — a reading-progress feel); active link + number + rail all unified to the brand mint `--accent-mint` (#0d9b7a — vivid but readable on beige; the pale `#7FDDC1` is too light for a thin rail/small text), hover nudges `translateX(2px)`. JS slugifies each h2 → `id`, builds anchor links (`scroll-margin-top:112px` clears nav+filter), runs **scroll-spy** (active = brand mint `#0d9b7a` for text, number, and the fill rail). FAQ heading is excluded; a post with **no h2** gets `.post-shell--no-toc` (single column). Newsletter stays full-width outside the shell.
- **Styleguide / kitchen-sink**: `/blog/styleguide` (noIndex) renders every body element for reference.

### Blog responsive (tablet & mobile)
Four breakpoints, all in `blog.css`. `--gutter` scales and drives every centered container (`width: min(--max-w, calc(100vw - --gutter*2))`). **Never below 16px** horizontal padding (≤560 gutter is 20px → floor respected).

| Breakpoint | `--gutter` | Target |
|------------|-----------|--------|
| Desktop (>1024) | `80px` | full staggered layouts |
| Tablet (≤1024) | `40px` | iPad portrait & down |
| Mobile (≤768) | `24px` | phones |
| Large phone (≤640) | `24px` | aspect-ratio + stack tweaks |
| Small phone (≤560) | `20px` | single-column lists |

- **Featured hero** collapses the staggered grid to a clean vertical stack: reset the desktop `grid-column`/`grid-row`/`-140px` placements (else they dangle) → image (`16/9`, `3/2` at ≤640) → **raised content card** (`grid-column:1; grid-row:auto; align-self:auto` + side margins + soft shadow): a clear **gap below the image** so the card reads as its own entity with the grid breathing through — `margin-top: 32px` tablet / `24px` mobile (NOT overlapping) → mini subscribe below, **62% width right-aligned** via `width: 62%` (tablet) / `width: max(62%, 240px)` (mobile floor) + `justify-self: end`. **Use `width` + `justify-self: end`, NOT `max-width` + `margin-left: auto`** — an auto margin shrinks the grid item to its content width so `max-width` never engages (it'll read too narrow).
- **Feed cards** (`.blog-feed .blog-list-item`): `1fr 200px` at ≤1024; single-column at ≤768 with **`.blog-list-thumb { order: -1 }`** (image on top; DOM order is body-then-thumb).
- **Index lists** (`.blog-index`, category/tag pages): `80px 1fr 200px` → meta/body/thumb reflow at ≤768 → single column at ≤560.
- **Post page** at ≤768: body `p`/`li` **19→17px** (lead 20→18px), h2 34→28px, h3 26→23px, h4 21→19px; tighter header/byline/quote/author-bio/related spacing. Author bio card goes `flex-direction: column` at ≤640.
- **Wide tables** at ≤640: `display:block; overflow-x:auto; white-space:nowrap` — scroll internally, never force page-level horizontal overflow. **Verify `documentElement.scrollWidth === clientWidth`** (no horizontal scroll) when testing.
- Rich-text **CTA** stacks (`flex-direction: column`) at ≤768; newsletter/tags-section/category-header re-padded for small screens.
- **Filter bar scroll affordance**: the category row is wrapped in `.filter-group-wrap`. When `.filter-group` overflows (tablet/mobile), a **drastic** gradient-to-bar-bg + `blur(1.5px)` overlay (84px, `::after` right / `::before` left) fades/blurs the edge to signal more. (No chevron — tried it, rejected; the fade is the sole cue.) `__enhanceFilterFade()` toggles `.is-fade-left`/`.is-fade-right` **on the wrap**, only when actually scrollable (a row that fits is never clipped); re-runs on resize, scroll, and live-search via `__blogEnhance`. On tablet/mobile the **`.filter-btn` labels drop to 11px** to match the Search placeholder.
- **Filter/search baseline**: `.blog-search` is nudged `top: -1px` so the Search placeholder aligns with the category labels — the labels' 2px transparent bottom-border (the active underline) lifts their text ~1px, so the search must rise to match.
- **Test live** at 834px (iPad) and 390px (iPhone) — the staggered hero is the part most likely to break. **Note:** the Chrome browser-tool window clamps to ~500px min and resets size on navigate — resize *after* navigating, and measure via computed styles since absolute px are DPR-scaled.

## Source of truth
- **Enterprise** is LIVE in production via the company repo **`stackblitz/bolt-public-pages`** (`src/pages/enterprise/index.astro` + `src/content/enterprise-body.html`). That is the source of truth — do NOT maintain a static copy here (the old `enterprise-staging.html` prototype was removed to avoid drift).
- **Blog** lives only in the company repo on the `contentful-blog` branch (not yet merged); deployed `/blog` needs Contentful env vars wired into Cloudflare Pages before the preview will render.
- This `garyliusf/Enterprise` repo is a **prototyping sandbox** (static HTML on GitHub Pages). Production lives in the company repo; use branch / bolt.host previews as "staging," not hand-synced HTML twins.
