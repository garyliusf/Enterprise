#!/usr/bin/env python3
"""Generate bolt-public-pages' src/content/careers-body.html from marketing/careers.html.

/careers is a hand-built page: Layout supplies Header/Footer and slots this
body in whole (src/pages/careers.astro). The staging page is the design source;
this script is the port, so the two never drift by hand:

  - drops the head, navbar, drawer, site footer, wordmark strip (+ its shimmer
    script), the review toggle and the Pages navigator
  - page-level `body` rules move to `.careers-main`
  - shared-components.css / .js are inlined (the company repo has neither),
    WITHOUT the --sc-* token blocks: Layout already loads sc-tokens.css
  - order as on the staging page: page CSS -> markup -> shared CSS (must win
    the cascade) -> page JS -> shared JS
  - images/careers/... -> /public-page-assets/careers/...

    python3 tools/build-careers-body.py ~/Projects/bolt-public-pages/src/content/careers-body.html
"""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
out = pathlib.Path(sys.argv[1]).expanduser()
h = (ROOT / 'marketing/careers.html').read_text()
shared_css = (ROOT / 'marketing/shared-components.css').read_text()
shared_js = (ROOT / 'marketing/shared-components.js').read_text()
def must(c, m):
    if not c: raise SystemExit('ASSERT: ' + m)

# ── page CSS ──
styles = list(re.finditer(r'<style([^>]*)>(.*?)</style>', h, re.S))
by_id = {re.search(r'id="([^"]+)"', m.group(1)).group(1): m.group(2) for m in styles if 'id="' in m.group(1)}
plain = [m.group(2) for m in styles if 'id="' not in m.group(1)]
must(len(plain) == 2 and 'body {' in plain[0], f'style blocks changed: {len(plain)} plain')
main_css = plain[1]
must(not re.search(r'(?m)^\s*(body|html|:root)\s*[{,]', main_css), 'bare body/html/:root rule in the main style block — scope it')
hero_blocks = ''.join(f'\n<style>{by_id[k]}</style>\n' for k in ('hero-stack-standard', 'hero-stack-phone'))
must('theme-review-toggle-style' in by_id, 'review toggle block not found (it must be dropped knowingly)')

# ── markup: first section -> the site-footer comment ──
m0 = h.index('<section', h.index('<body'))
m1 = h.index('<!-- ─── SECTION 9: SITE FOOTER')
markup = h[m0:m1].rstrip() + '\n'
must('<script' not in markup and '<style' not in markup and 'mkt-nav' not in markup, 'unexpected script/style/nav inside the markup slice')

# ── page JS: the inline scripts after the footer, up to the shared <link> (never to the last </script>) ──
tail = h[h.index('</footer>'):h.index('<link rel="stylesheet" href="shared-components.css')]
scripts = [s for s in re.findall(r'<script>(.*?)</script>', tail, re.S)]
keep = [s for s in scripts if 'Bolt strip shimmer' not in s[:200]]
must(len(scripts) == 4 and len(keep) == 3, f'page scripts: {len(scripts)} found, {len(keep)} kept')

# ── shared CSS without the token layer (palette x3 + type families) ──
t0 = shared_css.index(':root,\n.sc-on-light {'); t0 = shared_css.rfind('/*', 0, t0) if shared_css.rfind('*/', 0, t0) > shared_css.rfind('}', 0, t0) else t0
t1 = shared_css.index('--sc-label-weight'); t1 = shared_css.index('\n}', t1) + 2
dropped = shared_css[t0:t1]
left = re.sub(r'/\*.*?\*/', '', dropped, flags=re.S)
heads = [' '.join(x.split()) for x in re.findall(r'([^{}]+)\{', left)]
must(all(re.fullmatch(r'(@media \(prefers-color-scheme: dark\)|:root(:not\(\[data-theme="light"\]\))?(\[data-theme="dark"\])?(, ?\.sc-on-(light|dark))?)', x) for x in heads), f'token span holds non-token rules: {heads}')
shared_css_out = shared_css[:t0].rstrip() + '\n\n/* (the --sc-* token layer lives in src/styles/sc-tokens.css, loaded by Layout) */\n' + shared_css[t1:]
must('--sc-ink-rgb:' not in shared_css_out, 'token definitions left in shared css')

# ── shared JS without the review-only navigator ──
n0 = shared_js.index('/* ═══ REVIEW-ONLY: page navigator')
shared_js_out = shared_js[:n0].rstrip() + '\n'
must('sc-pages' not in shared_js_out, 'navigator code left in shared js')

def assets(s): return s.replace('images/careers/', '/public-page-assets/careers/')

body = f'''<!-- ============================================================================
     CAREERS — page body.
     GENERATED from the garyliusf/Enterprise sandbox (marketing/careers.html) by
     tools/build-careers-body.py — change the staging page and regenerate; the
     only hand edits that belong here are copy fixes mirrored back to staging.

     Self-contained by design, matching get-started-body.html: this repo has no
     shared-components.css/js, so both are inlined below rather than linked.
     Order is deliberate and mirrors the sandbox — page CSS first, then markup,
     then the shared component CSS (it must win the cascade), then page JS, then
     the shared JS the page calls into.

     Nav and footer are intentionally absent: Layout.astro supplies Header and
     Footer. Page-level background/font/overflow live on .careers-main rather
     than body. Light-capable: dark rules are the base, light ones are keyed on
     html[data-theme="light"]; the --sc-* tokens come from sc-tokens.css.
     ============================================================================ -->

<style>
  /* Page-level rules scoped to the wrapper — body belongs to Layout.astro. */
  .careers-main {{
    background: var(--sc-ground, #000);
    color: var(--sc-ink, #fff);
    font-family: var(--sc-font-sans, 'Inter', sans-serif);
    /* clip NOT hidden: hidden makes this a scroll container and breaks
       position:sticky on the site header. */
    overflow-x: hidden;
    overflow-x: clip;
  }}
  .careers-main, .careers-main *, .careers-main *::before, .careers-main *::after {{ box-sizing: border-box; }}
  html {{ scroll-behavior: smooth; }}   /* the hero CTA jumps to #open-roles */
</style>
{hero_blocks}
<style>{assets(main_css)}</style>

{assets(markup)}
<!-- ── Shared components (buttons, eyebrows, FAQ) — inlined; loads after
     the page CSS so it wins the cascade, exactly as on the sandbox page ── -->
<style>
{shared_css_out}</style>

''' + ''.join(f'<script>{assets(s)}</script>\n' for s in keep) + f'''
<!-- ── Shared component JS (scroll reveals, pixel-fill hovers, FAQ) ── -->
<script>
{shared_js_out}</script>
'''
out.write_text(body)
print(f'wrote {out}: {len(body):,} chars; markup {len(markup):,}, page css {len(main_css):,}, shared css {len(shared_css_out):,}, page js {sum(map(len, keep)):,}, shared js {len(shared_js_out):,}')
