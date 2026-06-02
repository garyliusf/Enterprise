# Pricing page — changes to merge

`share/pricing.html` is a **self-contained** copy of the pricing page (the shared
component CSS/JS are inlined, so there are **no external file dependencies** —
just drop it in / diff it against your copy).

## What changed this session

### Footer — now standardized to match the Microsoft/CLI/Enterprise footers
- Footer layout/typography unified: padding `90px 40px 0`, `gap: 24px`, headline `52px`,
  subtitle `18px` / `#ABABAB` / `max-width 640px` (mobile: headline `clamp(26px,8vw,36px)`
  line-height `1.1`, subtitle `16px` / `310px`, padding `48px 0 0`).
- Email-capture bar is a **bordered rounded card** (`.card-form-strip.is-carded`): `1px`
  border, `8px` radius, `space-between` layout (label left, input+submit right).
- Subtitle→form gap set to ~48px desktop / ~36px mobile (form `margin-top: -16px`,
  mobile override `-28px`).
- Animated **pixel field sits behind the headline** (canvas pulled up `-120px`, height `160px`).

### Footer pixel canvas — id standardized
- Renamed `#pricing-footer-pixel-canvas` → **`#footer-pixel-canvas`** (element id,
  `makePixelCanvas(...)` call, and `getElementById`) to match the other pages' convention.

### Typography — serif standardized
- All serif type uses **Cormorant Garamond** instead of **Playfair Display**
  (the rotating "Schedule a 1:1 with *Name*" in the footer).
- Google Fonts link swapped: removed `Playfair+Display`, added
  `Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400`.

## Notes
- The shared components (footer, FAQ accordion, buttons, eyebrows, email-capture card)
  live in `shared-components.css` / `shared-components.js` in the source repo
  (`garyliusf/Enterprise`). In this standalone file they're inlined under
  "shared-components (inlined for standalone sharing)" comments — if you'd rather keep them
  as separate shared files, grab those two from the source repo instead.
- Pricing-card buttons (`.cta-primary` / `.cta-blue`) are intentionally the smaller 42px
  card style — unchanged.
