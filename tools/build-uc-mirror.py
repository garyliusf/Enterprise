#!/usr/bin/env python3
"""Build the sandbox mirror of a live /use-cases/<slug> page.

Recipe (same as the microsoft / referral / enterprise mirrors): production's
rendered <main> (the real CMS copy) + the solutions/_template design (its
<style> + <script> blocks verbatim, which carry the light port) + the sandbox
chrome (over-hero nav + site footer + wordmark from marketing/solutions.html)
+ the template's review toggle / Pages navigator. The output is a REVIEW page
and the reference the production port is measured against — not a synced
source file. Re-run to re-pull.

    python3 tools/build-uc-mirror.py ai-software-development

Writes marketing/use-cases/<slug>/index.html (3 levels deep: ../../ = marketing).
"""
import re, sys, urllib.request, pathlib

slug = sys.argv[1] if len(sys.argv) > 1 else 'ai-software-development'
ROOT = pathlib.Path(__file__).resolve().parents[1]
tpl = (ROOT / 'solutions/_template/index.html').read_text()
sol = (ROOT / 'marketing/solutions.html').read_text()
live = urllib.request.urlopen(urllib.request.Request(f'https://bolt.new/use-cases/{slug}', headers={'User-Agent': 'Mozilla/5.0'})).read().decode()

out_dir = ROOT / 'marketing/use-cases' / slug
out_dir.mkdir(parents=True, exist_ok=True)
UP = '../../'            # marketing/
IMG = '../../../solutions/_template/images/'   # the template's own art (aurora hero etc.)

def rebase(html, prefix):
    """prefix relative href/src values (not http(s), #, mailto, data:, //)"""
    return re.sub(r'((?:href|src)=")(?!https?:|#|mailto:|data:|//|javascript:)', lambda m: m.group(1) + prefix, html)

# ── head: the template's (resolver, meta, fonts) + the shared nav stylesheet ──
head_end = tpl.index('<style>')
head = tpl[:head_end]
title = re.search(r'<title>(.*?)</title>', live, re.S).group(1).strip()
desc = re.search(r'<meta name="description" content="([^"]*)"', live).group(1)
head = re.sub(r'<title>.*?</title>', f'<title>{title} — staging mirror</title>\n<meta name="description" content="{desc}">', head, flags=re.S)
nav_css = re.search(r'<link rel="stylesheet" href="shared-nav-footer\.css[^"]*">', sol).group(0)
head = head.replace('</head>', '') if '</head>' in head else head
head += rebase(nav_css, UP) + '\n'

# ── styles: every <style> block of the template up to <body> ──
styles = tpl[head_end:tpl.index('<body>')]
styles = styles.replace('</head>\n', '')
styles = styles.replace('url("images/', f'url("{IMG}')
# the over-hero nav overlaps the hero here (the template is chrome-less)
styles, n = re.subn(r'--sc-nav-overlap:\s*0px;', '--sc-nav-overlap: 69px;   /* the over-hero nav is present on the mirror */', styles)
assert n == 1, n

# ── chrome: nav + drawer from solutions.html ──
nav = sol[sol.index('<nav class="mkt-nav'):sol.index('<style>', sol.index('<nav class="mkt-nav'))]
nav = rebase(nav, UP)

# ── main: production's, adapted to the template's classes and layers ──
main = re.search(r'<main\b[^>]*>.*?</main>', live, re.S).group(0)
main = main.replace('class="section-headline"', 'class="sc-section-h2"')
main = main.replace('<canvas id="hero-pixel-dots" class="js-hero-pixel-dots"></canvas>',
                    '<canvas id="hero-pixel-dots" class="hero-pixel-canvas"></canvas>\n  <canvas class="hero-dither" aria-hidden="true"></canvas>')
assert 'hero-dither' in main
# numbered corner labels on the feature cards (the compliance-card treatment)
counter = {'n': 0}
def num(m):
    counter['n'] += 1
    return m.group(0) + f'<span class="unlock-num">{counter["n"]:02d}</span>'
main = re.sub(r'<div class="unlock-card">\s*<canvas class="unlock-hover-canvas" aria-hidden="true"></canvas>', num, main)
assert counter['n'] >= 3, counter
# the included panel: corner dither instead of the discovery artwork + grain
main, n = re.subn(r'<div class="deploy-discovery"[^>]*>.*?</div>', '<canvas id="incl-corner-dither" aria-hidden="true"></canvas>', main, flags=re.S)
assert n == 1, n
main = main.replace('/public-page-assets/', 'https://bolt.new/public-page-assets/')

# ── after main: divider + site footer + wordmark from solutions.html ──
tail_start = sol.index('<!-- Subtle divider between the prompt-box CTA and the footer columns -->')
tail_end = sol.index('</section>', sol.index('<section class="footer-image-section">')) + len('</section>')
tail = rebase(sol[tail_start:tail_end], UP)

# ── scripts: the template's, from </main>'s position (its last section) to </body> ──
scripts = tpl[tpl.index('<script>', tpl.index('<section class="footer-section">')):tpl.index('</body>')]
scripts = scripts.replace("'images/", f"'{IMG}").replace('"images/', f'"{IMG}')
scripts = scripts.replace('../../images/', '../../../images/')
nav_js = re.search(r'<script src="shared-nav-footer\.js[^"]*"></script>', sol).group(0)

# the wordmark strip's clipping rules live in solutions.html's own CSS, not the template's: without them the
# shimmer canvas (scaled 1.35) runs past the viewport on phones
wm_rules = '\n'.join(re.findall(r'^\s*\.(?:footer-image-section|bolt-image-wrap)[^{]*\{[^}]*\}', sol, flags=re.M))
assert 'overflow' in wm_rules, wm_rules
extra = '''
<style id="mirror-overrides">
/* wordmark strip clipping (from marketing/solutions.html) */
''' + wm_rules + '''
/* mirror-only: production renders CMS testimonial avatars as initials */
.testi-card-avatar--initials { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; background: rgba(20,136,252,0.14); color: #4DA6FF; border: 1px solid rgba(255,255,255,0.10); }
html[data-theme="light"] .testi-card-avatar--initials { background: rgba(20,136,252,0.10); color: #0f6fd0; border-color: rgba(var(--sc-ink-rgb),0.10); }
</style>
'''

page = (head + styles + '</head>\n<body>\n\n' + nav + '\n' + main + '\n\n' + tail + '\n' + extra + scripts + rebase(nav_js, UP) + '\n</body>\n</html>\n')
# the template's Pages navigator lists pages relative to the template's depth; the mirror sits one level deeper under marketing/ — leave it, it is review chrome
(out_dir / 'index.html').write_text(page)
print(f'wrote {out_dir / "index.html"} ({len(page):,} chars); title: {title}')
