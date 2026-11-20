#!/usr/bin/env python3
"""Port the solutions "templates" design to bolt-public-pages (Gary, 2026-11-20).

Design source: marketing/solutions/ai-for-real-estate-templates/index.html (R). The
other three staging pages (ai-for-{small-business,entrepreneurs,agencies}-templates)
are generated from R by tools/build-solution-template-pages.py and carry only CONTENT
differences, which this script lifts into the CMS entries.

Production renders the design as the solutions route's `layout: "collage"`
(SolutionPageBody → src/components/solutions/collage/*). Every page not switched to
that layout is untouched.

  CSS  every <style> of R (the page is the full design: the reviewed smb base + the
       split hero, template deck, use-case bento, prompt tabs, five-scene how it
       works) → public/public-page-assets/solutions/solution-collage.css, each rule
       scoped under `.solution-page[data-page="solution"][data-layout="collage"]`
       (0,4,0 — outranks solution-route.css at equal structure), the inlined
       token layer dropped (production has sc-tokens.css), keyframes `solc-`,
       review-only rules (theme switch, Pages navigator, hero variants A/C) and
       mirror-only chrome (wordmark, video card, nav/footer) dropped, local art
       copied to /public-page-assets/solutions/collage/.
  JS   R's design scripts (hero collage canvases, template deck, floating hero
       cards, bento live states + scroll restart, prompt tabs, five-scene how it
       works, templates rail drift) → public/public-page-assets/solutions/
       solution-collage.js. How it works loses its staging PRESETS table: the
       page renders its CMS example as the section's JSON block (as use-case-v2).
  DATA with --content: the four staging pages' copy, photos, crops, deck, hero
       cards, prompt tabs, six tiles and how-it-works example → the four
       src/content/solutions/<slug>.json entries (layout "collage"), images
       copied to /public-page-assets/solutions/collage/ (an identical file that
       production already ships is reused instead).

    python3 tools/port-solution-collage.py ~/Projects/bpp-sol-templates [--content]
"""
import hashlib, html, json, pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
repo = pathlib.Path(sys.argv[1]).expanduser()
R_DIR = ROOT / 'marketing/solutions/ai-for-real-estate-templates'
R = (R_DIR / 'index.html').read_text()
PUB = repo / 'public'
ASSET_DIR = PUB / 'public-page-assets/solutions/collage'
ASSET_URL = '/public-page-assets/solutions/collage/'
V2 = '/public-page-assets/use-cases/v2/'

# ── assets: staging path (relative to a page dir 3 deep) → production URL ─────
_known = None
def _index():
    global _known
    if _known is None:
        _known = {}
        for p in (PUB / 'public-page-assets').rglob('*'):
            if p.is_file() and p.suffix.lower() in ('.webp', '.jpg', '.jpeg', '.png', '.svg'):
                _known.setdefault(hashlib.sha1(p.read_bytes()).hexdigest(), '/' + str(p.relative_to(PUB)))
    return _known

def asset(rel, page_dir=R_DIR):
    rel = rel.split('?')[0]
    src = (page_dir / rel).resolve()
    assert src.is_file(), rel
    h = hashlib.sha1(src.read_bytes()).hexdigest()
    known = _index()
    if h in known: return known[h]
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    name = src.name
    if (ASSET_DIR / name).exists():   # same name, different bytes (e.g. two pages' re-right) — keep both
        name = src.stem + '-' + h[:6] + src.suffix
    shutil.copyfile(src, ASSET_DIR / name)
    url = ASSET_URL + name
    known[h] = url
    return url

# ── CSS ───────────────────────────────────────────────────────────────────────
PFX = '.solution-page.solution-page[data-page="solution"][data-layout="collage"]'
REVIEW_STYLES = {'theme-review-toggle-style'}
DEMO = re.compile(r'\.(?:promo-banner|bp-page|hero-preview|template-create|bolt-wrap|bolt-fade|bolt-shimmer|bolt-image-wrap|footer-image-section|rotating-name|hero-cta-button|hero-form-row|hero-email-input|card-form-strip|footer-form-row|footer-email-input|logo-train|logo-track|logo-item|logos-section|logos-label|sc-theme-switch|sc-pages|mkt-nav|site-footer|hv-switch)(?![\w-])|#bolt-wordmark-img|#bolt-shimmer-canvas|#modal-|body\.bp-page|(?<!:not\()\[data-hv="[ac]"\]')
DROP_WHOLE = re.compile(r'^(?::root|\*|html|\.sr-only)$')

styles = [(m.group(1), m.group(2)) for m in re.finditer(r'<style(?: id="([^"]*)")?[^>]*>(.*?)</style>', R, re.S)]
css = '\n'.join(body for id_, body in styles if id_ not in REVIEW_STYLES)
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)

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
        items.append((head, src[j + 1:k - 1])); i = k
    return items

KF = set(re.findall(r'@keyframes\s+([\w-]+)', css))
def rename_kf(text):
    for k in sorted(KF, key=len, reverse=True):
        text = re.sub(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', 'solc-' + k, text)
    return text

def urls(body):
    def sub(m):
        u = m.group(2)
        if u.startswith(('data:', '%23', 'http', '/')): return m.group(0)
        return 'url(' + m.group(1) + asset(u) + m.group(1) + ')'
    return re.sub(r'url\(\s*(["\']?)([^"\')]+)\1\s*\)', sub, body)

BARE_BTN = re.compile(r'^\.(hero-btn-primary|hero-btn-ghost|footer-cta-btn)(?![\w-])')
HEAD = re.compile(r'^((?:html|:root)(?:\[[^\]]*\]|:not\(\[[^\]]*\]\))*(?:\s+body)?)\s+(.*)$')
def scope(sel):
    sel = sel.strip().replace('.sc-section-h2', '.section-headline')
    # hero variant B is the design: its rules keep their weight (html never carries data-hv in production, so
    # :not([data-hv="c"]) always matches) — stripping them let later equal-weight rules win (--hc-h)
    sel = sel.replace('[data-hv="b"]', ':not([data-hv="c"])')
    sel = re.sub(r'#how\b(?!-)', '#how-it-works', sel).replace('#hero-dither', '.hero-dither')
    m = HEAD.match(sel)
    head, rest = (m.group(1).replace(':root', 'html') + ' ', m.group(2)) if m else ('', sel)
    if head.endswith('body '): head = head[:-5].rstrip() + ' '
    if head.strip() == 'html': head = ''
    assert not rest.startswith(('html', ':root')), sel
    if rest.startswith('body'):
        rest = rest[4:].lstrip()
        if not rest: return f'{head}{PFX}'
    if BARE_BTN.match(rest): rest = 'main ' + rest   # the navbar's Get started shares .hero-btn-primary
    return f'{head}{PFX} {rest}'

def emit(items):
    out = []
    for head, body in items:
        h = head.strip()
        if not h: continue
        if h.startswith('@keyframes'):
            out.append(f'@keyframes solc-{h.split()[1]} {{{urls(rename_kf(body))}}}'); continue
        if h.startswith(('@media', '@supports')):
            if 'prefers-color-scheme' in h: continue   # the OS-dark block only carried tokens
            inner = emit(parse(body))
            if inner.strip(): out.append(f'{h} {{\n{inner}\n}}')
            continue
        if h.startswith('@'): continue
        if DROP_WHOLE.match(h) or ':root' in h and not re.search(r':root\[data-theme', h): continue
        decls = [d.strip() for d in body.split(';') if d.strip()]
        if decls and all(d.startswith('--sc-') for d in decls): continue   # token-only blocks
        sels = [s.strip() for s in h.split(',') if s.strip() and not DEMO.search(s)]
        if not sels: continue
        try: b = urls(rename_kf(body))
        except AssertionError as e:
            print('  dropped (missing art %s): %s' % (e, h[:90])); continue
        out.append(',\n'.join(scope(s) for s in sels) + ' {' + b + '}')
    return '\n'.join(out)

generated = emit(parse(css))

CHROME = '''
/* ═══ Route plumbing (hand-written) ═══ */
PFX { --sc-nav-overlap: 69px; line-height: normal; }
PFX .mkt-nav-shell { margin-bottom: calc(-1 * var(--sc-nav-overlap, 68px)); }
PFX .hero-section .js-hero-pixel-dots { display: none; }
PFX #templates ~ .video-section { margin-top: 0; }   /* staging's `#templates + .video-section`: production renders the rail's <script> between them */
PFX main .hero-btn-primary { font-family: var(--sc-font-sans, 'Schibsted Grotesk', sans-serif); text-align: start; }   /* the site's global button rule sets Inter */
PFX .why-section .section-headline br { display: none; }   /* staging's stats headline has no forced break: the balanced 2-line wrap */
/* stats: equal room above and below (Gary, staging's sol-why-seam on the three persona pages) */
PFX .why-section { padding: 128px 0; border-top: 0; }
@media (max-width: 1024px) { PFX .why-section { padding: 96px 0; } }
@media (max-width: 768px) { PFX .why-section { padding: 72px 0; } }
/* per-photo phone crops written by the CMS (staging carried them as page-local style blocks) */
@media (max-width: 768px) {
  PFX .hero-uc-img[data-phone-pos], PFX .rx-photo[data-phone-pos] { object-position: var(--phone-pos) !important; }
  PFX .hero-collage--templates .hero-collage-col:nth-child(1) .hero-uc-img[data-phone-shift] { transform: translateX(calc(var(--hc-h) * var(--phone-shift) * -1)); }
  PFX .hero-collage--templates .hero-collage-col:nth-child(3) .hero-uc-img[data-phone-pos] { transform: none; }
}
'''.replace('PFX', PFX)

header = '''/* ── /solutions/<slug> — layout "collage" (the templates design, staging
   marketing/solutions/ai-for-real-estate-templates). GENERATED by
   tools/port-solution-collage.py in the sandbox repo (garyliusf/Enterprise) — do
   not hand-edit; change the staging page and regenerate. Linked by
   SolutionPageBody only on collage pages; every rule is scoped under the
   wrapper's data-layout="collage" as well. ─────────────────────────────── */
'''
(PUB / 'public-page-assets/solutions').mkdir(parents=True, exist_ok=True)
(PUB / 'public-page-assets/solutions/solution-collage.css').write_text(header + generated + '\n' + CHROME)

# ── JS ────────────────────────────────────────────────────────────────────────
def script(id_):
    m = re.search(rf'<script id="{id_}">(.*?)</script>', R, re.S)
    assert m, id_
    return m.group(1)

hiw = script('uc2-hiw-js')
a = hiw.index('  var PRESETS = ')
b = hiw.index('  var C = B.colors')
hiw = hiw[:a] + '''  var B = {};
  var data = section.querySelector('.uc2-hiw-business');
  if (data) { try { B = JSON.parse(data.textContent) || {}; } catch (e) {} }
''' + hiw[b:]
assert "var HOME = '../../../home/preview/';" in hiw
hiw = hiw.replace("var HOME = '../../../home/preview/';", f"var HOME = '{V2}';")
assert 'PRESETS' not in hiw

place = script('hv-place-js')
# the incoming card in the hero's inquiry → board flow comes from the board's data attributes (the CMS)
old_new = "'<span class=\"hv-new-pill\"><span class=\"hv-bar\"></span></span><span class=\"rx-deal-txt\"><b>Jordan Reyes</b><small>New inquiry</small></span>'"
assert old_new in place
place = place.replace(old_new, "'<span class=\"hv-new-pill\"><span class=\"hv-bar\"></span></span><span class=\"rx-deal-txt\"><b>' + esc(apps.dataset.newName) + '</b><small>' + esc(apps.dataset.newSub) + '</small></span>'")
place = place.replace('(function () {', "(function () {\n  function esc(s) { return String(s || '').replace(/[&<>\"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c]; }); }", 1)

parts = [('hero collage canvases', script('hero-collage-js')), ('template deck', script('re-deck-js')),
         ('floating hero cards', place), ('use-case bento', script('re-uc-js')),
         ('prompt tabs', script('uc2-pg-js')), ('how it works', hiw), ('templates rail drift', script('tmpl-rail-drift'))]
for name, js in parts:
    assert '../' not in js, (name, re.findall(r'["\'][^"\']*\.\./[^"\']*', js)[:3])
js = '''/* /solutions/<slug> — layout "collage" behaviour. GENERATED by
   tools/port-solution-collage.py in the sandbox repo from
   marketing/solutions/ai-for-real-estate-templates — do not hand-edit. Loaded
   only on collage pages. Prompt boxes are wired to bolt.new by solution-page.js. */
(function () {
if (!document.querySelector('.solution-page[data-layout="collage"]')) return;
''' + '\n'.join(f'/* ── {n} ── */\n{j}' for n, j in parts) + '\n})();\n'
(PUB / 'public-page-assets/solutions/solution-collage.js').write_text(js)
print(f'css {len(generated.splitlines()):,} lines ({len(generated)//1024} KB), keyframes {len(KF)}; js {len(js)//1024} KB')

if '--content' in sys.argv:
    sys.path.insert(0, str(ROOT / 'tools'))
    import importlib.util
    spec = importlib.util.spec_from_file_location('collage_content', ROOT / 'tools/port-solution-collage-content.py')
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    mod.run(repo, asset)
