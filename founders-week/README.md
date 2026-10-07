# Founders Week

Landing page for Founders Week (Oct 17–24): what the week is, a sign-up to
participate, the session schedule, the founder templates, and the competition
(prizes, entries gallery, submission form). Linear: DES-428, DES-430. Brief:
the "Founders Week page" step on the GTM launch board in Notion.

React + Vite + TypeScript, no other runtime dependencies. Built to be exported
to Bolt.

## Run it

```bash
npm install
npm run dev
```

## Where things live

| What | File |
|---|---|
| All copy, dates, prizes, sessions, templates | `src/config.ts` |
| Backend calls (Supabase REST, preview mode) | `src/lib/api.ts` |
| Database tables + security rules | `supabase/migrations/` |
| Page sections | `src/components/` |
| Page styles | `src/styles/page.css` |
| Shared marketing components (buttons, eyebrows, FAQ, H2) | `src/styles/shared-components.css`, `src/vendor/shared-components.js`: verbatim copies of `marketing/shared-components.*` in the Enterprise sandbox. Re-copy, don't edit. |

Anything still waiting on a decision is marked `TBC` in `config.ts` and shows a
small TBC tag on the page.

## Preview mode

Until `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, both forms
pretend to succeed without saving anything, and the gallery shows sample
entries. A small note under each form says so.

## Exporting to Bolt

1. Push this folder to its own GitHub repo (repo root = this folder).
2. Open `bolt.new/~/github.com/<owner>/<repo>`.
3. In Bolt, connect Supabase. Bolt sets the two env vars. Run the migration in
   `supabase/migrations/` (or ask Bolt to apply it).
4. Publish. Approve competition entries by setting `approved_at` on a row in
   the Supabase `entries` table; approved entries appear in the gallery.

## Data model

- `participants`: sign-ups (name, email, stage, what they're building). One
  per email.
- `entries`: competition submissions. One per email. Hidden until approved.
- The public key can only insert. The page reads a participant count
  (`participant_count()`) and approved entries without emails
  (`gallery_entries`).
