#!/usr/bin/env python3
"""Build the sandbox mirror of a live /solutions/<slug> page (the solutions route).

Recipe (the use-case mirror's, build-uc-mirror.py): production's rendered <main>
(the real CMS copy, incl. the home-kit band + rail the route renders) + the
solutions/smb design (its <style> + <script> blocks verbatim — smb is the route's
design source, solution-route.css is generated from it) + the sandbox chrome
(over-hero nav + site footer + wordmark from marketing/solutions.html) + smb's
review toggle / Pages navigator. The video card the route renders between the
hero and the stats is production-only markup: its rules come from the
real-estate prototype (solutions/ai-for-real-estate) and the YouTube embed is
replaced by a poster that links out (no Plyr on the mirror). REVIEW page, not a
source file — re-run to re-pull.

    python3 tools/build-sol-mirror.py ai-for-real-estate

Writes marketing/solutions/<slug>/index.html (3 levels deep: ../../ = marketing).
"""
import re, sys, urllib.request, pathlib

slug = sys.argv[1] if len(sys.argv) > 1 else 'ai-for-real-estate'
ROOT = pathlib.Path(__file__).resolve().parents[1]
tpl = (ROOT / 'solutions/smb/index.html').read_text()
re_page = (ROOT / 'solutions/ai-for-real-estate/index.html').read_text()
sol = (ROOT / 'marketing/solutions.html').read_text()
live = urllib.request.urlopen(urllib.request.Request(f'https://bolt.new/solutions/{slug}', headers={'User-Agent': 'Mozilla/5.0'})).read().decode()

out_dir = ROOT / 'marketing/solutions' / slug
out_dir.mkdir(parents=True, exist_ok=True)
UP = '../../'                                  # marketing/
IMG = '../../../solutions/smb/images/'         # smb's own art

def rebase(html, prefix):
    return re.sub(r'((?:href|src)=")(?!https?:|#|mailto:|data:|//|javascript:)', lambda m: m.group(1) + prefix, html)

# ── head: smb's (resolver, meta, fonts) + the shared stylesheets rebased ──
head_end = tpl.index('<style>')
head = tpl[:head_end]
title = re.search(r'<title>(.*?)</title>', live, re.S).group(1).strip()
desc_m = re.search(r'<meta name="description" content="([^"]*)"', live)
head = re.sub(r'<title>.*?</title>', f'<title>{title} — staging mirror</title>' + (f'\n<meta name="description" content="{desc_m.group(1)}">' if desc_m else ''), head, flags=re.S)
head = head.replace('../../marketing/', '../../')          # smb links ../../marketing/*; the mirror sits under marketing/

# ── styles: every <style> block of smb up to <body> ──
styles = tpl[head_end:tpl.index('<body')]
styles = styles.replace('</head>\n', '')
styles = styles.replace('url("images/', f'url("{IMG}').replace("url('images/", f"url('{IMG}").replace('url(images/', f'url({IMG}')
styles = styles.replace('../../marketing/', '../../')   # smb's shared stylesheet links (../../marketing/*) — the mirror sits under marketing/

# the video card (production-only markup on this route): rules from the real-estate prototype
re_head = re_page[:re.search(r'<body\b', re_page).start()]
re_css = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', re_head, re.S))
VID = r'(?:html\[data-theme="light"\]\s*)?(?:\.video-section|\.hero-video[\w-]*|\.hero-card-strip[\w-]*|\.hero-card-social[\w-]*|\.hero-play-btn[\w-]*|\.hero-preview-video[\w-]*|\.hero-social-proof[\w-]*|\.hero-strip-btn[\w-]*|\.video-modal[\w-]*|#video-pixel-canvas)'
vid_rules = re.findall(r'(?:^|\n)[ \t]*(' + VID + r'[^{}]*\{[^}]*\})', re_css)
vid_media = []
for m in re.finditer(r'@media[^{]*\{', re_css):
    i = m.end(); depth = 1; k = i
    while k < len(re_css) and depth:
        depth += {'{': 1, '}': -1}.get(re_css[k], 0); k += 1
    body = re_css[i:k - 1]
    inner = re.findall(r'(?:^|\n)[ \t]*(' + VID + r'[^{}]*\{[^}]*\})', body)
    if inner: vid_media.append(m.group(0) + '\n' + '\n'.join(inner) + '\n}')
assert len(vid_rules) > 10, len(vid_rules)
video_css = '\n'.join(vid_rules + vid_media)

# ── chrome: nav + drawer from solutions.html ──
nav = sol[sol.index('<nav class="mkt-nav'):sol.index('<style>', sol.index('<nav class="mkt-nav'))]
nav = rebase(nav, UP)

# ── main: production's, adapted to smb's hooks ──
main = re.search(r'<main\b[^>]*>.*?</main>', live, re.S).group(0)
main, n = re.subn(r'<canvas class="hero-dither js-hero-dither" aria-hidden="true"></canvas>', '<canvas id="hero-dither" class="hero-dither" aria-hidden="true"></canvas>', main)
assert n == 1, n
counter = {'n': 0}
def num(m):
    counter['n'] += 1
    return m.group(0) + f'<span class="unlock-num">{counter["n"]:02d}</span>'
main = re.sub(r'<div class="unlock-card">\s*<canvas class="unlock-hover-canvas" aria-hidden="true"></canvas>', num, main)
assert counter['n'] >= 3, counter
# the YouTube embed → a poster that links out (no Plyr vendor on the mirror)
yt = re.search(r'data-plyr-embed-id="([^"]+)"', main)
if yt:
    vid = yt.group(1)
    main = re.sub(r'<div class="hero-preview-video" id="preview-plyr"[^>]*></div>',
                  f'<img class="hero-preview-video" src="https://i.ytimg.com/vi/{vid}/maxresdefault.jpg" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">', main)
    main = main.replace('<div class="hero-play-btn" id="hero-play-btn">', f'<a class="hero-play-btn" id="hero-play-btn" href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener" aria-label="Play video">')
    main = re.sub(r'(<a class="hero-play-btn"[^>]*>\s*<svg.*?</svg>\s*)</div>', r'\1</a>', main, count=1, flags=re.S)
    main = re.sub(r'<div class="video-modal"[^>]*>.*?<div id="modal-plyr"[^>]*></div>\s*</div>\s*</div>', '', main, count=1, flags=re.S)
main = main.replace('/public-page-assets/', 'https://bolt.new/public-page-assets/')

# ── after main: divider + site footer + wordmark from solutions.html ──
tail_start = sol.index('<!-- Subtle divider between the prompt-box CTA and the footer columns -->')
tail_end = sol.index('</section>', sol.index('<section class="footer-image-section">')) + len('</section>')
tail = rebase(sol[tail_start:tail_end], UP)

# ── scripts: smb's, from its first script after the closing band to </body> ──
scripts = tpl[tpl.index('<script', tpl.index('<div class="hm-closing-zone')):tpl.index('</body>')]
scripts = scripts.replace("'images/", f"'{IMG}").replace('"images/', f'"{IMG}')
scripts = scripts.replace('../../images/', '../../../images/').replace('../../marketing/', '../../')
nav_js = re.search(r'<script src="shared-nav-footer\.js[^"]*"></script>', sol).group(0)

wm_rules = '\n'.join(re.findall(r'^\s*\.(?:footer-image-section|bolt-image-wrap)[^{]*\{[^}]*\}', sol, flags=re.M))
assert 'overflow' in wm_rules, wm_rules
extra = '''
<style id="mirror-overrides">
/* wordmark strip clipping (from marketing/solutions.html) */
''' + wm_rules + '''
/* the route's video card (production-only markup) — rules from solutions/ai-for-real-estate */
''' + video_css + '''
.video-section .hero-play-btn { text-decoration: none; }
</style>
'''

page = (head + styles + '</head>\n<body>\n\n' + nav + '\n' + main + '\n\n' + tail + '\n' + extra + scripts + rebase(nav_js, UP) + '\n</body>\n</html>\n')
(out_dir / 'index.html').write_text(page)
print(f'wrote {out_dir / "index.html"} ({len(page):,} chars); title: {title}; video rules: {len(vid_rules)} + {len(vid_media)} media')
