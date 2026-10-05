#!/usr/bin/env python3
"""Generate bolt-public-pages' src/styles/use-cases-page.css — the /use-cases
directory page on the reviewed staging design (marketing/use-cases/index.html).
Hand-mapped (the production sections use uc-* classes); the footer / prompt box
/ pills rules are reused from use-case-route.css (same footer-cta variant).

    python3 tools/port-use-cases-css.py ~/Projects/bolt-public-pages
"""
import re, sys, pathlib
repo = pathlib.Path(sys.argv[1]).expanduser()
P = '.use-case-page[data-page="use-cases"]'
NOISE = """url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")"""
NAV = '''
/* ── Over-hero nav — transparent with white ink at rest over the hero, solid
   once scrolled, solid with the drawer/menu open, both themes ── */
P .mkt-nav-shell { margin-bottom: calc(-1 * var(--sc-nav-overlap, 68px)); }
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) {
  background: var(--sc-nav-over-bg);
  border-bottom-color: var(--sc-nav-over-hairline);
  -webkit-backdrop-filter: var(--sc-nav-over-blur);
  backdrop-filter: var(--sc-nav-over-blur);
}
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link,
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-signin { color: var(--sc-nav-over-ink); }
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link:hover,
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link.is-open,
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link[data-state="open"] { color: var(--sc-nav-over-ink-hover); background: var(--sc-nav-over-ink-hover-bg); }
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-signin:hover { color: var(--sc-nav-over-ink-hover); }
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-logo svg path { fill: var(--sc-nav-over-logo); }
html[data-theme="light"] P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-burger span { background: var(--sc-nav-over-logo); }
P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded).is-scrolled:not(.has-menu-open) { background: var(--sc-nav-over-bg-scrolled); -webkit-backdrop-filter: none; backdrop-filter: none; }
html P .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded).has-menu-open { background: var(--sc-nav-bg-solid); -webkit-backdrop-filter: none; backdrop-filter: none; }
P .mkt-nav { transition: background-color 0.12s ease; }
P .mkt-nav-logo svg path { transition: fill 0.12s ease; }
'''
BODY = '''
/* ── Labels: the sans label face at Bold — eyebrows and every small-caps label ── */
P .section-eyebrow,
P .footer-eyebrow { font-family: var(--sc-font-label, 'Schibsted Grotesk', sans-serif); font-weight: var(--sc-label-weight, 700); font-size: var(--sc-eyebrow-size, 13px); }
P .uc-dir-filter,
P .uc-dir-search,
P .uc-dir-empty,
P .uc-card-tag { font-family: var(--sc-font-label, 'Schibsted Grotesk', sans-serif); font-weight: var(--sc-label-weight, 700); }

/* ── Section scaffolding: header rhythm 16 / 12 / 12 + 16 / 12 / 8, section units ── */
P .section-header { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 56px; }
P .section-header > * { margin: 0; }
P .unlocks-header .section-header { margin-bottom: 0; }
P .section-headline { color: var(--sc-ink, #fff); }
P .section-sub { color: var(--sc-text-muted, rgba(255,255,255,0.5)); max-width: 640px; }
@media (max-width: 1024px) {
  P .section-header { gap: 12px; }
  P .section { padding: 64px 0; }
}
@media (max-width: 768px) {
  P .section-header { gap: 8px; margin-bottom: 40px; }
  P .section-header > .section-eyebrow { margin-bottom: 4px; }
  P .section-sub { font-size: 15px; line-height: 1.4; }
  P .section { padding: 48px 0; }
  P main .hero-btn-primary { height: 52px; padding: 0 26px; font-size: 16px; min-width: var(--cta-min-w, 220px); max-width: 100%; }
}

/* ── Hero (hero-short): the family box + the nav overlap, copy centred ── */
P .uc-hero {
  min-height: calc(min(65vh, 684px) + var(--sc-nav-overlap, 0px));
  min-height: calc(min(65dvh, 684px) + var(--sc-nav-overlap, 0px));
  padding: calc(clamp(90px, calc(24px + 8.5vh), 148px) + var(--sc-nav-overlap, 0px)) 0 clamp(72px, 8vh, 112px);
  background: var(--sc-ground, #050507) radial-gradient(ellipse 70% 50% at 50% 30%, rgba(20,136,252,0.18) 0%, transparent 70%);
}
/* film grain over the field, dissolved before the foot (a full-bleed 5% dim ended in a line against the white next section) */
P .uc-hero::before {
  content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image: NOISE;
  background-size: 256px 256px; opacity: 0.05;
  -webkit-mask-image: linear-gradient(180deg, #000 65%, rgba(0,0,0,0) 95%);
          mask-image: linear-gradient(180deg, #000 65%, rgba(0,0,0,0) 95%);
}
/* dark: the hero fades into the black page */
html:not([data-theme="light"]) P .uc-hero::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 120px; z-index: 2; pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 55%, #000 100%);
}
P .uc-hero-dots { display: none; }   /* the dither is the hero's pixel layer */
P .uc-hero .hero-dither {
  position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;
  -webkit-mask-image: linear-gradient(180deg, #000 55%, rgba(0,0,0,0) 90%);
          mask-image: linear-gradient(180deg, #000 55%, rgba(0,0,0,0) 90%);
}
P .uc-hero-h1 { font-size: 66px; line-height: 1.1; letter-spacing: -0.5px; color: #fff; }
P .uc-hero-subtitle { font-size: clamp(16px, 1.4vw, 20px); line-height: 1.5; color: #ABABAB; max-width: 640px; }
/* hero stack standard: H1→subtitle 20 / 20 / 12, subtitle→CTA 32 / 32 / 24 — net of the 24px stack gap */
P .uc-hero-inner > .uc-hero-subtitle { margin-top: -4px; }
P .uc-hero .hero-btn-group { margin-top: 8px; }
P .uc-hero .hero-btn-group .hero-btn-primary { min-width: var(--cta-min-w, 180px); }
@media (max-width: 1024px) {
  P .uc-hero-h1 { font-size: 51px; }
  P .uc-hero-subtitle { font-size: 18px; }
}
@media (max-width: 768px) {
  P .uc-hero { min-height: 0; padding: calc(80px + var(--sc-nav-overlap, 0px)) 0 68px; }
  P .uc-hero-h1 { font-size: clamp(37px, 10.45vw, 51px); }
  P .uc-hero-subtitle { font-size: 16px; }
  P .uc-hero-inner > .uc-hero-subtitle { margin-top: -12px; }
  P .uc-hero .hero-btn-group { margin-top: 0; }
}

/* ── Featured panel ── */
P .uc-featured { padding-top: clamp(32px, 6vh, 64px); }   /* the section's own trim, restated: the bundler can order the section stylesheet before the base .section padding */
P .uc-bridge { width: min(1200px, calc(100vw - 160px)); margin: 0 auto -180px; height: 180px; }
P .uc-fcard-image {
  background:
    radial-gradient(120% 80% at 100% 0%, rgba(var(--sc-ink-rgb, 255, 255, 255), 0.07) 0%, transparent 55%),
    linear-gradient(165deg, #15151c 0%, #0a0a10 60%, #050508 100%);
}
P .unlocks-visual { border-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.12); }
P .uc-featured .unlocks-visual::after {
  background-image: linear-gradient(rgba(var(--sc-ink-rgb, 255, 255, 255), 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(var(--sc-ink-rgb, 255, 255, 255), 0.05) 1px, transparent 1px);
}
P .uc-fcard,
P .uc-dir-card {
  border-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.10);
  background: linear-gradient(180deg, rgba(var(--sc-ink-rgb, 255, 255, 255), 0.03) 0%, rgba(var(--sc-ink-rgb, 255, 255, 255), 0.005) 100%);
}
P .uc-fcard:hover,
P .uc-dir-card:hover { border-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.22); }
P .uc-fcard-image { border-bottom-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.08); }
P .uc-card-name { color: var(--sc-ink, #fff); }
P .uc-card-desc { color: var(--sc-text-desc, rgba(255,255,255,0.55)); }
P .uc-card-tag { color: var(--sc-text-desc, rgba(255,255,255,0.55)); border-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.18); }
P .uc-card-logo { background: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.05); border-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.08); color: var(--sc-ink, #fff); font-family: var(--sc-font-label, 'Schibsted Grotesk', sans-serif); font-size: 14px; font-weight: 700; }
/* dark: the pale dot field at full strength reads far too loud on black (Gary) */
html:not([data-theme="light"]) P .uc-fcard:hover .uc-card-canvas,
html:not([data-theme="light"]) P .uc-dir-card:hover .uc-card-canvas { opacity: 0.4; }
@media (max-width: 1024px) { P .uc-bridge { width: min(900px, calc(100vw - 80px)); } }
@media (max-width: 768px) {
  P .uc-bridge { width: calc(100vw - 32px); height: 160px; margin-bottom: -160px; }
  P .unlocks-visual { padding: 28px 20px; }
}

/* ── Directory ── */
P .uc-transition { width: min(1200px, calc(100vw - 160px)); margin: -120px auto -120px; height: 240px; }
P .uc-dir { background: var(--sc-band, #050508); padding-top: clamp(24px, 4vh, 48px); padding-bottom: clamp(24px, 4vh, 48px); }   /* the seam trims (both neighbours share the ground) */
P .uc-dir .section-sub a { color: #4DA6FF; font-weight: 600; }
P .uc-dir .section-sub a:hover { color: #7CBFFF; }
P .uc-dir-filters { border-top-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.08); border-bottom-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.08); }
P .uc-dir-filter { color: var(--sc-text-desc, rgba(255,255,255,0.55)); }
P .uc-dir-filter:hover { color: var(--sc-ink, #fff); }
P .uc-dir-filter.is-active { color: #0b6e57; background: #BCE6D7; }   /* restated: the scoped colour above outranks the section's own active rule */
P .uc-dir-search-wrap svg { color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.45); }
P .uc-dir-search { color: var(--sc-ink, #fff); }
P .uc-dir-search::placeholder { color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.35); }
P .uc-dir-empty { color: var(--sc-text-faint, rgba(255,255,255,0.4)); border-color: rgba(var(--sc-ink-rgb, 255, 255, 255), 0.10); }
@media (max-width: 1024px) {
  P .uc-transition { width: min(900px, calc(100vw - 80px)); }
  P .uc-dir { padding-top: clamp(24px, 4vh, 48px); padding-bottom: clamp(24px, 4vh, 48px); }
}
@media (max-width: 768px) {
  P .uc-transition { width: calc(100vw - 32px); height: 180px; }
  P .uc-dir { padding-top: 48px; padding-bottom: 48px; }
}

/* ═══ LIGHT — the staging page's own theme-keyed rules ═══ */
/* the approved DEEP light hero (the bowl): a wide radial dome hangs from above over a smooth light ramp; white settles in the last fifth */
html[data-theme="light"] P .uc-hero {
  background:
    radial-gradient(140% 150% at 50% -32%,
      #04091a 0%, #061129 26%, #081b3f 38%, #0b2a58 48%, #0f3c78 56%,
      #155a9e 62%, #1f74bd 67%, rgba(58,142,205,0.8) 72%,
      rgba(108,178,224,0.45) 78%, rgba(150,205,238,0.15) 82.5%,
      rgba(175,220,243,0) 86%),
    linear-gradient(180deg,
      #2f80c4 45%, #5da5d8 58%, #8ec6e8 68%, #bcdcf1 76%,
      #d6e9f7 81.5%, #e6f1fa 85.5%, #f0f7fc 88.5%, #f7fbfe 91%,
      #fbfdfe 93%, #fdfeff 94.5%, #fff 96%), #fff;
}
html[data-theme="light"] P .uc-hero-subtitle { color: rgba(255,255,255,0.94); }
/* the featured panel is a light paper-grid pocket: light surface + quiet ambient shadow */
html[data-theme="light"] P .unlocks-visual { background: var(--sc-surface); box-shadow: 0 6px 20px rgba(15,26,42,0.05), inset 0 1px 0 rgba(255,255,255,0.6); }
/* 1px hero-foot antialiasing artifact — a full-bleed ground strip covers the boundary */
html[data-theme="light"] P .uc-featured { margin-top: -2px; position: relative; }
html[data-theme="light"] P .uc-featured::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: var(--sc-ground); z-index: 0; pointer-events: none; }
html[data-theme="light"] P .uc-dir .section-sub a { color: #1488FC; }
html[data-theme="light"] P .uc-dir .section-sub a:hover { color: #0f6fd0; }
'''
HEAD = '''/* ── /use-cases (the directory) — the reviewed staging design
   (garyliusf/Enterprise marketing/use-cases/index.html), ported 2026-10-05 on
   the /solutions recipe. GENERATED by tools/port-use-cases-css.py in the
   sandbox repo. Loaded by the use-cases-directory section, which only this
   page uses; EVERY rule is scoped under the page wrapper's data-page, so
   hero-short / use-cases-featured / footer-cta are untouched elsewhere.
   Colours come from the --sc-* tokens (no data-theme = the dark literals the
   sections ship; html[data-theme="light"] flips them). ─────────────────── */

P {
  --sc-nav-overlap: 69px;   /* the bar's BOX: 68px + its 1px hairline */
  --sub-to-cta: 32px;
  --cta-min-w: 180px;
  background: var(--sc-ground, #000);
  color: var(--sc-ink, #fff);
  font-family: var(--sc-font-sans, 'Schibsted Grotesk', sans-serif);
  line-height: normal;   /* the site's Tailwind base sets 1.5; the staging page is browser-normal */
}
@media (max-width: 768px) { P { --sub-to-cta: 24px; --cta-min-w: 220px; } }
P main button,
P main input,
P .hero-btn-primary,
P .re-prompt-submit { font-family: var(--sc-font-sans, 'Schibsted Grotesk', sans-serif); }
'''
css = (HEAD + NAV + BODY).replace('P ', P + ' ').replace('P {', P + ' {').replace('NOISE', NOISE)
# footer + prompt box + pills: reuse the use-case route's generated rules (the same footer-cta "use-case" variant), re-scoped
route = (repo / 'src/styles/use-case-route.css').read_text()
RP = '.use-case-page.use-case-page[data-page="use-case"]'
def blocks(src):
    i, n, out = 0, len(src), []
    while i < n:
        j = src.find('{', i)
        if j < 0: break
        head = src[i:j]; depth, k = 1, j + 1
        while k < n and depth:
            if src[k] == '{': depth += 1
            elif src[k] == '}': depth -= 1
            k += 1
        out.append((head.strip(), src[j + 1:k - 1])); i = k
    return out
FOOT = re.compile(r'\.(footer-section|footer-eyebrow|footer-headline|footer-subtitle|footer-cta-wrap|footer-prompt-stack|footer-cta-pills|footer-spacer|re-prompt-shell|re-prompt-input|re-prompt-actions|re-prompt-submit|hero-pills)')
def pick(head, body):
    head = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()
    if head.startswith('@media'):
        inner = '\n'.join(x for h, b in blocks(body) for x in pick(h, b))
        return [f'{head} {{\n{inner}\n}}'] if inner.strip() else []
    if head.startswith('@') or not head: return []
    sels = [s.strip() for s in head.split(',') if FOOT.search(s)]
    return [', '.join(s.replace(RP, P) for s in sels) + ' {' + body + '}'] if sels else []
foot = [x for h, b in blocks(route) for x in pick(h, b)]
css += '\n/* ═══ Footer CTA + prompt box + pills — the use-case route\'s rules (the same footer-cta "use-case" variant), re-scoped ═══ */\n' + '\n'.join(foot) + '\n'
css += '''
/* this page's own footer measure (the route rules above carry the use-case template's) */
P .footer-section { border-top: 0; }
P .footer-section .footer-subtitle { max-width: 640px !important; white-space: normal; }
@media (max-width: 768px) {
  P .uc-featured { padding-top: 48px; }   /* the phone section unit (the restated trim above would otherwise win) */
  P .footer-section { padding-top: 48px; padding-left: 0; padding-right: 0; }
  P .footer-section > *:not(canvas):not(.footer-cta-wrap):not(.hero-pills) { padding-left: 12px; padding-right: 12px; box-sizing: border-box; width: 100%; }   /* the staging structure: full-bleed section, 12px text gutters */
  P .footer-cta-wrap { padding-left: 16px; padding-right: 16px; box-sizing: border-box; }   /* the prompt box keeps the 16px floor */
  P .footer-section .footer-subtitle { max-width: 380px !important; }
}
'''.replace('P ', P + ' ')
(repo / 'src/styles/use-cases-page.css').write_text(css)
print(f'wrote use-cases-page.css: {len(css.splitlines())} lines ({len(foot)} footer rules reused)')
