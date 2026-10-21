# bolt.new site monitor

Weekly audit of the live bolt.new marketing pages, run by a scheduled Claude
cloud routine that files de-duplicated Linear issues.

- `pages.json`: the pages (20 core pages + a rotating slice of 8 `/use-cases/*` slugs per ISO week), viewports (1440 / 834 / 390) and themes (light / dark).
- `monitor.mjs`: Playwright + axe-core (WCAG 2.2 AA) + CLAUDE.md design checks + console/network errors + a link check + Lighthouse performance. Writes `out/report.json` and `out/summary.md`.

```
npm run setup          # once: deps + Chromium
npm run audit          # full run, about 25–35 min
npm run audit:quick    # 3 pages, desktop + phone, light, no Lighthouse
node monitor.mjs --only /enterprise,/pricing
```

## What it checks

| Category | Checks | Severity |
|---|---|---|
| `a11y` | axe-core wcag2a/aa, 2.1, 2.2 AA: contrast, names, landmarks, ARIA, focusables under aria-hidden | axe critical/serious → high, moderate → medium |
| `design` | horizontal scroll; buttons 52px tall, 6px radius (form submit 0/6/6/0), 16px type on phones; section H2 on the `clamp(40px,4vw,52px)` / `clamp(28px,8vw,40px)` curve; 16px phone gutter floor; eyebrows never an opacity variant | h-scroll high, rest medium |
| `runtime` | JS exceptions, console errors, 4xx/5xx from bolt.new, stylesheets/scripts served as `text/html` (poisoned edge cache) | high / medium |
| `links` | every link on every page (deduped); external bot-blockers (LinkedIn 999, X 403, 429) reported as unverified | internal high, external medium, unverified low |
| `perf` | Lighthouse mobile + desktop on core pages; flags only clearly poor values (LCP > 4s, CLS > 0.25, TBT > 600ms) | medium |

Every finding has a `fingerprint` (rule + page + selector; `/use-cases/*` pages collapse to one) and a `groupKey` (rule + selector, page-independent) for grouping a template-level problem into one issue.

## Routine instructions

The cloud routine's prompt points here, so edit this section to change its behaviour; no routine update is needed.

1. `cd tools/site-monitor && npm run setup && npm run audit`. If the full run fails, retry once with `--no-lighthouse`, and say so in the digest.
2. Read `out/report.json`. **Triage before filing**, using judgment:
   - Group findings that share a `groupKey`, or are clearly one root cause (e.g. the same token failing contrast in many places), into ONE issue.
   - Drop noise: third-party script errors (analytics, Google sign-in, StackAdapt), transient timeouts that appear on one viewport only, and `link-unverified`.
   - Production-owned exceptions listed in the repo's `CLAUDE.md` are not drift: the 1120px nav mega-panel, the compact `templates/detail` H2, the editorial light pages (press/blog/customers) keeping solid light chrome, the prompt-box pill radius.
   - Work out which repo owns the fix: marketing pages → `stackblitz/bolt-public-pages` (name the stylesheet or section if the selector makes it obvious, e.g. `.mkt-nav-*` → `marketing-nav-footer.css`); `/pricing` and app-shell elements → `stackblitz/bolt`.
3. **De-duplicate against Linear.** Search the team's issues (open AND closed in the last 30 days) labelled `site-monitor` for each fingerprint (every issue body carries `fp:<fingerprint>` lines). Already open → add a short comment only if the scope changed (new pages/viewports), otherwise leave it. Closed in the last 30 days but still failing → reopen it with a comment ("still failing on …"). Not found → create it.
4. **What gets its own issue:** every `high` finding group, and `medium` a11y/runtime/link groups. **Everything else** (medium design drift, perf, low) goes into ONE weekly digest issue titled `Site monitor digest — YYYY-MM-DD`, which also carries the Core Web Vitals table and a week-over-week comparison against the previous digest (flag any page whose mobile LCP or score got >20% worse).
5. Issue format: title `[a11y] <what is wrong> — <page or "N pages">`; body = what fails and why it matters (WCAG criterion for a11y), affected pages × viewports × themes, selector(s) and the failing HTML snippet, the likely owning file, a concrete suggested fix, and the `fp:` lines. Label `site-monitor` + the category. Priority: high → 2 (High), medium → 3, digest → 4. Don't assign anyone.
6. Cap: at most 15 new issues per run; if there would be more, file the 15 most severe and list the rest in the digest.
7. Never change the website, open PRs, or commit to this repo. Finish with a 3-line summary: new / reopened / unchanged counts and the digest link.
