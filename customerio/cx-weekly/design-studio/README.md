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

**Weekly workflow (CX):** duplicate the template email → click text to edit, select a
block for its sidebar fields → add/remove `Bolt CX Event` blocks from the insert menu →
link it to a broadcast and send. No code visible anywhere.

**Editing a component (design change):** edit the file here first, then
`PUT /v1/environments/224051/design_studio/components/{id}` with the full file as
`content` — the two are hand-synced, same policy as the templates. Component edits
don't republish linked emails; re-publish to push changes. Check impact first with
`POST /ds/components/references`.

**Editor note for CX:** the edit-mode canvas draws gaps between components (each is
a draggable row) — the white card looks "broken into sections" there. It isn't: the
rendered email is seamless. Toggle **Preview** at the bottom of the canvas to see
real spacing. Don't try to "fix" these gaps.

**Gotchas learned:** component `content` must be the full `<script>`+`<template>` file
(raw markup saves fine but shows "No base component found"); `defaultValue` (editor)
is separate from the schema `.default()` (render); boolean props are passed
`:show-prompt="true"` — quoted-string form fails; `x-section width` includes its own
side padding (624px − 2×12px = the 600px design column); `{% unsubscribe_url %}`
survives the two-phase render into send time.
