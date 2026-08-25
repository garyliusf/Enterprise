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

### Standalone CTA button min-width (standard)
**Standalone hero/footer CTA buttons** (`.hero-btn-primary` / `.hero-btn-ghost` — NOT form-attached submits) get an equalizing min-width so single short labels (e.g. "Learn More") don't look small and multiple buttons match:
- **Desktop:** `min-width: 180px`
- **Mobile (≤768px):** `min-width: 260px` + `max-width: 100%`, `height: 52px`, `font-size: 16px`, centered/contained (not full-bleed)
- **Scope to the hero CTA container** so it never hits form buttons: `.hero-btn-group .hero-btn-primary`, `.hero-cta-row .hero-btn-primary`, `.hero-section--simple .hero-btn-group .hero-btn-primary`, etc.
- **Excluded:** form/input-attached submit buttons (`.hero-cta-button` email strips, `.re-prompt-submit` prompt boxes) — these keep their natural width.

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

**Border radius is always `2px` on surfaces (decision: Gary, 2026-08-05)** — cards, panels, tiles, icon tiles, video frames, stages. Exceptions: true circles (`50%` dots), pill buttons (`999px`), and partial-corner cases like the form-submit `0 2px 2px 0`. solutions.html is fully normalized; older pages may still carry 4–16px values — normalize when touching them.

---

## Typography

| Element | Size | Weight | Color | Line Height |
|---------|------|--------|-------|-------------|
| Hero H1 | `66px` desktop / `51px` tablet (≤1024px) / `clamp(36px, 6.5vw, 51px)` mobile (≤768px) | `500` | `#fff` | `1.1` | `normal` (not `-1px` — that is H2 only) |
| Hero subtitle | `clamp(16px, 1.4vw, 20px)` desktop / `18px` tablet (≤1024px) / `16px` mobile (≤768px) | `400` | `#ABABAB` | `1.4` | — |
| Section headline (H2) | `clamp(40px, 4vw, 52px)` desktop / `clamp(28px, 8vw, 40px)` mobile (≤768px) — 40px desktop floor = mobile cap, so the size is continuous at the breakpoint (a 32px floor made H2s shrink 8px crossing 768→769px) | `500` | `#fff` | `1.15` | `-1px` |
| Section subtitle | `clamp(15px, 1.1vw, 17px)` desktop / `16px` tablet / `15px` mobile | `400` | `rgba(255,255,255,0.5)` | `1.65` | — |
| Eyebrow | `16px` desktop / `13px` tablet+mobile | `400` | `#1488FC` | — | `2px` letter-spacing, `uppercase` |
| Card title | `18px` | `600` | `#fff` | `1.35` | `-0.2px` |
| Body/description | `14–15px` | `400` | `rgba(255,255,255,0.55)` | `1.55–1.65` | — |
| FAQ question | `18px` desktop / `17px` ≤1024px / `16px` ≤768px | `500` | `rgba(255,255,255,0.7)` default / `#fff` when open | — | — |
| FAQ answer | `15px` desktop / `13px` ≤768px | `400` | `rgba(255,255,255,0.5)` — standardized to the section-subtitle grey (Gary, 2026-08-07; was 0.65) | `1.7` | — |
| Success pull-quote | `26px` | `300` | `#EDDCC6` (warm beige) | `1.55` | not italic |
| Stat number | `72px` | `300` | `#fff` | `0.85` | `-3px` |

### Section H2 — ONE canonical class: `.sc-section-h2` (RULE)

**When building or replicating a page, section-level H2s use `class="sc-section-h2"` from `shared-components.css` — do NOT mint a new per-page/per-section class.** We learned this the hard way (2026-08): the same H2 style existed under 12 aliases (`.builtin-h2`, `.detail-h2`, `.agent-h2`, `.compliance-h2`, `.trust-h2`, `.hiw-h2`, `.run-callout-h2`, `.section-headline`, …), so the ≤768px size rule got written for `.builtin-h2` only and sibling H2s rendered visibly smaller on phones. Twelve names for one component = breakpoint changes silently miss instances.

- **Canonical values** (live in `shared-components.css`): `clamp(40px, 4vw, 52px)` / `500` / `#fff` / `1.15` / `-1px` / `margin: 0`, plus `≤768px: clamp(28px, 8vw, 40px)`. The 40px desktop floor is deliberate (2026-08): it equals the mobile cap so the size is continuous across the 768px breakpoint — the old 32px floor made headlines **shrink 8px as the viewport grew** past 768px (4vw doesn't reach 40px until 1000px; the 32px floor only ever bound at 769–800px). Production's `.section-headline` (use-case-page.css) got the same 40px floor via bolt-public-pages#267 (merged 2026-08-05) — sandbox and production match. Margins are page layout — put them on wrappers or page-scoped rules (`.section-header .sc-section-h2 { … }`), never fork the base class for spacing.
- **Self-contained pages** (e.g. `solutions/_template`): inline the canonical block verbatim with a comment noting it's synced with shared — see `_template` for the pattern.
- **Duplicating an existing page** (cp security.html → new page): the copy inherits `.sc-section-h2` automatically — keep it. If the source page still has legacy aliases, migrate them in the copy rather than propagating them.
- **Production mapping**: `bolt-public-pages` names the same canon `.section-headline` (the built-page primitive in `use-case-page.css`, consumed by `/use-cases/*`, CMS-built pages via `built-page.css`, and the section library). When porting, translate `sc-section-h2` → `section-headline`. **Never rename production's `.section-headline`** — the CMS builder's blocks depend on it (Donald). Values PR: bolt-public-pages#267.
- **`.ms-faq-headline` and `.footer-headline` share the canonical TYPE but keep their class names** (2026-08 unification): in `shared-components.css` they're grouped into the `.sc-section-h2` type rule (same size curve, lh 1.15, -1px, same mobile clamp); their own component rules carry layout only (FAQ's 48px bottom margin, footer centering). Keep the markup classes — don't swap them to `sc-section-h2` (they'd lose the layout), and don't re-add type values to their component rules (that re-forks the canon).
- **Legitimate variants — do NOT convert:** `marketing/templates/detail`'s compact `clamp(28px, 3.4vw, 40px)` H2 (deliberate), microsoft.html (production-owned, don't touch), bolt.conf (own branding). A smaller "panel H2" variant (`clamp(30px, 3.6vw, 46px)` — `.controls-h2`/`.aiblock-h2` on 4 pages) is a candidate for a future `.sc-panel-h2`.
- Before adding any new class to shared, grep all pages for the name first (see "Shared-file hazards").

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
| Desktop | `min(1200px, calc(100vw - 160px))` — 80px each side (was 1120; sweep 2026-08-25 so containers align with the 1200px mkt-nav bar + site-footer edges) |
| Tablet (≤1024px) | `min(900px, calc(100vw - 80px))` — 40px each side |
| Mobile (≤768px) | `calc(100vw - 32px)` — **16px each side** (matches enterprise `px-4`) |

**Never use less than 16px horizontal padding on any breakpoint.**

**Deliberate 1120 holdouts (Gary, 2026-08-25 — do NOT "fix" to 1200):** the nav mega-menu panel (`.mkt-nav-panel-inner` max-width 1120 in shared-nav-footer.css + its five inline copies) and the blog-family light pages (`--max-w: 1120px` on customers/press/customers-detail — editorial reading measure, not the marketing grid). Excluded from the sweep as stale/production-owned: microsoft, bolt-cli, platform-old, platform/referral, blog snapshot. staging/enterprise + staging/get-started mirrors ARE swept to 1200. The production sweep shipped standalone after all — measuring live bolt.new showed the CURRENT nav's content box is already 1200 (pages were the misaligned half): bolt-public-pages#358 (2026-08-25) sweeps enterprise/get-started/forrester bodies, use-case-page.css + solution-page.css (the _template sync-pair port), and the CMS section library (browser-slider, hero-split, pixel-divider, referral-hero, stack-cards, templates-rail — serves microsoft/cli/referral). Production keepers: nav mega-panel 1120, blog.css. Their sub-16px mobile gutters (10–12px on hero-form-card / slider-section-header / support-inner / practice-inner) WERE fixed in production — floor violations are bugs, not spacing standardization: bolt-public-pages#357 (2026-08-25) + the same fix on the sandbox mirrors.

### Adjacent-section seams (rule, 2026-08-06)
The per-section `clamp(80px, 12vh, 140px)` padding applies to each side, so two adjacent sections stack ~215px at the seam. **When both sections share the same background (black-on-black, no visual boundary), the seam must total ~ONE standard unit (~110–155px), not two** — trim ONE side (usually the lower section's `padding-top`, e.g. `clamp(24px, 4vh, 48px)`) rather than shrinking the shared `.section` rule. Keep the full double padding only where a background change, border, or panel edge marks the section break. First applied: solutions.html tabs→use-cases seam.

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
| Answer color | `rgba(255,255,255,0.5)` (2026-08-07, was 0.65) |
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

### Navbar + site footer — `marketing/shared-nav-footer.css` / `.js` (2026-08-06)

Canonical source for the sticky **navbar** (`.mkt-nav*` — mega-menu + mobile drill-down drawer) and the **site footer** (`.site-footer*` link columns + bottom bar). Extracted from `marketing/templates/index.html`, which had grown an inline copy alongside `templates/detail/`. Every JS block self-guards (`if (!nav) return;`), so the files are safe to load on pages without the markup.

**Footer order is fixed — CTA section → `.site-footer-divider` → `.site-footer` link columns → bolt wordmark (`.footer-image-section`). There is NO bottom bar.** Keep the wordmark in its own `.footer-image-section` so the columns sit above it; don't nest it back inside `.footer-section`.

- **There is no `.site-footer-tail` (bolt logo + `© Bolt.new 2026`) — it was deliberately REMOVED (Gary, commit `2dd0315`, 2026-07-29)** and replaced by the `.site-footer-divider` above the columns. Its CSS (`.site-footer-tail`, `.site-footer-bottom`, `.site-footer-logo`, `.site-footer-copyright`) is still in the stylesheet but is **dead — do not re-add the markup.** It looks like a missing component when you diff pages against `templates/detail/`; it is not.
- **Legal links (Terms of Use / Privacy Policy / Security) live in the footer's "More" column**, below Templates and Pricing — not in a bottom bar.
- **`marketing/templates/detail/index.html` is STALE on this point** — it still renders the old tail because it never got `2dd0315`. Do not use it as the footer reference; `templates/index.html` and `pricing.html` are correct.

- **RULE (Gary, 2026-08-06): every navbar/footer change applies to ALL instances in the same commit** — `shared-nav-footer.css` + the inline copies (pricing.html, templates/index.html, templates/detail/index.html). No page-local nav/footer tweaks.
- **Markup is copied per page** (static sandbox, no includes) — only the CSS/JS are shared. Relative `href`s must be re-based for the page's directory depth: from `marketing/templates/*` to `marketing/*`, `../../` → `../`, `../` → bare, `./` → `templates/`. Drop `is-active` from whichever nav item isn't the current page.
- **`overflow-x: hidden` on `body` breaks the sticky navbar** — it makes body a scroll container, so `position: sticky` on descendants stops working. Use `overflow-x: hidden; overflow-x: clip;` (hidden first as the fallback). Bit both templates and platform.
- **Not yet migrated:** `marketing/templates/index.html` and `marketing/templates/detail/index.html` still carry inline copies of this CSS/JS (their markup is now in sync). Mirror changes there until they're migrated to these files.

Pages on the standard: `solutions.html`, `templates/index.html`, `pricing.html` (no divider yet — minor). `templates/detail/index.html` still shows the retired tail. **Chrome rollout (2026-08-25):** security, security-agent, compliance, trust, trust-v2, integrations, use-cases, solutions/ai-for-real-estate, solutions/smb all got the nav + footer-columns chrome (markup copied from solutions.html, hrefs re-based per depth; they LINK `shared-nav-footer.css/js` — no new inline CSS copies). Their footers were restructured to the canonical order (CTA section → divider → columns → wordmark in its own `.footer-image-section`), body `overflow-x` got the `clip` fallback, and the five security/trust-family heroes moved to the with-nav top pad `clamp(90px, calc(24px + 8.5vh), 148px)`. Still chrome-less on purpose: `solutions/_template` (production `/use-cases/*` renders the site nav from Astro — adding it to the synced template needs Donald's call) and the forrester report page (gated landing).

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
- **First-section rule (Gary, 2026-08-06):** the FIRST content section after the hero (or after a hero + logo strip) also renders its H2 statically — no `.dsa-reveal`/`.reveal-h`/`.reveal-stagger`. It's effectively above/at the fold, so the scroll-in reveal either never fires as intended or plays while the user is already reading. Applied: platform tabs section ("Built for how you ship"), pricing "Compare features" (before it moved into the table head). Later sections keep their reveals.
- **Eyebrow scramble:** `.eyebrow-scramble` class triggers letter scramble on scroll. Apply to ALL eyebrows including hero eyebrow, success eyebrow, footer eyebrow.
- **How It Works line:** `.how-steps-wrap` → `.line-active` class triggers node + text animations

---

## Reference: pricing.html (sandbox canonical — 2026-08-06 standardization pass)

### Pricing Page Buttons
| Type | Class | Spec |
|------|-------|------|
| Plan CTA (blue) | `.hero-btn-primary.card-cta` | shared 52px standard; `.card .card-cta { width:100%; margin-top:auto }` for equal-height cards |
| Plan CTA (outline) | `.hero-btn-ghost.card-cta` | shared 52px standard, same layout hook |
| Compliance "Learn more" / FAQ "Visit Help Center" | `.hero-btn-ghost` | shared standard + `--cta-min-w` floor, `width:fit-content` (flex-column parent) |
| Footer CTA | `.hero-btn-primary.footer-cta-btn` "Start Building" → bolt.new | solutions.html footer pattern (the old email strip + rotating-name form was removed 2026-08-06) |
| Toggle (Yearly/Monthly) | `.billing-btn` | `~26px`, `5px 22px`, `13px`, `500`, `#fff`, pill `999px` |

**CTA labels are Title Case (decision: Gary, 2026-08-06):** cap the first letter of each word — "Get Started", "Contact Us", "Learn More", "Start Building" — in BOTH slide-up spans of the button markup. **Short function words stay lowercase** (Gary, 2026-08-11): "Start Building for Free", not "For Free".

**Billing toggle (redesigned 2026-08-06):** squared 2px segmented control (rgba(255,255,255,0.04) fill, 0.1 border), sliding `#1488FC` thumb positioned by JS from the active button (re-measured on font-load/resize), active label white/600. The savings chip copy is **"Save up to 28%" — required copy, do not shorten**; 12px/600, inactive `#4DA6FF` on `rgba(20,136,252,0.14)`, active `#fff` on `rgba(0,0,0,0.28)` (dark inset — white-on-lightened-blue failed contrast). Not the old white 999px pill.

**The old 42px plan-CTA exception is RETIRED (decision: Gary, 2026-08-06).** The `.cta-primary`/`.cta-secondary` 42px component was deleted; all pricing buttons are the shared 52px standard. Do not reintroduce a shorter variant. The live production pricing page still has 42px buttons — the sandbox page is the approved go-forward design, ported when it launches.

pricing.html carries the shared **mkt-nav navbar + site-footer** (2026-08-06): the sticky mega-menu nav and link-columns footer copied from `marketing/templates/index.html` (the component's home) with paths shifted one level up and Pricing marked `is-active`. Because the 68px nav is in-flow sticky, `.page` top padding dropped 140→72px and the compare table's sticky tier-head pins at `top: 68px` (its fade JS thresholds shifted by +68 too). Page order: CTA footer-section → site-footer → bolt wordmark.

Other pricing standardizations from the same pass: FAQ = shared `.ms-faq-*` component (two-column layout is page-local), section H2s = `.sc-section-h2`, logo train = solutions.html wordmark component (`images/logos-home/`, CSS `scrollLogos` keyframe — mobile overrides must sit AFTER the base rules in source order), all pixel-fill hovers come from `shared-components.js` (no page-side pixelize module).

### Pricing Page Eyebrows
- Color: `#1488FC` ✓ — consistent with brand standard

### Pricing Page Typography
- Matches bolt.new/enterprise: H1 `66px`/`51px` tablet (≤1024)/`clamp(37px,10.45vw,51px)` mobile, weight `500`; hero subtitle `clamp(16px,1.4vw,20px)`; H2 = `.sc-section-h2`; section subtitles (`.faq-sub`) = `clamp(15px,1.1vw,17px)` `rgba(255,255,255,0.5)` (2026-08-06 audit)
- Deliberate page-local variants kept by the audit: card/banner surfaces `#0a0a0a` (page-consistent, vs the `#111` token), `.plan-label` card eyebrows 13px Silkscreen, `.compliance-title` 28px panel h3 (a `.sc-panel-h2`-class case), `.page` wrapper owns vertical rhythm (140px top) instead of per-section clamp padding

---

## Pages
- `marketing/microsoft.html` — Microsoft Teams & Copilot landing page. **RETIRED as a working copy (2026-08-07): production moved to the CMS page builder** — `src/pages/platform/integrations/microsoft.astro` is a `<BuiltPage>` stub; the page is `src/content/pages/platform-integrations-microsoft.json` (sections: ms-hero, browser-slider, stack-cards, how-it-works, faq, footer-cta), edited via `npm run cms`. `microsoft-body.html` is deleted. Same policy as `/platform/referral`: the sandbox copy is a stale one-off mirror — don't edit it expecting changes to go anywhere.
- `marketing/bolt-cli.html` — Bolt CLI landing page. **Production ALSO moved to the CMS builder (2026-08-07 discovery)** — `platform-features-cli.json`; `cli-body.html` is deleted. Sandbox copy is now prototype-only, same policy as microsoft.
- `marketing/pricing.html` — Pricing page. **Canonical/correct version, NOT live yet (pending approval).** Its own track; will get its own port + PR when approved.
- `marketing/solutions.html` — Solutions overview page (renamed from `platform.html`, 2026-08-13), **rebuilt 2026-08-04** from the marketing content doc. Combines Security-page components (hero gradient + pixel dots, feat tab slider — extended to 4 tabs, builtin-cards, footer + bolt shimmer) with Templates-page components (comet-outline prompt shell, section scaffolding, int-logo tiles, arrow links). Sections: hero (eyebrow/H1/sub/CTA/microcopy + prompt box) → logo train (real homepage wordmarks extracted to `images/logos-home/*.svg`, black fills → `filter: invert(1)`) → business-size tabs (Entrepreneur/SMB/Enterprise/Agencies; agencies link URL still TBD) → use cases 5-card (3+2 centered via 6-col grid) → template rows → trust band (copy + 4 checklist cards) → integrations tiles → footer CTA. The old prototype lives at `marketing/platform-old.html` ("Old Platform", reference only). `enterprise-v2/` was deleted the same day (no use) — its optimized footer wordmark strip lives on as `images/bolt-footer.webp` (36KB; do NOT swap to the 1.35MB `bolt-bottom.webp`), referenced by templates/use-cases/integrations/templates-detail footers.
- `marketing/security-agent.html` — Security Agent landing page (built 2026-08, sandbox only — not yet ported/PR'd to the company repo). Hero → agent video → How-It-Works timeline → "What it scans" 5-card → "Free every time" 3-card + `run-callout` (photo bg `run-callout-bg.jpg`, scroll-in reveal at 50% visible) → FAQ → footer.
- `marketing/shared-components.css` — **Canonical component CSS** (buttons, eyebrows, FAQ). Wins the cascade — linked at end of `<body>`. Edit here, not per-page.
- `marketing/shared-components.js` — **Canonical component JS** (FAQ per-item pixel canvas animation + scroll animations). Linked at end of `<body>`.

### Spacing / CTA design tokens (in `shared-components.css`)
- `--sub-to-cta`: subtitle→CTA vertical gap — **32px desktop / 24px mobile (≤768)**. Applied via `margin-top: calc(var(--sub-to-cta) - <container gap>)` on `.hero-inner > .hero-btn-group` (child combinator — deliberate, `gap` only spaces direct children), `.builtin-cta`, `.run-callout-btns`, `.footer-cta-btn`.
- `--cta-min-w`: standalone-CTA min-width **floor** — **180px desktop / 220px mobile**. Longer labels still expand past it. Form/input-attached submits are explicitly excluded (a `:is(form, .hero-form-row, .card-form-strip, .re-prompt-shell)` reset).
- These are **going-forward standards (decision: Gary, 2026-08-04): they apply to the sandbox and to NEW pages. Existing live production pages keep their current SPACING — do NOT open a spacing-"standardization" PR against them** (production microsoft's 42px hero is fine as-is). The once-planned "PR C" is cancelled, nothing is lost. **Typography is different (Gary, 2026-08-06):** hero-subtitle type was aligned to the clamp standard everywhere — microsoft's 22px subtitle + the vh-capped slider taglines on enterprise/get-started are fixed in [bolt-public-pages#276](https://github.com/stackblitz/bolt-public-pages/pull/276).
- Footer form strips (`.card-form-strip` inline `margin-top:-16px` on 6 pages) are **not yet tokenized** — planned as its own pass ("PR 2").

### Shared-file hazards (learned the hard way, 2026-08)
- **Class-name collisions:** shared wins the cascade by loading last, so any generic class it declares silently overrides page-local classes of the same name. Two found and fixed: `.footer-cta-btn` (solutions pages had it as a form-submit style) and `.hero-video-overlay` (shared's video-card vignette replaced microsoft's full-page hero darkener → bright hero). Shared's video vignette is now scoped `.hero-video-area > .hero-video-overlay`. **Before adding any class to shared, grep all pages for prior use of that name.** A namespacing pass (`.sc-*`) is the real fix, not yet done.
- **Duplicate scroll animations:** microsoft, bolt-cli, platform, pricing ship their own word-reveal + eyebrow scramble. Running shared's copies on the same elements is a race that corrupts text (both capture "final" text at run time). Pages that own their animations set `window.__pageOwnsScrollAnims = true` **before** the shared script tag; shared's scroll-anim module stands down. Set this flag on any page that has local reveal/scramble code.
- **GitHub Pages caches CSS for 10 min** (`max-age=600`). When verifying a deploy, hard-refresh (⌘⇧R) — a normal refresh can serve stale CSS long after the deploy landed.
- **Never preview sandbox pages via `file://`** — canvas effects that read image pixels (the bolt-wordmark stripe shimmer's `getImageData`) throw a SecurityError under `file://` (tainted canvas) and silently die. The page looks broken but isn't. Always use `http://localhost:8765/...` (`python3 -m http.server 8765` from the repo root) or the deployed GitHub Pages URL.

### Sandbox drift (platform/referral)
`marketing/platform/referral/index.html` is a **stale mirror** as of 2026-08-04: Donald moved `/platform/referral` to the CMS page builder (`bolt-public-pages` PR #249 — the old 1600-line `referral-body.html` is deleted; the page is now six editable sections with `rf-`prefixed CSS). Same policy as `/blog`: don't treat the sandbox copy as source of truth, don't port spacing/CSS changes to it, and if prototyping referral changes, grab the latest from the CMS-built page first (Donald's ask).

### Sandbox drift (microsoft.html)
Production (`bolt.new/platform/integrations/microsoft`, from `bolt-public-pages`) loads **no shared-components.js/css** — the sandbox copy both links them and has drifted: two pre-existing JS TypeErrors from removed elements (`#hero-form-card` referenced by the video-modal block, `#slider-inner-tagline` by the slider block), and layout values that differ from live. Treat production as the source of truth for this page (same policy as `/blog`); don't derive standards by measuring the sandbox copy.
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
- Note: heading currently reads "Start building now"; the prompt JS sends the typed text to **`bolt.new/?autosubmit=true#prompt=<encoded>`** (hash, not query) so the prompt prefills AND auto-submits in the bolt composer.

### `solutions/_template/` — reusable clone (simple no-video hero)
`solutions/_template/index.html` is a clone of the real-estate page for spinning up new `/solutions/*` (or use-case) pages. **Currently filled with portfolio-website-builder example copy.** Two things differ from the real-estate page:
- **Hero has NO video** — it's the `.hero-section--simple` variant: centered eyebrow → H1 (`white-space:normal`, long headlines wrap) → subtitle → **bolt prompt box** → `.hero-pills` (inline green-dot feature list). Hero side gutters match the section standard (80 desktop / 40 tablet / 16 mobile). For the canonical height rule, see **[Simple-hero height rule](#simple-hero-height-rule)** below.
  - **Prompt box = production's animated "comet" outline** (`.re-prompt-shell.hero-prompt-shell`): two glows (`.hero-prompt-glow--brand`/`--accent`) orbit the 1px border via `offset-path`, an opaque `.hero-prompt-inner` (#1c1c20) hides the centre, and a real crawlable `.hero-prompt-example` `<p>` (SEO) shows as the placeholder and hides on type (`data-example` fallback). JS `goToBolt()` carries the text to `bolt.new/#prompt=…` in a new tab. (Earlier conic-gradient `@property` glow was replaced to match the live page.)
  - Dead CSS for `.hero-video-*` / `.video-modal` is left in `<style>` but unused — strip if you want a leaner file.
- **Templates section repurposed as "Example prompts"** — `.template-card.prompt-card` (text-only, no image): a Cormorant `.prompt-card-quote` + uppercase blue `.prompt-card-label`. Reuses the clickable-overlay + hover-pixel-canvas component. Links carry `data-prompt`; JS (`.prompt-card-link`) builds `bolt.new/?autosubmit=true#prompt=<encoded>` and opens a new tab.
- **Testimonials** use a 3-up `.testi-grid` of `.testi-card`s (stars + quote + avatar/name/role) instead of the single pull-quote+stats card.
- Section order: simple hero → stats (2×2) → features (6-card `unlocks-grid`) → example prompts (+ "Start building now" prompt box) → how it works → testimonials → FAQ → footer CTA → bolt wordmark. Bolt wordmark uses repo-root `../../images/bolt-bottom.png` (no local `images/` folder).

### Simple-hero height rule
**Canonical for `.hero-section--simple`** (used by `/use-cases/*` and the no-video `/solutions/*` pages). Ported from `src/styles/solution-page.css` so both page families render identical hero heights. Lives in `src/styles/use-case-page.css` in production and inline in `solutions/_template/index.html` in the sandbox. Landed via [bolt-public-pages#120](https://github.com/stackblitz/bolt-public-pages/pull/120) + [#121](https://github.com/stackblitz/bolt-public-pages/pull/121).

**Two variants by content density:**

| Variant | When to use | min-height | Examples |
|---|---|---|---|
| **Tall** (default) | Hero has prompt box + pills (the bolt prompt input + trust pills) | `min(80vh, 900px)` / `min(80dvh, 900px)` | `/use-cases/*`, `/solutions/ai-for-real-estate`, `solutions/_template` |
| **Short** | Content-light hero — just H1 + 1 CTA (or H1 + subtitle + 1 CTA) | `min(65vh, 720px)` / `min(65dvh, 720px)` | `marketing/use-cases/` catalog (sandbox), other index/landing heroes with minimal stack |

```css
/* Tall variant — prompt-box pages */
.hero-section--simple {
  height: auto;
  min-height: min(80vh, 900px);   /* fallback */
  min-height: min(80dvh, 900px);  /* mobile-viewport correct (dvh excludes URL bar) */
  padding-top: clamp(132px, 14vh, 184px);
  padding-bottom: clamp(72px, 8vh, 112px);
  justify-content: center;
}
@media (max-width: 768px) {
  /* mobile floor (PR #143 use-cases, PR #144 solutions, merged 2026-08-07):
     min-height: 0 let CMS-length H1s collapse the hero on phones */
  .hero-section--simple { min-height: min(100dvh, 720px); padding: 92px 0 56px; }
}

/* Short variant — H1 + CTA only, no prompt box */
.hero-section {  /* or .hero-section--short — whichever class fits */
  min-height: min(65vh, 720px);
  min-height: min(65dvh, 720px);
  /* same padding + justify-content as the tall variant */
}
```

Why these values:
- **`min(<vh>, <px-cap>)`** scales with the viewport but caps so the hero never dominates tall (1440px+) monitors.
- **No px floor / no `:has()` variant** — the section grows past `min-height` when content needs it; one rule per variant serves both 1-line and 2-line H1 pages within that variant.
- **`<dvh>` upgrade** matches the solution-page.css pattern so the rule plays well with mobile browsers that change the visible viewport when the URL bar collapses.
- **`justify-content: center`** centers the content stack within the section; without it, a short H1 leaves dead space below on tall displays.
- **Picking a variant**: count the items in the hero content stack. Prompt box (with its own ~180px height) + pills row ≈ tall. Just an H1 + subtitle + button ≈ short. If in doubt, prototype short first — easier to bump up if the hero feels cramped than to shrink a too-tall hero.
- **Don't invent in-between values** — stick to the two variants so all pages feel like they belong to the same system.
- **Deliberate exception — `marketing/templates/index.html`**: the templates catalog hero is intentionally compact (`min(30vh, 300px)`, tuned `calc(base + Nvh)` padding) so the browsing grid is visible quickly. It is **short by design (Gary, 2026-08-04)** — do NOT "fix" it to the 65vh short variant (that was tried and reverted, commits 9418edb/c879d78). `marketing/use-cases/` deliberately does NOT share this exception — it was moved to the standard short variant at Gary's request the same day.

## CMS-connected pages — how updates flow (Donald, 2026-08-04)
- **The sandbox never auto-updates production.** Updating a sandbox template page does nothing to the Astro/CMS copy — design/CSS/JS changes must be PR'd to `bolt-public-pages`; **copy changes are edited in the CMS directly** (Claude can edit CMS copy on request).
- **Marketing CSS and blog CSS must NEVER mix.** They are different themes (dark vs light) and cross-importing breaks pages site-wide ("it fucks up all the pages when they mix" — Donald). Treat anything Blog as a separate entity; never share/import rules between `blog.css` and the marketing/use-case stylesheets.

## Blog (company repo `stackblitz/bolt-public-pages` — LIVE at bolt.new/blog)
Contentful-backed SSR blog (`/blog` renders on-demand, reading PUBLISHED content from the Contentful Delivery API at request time — not static/prerendered). Key files: `src/layouts/BlogLayout.astro`, `src/styles/blog.css`, `src/pages/blog/`. **Light theme** (distinct from the dark marketing pages).

**`contentful-blog` branch is merged and dead** — don't branch off it or reference it, it's 0 commits ahead of `main` (as of 2026-07-06). Blog code lives on `main` like everything else now.

**Workflow — work directly in the company repo, not the sandbox.** Unlike `solutions/_template` (an actively-maintained dual-source-of-truth pair with `/use-cases/*`), the blog never had that relationship — the sandbox's `/blog` static snapshot was a one-off "for sharing" mirror, not a synced pair, and it's gone stale (last touched 2026-06-17, hundreds of commits behind `main`). Because the real blog is SSR + CMS-backed, a static mirror can't represent it anyway (no real pagination, no real long-title wrapping, no real image variety). So:
- **Design/layout/CSS/animation changes**: branch off `main` in `bolt-public-pages`, run `npm run dev` (Astro dev server, `http://localhost:4321`) with a local `.env` populated with `CONTENTFUL_SPACE_ID` / `CONTENTFUL_DELIVERY_TOKEN` / `CONTENTFUL_ENVIRONMENT` (see `.env.example`) so `/blog` renders real live content while you iterate — then open a PR as usual.
- **Actual post content** (new articles, edits, tags/categories): that's in Contentful itself, not in either repo.
- Cloudflare Pages branch previews work too, but haven't been confirmed to have Contentful credentials wired into the **Preview** environment scope (separate from Production) — verify before relying on a preview link to share a WIP blog change.

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
- **Blog** is LIVE in production at bolt.new/blog via the company repo (`main` branch — `contentful-blog` was merged and is now dead, don't use it). Work directly in `bolt-public-pages` using local dev with real Contentful credentials (see the Blog section above) — do NOT treat the sandbox's `/blog` static snapshot as a source of truth; it's a stale one-off mirror, not an actively-synced pair like `_template`.
- This `garyliusf/Enterprise` repo is a **prototyping sandbox** (static HTML on GitHub Pages). Production lives in the company repo; use branch / bolt.host previews as "staging," not hand-synced HTML twins.
- **`solutions/_template` ↔ live `/use-cases/*` are kept in sync** (as of 2026-06-17). The sandbox `_template/index.html` is the **design source of truth** for the use-case template; production renders the same design from `src/pages/use-cases/[slug].astro` + `src/styles/use-case-page.css` + `public/public-page-assets/use-cases/use-case-page.js` (CMS-driven content). Prototype in `_template`, then port to those three files via a company-repo PR. **Intended, permanent differences** (not drift): image paths (`images/` vs `/public-page-assets/use-cases/`) and the CMS-only initials avatar (`.testi-card-avatar--initials`; sandbox uses example `<img>`s). Keep CSS/JS otherwise identical.

## PR / deployment workflow (IMPORTANT)
- **All PRs go to the company repo `stackblitz/bolt-public-pages` only — never open PRs in the `garyliusf/Enterprise` sandbox.**
- **Sandbox (`garyliusf/Enterprise`):** iterate/prototype freely; push to `main` for the GitHub Pages preview (`https://garyliusf.github.io/Enterprise/...`). No PRs here.
- **Company repo (`bolt-public-pages`):** when asked to "create a PR," clone it, branch off `main`, translate the change into its **Astro** structure (page CSS/markup lives in `src/content/*-body.html`, pages in `src/pages/...`), commit, push the branch, and open the PR there for a coworker to review/approve. I have `MAINTAIN` access.
- Page → file map in the company repo: `enterprise-body.html`, `get-started-body.html`, `forrester-body.html` under `src/content/`. **microsoft and cli are CMS-built pages now** (`src/content/pages/*.json` + the `src/sections/*` library) — copy edits go through the CMS, design edits through section-library CSS PRs; there is no body file to port to.
- After opening a company-repo PR, note that it's **CSS/HTML only** and the Astro build wasn't run locally — reviewer should verify via the PR's **preview deploy** (or `npm run dev`) at ≤768px.

## Verifying company-repo pages (preview before merge)
- **Preview deploy (easiest):** the PR should get an automatic preview URL (Cloudflare/Netlify check on the PR). Open it, then the route + DevTools device mode (e.g. iPhone 390px / iPad 834px). Routes: Microsoft `…/platform/integrations/microsoft`, CLI `…/platform/features/cli`.
- **Local:** `git clone` the repo → `npm install` → `npm run dev` → open the route, resize to ≤768px. (`npm run build` just confirms it compiles.)
- **What to eyeball at ≤768px** (renders differ from the static sandbox because of the real nav + global styles): hero buttons not overflowing / no horizontal scroll on ~360px; CLI "Request Access" text fits; H1 size matches enterprise; CLI cards have no hard border.

## Component archive — "Bespoke basics" comparison table (solutions/smb)

Two-column bad-vs-good comparison table built for `solutions/smb/index.html` (section "The shift"). **Likely to be cut from the SMB page (Gary, 2026-08-11) — archived here so it can be rebuilt on another page.** Full working source: commit `85205f6`, `solutions/smb/index.html` (markup `<!-- BESPOKE BASICS — comparison -->`, CSS `.bespoke-*` blocks, JS `bespoke-cta-canvas`).

**Structure:** one CSS grid (`1fr 1fr`, `gap: 0`, 1px border, 2px radius, `overflow: hidden`) — the two column headers are the first two cells, then rows alternate left/right cell in DOM order. No `<table>`.

- Column heads: Silkscreen 13px / 2px tracking / uppercase — left `rgba(255,255,255,0.5)` on `rgba(255,255,255,0.01)`, right `#1488FC` on `rgba(20,136,252,0.04)`.
- `.bespoke-row`: `18px 28px`, 15px, `border-top: 1px rgba(255,255,255,0.08)`, flex + 14px gap. `--neg` = muted `0.55` text, right border, hover `rgba(255,255,255,0.025)`. `--pos` = `#fff` 500, hover `rgba(20,136,252,0.06)`.
- Row glyphs are **pixel-art data-URI SVGs** in `::before` (18px): `--neg` = four grey dots (`%23ffffff66`), `--pos` = a blue pixel checkmark (`%231488FC`), both `shape-rendering='crispEdges'`.
- Last right-hand cell is a **CTA link row** (`.bespoke-row--cta-link`, `min-height: 64px`, bg `#050608`) wrapping `#bespoke-cta-canvas` — a `makePixelCanvas` centre-fading rotating-wave field (`'170,210,255'`, spacing 6, dot 2) — plus `.bespoke-cta-text` and `.bespoke-cta-arrow` (28×18 SVG, `opacity 0 → 1` + `translateX(-8px) → 0` on hover).
- Section spacing: `.bespoke-section { padding-bottom: clamp(48px,7vh,80px) }` and `.bespoke-section + .section { padding-top: clamp(48px,7vh,80px) }` (trims the double seam).

**Copy as written (SMB version):**

| Bloated software | Bespoke basics on Bolt.new |
|---|---|
| Built for the average of ten thousand businesses | Built for your business |
| $89,000/year in waste *(Cledara, 2025)* | Pro plans from $240/year |
| 4 tools juggled daily, 1.5 hours lost | One tool, your workflow, your way |
| 53% of licenses go unused | Every feature is one you asked for |
| Use 5 of 100 features | Ships in 24 hours |
| Annual contract, 90-day implementation | **Start building now** → (CTA row, links to bolt.new) |

Section intro that ran above it — eyebrow "The shift", H2 "Bespoke basics. Not bloated software.", sub: "The software you've been paying for was built for the average of ten thousand companies. None of them are yours. You get 100 features and use 5. You pay for them all, every month. The other 95? That's how the software industry makes its money."
