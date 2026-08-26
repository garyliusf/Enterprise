# Bolt CX weekly — HubSpot files

Template, modules and assets for **variant A** (cloud hero → white content → black
footer). Design source of truth: `emails/variants.html`.

**Status (2026-08-26): live in the bolt.new portal (45403856) and synced.** Template +
7 modules uploaded to `cx-weekly/` in the Design Manager, images in the File Manager at
`email/cx-weekly/`, `asset_base` pointing at the real URLs. The template shows up under
the Custom tab when creating a Regular email.

**CX-team handoff guide** (how to build and send the weekly email — share this, not this
README): https://claude.ai/code/artifact/959816d2-dc81-4695-8d56-07989f6e1057

Re-upload after editing (from the repo root, CLI is authed via `hubspot.config.yml`):

```bash
hs cms upload hubspot/cx-weekly/modules cx-weekly/modules
hs cms upload hubspot/cx-weekly/templates cx-weekly/templates
```

Three rendering gotchas baked into the current files — don't undo them:

1. **Every module wraps itself in its own centered 600px table.** HubSpot div-wraps all
   module/dnd output, so bare `<tr>` splices get hoisted out of a shared template table
   and render full-bleed.
2. **The template CSS kills HubSpot's dnd padding with higher specificity**
   (`td.hs_padded`, `div.hse-section`) — HubSpot appends its generated stylesheet after
   all template styles, so source order can't win, and it re-adds padding at ≤639px.
3. **Radius-carrying tables force `border-collapse:separate`** — HubSpot's sheet sets
   `collapse`, which makes browsers ignore `border-radius` on bordered tables.

```
cx-weekly/
  templates/cx-weekly-a.html      the coded email template
  modules/*.module/               7 custom modules (module.html + fields.json + meta.json)
  assets/                         images to upload to the File Manager
```

---

## Option 1 — HubSpot CLI (recommended)

One-time setup:

```bash
npm install -g @hubspot/cli
hs init                     # paste a personal access key from Settings > Integrations > Private Apps
```

Then from the repo root:

```bash
hs upload hubspot/cx-weekly/modules  cx-weekly/modules
hs upload hubspot/cx-weekly/templates cx-weekly/templates
```

Upload the images separately (CLI can't write to the File Manager):
Marketing → Files → create `email/cx-weekly/` → drag in everything from `assets/`.

## Option 2 — paste by hand

Design Manager → File → New file → **Coded file** → *Email template*, paste
`templates/cx-weekly-a.html`. Then for each module: New file → **Module**, tick
*Email*, paste `module.html`, and add the fields from `fields.json` in the field editor.
Slower, but no CLI setup.

---

## After uploading: 3 things to wire up

1. **Point the template at your images.** Open `cx-weekly-a.html` and replace
   `YOUR-PORTAL.hubspotusercontent-na1.net/hubfs/email/cx-weekly` at the top with the real
   folder URL (copy any uploaded file's URL and trim the filename). Everything else
   derives from it.
2. **Check the module paths.** The template references `../modules/bolt-hero` etc. If you
   upload to a different folder, update those paths to match.
3. **Attach a subscription type** when you create the first email — these are
   marketing/lifecycle sends, separate from the Rails transactional emails.

---

## Assets

| File | Used for |
|---|---|
| `hero-bg.jpg` | hero background (fades to black at the base) |
| `nexal-dashboard.jpg` | hero product shot — **must be dark-edged**, it bleeds into the hero |
| `build-with-voice.jpg`, `maker-photo.jpg`, `bolt-templates.jpg`, `soulpress-app.jpg` | event images |
| `callout-bg.jpg` | announcement-card texture (dark designs only) |
| `wordmark-white.png` / `wordmark-grey.png` | header / footer logos (2x) |
| `social-*.png` | footer icons (2x) |

All exported at 2x and displayed at 1x. **Never** swap these for data URIs or relative
paths — Gmail and Outlook block them.

---

## What CX edits vs. what's locked

**Editable:** hero headline/subline/CTA/image · body copy and lists · section headings ·
event rows (image, title, date, RSVP link — with **+ Add event** to add or remove weeks) ·
announcement card (eyebrow, title, body, prompt, CTA) · signature.

**Locked in the template:** page and card colours, 600px width, type scale, spacing,
button spec (`#1389fd`, 15px/600, 15×28, 180px min-width, 2px radius), badge styling,
composer chrome, footer layout, and the Outlook dark-mode overrides.

Changing anything locked = a template edit, not an editor edit. That's deliberate.

---

## Before the first send

Send a test and open it in **Gmail app (light)**, **Gmail app (dark)**, **Apple Mail**, and
**Outlook (dark)**. Those four cover every failure mode we hit while designing:

- hero seam invisible (image edge meets the black canvas)
- footer wordmark still visible in dark mode
- button still reads as a button in Outlook
- no light gradient sitting under light text

See `emails/HUBSPOT-BUILD-GUIDE.md` for the reasoning behind these.
