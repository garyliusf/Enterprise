#!/usr/bin/env python3
"""Generate bolt-public-pages' src/styles/use-case-route.css from solutions/_template.

The use-case route (src/pages/use-cases/[slug].astro) renders the shared section
library on top of use-case-page.css, which every CMS-built page also loads — so
the reviewed template design cannot be written into that file. This script
takes the template's own <style> blocks (the design source, light port
included) and emits them scoped under the route's wrapper,
`.use-case-page[data-page="use-case"]`, so they are inert everywhere else:

  - drops the inlined token layer (:root), the resets, and every rule that only
    styles the template's demo-only blocks (split hero, platform tabs,
    comparison table, split sections, two-button footer, video card, wordmark)
  - `.sc-section-h2` → `.section-headline` (production's name for the canon)
  - keyframes get a `uc-` prefix so they never collide with use-case-page.css
  - light-keyed rules keep their `html[data-theme="light"]` head
  - `body` becomes the wrapper rule; image urls point at /public-page-assets

Then it appends the hand-written chrome block (over-hero nav, footer line) that
the chrome-less template has no equivalent for.

    python3 tools/port-uc-css.py ~/Projects/bolt-public-pages/src/styles/use-case-route.css
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
out_path = pathlib.Path(sys.argv[1]).expanduser()
tpl = (ROOT / 'solutions/_template/index.html').read_text()

PFX = '.use-case-page.use-case-page[data-page="use-case"]'   # (0,3,0): outranks every base rule at equal structure
DEMO = re.compile(r'\.(?:plat-|compare-|split-|hero-section--split|footer-section--buttons|footer-cta-wrap--buttons|hero-video|video-modal|template-create|pvideo|hero-card|hero-play|hero-strip|bolt-wrap|bolt-fade|bolt-shimmer|bolt-image-wrap|rotating-name|hero-cta-button|hero-form-row|hero-email-input|logo-train|logo-track|logo-item|logos-section|logos-label|hero-aurora|re-prompt-input::placeholder)|#bolt-wordmark-img|#bolt-shimmer-canvas|#plat-|#compare-|#footer-pixel-canvas-b')
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
        text = re.sub(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', 'uc-' + k, text)
    return text

def scope(sel):
    sel = sel.replace('.sc-section-h2', '.section-headline')
    sel = re.sub(r'#how\b(?!-)', '#how-it-works', sel)
    m = re.match(r'^(html\[data-theme="light"\]|html\[data-theme=light\]|html body|html)\s+(.*)$', sel)
    if m: return f'{m.group(1)} {PFX} {m.group(2)}'
    return f'{PFX} {sel}'

def emit(items, depth=0):
    out = []
    for head, body in items:
        h = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()   # comments riding on the head (before at-rules too)
        if h.startswith('@keyframes'):
            out.append(f'@keyframes uc-{h.split()[1]} {{{rename_kf(body)}}}'); continue
        if h.startswith('@media') or h.startswith('@supports'):
            inner = emit(parse(body), depth + 1)
            if inner.strip() and 'prefers-color-scheme' not in h: out.append(f'{h} {{\n{inner}\n}}')   # the OS-dark media block only carried tokens
            continue
        if h.startswith('@'): continue   # @font-face / @property — not expected
        if not h: continue
        if DROP_WHOLE.match(h): continue
        if ':root' in h: continue   # the inlined token layer — production has sc-tokens.css
        decls = [d.strip() for d in re.sub(r'/\*.*?\*/', '', body, flags=re.S).split(';') if d.strip()]
        if decls and all(d.startswith('--') for d in decls): continue   # token-only blocks (.sc-on-light / .sc-on-dark)
        if h == 'body':
            out.append(f'{PFX} {{{rename_kf(body)}}}'); continue
        kept = keep_selectors(h)
        if not kept: continue
        b = rename_kf(body).replace('url("images/aurora-hero.webp")', 'url("/public-page-assets/use-cases/aurora-hero.webp")')
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

/* the section library's own extras this design does not use */
PFX .deploy-discovery { display: none; }                       /* the included panel's artwork + grain: the corner dither takes its place */
PFX .hero-section--simple .js-hero-pixel-dots { display: none; }   /* the dither is the hero's pixel layer */
/* numbered corner labels on the feature cards — the template renders a span,
   the section does not, so the count is drawn by CSS */
PFX .unlocks-grid { counter-reset: uc-card; }
PFX .unlock-card { counter-increment: uc-card; }
PFX .unlock-card::after { content: counter(uc-card, decimal-leading-zero); UNLOCK_NUM }
PFX .unlock-card:hover::after { color: #1488FC; }
/* CMS testimonial avatars render as initials */
PFX .testi-card-avatar--initials { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; background: rgba(20,136,252,0.14); color: #4DA6FF; border: 1px solid rgba(255,255,255,0.10); }
html[data-theme="light"] PFX .testi-card-avatar--initials { background: rgba(20,136,252,0.10); color: #0f6fd0; border-color: rgba(var(--sc-ink-rgb),0.10); }
/* footer: the CTA pills sit 88px above the footer line (the template's own
   wordmark lived inside the section; here the site footer follows) */
PFX .footer-section { padding-bottom: 88px; }
PFX .footer-section .footer-spacer { display: none; }
'''
num_rule = re.search(r'\.unlock-card > \.unlock-num, \.included-item > \.unlock-num \{([^}]*)\}', css)
assert num_rule, 'unlock-num rule not found'
chrome = CHROME.replace('UNLOCK_NUM', num_rule.group(1).strip()).replace('PFX', PFX)

header = f'''/* ── /use-cases/<slug> — the reviewed staging design (garyliusf/Enterprise
   solutions/_template, the use-case design source), ported 2026-10-02.
   GENERATED by tools/port-uc-css.py in the sandbox repo from the template's
   own <style> blocks — do not hand-edit the generated part; change the template
   and regenerate. Loaded by src/pages/use-cases/[slug].astro; EVERY rule is
   scoped under the route wrapper's data-page="use-case", which the route sets
   only on pages opted into the design (the canary first), so use-case-page.css
   — shared with every CMS-built page — is untouched and other use-case pages
   are byte-identical. Dark rules are the base (the --sc-* tokens resolve to the
   dark literals when no data-theme is set); light ones are keyed on
   html[data-theme="light"]. ──────────────────────────────────────────── */
'''
out_path.write_text(header + generated + '\n' + chrome)
print(f'wrote {out_path}: {len(generated.splitlines()):,} generated lines + chrome; keyframes {sorted(KF)}')
