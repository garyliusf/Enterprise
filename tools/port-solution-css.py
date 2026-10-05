#!/usr/bin/env python3
"""Generate bolt-public-pages' src/styles/solution-route.css from solutions/smb.

The solutions route (src/pages/solutions/[slug].astro -> SolutionPageBody) renders
the shared section library on top of solution-page.css (the old dark design).
solutions/smb/index.html is the reviewed design source for that route (same
structure one for one). This script takes the page's own <style> blocks (light
port included) and emits them scoped under the route wrapper,
`.solution-page[data-page="solution"]`:

  - drops the inlined token layer (:root), the resets, and every rule for
    things the route does not render from this design: the sandbox wordmark,
    logo train, email strips, promo banner, review toggle, and the VIDEO card
    (production's video-section has its own markup + styles; light rules for it
    are in the hand-written block)
  - keyframes get a `sol-` prefix; `#hero-dither` -> `.hero-dither`
  - light-keyed rules keep their `html[data-theme="light"]` head
  - `body` becomes the wrapper rule; the hero art points at /public-page-assets

Then it appends the hand-written chrome block (over-hero nav, footer line,
card numerals by CSS counter, footer prompt stack, video section on light).

    python3 tools/port-solution-css.py ~/Projects/bolt-public-pages/src/styles/solution-route.css
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
out_path = pathlib.Path(sys.argv[1]).expanduser()
tpl = (ROOT / 'solutions/smb/index.html').read_text()

PFX = '.solution-page.solution-page[data-page="solution"]'   # (0,3,0): outranks every base rule at equal structure
DEMO = re.compile(r'\.(?:promo-banner|bp-page|hero-video|video-modal|video-section|hero-card|hero-play|hero-strip|hero-preview|hero-social-proof|template-create|bolt-wrap|bolt-fade|bolt-shimmer|bolt-image-wrap|footer-image-section|rotating-name|hero-cta-button|hero-form-row|hero-email-input|card-form-strip|footer-form-row|footer-email-input|logo-train|logo-track|logo-item|logos-section|logos-label|hero-aurora|sc-theme-switch|sc-pages|mkt-nav|site-footer)|#bolt-wordmark-img|#bolt-shimmer-canvas|#modal-|#video-|body\.bp-page')
DROP_WHOLE = re.compile(r'^(?::root|\*|html|\.sr-only)$')

# ── 1. collect the template's style blocks (every <style> before <body>) ──
head = tpl[:tpl.index('<body>')]
blocks = re.findall(r'<style[^>]*>(.*?)</style>', head, re.S)
css = '\n'.join(blocks)
css = re.sub(r'/\*.*?\*/', lambda m: m.group(0) if '\n' not in m.group(0) and len(m.group(0)) < 160 else '', css, flags=re.S)   # keep short inline comments

# ── 2. a small tokenizer: top-level items are rules or at-rules with a body ──
def parse(src):
    items, i, n = [], 0, len(src)
    while i < n:
        j = src.find('{', i)
        if j == -1: break
        head = src[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if src[k] == '{': depth += 1
            elif src[k] == '}': depth -= 1
            k += 1
        body = src[j + 1:k - 1]
        items.append((head, body)); i = k
    return items

def keep_selectors(head):
    """drop demo-only selectors from a selector list; None = drop the rule"""
    sels = [s.strip() for s in head.split(',')]
    kept = [s for s in sels if not DEMO.search(s)]
    return kept or None

KF = set(re.findall(r'@keyframes\s+([\w-]+)', css))
def rename_kf(text):
    for k in KF:
        text = re.sub(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', 'sol-' + k, text)
    return text

BARE_BTN = re.compile(r'^\.(hero-btn-primary|hero-btn-ghost|footer-cta-btn)(?![\w-])')
def scope(sel):
    sel = sel.replace('.sc-section-h2', '.section-headline')
    sel = re.sub(r'#how\b(?!-)', '#how-it-works', sel).replace('#hero-dither', '.hero-dither')
    # the template has no navbar, so its button rules start at the bare class;
    # on the route the navbar's "Get Started" (.mkt-nav-cta.hero-btn-primary)
    # sits outside <main> and must keep the bar's 38px size
    m = re.match(r'^(html\[data-theme="light"\]|html\[data-theme=light\]|html body|html)\s+(.*)$', sel)
    head, rest = (m.group(1) + ' ', m.group(2)) if m else ('', sel)
    if BARE_BTN.match(rest): rest = 'main ' + rest
    return f'{head}{PFX} {rest}'

def emit(items, depth=0):
    out = []
    for head, body in items:
        h = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()   # comments riding on the head (before at-rules too)
        if h.startswith('@keyframes'):
            out.append(f'@keyframes sol-{h.split()[1]} {{{rename_kf(body)}}}'); continue
        if h.startswith('@media') or h.startswith('@supports'):
            inner = emit(parse(body), depth + 1)
            if inner.strip() and 'prefers-color-scheme' not in h: out.append(f'{h} {{\n{inner}\n}}')   # the OS-dark media block only carried tokens
            continue
        if h.startswith('@'): continue   # @font-face / @property — not expected
        if not h: continue
        if DROP_WHOLE.match(h): continue
        if ':root' in h: continue   # the inlined token layer — production has sc-tokens.css
        decls = [d.strip() for d in re.sub(r'/\*.*?\*/', '', body, flags=re.S).split(';') if d.strip()]
        if decls and all(d.startswith('--sc-') for d in decls): continue   # token-only blocks (.sc-on-light / .sc-on-dark); component vars like --rail-w stay
        if h == 'body':
            out.append(f'{PFX} {{{rename_kf(body)}}}'); continue
        kept = keep_selectors(h)
        if not kept: continue
        b = rename_kf(body).replace('url("images/aurora-hero.webp")', 'url("/public-page-assets/solutions/aurora-hero.webp")')
        if 'images/' in b: continue   # any other local art belongs to a dropped component
        out.append(', '.join(scope(s) for s in kept) + ' {' + b + '}')
    return '\n'.join(out)

generated = emit(parse(css))

CHROME = '''
/* ═══ Chrome + route plumbing (hand-written — the template is chrome-less) ═══ */
PFX {
  --sc-nav-overlap: 69px;   /* the bar's BOX: 68px + its 1px hairline; the hero pads down by it */
  line-height: normal;      /* the site's Tailwind base sets 1.5; the template is browser-normal (every stack measured 3-4px taller without this) */
}
PFX .mkt-nav-shell { margin-bottom: calc(-1 * var(--sc-nav-overlap, 68px)); }
/* Over-hero nav — transparent with white ink at rest over the hero, solid once
   scrolled, solid with the drawer/menu open, both themes (as /solutions, /platform/security) */
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) {
  background: var(--sc-nav-over-bg);
  border-bottom-color: var(--sc-nav-over-hairline);
  -webkit-backdrop-filter: var(--sc-nav-over-blur);
  backdrop-filter: var(--sc-nav-over-blur);
}
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link,
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-signin { color: var(--sc-nav-over-ink); }
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link:hover,
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link.is-open,
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-link[data-state="open"] { color: var(--sc-nav-over-ink-hover); background: var(--sc-nav-over-ink-hover-bg); }
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-signin:hover { color: var(--sc-nav-over-ink-hover); }
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-logo svg path { fill: var(--sc-nav-over-logo); }
html[data-theme="light"] PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded):not(.is-scrolled):not(.has-menu-open) .mkt-nav-burger span { background: var(--sc-nav-over-logo); }
PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded).is-scrolled:not(.has-menu-open) { background: var(--sc-nav-over-bg-scrolled); -webkit-backdrop-filter: none; backdrop-filter: none; }
html PFX .mkt-nav:not(.mkt-nav--solid):not(.mkt-nav--embedded).has-menu-open { background: var(--sc-nav-bg-solid); -webkit-backdrop-filter: none; backdrop-filter: none; }
PFX .mkt-nav { transition: background-color 0.12s ease; }
PFX .mkt-nav-logo svg path { transition: fill 0.12s ease; }

PFX .hero-section .js-hero-pixel-dots { display: none; }   /* the dither is the hero's pixel layer */
/* numbered corner labels on the feature cards — the staging page renders a span,
   the section does not, so the count is drawn by CSS */
PFX .unlocks-grid { counter-reset: sol-card; }
PFX .unlock-card { counter-increment: sol-card; }
PFX .unlock-card::after { content: counter(sol-card, decimal-leading-zero); UNLOCK_NUM }
PFX .unlock-card:hover::after { color: #1488FC; }
/* footer: the CTA pills sit 88px above the footer line; the prompt stack's
   pull-up is written inline by the section (-135px) — subtitle→prompt box is
   32 / 32 / 24 on this design */
PFX .footer-section { padding-bottom: 88px; }
PFX .footer-section .footer-spacer { display: none; }
PFX .footer-section > div:has(> .js-footer-pixel-canvas) { margin-top: -142px !important; }
@media (max-width: 768px) { PFX .footer-section > div:has(> .js-footer-pixel-canvas) { margin-top: -150px !important; } }
PFX .footer-section .hero-pills { margin-top: 0; }                      /* prompt box → pills 24 (the staging footer zeroes the hero pull-up inline) */
/* the section's footer box is the comet shell (glow track, no border). On light it sits on the white ground, where the
   staging design is the plain bordered card (as the use-case footer); dark keeps production's comet */
html[data-theme="light"] PFX .footer-section .re-prompt-shell { background: #fff; border: 1px solid var(--sc-line); padding: 0; box-shadow: 0 4px 16px rgba(15,26,42,0.05); }
html[data-theme="light"] PFX .footer-section .re-prompt-shell:focus-within { border-color: #1488FC; box-shadow: 0 0 0 1px #1488FC, 0 4px 16px rgba(15,26,42,0.05); }
html[data-theme="light"] PFX .footer-section .hero-prompt-glow { display: none; }
PFX .ms-faq-section { border-top: 0; }                                   /* the customer-story card above already ends the section */
PFX .how-header .section-sub { max-width: 680px; }                       /* staging sets this inline */
PFX .why-layout > .dsa-reveal:first-child > .section-headline { margin-bottom: 0; }
/* the stats heading has no .why-header class in the section markup */
PFX .why-layout > .dsa-reveal:first-child { max-width: 900px; margin-bottom: clamp(40px,6vh,72px); }
@media (max-width: 768px) { PFX .why-layout > .dsa-reveal:first-child { margin-bottom: 32px; } }
/* ── VIDEO section (the real-estate page): production's own component, not in
   the staging page — its dark card stays dark on light (an .sc-on-dark island),
   only the ground and the strip under it follow the theme ── */
html[data-theme="light"] PFX .video-section { background: var(--sc-ground); border-top-color: var(--sc-line-soft); }
'''
num_rule = re.search(r'\.unlock-card > \.unlock-num \{([^}]*)\}', css)
assert num_rule, 'unlock-num rule not found'
chrome = CHROME.replace('UNLOCK_NUM', ' '.join(num_rule.group(1).split())).replace('PFX', PFX)

header = f'''/* ── /solutions/<slug> — the reviewed staging design (garyliusf/Enterprise
   solutions/smb, the design source for this route), ported 2026-10-05.
   GENERATED by tools/port-solution-css.py in the sandbox repo from the page's
   own <style> blocks — do not hand-edit the generated part; change the staging
   page and regenerate. Loaded by src/pages/solutions/[slug].astro after
   solution-page.css; EVERY rule is scoped under the route wrapper's
   data-page="solution" (set by SolutionPageBody; custom-layout solutions do
   not get it). Dark rules are the base (the --sc-* tokens resolve to the dark
   literals), light ones are keyed on html[data-theme="light"]. ───────────── */
'''
out_path.write_text(header + generated + '\n' + chrome)
print(f'wrote {out_path}: {len(generated.splitlines()):,} generated lines + chrome; keyframes {sorted(KF)}')
