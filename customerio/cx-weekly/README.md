# Bolt CX weekly — Customer.io files

The Customer.io port of the CX weekly email, **variant A** (cloud hero → white content →
black footer). Same design as `hubspot/cx-weekly/`; design source of truth is
`emails/variants.html` (built by `emails/build_variants.py`).

```
cx-weekly/
  templates/cx-weekly-a.html    variant A — cloud hero, white content, black footer
  templates/cx-weekly-b.html    variant B — Musicbed-style all-dark canvas
  snippets/bolt_footer.html     shared-footer snippet (variant A style; B's footer is in-canvas)
```

Both templates share the same conventions: an EDIT block at the top holds every
per-send value; the markup below is locked. Variant B does NOT use the
`bolt_footer` snippet — its footer lives inside the black canvas.

Images live in the **Customer.io asset manager** (Assets page, workspace 224051) —
uploaded 2026-08-24 from `hubspot/cx-weekly/assets/` (still the source files in the
repo). The template and snippet reference the `userimg-assets.customeriomail.com`
CDN URLs directly (see Assets).

---

## How the HubSpot build maps to Customer.io

Customer.io has **no custom-module / drag-and-drop template system** — snippets are its
only reuse primitive, and snippets **cannot read variables assigned in the message body**
(only profile/event data). So the 7 HubSpot modules can't become 7 parameterised
snippets. Instead:

| HubSpot | Customer.io |
|---|---|
| Coded template + `dnd_area` | One standalone code-editor template |
| Module fields (edited in the sidebar) | The **EDIT block** — a marked Liquid section at the top of the template holding every per-send value (`{% assign %}` for short text, `{% capture %}` for HTML) |
| Repeatable event-row module (+ Add event) | `events` capture: **one line per event** (`image ;; title ;; date ;; link ;; label`, events separated by `@@`). The Liquid loop below reproduces the module's exact last-row spacing |
| Locked module markup | Everything below the `LOCKED MARKUP` line |
| — | `snippets/bolt_footer.html` — the footer is the only block with no per-send fields, so it's the only piece worth making a workspace snippet |

---

## Loading it into Customer.io

1. Create the email (broadcast/newsletter or campaign message) and choose the
   **code editor**.
2. Paste `templates/cx-weekly-a.html` in full.
3. **Edit once, before the first send:** the company name + postal address in the footer
   (the `[Company name] | [Street address]…` line — required for CAN-SPAM). The
   unsubscribe link is already wired to `{% unsubscribe_url %}`; if the workspace has a
   subscription center, swap it for `{% manage_subscription_preferences_url %}`.
4. Set the subject in the composer; the preheader comes from the `preheader` assign at
   the top of the template.

**Weekly workflow:** duplicate last week's email, then change only the EDIT block —
hero headline/subline/CTA, intro paragraphs, the "You'll learn" list, the event lines,
the tip card, the signature. Nothing below the `LOCKED MARKUP` line should need touching.

**Optional shared footer:** Settings → Snippets → create `bolt_footer`, paste
`snippets/bolt_footer.html`, then replace the template's inline footer table with
`{{snippets.bolt_footer}}`. URLs inside the snippet are hardcoded deliberately —
snippets can't see the template's `asset_base`.

There's no CLI equivalent of `hs upload` for email content — newsletters/campaign
bodies are created in the UI. (Snippets can also be managed via the App API
`/v1/snippets` endpoints with an App API key, if updating the footer ever needs
automating.)

---

## Editing events

One line per event inside `{% capture events %}`, fields separated by `;;`,
events separated by `@@` on its own line:

```
https://…/build-with-voice.jpg ;; Build with your voice ;; Thursday, August 27 ;; https://lu.ma/… ;; RSVP
@@
https://…/maker-photo.jpg ;; Maker session ;; Tuesday, September 1 ;; https://lu.ma/… ;; RSVP
```

- Leave a field empty to skip it (no image row, no date line, no RSVP link).
- No trailing `@@` after the last event.
- 1–6 events reads best (the HubSpot module capped at 6).
- Images 1200px wide, dark edges preferred.

---

## Assets

Hosted in the Customer.io asset manager (Assets page) — same filenames as
`hubspot/cx-weekly/assets/`, which remain the source files in the repo. Customer.io
keys each upload by a unique id, so there is no shared `asset_base`; every image
reference in the template's LOCKED assets block (and the 5 hardcoded URLs in the
`bolt_footer` snippet) carries its full `userimg-assets.customeriomail.com` URL.
To replace an image: upload the new file in the Assets page, copy its URL, and swap
it into the matching assign. Three uploaded files are spares for future weeks
(`bolt-templates.jpg`, `soulpress-app.jpg`, `callout-bg.jpg`).

All images are exported at 2x and displayed at 1x. **Never** swap them for data URIs or
relative paths — Gmail and Outlook block them.

---

## What CX edits vs. what's locked

**Editable (all in the EDIT block):** preheader · hero headline/subline/CTA/product
image · intro copy · "You'll learn" heading + list · events heading + event lines
(image, title, date, RSVP link — add/remove weeks by adding/removing lines) · tip card
(eyebrow, title, body, prompt toggle + text, CTA) · signature.

**Locked in the markup:** page and card colours, 600px width, type scale, spacing,
button spec (`#1389fd`, 15px/600, 15×28, 180px min-width, 2px radius), badge styling,
composer chrome, footer layout, and the Outlook dark-mode overrides.

Changing anything locked = a design change: do it in `emails/build_variants.py` first,
then port to BOTH `hubspot/cx-weekly/` and here — the three are hand-synced, not
generated from each other.

Note: the HubSpot-specific fixes (the `td.hs_padded` padding kill and the
`border-collapse` overrides for HubSpot's injected stylesheet) are deliberately absent —
Customer.io injects no stylesheet, so they're not needed. `border-collapse:separate`
stays inline on the radius-carrying tables as a defensive default.

---

## Before the first send

Send a test and open it in **Gmail app (light)**, **Gmail app (dark)**, **Apple Mail**,
and **Outlook (dark)**. Those four cover every failure mode hit while designing:

- hero seam invisible (image edge meets the black canvas)
- footer wordmark still visible in dark mode
- button still reads as a button in Outlook
- no light gradient sitting under light text

Also worth checking on the first Customer.io send specifically: the event loop renders
both default events with correct spacing (a mis-typed `;;`/`@@` shifts fields), and the
preheader shows in the inbox preview line.

See `emails/HUBSPOT-BUILD-GUIDE.md` for the reasoning behind the client checklist.
