# Building the CX emails in HubSpot

How to get variants **A** (Robinhood-style: cloud hero → white content → black footer)
and **B** (Musicbed-style: black canvas throughout) into HubSpot so CX can send them
weekly without touching HTML.

Design source of truth: `emails/variants.html` (staging:
https://garyliusf.github.io/Enterprise/emails/variants.html)

---

## The approach in one line

**One coded email template per variant + a handful of custom modules**, with the middle
of the email as a drag-and-drop area. Chrome (hero shell, footer, spacing, type, buttons)
is locked in the template; copy, images and links are module fields.

Not the plain drag-and-drop builder: it re-wraps content in its own tables and the
full-bleed images, 2px buttons and tuned spacing won't survive.

---

## 1. Upload the assets first

Marketing → Files. Suggested folder: `email/cx-weekly/`.

| File (in `emails/va/`) | Used for | Notes |
|---|---|---|
| `hero-bg.jpg` | Variant A hero background | 1200×1000, fades to solid black at the base |
| `nexal-dashboard.jpg` | Hero product shot / event image | dark-edged (required for A's seamless hero) |
| `build-with-voice.jpg` | Event image | |
| `maker-photo.jpg` | Event image | |
| `bolt-templates.jpg` | Event image | |
| `soulpress-app.jpg` | Example-app image (B) | |
| `callout-bg.jpg` | Announcement-card texture (B) | dark; safe on the dark design |
| `waveform.png` | Composer waveform (if the full composer is used) | transparent PNG |
| wordmark white / grey PNGs | Header + footer logos | export at 2x from the SVG masters |

Rules that matter:

- **Absolute HubSpot CDN URLs only.** The prototype's relative paths and data-URI logos
  will not render in a real send — Gmail and Outlook block data URIs.
- **Upload at 2x, display at 1x** (e.g. a 1200px-wide file shown at 600) so it stays sharp
  on retina.
- **Hero/event images must be dark-edged in variant A** — the hero bleeds into the black
  canvas, and a bright-edged image creates a visible seam. Tested and rejected once already.

---

## 2. Modules to create

Design Manager → new module, "Used in: Email". Names prefixed `Bolt —` so they group together.

### `Bolt — Hero`
| Field | Type | Default |
|---|---|---|
| Eyebrow | Text | THIS WEEK ON BOLT |
| Headline | Text | Take payments with the Stripe MCP |
| Subline | Text | This week on Bolt — live with the team. |
| CTA label | Text | Register now |
| CTA URL | URL | |
| Hero image | Image | `nexal-dashboard.jpg` |

Locked in the template: background image, wordmark, type sizes (33/22), button spec.

### `Bolt — Event row` *(repeatable — the important one)*
Make the whole field group repeatable, labelled **Event**.

| Field | Type | Help text |
|---|---|---|
| Image | Image | 600×400 or wider, dark-edged |
| Title | Text | ~60 characters reads best |
| Date | Text | e.g. Thursday, August 20 |
| RSVP URL | URL | |
| RSVP label | Text | default "RSVP →" |

CX gets **+ Add event**, drag-to-reorder, delete. Three events one week, two the next.

### `Bolt — Section heading`
| Field | Type |
|---|---|
| Heading | Text |

For "You'll learn how to:" / "Coming up next:". Size and weight locked (24/500).

### `Bolt — Rich text`
| Field | Type |
|---|---|
| Body | Rich text |

Restrict the toolbar to bold / italic / link / bullets. That covers every body paragraph
and bullet list in both emails, and prevents pasted-in font sizes and colors.

### `Bolt — Announcement card`
The reusable component (currently "Tip of the week"; also usable for feature launches, notices).

| Field | Type | Default |
|---|---|---|
| Eyebrow | Text | TIP OF THE WEEK |
| Title | Text | |
| Body | Rich text | |
| Show prompt box | Boolean | true |
| Prompt text | Text | the example prompt |
| CTA label | Text | Start Building |
| CTA URL | URL | |

Locked: card border/background, badge styling, composer chrome, corner glow, button.

### `Bolt — Signature`
| Field | Type | Default |
|---|---|---|
| Closing line | Text | Keep building, |
| Signer | Text | Monika & The Bolt Team ⚡ |

### `Bolt — Button` *(standalone, for one-off CTAs)*
| Field | Type |
|---|---|
| Label | Text |
| URL | URL |

Locked: `#1389fd`, 15px/600, 15×28 padding, 180px min-width, 2px radius (14px label on mobile).

---

## 3. Template structure

Coded file, `templateType: email`.

```
[locked]  page wrapper + card + hero shell
[locked]  Bolt — Hero module
[dnd_area] ← CX drags modules here: section heading, rich text,
             event rows, announcement card, button
[locked]  Bolt — Signature
[locked]  footer: wordmark, socials, address, unsubscribe
```

The `dnd_area` is what makes this flexible: CX can restructure a week's email from a palette
of approved modules without design review, and can't produce something off-system.

**Required by HubSpot to publish:** unsubscribe link and company address. Use HubSpot's
tokens rather than hard-coded text so they stay valid per-send. Attach the right
**subscription type** — these are marketing/lifecycle sends, distinct from the Rails
transactional emails.

---

## 4. Keep these details when translating the HTML

These were all found the hard way in testing; they're easy to lose in a rebuild.

- **Buttons:** the fill and radius sit on the `<td>`, not the `<a>` (bulletproof pattern —
  Outlook won't render a background on the anchor). Label carries `white-space: nowrap`.
- **Outlook dark-mode armor:** the `[data-ogsc]` / `[data-ogsb]` override block in the
  `<style>`, plus the color-group classes on elements. Without it, modern Outlook inverts
  the dark design. Classic Windows Outlook is deliberately out of scope.
- **No CSS gradients on backgrounds behind text.** Gmail dark repaints background *colors*
  but never background *images*, so a light gradient survives under flipped-light text and
  becomes unreadable. Solid tints only. (Decorative dark-on-dark gradients are fine.)
- **Logo colors:** white on dark surfaces, grey `#9E9C99` for quiet footer marks, never a
  black logo image on a light email — it ghosts when Gmail darkens the card.
- **Mobile rules live in `<style>`** (type scale, paddings, full-width tweaks) but every
  critical style is also inline, since Gmail can strip `<style>` in some contexts.
- **Alignment:** body content aligns to the banner wordmark's left edge — 36px desktop, 6%
  mobile. If the banner artwork is ever re-exported, re-check this.

---

## 5. Test before the first send

1. HubSpot preview → desktop + mobile.
2. Send a test to yourself; open in **Gmail app light**, **Gmail app dark**, **Apple Mail**,
   and **Outlook (web or app) dark**. Those four cover the real failure modes.
3. Check the hero seam (no visible line where the image meets the canvas), the footer
   wordmark is visible in dark mode, and the button reads as a button in Outlook.
4. If Litmus or Email on Acid is available, run the full grid once for the first send.

---

## 6. Weekly workflow after setup

1. Clone last week's email.
2. Update: hero headline + image, three event rows (title / date / link / image),
   the announcement card, subject line.
3. Preview, send a test, schedule.

Anything not exposed as a field — spacing, colors, type — needs a template change rather
than an editor change. That's deliberate: it's what keeps the design from drifting.
