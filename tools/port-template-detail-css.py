#!/usr/bin/env python3
"""Generate bolt-public-pages' src/styles/template-detail-page.css from marketing/templates/detail.

The template detail route (src/pages/resources/templates/[slug].astro) renders its
own markup on use-case-page.css + built-page-variants.css + template-detail.css
(the dark design). The staging page is the reviewed design; this emits its own
<style> block scoped under the route wrapper, `.use-case-page[data-page="template-detail"]`:

  - drops the inlined token layer, the resets, the inline navbar / site-footer /
    wordmark copies, the review toggle and the sandbox footer-CTA rules (the
    footer-cta section's rules are reused from use-case-route.css instead)
  - `.detail-shell` -> `.tpl-detail`, `.section-eyebrow` -> `.tpl-eyebrow`,
    `.section-headline` / `.sc-section-h2` -> `.tpl-headline`
  - keyframes `td-` prefixed; `body` -> the wrapper; light rules keep their head

    python3 tools/port-template-detail-css.py ~/Projects/bolt-public-pages
"""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
repo = pathlib.Path(sys.argv[1]).expanduser()
out_path = repo / 'src/styles/template-detail-page.css'
page = (ROOT / 'marketing/templates/detail/index.html').read_text()

PFX = '.use-case-page.use-case-page[data-page="template-detail"]'
DEMO = re.compile(r'\.(?:mkt-nav|site-footer|footer-image-section|bolt-wrap|bolt-fade|bolt-shimmer|bolt-image-wrap|sc-theme-switch|sc-pages|footer-section|footer-eyebrow|footer-headline|footer-subtitle|footer-prompt-stack|footer-cta|re-prompt|hero-pills|logo-train|logo-track|logo-item)|#bolt-|#footer-pixel')
DROP_WHOLE = re.compile(r'^(?::root|\*|html|\.sr-only)$')

css = [m.group(2) for m in re.finditer(r'<style([^>]*)>(.*?)</style>', page, re.S) if 'id="' not in m.group(1)][0]
css = re.sub(r'/\*.*?\*/', lambda m: m.group(0) if '\n' not in m.group(0) and len(m.group(0)) < 160 else '', css, flags=re.S)

def parse(src):
    items, i, n = [], 0, len(src)
    while i < n:
        j = src.find('{', i)
        if j == -1: break
        head = src[i:j].strip(); depth, k = 1, j + 1
        while k < n and depth:
            if src[k] == '{': depth += 1
            elif src[k] == '}': depth -= 1
            k += 1
        items.append((head, src[j + 1:k - 1])); i = k
    return items
KF = set(re.findall(r'@keyframes\s+([\w-]+)', css))
def rename_kf(t):
    for k in KF: t = re.sub(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', 'td-' + k, t)
    return t
BARE_BTN = re.compile(r'^\.(hero-btn-primary|hero-btn-ghost)(?![\w-])')
def scope(sel):
    sel = (sel.replace('.detail-shell', '.tpl-detail').replace('.section-eyebrow', '.tpl-eyebrow')
              .replace('.section-headline', '.tpl-headline').replace('.sc-section-h2', '.tpl-headline'))
    m = re.match(r'^(html\[data-theme="light"\]|html\[data-theme=light\]|html body|html)\s+(.*)$', sel)
    head, rest = (m.group(1) + ' ', m.group(2)) if m else ('', sel)
    if BARE_BTN.match(rest): rest = 'main ' + rest   # the navbar's Get Started shares .hero-btn-primary
    return f'{head}{PFX} {rest}'
def emit(items):
    out = []
    for head, body in items:
        h = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()
        if h.startswith('@keyframes'): out.append(f'@keyframes td-{h.split()[1]} {{{rename_kf(body)}}}'); continue
        if h.startswith('@media') or h.startswith('@supports'):
            inner = emit(parse(body))
            if inner.strip() and 'prefers-color-scheme' not in h: out.append(f'{h} {{\n{inner}\n}}')
            continue
        if h.startswith('@') or not h or DROP_WHOLE.match(h) or ':root' in h: continue
        decls = [d.strip() for d in re.sub(r'/\*.*?\*/', '', body, flags=re.S).split(';') if d.strip()]
        if decls and all(d.startswith('--sc-') for d in decls): continue
        if h == 'body': out.append(f'{PFX} {{{rename_kf(body)}}}'); continue
        kept = [s.strip() for s in h.split(',') if not DEMO.search(s)]
        if not kept: continue
        b = rename_kf(body)
        if 'images/' in b: continue
        out.append(', '.join(scope(s) for s in kept) + ' {' + b + '}')
    return '\n'.join(out)
generated = emit(parse(css))
must = lambda c, m: None if c else sys.exit('ASSERT: ' + m)
must('.mkt-nav' not in generated and '.site-footer' not in generated, 'chrome rules leaked')

# footer-cta section rules, reused from the use-case route (the same variant as the catalog page)
route = (repo / 'src/styles/use-case-route.css').read_text()
RP = '.use-case-page.use-case-page[data-page="use-case"]'
FOOT = re.compile(r'\.(footer-section|footer-eyebrow|footer-headline|footer-subtitle|footer-cta-wrap|footer-prompt-stack|footer-cta-pills|footer-spacer|re-prompt-shell|re-prompt-input|re-prompt-actions|re-prompt-submit|hero-pills|hero-btn-primary|hero-btn-ghost|btn-bg-hover|btn-text-wrap|btn-text-inner|btn-pixelized)')   # + the shared button rules (the staging page links shared-components.css; the route carries its inlined copy)
def pick(head, body):
    head = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()
    if head.startswith('@media'):
        inner = '\n'.join(x for h, b in parse(body) for x in pick(h, b))
        return [f'{head} {{\n{inner}\n}}'] if inner.strip() else []
    if head.startswith('@') or not head: return []
    sels = [s.strip() for s in head.split(',') if FOOT.search(s)]
    return [', '.join(s.replace(RP, PFX) for s in sels) + ' {' + body + '}'] if sels else []
foot = [x for h, b in parse(route) for x in pick(h, b)]
must(foot and RP not in '\n'.join(foot), 'footer reuse')

CHROME = '''
/* ═══ Route plumbing (hand-written) ═══ */
PFX { line-height: normal; }   /* the staging page is browser-normal; the site's Tailwind base is 1.5 */
/* the section script injects a hover dot-field canvas into every .unlock-card on themed pages; this design does not use it */
PFX .unlock-field-canvas { display: none; }
PFX .catalog-card-tag { padding-top: 0; }   /* built-page-variants pads it 2px */
/* the sticky clone bar sits OUTSIDE <main> (after the site footer), so the reused `main .hero-btn-primary` rules miss it */
PFX .sticky-banner .hero-btn-primary { color: #fff; font-family: var(--sc-font-sans, 'Inter', sans-serif); }
/* footer-cta section (the catalog page's use-case variant; its own .footer-cta-wrap pull-up is in the reused rules): the staging footer measure + the 88px line */
PFX .footer-section { border-top: 0; padding-bottom: 88px; }
PFX .footer-section .footer-spacer { display: none; }
PFX .footer-section .footer-subtitle { max-width: 640px !important; white-space: normal; }
@media (max-width: 768px) {
  PFX .footer-section { padding-top: 48px; padding-left: 0; padding-right: 0; }
  PFX .footer-section > *:not(canvas):not(.footer-cta-wrap):not(.hero-pills) { padding-left: 12px; padding-right: 12px; box-sizing: border-box; width: 100%; }
  PFX .footer-cta-wrap { padding-left: 16px; padding-right: 16px; box-sizing: border-box; }
  PFX .footer-section .footer-subtitle { max-width: 380px !important; }
}
'''.replace('PFX', PFX)

header = '''/* ── /resources/templates/<slug> — the reviewed staging design (garyliusf/Enterprise
   marketing/templates/detail), ported 2026-10-05. GENERATED by
   tools/port-template-detail-css.py in the sandbox repo from the page's own
   <style> block — do not hand-edit the generated part; change the staging page
   and regenerate. Loaded by src/pages/resources/templates/[slug].astro after
   template-detail.css; EVERY rule is scoped under the wrapper's
   data-page="template-detail". Dark rules are the base (the --sc-* tokens
   resolve to the dark literals), light ones are keyed on html[data-theme="light"]. */
'''
out_path.write_text(header + generated + '\n\n/* ═══ Footer CTA + prompt box — the use-case route\'s rules, re-scoped ═══ */\n' + '\n'.join(foot) + '\n' + CHROME)
print(f'wrote {out_path.name}: {len(generated.splitlines())} generated lines + {len(foot)} footer rules; keyframes {sorted(KF)}')
