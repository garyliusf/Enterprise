#!/usr/bin/env python3
"""Generate bolt-public-pages' src/content/not-found-body.html from marketing/404.html.

The staging page (marketing/404.html) is the design source. Production renders
it from src/pages/404.astro (prerendered -> dist/404.html, the file Cloudflare
Pages serves with HTTP 404 for every miss under the proxied sections), which
slots this body into <main class="nf-main"> between the real Header/Footer.

This script takes the staging page's own <style> block, its <main> and its page
script, and:
  - scopes every rule under `.nf-main` (light-keyed rules keep their
    `html[data-theme=...]` head; `body` becomes the `.nf-page` wrapper rule;
    the `*` reset stays inside main so the site chrome is untouched)
  - swaps the shared-components classes the page borrowed (section eyebrow /
    H2 / sub / header) for nf- names and appends their canonical values, so the
    page does not depend on the sandbox's shared-components.css
  - drops the sandbox wordmark rules (production's Footer renders its own)
  - re-points images at /public-page-assets/404/ and relative links at bolt.new
  - prefixes the prompt glow keyframes (nf-) so they can't collide

    python3 tools/port-404.py ~/Projects/bolt-public-pages/src/content/not-found-body.html

Change the staging page, then regenerate — never hand-edit the output.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
out_path = pathlib.Path(sys.argv[1]).expanduser()
src = (ROOT / 'marketing/404.html').read_text()

PFX = '.nf-main'
RENAME = [('section-header', 'nf-dest-header'), ('section-eyebrow', 'nf-eyebrow'),
          ('sc-section-h2', 'nf-h2'), ('section-sub', 'nf-dest-sub')]

# ── 1. pieces ──
style = next(b for b in re.findall(r'<style>(.*?)</style>', src, re.S) if '═══ 404' in b)
main = re.search(r'<main>(.*?)</main>', src, re.S).group(1)
i = src.index('<script src="shared-components.js')
i = src.index('<script>', i)
script = src[i + len('<script>'):src.index('</script>', i)]

# ── 2. css ──
def parse(css):
    items, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j == -1: break
        head = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        items.append((head, css[j + 1:k - 1])); i = k
    return items

def ren(text):
    for a, b in RENAME:
        text = re.sub(r'(?<![\w-])' + a + r'(?![\w-])', b, text)
    return text.replace('heroPromptOrbit', 'nf-heroPromptOrbit')

def scope(sel):
    sel = sel.strip()
    m = re.match(r'^(html\[data-theme="(?:light|dark)"\])\s+(.*)$', sel)
    head, rest = (m.group(1) + ' ', m.group(2)) if m else ('', sel)
    if rest == '*': return f'{head}{PFX} *, {head}{PFX} *::before, {head}{PFX} *::after'
    return f'{head}{PFX} {rest}'

def emit(items):
    out = []
    for head, body in items:
        h = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()
        if h.startswith('@keyframes'):
            out.append(f'{ren(h)} {{{body}}}'); continue
        if h.startswith('@media'):
            inner = emit(parse(body))
            if inner.strip(): out.append(f'{h} {{\n{inner}\n}}')
            continue
        if not h or h.startswith('@'): continue
        if 'bolt-image-wrap' in h: continue            # sandbox wordmark; Footer renders production's
        if h == 'body':
            # clip only: `hidden` would make the wrapper a scroll container and
            # unstick the nav it holds (the iOS sticky-nav lesson)
            out.append(f'.nf-page {{{body.replace("overflow-x: hidden; ", "")}}}'); continue
        out.append(', '.join(scope(s) for s in ren(h).split(',')) + ' {' + ren(body) + '}')
    return '\n'.join(out)

css = emit(parse(re.sub(r'/\*.*?\*/', '', style, flags=re.S)))

# canonical values of the shared classes the page borrowed (shared-components.css)
css += '''
/* section header — canonical values from the sandbox shared-components.css
   (.section-eyebrow / .sc-section-h2 / header rhythm 16 / 12 / 12) */
.nf-main .nf-eyebrow { margin: 0; font-family: var(--sc-font-label); font-size: var(--sc-eyebrow-size, 13px); font-weight: var(--sc-label-weight, 700); letter-spacing: 2px; text-transform: uppercase; color: var(--sc-blue); }
.nf-main .nf-h2 { margin: 0; font-size: clamp(40px, 4vw, 52px); font-weight: 500; color: var(--sc-ink); line-height: 1.15; letter-spacing: -1px; }
@media (max-width: 768px) { .nf-main .nf-h2 { font-size: clamp(28px, 8vw, 40px); } .nf-main .nf-dest-sub { line-height: 1.4; } }
.nf-main p, .nf-main h1, .nf-main h2, .nf-main h3 { margin: 0; }
'''

# ── 3. markup ──
main = ren(main)
main = main.replace('class="nf-eyebrow eyebrow-scramble"', 'class="nf-eyebrow"')
main = main.replace('src="images/404/', 'src="/public-page-assets/404/')
main = main.replace('href="pricing.html"', 'href="https://bolt.new/pricing"')
# no-JS / pre-script defaults: the script writes the real dead path in; the
# sandbox's /banana stand-in must never flash on a production 404
main = main.replace('<code class="nf-path" id="nf-path">/banana</code>', '<code class="nf-path" id="nf-path">this page</code>')
main = main.replace('Build the banana page I was looking for.', 'Build the page I was looking for.')
assert 'banana' not in main, 'sandbox stand-in left in markup'
assert 'images/' not in main.replace('/public-page-assets/', ''), 'unmapped image path'

# ── 4. script ──
# production reads the real dead path; ?path= stays as a preview override, the
# sandbox's /banana stand-in (the page lives at /Enterprise/marketing/404.html) goes
script = script.replace("  if (/\\/Enterprise\\/|404(\\.html)?$/.test(path) && !q) path = '/banana';\n", '')
script = script.replace('''   The sandbox serves this page at /Enterprise/marketing/404.html, so the
   "missing" path falls back to /banana (the brief's examples). Preview any
   path with ?path=/use-case/ai-websites. In production this reads the real
   location.pathname''', '''   Reads the real location.pathname (this file is served AT the dead URL);
   ?path=/some/path previews another one''')
assert 'Enterprise' not in script and "'/banana'" not in script

body = f'''<!-- GENERATED by tools/port-404.py (garyliusf/Enterprise) from marketing/404.html.
     Do not hand-edit: change the staging page and regenerate. -->
<style>
{css}
</style>
{main.strip()}
<script>
{script.strip()}
</script>
'''
out_path.write_text(body)
print(f'wrote {out_path} ({len(body):,} bytes)')
