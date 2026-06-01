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

All buttons must use these exact specs. No inline overrides unless absolutely necessary.

### Primary Blue Button (`.hero-btn-primary`)
- **Height:** `52px`
- **Padding:** `0 28px`
- **Font size:** `15px`
- **Font weight:** `600`
- **Background:** `#1488FC`
- **Hover background:** `#0f6fd0`
- **Border radius:** `2px`
- **Color:** `#fff`

### Ghost Button (`.hero-btn-ghost`)
- **Height:** `52px`
- **Padding:** `0 28px`
- **Font size:** `15px`
- **Font weight:** `500`
- **Background:** `transparent`
- **Border:** `1px solid rgba(255,255,255,0.22)`
- **Border radius:** `2px`
- **Color:** `rgba(255,255,255,0.8)`

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
| Hero H1 | `66px` desktop / `51px` tablet (≤1024px) / `clamp(36px, 6.5vw, 51px)` mobile (≤768px) | `500` | `#fff` | `1.1` |
| Hero subtitle | `clamp(16px, 1.4vw, 20px)` | `400` | `#ABABAB` | `1.6` |
| Section headline | `clamp(32px, 4vw, 52px)` | `500` | `#fff` | `1.2` |
| Section subtitle | `clamp(15px, 1.1vw, 17px)` | `400` | `rgba(255,255,255,0.5)` | `1.65` |
| Eyebrow | `16px` desktop / `13px` tablet+mobile | `400` | `#1488FC` | — |
| Card title | `18px` | `600` | `#fff` | `1.35` |
| Body/description | `14–15px` | `400` | `rgba(255,255,255,0.55)` | `1.55–1.65` |
| FAQ question | `18px` | `500` | `#fff` | — |
| FAQ answer | `15px` | `400` | `rgba(255,255,255,0.55)` | `1.7` |

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
- Eyebrow + H2 always wrapped in `.dsa-reveal` for scroll animation
- H2 class: `ms-faq-headline` — `clamp(32px, 4vw, 52px)`, weight `500`, letter-spacing `-1px`
- Question padding: `28px 16px` (desktop), `22px 0` (mobile ≤768px)
- Answer padding: `0 16px 28px` (desktop), `0 0 24px` (mobile ≤768px)

---

## Scroll Animations
- Word-reveal: `.dsa-reveal` container + JS auto-wraps words in `.word` spans
- Eyebrow scramble: `.eyebrow-scramble` class triggers letter scramble on scroll
- How It Works line: `.how-steps-wrap` → `.line-active` class triggers node + text animations

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
- `marketing/microsoft.html` — Microsoft Teams & Copilot landing page
- `marketing/bolt-cli.html` — Bolt CLI landing page
- `marketing/platform.html` — Platform overview
- `marketing/pricing.html` — Pricing page
- `marketing/enterprise-staging.html` — Enterprise staging page (video hero + email capture, simpler version of enterprise page)
- `bolt.conf/index.html` — Bolt Conf event landing page — **Conference style** (keep in its own folder, separate from marketing)
