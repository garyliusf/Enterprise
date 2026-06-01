# Enterprise Marketing Pages — Design Standards

## Button Standards

All buttons must use these exact specs. No inline overrides unless absolutely necessary.

### Primary Blue Button (`.hero-btn-primary`)
- **Height:** `52px`
- **Padding:** `0 28px`
- **Font size:** `15px`
- **Font weight:** `600`
- **Background:** `#2563EB`
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
- **Background:** `#2563EB`
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
| Primary blue | `#2563EB` | Button backgrounds, accents |
| Hover blue | `#0f6fd0` | Button hover states |
| Brand blue | `#1488FC` | Eyebrows, labels, icons, badges |
| Body text | `#ABABAB` | Subtitles, secondary text |
| Muted text | `rgba(255,255,255,0.55)` | Descriptions, card text |

**Eyebrow color is always `#1488FC` — never use `rgba(20,136,252,0.7)` or any opacity variant.**

---

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Hero H1 | `clamp(44px, 5.5vw, 66px)` | `500` | `#fff` |
| Hero subtitle | `clamp(16px, 1.4vw, 20px)` | `400` | `#ABABAB` |
| Section headline | `clamp(32px, 4vw, 52px)` | `500` | `#fff` |
| Eyebrow | `16px` | `400` | `#1488FC` |
| Body/description | `14–15px` | `400` | `rgba(255,255,255,0.55)` |

---

## Pages
- `marketing/microsoft.html` — Microsoft Teams & Copilot landing page
- `marketing/bolt-cli.html` — Bolt CLI landing page
