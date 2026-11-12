#!/usr/bin/env python3
"""Port the glossary (marketing/glossary/, built by tools/build-glossary.py) to
bolt-public-pages.

    python3 tools/port-glossary.py ~/Projects/bpp-glossary

Writes, under the given production checkout:
  src/content/glossary/<slug>.json            one CMS entry per term (the
                                              glossaryTerms collection)
  src/styles/glossary-page.css                the reviewed staging CSS, every
                                              rule scoped under .glossary-page
  public/public-page-assets/glossary/glossary.js
                                              the page scripts (filter, reveals,
                                              FAQ, pixel fields, prompt box)

The routes themselves (src/pages/resources/glossary/index.astro + [slug].astro)
are hand-written in production and render the same markup as the staging pages.
Change the staging pages, re-run build-glossary.py, then re-run this — never
hand-edit the generated files. Term JSON is written only for terms that do not
exist yet (pass --overwrite-terms to reset them): after launch the CMS owns them.
"""
import importlib.util, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
args = [a for a in sys.argv[1:] if not a.startswith('--')]
OVERWRITE = '--overwrite-terms' in sys.argv
DST = pathlib.Path(args[0]).expanduser()
PFX = '.glossary-page'

spec = importlib.util.spec_from_file_location('bg', ROOT / 'tools/build-glossary.py')
bg = importlib.util.module_from_spec(spec); spec.loader.exec_module(bg)

# ── 1. term entries ────────────────────────────────────────────────────────
tdir = DST / 'src/content/glossary'; tdir.mkdir(parents=True, exist_ok=True)
written = 0
for t in bg.TERMS:
    f = tdir / f"{t['slug']}.json"
    if f.exists() and not OVERWRITE:
        continue
    entry = {
        'name': t['name'],
        'article': t['art'],
        'category': bg.CATS[t['cat']],
        'definition': t['def'],
        'sections': [],
        'faqs': [],
        'related': [r['slug'] for r in bg.related_of(t)],
        'draft': False,
        'tags': [],
    }
    f.write_text(json.dumps(entry, indent=2, ensure_ascii=False) + '\n')
    written += 1

# ── 2. css ─────────────────────────────────────────────────────────────────
term_html = (ROOT / 'marketing/glossary/301-redirect/index.html').read_text()
head = term_html[:term_html.index('</head>')]
page_css = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', head, re.S))
shared_css = (ROOT / 'marketing/shared-components.css').read_text()

DROP = ('mkt-nav', 'site-footer', 'bolt-image-wrap', 'bolt-shimmer', 'bolt-fade', 'bolt-wordmark',
        'footer-image-section', 'sc-theme-switch', 'sc-page-nav', 'sc-embedded', ':root',
        # sandbox-only components the glossary never renders
        'hero-video', 'video-modal', 'hero-card-strip', 'hero-play-btn')

def parse(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    items, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j == -1: break
        head_ = css[i:j].strip()
        if head_.startswith('@import') or head_.startswith('@charset'):
            k = css.find(';', i); i = k + 1; continue
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        items.append((head_, css[j + 1:k - 1])); i = k
    return items

def scope_one(sel):
    sel = sel.strip()
    if any(d in sel for d in DROP): return None
    m = re.match(r'^(html\[data-theme=["\'](?:light|dark)["\']\])\s*(.*)$', sel)
    lead, rest = (m.group(1) + ' ', m.group(2)) if m else ('', sel)
    rest = re.sub(r'^html\s+body\s+', '', rest)
    rest = re.sub(r'^html\s+', '', rest)
    if rest in ('html', 'html, body', ''): return None
    if rest == 'body': return f'{lead}{PFX}'
    if rest.startswith('body '): rest = rest[5:]
    if rest == '*': return f'{lead}{PFX} *'
    return f'{lead}{PFX} {rest}'

keyframes = set()
def emit(items, depth=0):
    out = []
    for h, body in items:
        if h.startswith('@keyframes'):
            name = h.split()[1]; keyframes.add(name)
            out.append(f'@keyframes gl-{name} {{{body}}}'); continue
        if h.startswith('@media') or h.startswith('@supports'):
            inner = emit(parse(body), depth + 1)
            if inner.strip(): out.append(f'{h} {{\n{inner}\n}}')
            continue
        if h.startswith('@'): continue                 # @font-face etc. — Layout loads the fonts
        sels = [x for x in (scope_one(p) for p in h.split(',')) if x]
        if not sels: continue
        # token-only blocks belong to sc-tokens.css in production
        decls = [d.strip() for d in body.split(';') if d.strip()]
        if decls and all(d.startswith('--sc-') for d in decls): continue
        out.append(f'{", ".join(sels)} {{{body}}}')
    return '\n'.join(out)

css = emit(parse(page_css)) + '\n\n/* ── shared components (sandbox shared-components.css) ── */\n' + emit(parse(shared_css))
for k in sorted(keyframes, key=len, reverse=True):
    css = re.sub(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', 'gl-' + k, css)
css = css.replace('@keyframes gl-gl-', '@keyframes gl-')

# production chrome: there is no .site-footer-divider element, so the footer CTA
# carries the whole 88px to the footer line itself (bolt-public-pages#501 rule)
css += '''

/* ── production plumbing (hand-written in port-glossary.py) ── */
.glossary-page { background: var(--sc-ground); color: var(--sc-ink); line-height: normal; }
.glossary-page .footer-section { padding-bottom: 88px !important; }
.glossary-page img { max-width: none; }
'''
header = ('/* GENERATED by Enterprise tools/port-glossary.py from marketing/glossary/ '
          '(the reviewed staging design). Do not hand-edit — change staging and regenerate. */\n')
(DST / 'src/styles/glossary-page.css').write_text(header + css + '\n')

# ── 3. js ──────────────────────────────────────────────────────────────────
uc = (ROOT / 'marketing/use-cases/index.html').read_text()
def between(a, b, s):
    i = s.index(a); return s[i:s.index(b, i)]
main_js = uc[uc.index('<script src="../shared-components.js'):]
main_js = main_js[main_js.index('<script>') + 8:]
main_js = main_js[:main_js.index('</script>')]
blocks = [
    between('/* ── Hero pixel-dots', '/* ── makePixelCanvas helper', main_js),
    between('/* ── makePixelCanvas helper', '/* ── Section transition', main_js),
    between('/* ── Footer pixel canvas', '/* ── Rotating name', main_js),
    between('/* ── Footer prompt box', '/* ── Featured-bridge', main_js),
]
i = uc.index('// ── Hero dither (BOTH themes')
dither = uc[i:uc.index('</script>', i)]

sjs = (ROOT / 'marketing/shared-components.js').read_text()
mods = re.split(r'\n(?=/\* =+\n|\(function \(\) \{\n)', sjs)
keep = [m for m in mods if ('ms-faq-item' in m or "querySelectorAll('.hero-btn-primary')" in m
                             or '__pageOwnsScrollAnims' in m)]
shared = '\n'.join(keep)
for cls in ('.hero-btn-primary', '.hero-btn-ghost', '.footer-cta-btn'):
    shared = shared.replace(f"document.querySelectorAll('{cls}')", f"document.querySelectorAll('{PFX} {cls}')")

strip = lambda s: re.sub(r'</?script>', '', s)
page_js = strip(bg.NAV_H_JS).replace("document.querySelector('.mkt-nav')", "document.querySelector('.mkt-nav')")
index_js = strip(bg.INDEX_JS).replace("(function () {\n  var input = document.getElementById('gl-search');",
                                     "(function () {\n  var input = document.getElementById('gl-search');\n  if (!input) return;", 1)
js = '\n\n'.join([
    '/* GENERATED by Enterprise tools/port-glossary.py — the glossary page scripts. Do not hand-edit. */',
    shared, *blocks, dither, page_js, index_js, bg.TERM_JS, bg.GALLERY_JS,
])
jdir = DST / 'public/public-page-assets/glossary'; jdir.mkdir(parents=True, exist_ok=True)
(jdir / 'glossary.js').write_text(js + '\n')

print(f'terms: {written} written ({len(bg.TERMS)} total) | css: {len(css)//1024}KB, keyframes {sorted(keyframes)} | js: {len(js)//1024}KB, shared modules {len(keep)}')
