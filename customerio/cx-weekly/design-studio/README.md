# CX Weekly — Design Studio components

Variant A rebuilt as **Customer.io Design Studio custom components**, so CX edits
visually (click text on the canvas, fill sidebar fields) instead of touching code.
This is the CX-facing editing layer; the code templates in `../templates/` remain
the canonical design source. Workspace: 224051.

| Component (tag) | Workspace id | Editable | Locked |
|---|---|---|---|
| `bolt-cx-hero` | 7c7f117b-aaf8-4b38-8566-a6efb10123f6 | headline (inline), subline, CTA label/link, product image + alt | cloud bg image, wordmark, type scale, button spec, 34px white gap |
| `bolt-cx-copy` | 14d64d5e-651c-411c-9d11-a6f5681af618 | paragraphs/lists dropped inside | white bg, 36px gutters, 16px/1.6 type |
| `bolt-cx-heading` | 723cfd18-a1a5-4b4b-9434-5ed1e0035485 | heading text (inline) | 24px/500, 32/36/16 padding |
| `bolt-cx-event` | 33029119-d0ff-462c-8284-258132131241 | title (inline), image, date, RSVP link/label | full-bleed image row, title/date/link styling, spacing |
| `bolt-cx-tip` | 20783580-4cf8-4d15-8b2a-ec26cd363d32 | body (inline, bold/italic/link), eyebrow, title, prompt toggle/label/text, CTA | card border/radius, badge, composer chrome + glow, button |
| `bolt-cx-signature` | 09285d3f-78a7-4f27-9da9-ea56b9490e1f | closing, signer | layout/centering |
| `bolt-cx-footer` | c68924d3-9905-44c3-a65d-d1a94899b0e4 | nothing | everything (wordmark, socials, legal address, `{% unsubscribe_url %}`) |

The assembled email lives as Design Studio node **1447823b-44b5-4316-999d-5ed94fed6401**
("CX Weekly — Variant A (Design Studio)", marked as a template) — see
`cx-weekly-a-email.html` for the markup. All components carry a `CX Weekly` section
in the insert menu, with descriptions.

## Variant B (Musicbed all-dark canvas) — `bolt-cxd-*`

Same system, dark design. Everything sits inside a **canvas** component (the black
rounded card); insert-menu section `CX Weekly (Dark)`.

| Component (tag) | Workspace id | Editable | Locked |
|---|---|---|---|
| `bolt-cxd-canvas` | e4b1ee5f-c0aa-4af5-92f5-b29b4d7df71c | blocks dropped inside | black card, radius 12, overflow clip |
| `bolt-cxd-header` | ce8851e5-5487-4443-9fd9-2489fa802bb1 | nothing | wordmark row |
| `bolt-cxd-hero` | 2306b392-c64a-49d3-9efa-8a63b62af0d0 | headline (inline), eyebrow, featured image + alt | badge/type styling, inset-rounded image layout |
| `bolt-cxd-copy` | b78a2ec3-a359-46e0-b417-a1ceece1c00c | paragraphs/lists inside (set color #ABABAB) | 40px gutters, grey type |
| `bolt-cxd-button` | 2f2f263e-5912-44fd-8d56-83e235a9c693 | label, link | button spec, left alignment |
| `bolt-cxd-heading` | cb280250-9657-44eb-884a-29a8a5f4c1f6 | heading text (inline) | 24px/500 white |
| `bolt-cxd-event` | 46c1527a-b596-4a7c-93de-d59538cc1db9 | title (inline), image, date, RSVP link/label | inset image, spacing, colors |
| `bolt-cxd-tip` | 533819a5-0cc2-44ec-9fe7-6dd637d94d49 | body (inline), eyebrow, title, prompt toggle/label/text, CTA | textured card, badge, composer chrome |
| `bolt-cxd-signature` | 3badf7f2-a6fa-44d0-a69d-2fffdeb1ecab | closing, signer | layout, white signer |
| `bolt-cxd-footer` | 101d4cfb-a799-435d-9c6c-45062fd9b74e | nothing | divider, wordmark, socials, legal, `{% unsubscribe_url %}` |

Assembled email: node **30f20689-6d40-47d0-bb03-c88796cd25b0** ("CX Weekly — Variant B
(Design Studio)", is_template) — markup in `cx-weekly-b-email.html`. The code
template's `#000001` band trick is deliberately absent: Design Studio emails ship
`color-scheme: normal` meta, which handles dark-mode clients, so plain `#000000` is
used throughout. Verified visually in the editor preview (canvas corners, all seams,
tip texture, footer).

**Weekly workflow (CX):** duplicate the template email → click text to edit, select a
block for its sidebar fields → add/remove `Bolt CX Event` blocks from the insert menu →
link it to a broadcast and send. No code visible anywhere.

**Editing a component (design change):** edit the file here first, then
`PUT /v1/environments/224051/design_studio/components/{id}` with the full file as
`content` — the two are hand-synced, same policy as the templates. Component edits
don't republish linked emails; re-publish to push changes. Check impact first with
`POST /ds/components/references`.

**Component roots must be table/td, never div (learned via a real bug):** a div-root
component leaks its first/last child's margins via CSS margin collapse — the list's
16px and the signature's 32px top margins escaped their white containers and showed
as beige page-background gaps between blocks (visible in Preview AND sent email).
Table cells don't collapse margins; all bolt-cx-* roots are tables now. The edit-mode
canvas additionally separates components as draggable rows — judge spacing only in
**Preview** or a test send.

**Gotchas learned:** component `content` must be the full `<script>`+`<template>` file
(raw markup saves fine but shows "No base component found"); `defaultValue` (editor)
is separate from the schema `.default()` (render); boolean props are passed
`:show-prompt="true"` — quoted-string form fails; `x-section width` includes its own
side padding (624px − 2×12px = the 600px design column); `{% unsubscribe_url %}`
survives the two-phase render into send time; **component attributes do NOT decode
HTML entities** — pass raw characters (`signer="Monika & …"`, never `&amp;`) or the
`${props}` interpolation double-escapes them. Slot/text content DOES take entities
(`&rsquo;`, `&mdash;`) normally.
