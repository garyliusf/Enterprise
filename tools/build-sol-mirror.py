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

# ── split hero (2026-11-11): production still renders the prompt box + pills;
#    the design is copy left + the home use-case collage right, a primary CTA
#    and the page's own pills in a cta stack. Markup from smb's markers.
SPLIT_HERO = {'ai-for-small-business', 'ai-for-entrepreneurs', 'ai-for-agencies', 'ai-for-real-estate'}   # all four (real estate joined 2026-11-11; its video card below the hero stays)
if slug in SPLIT_HERO:
  _cta = re.search(r'<!-- hero-cta-stack -->\s*(<div class="hero-cta-stack">.*?</div>\s*</div>)\s*<!-- /hero-cta-stack -->', tpl, re.S).group(1)
  _col = re.search(r'<!-- hero-collage:.*?-->\s*(<div class="hero-collage[^"]*">.*?)\s*<!-- /hero-collage -->', tpl, re.S).group(1)
  _col = _col.replace('../../marketing/', '../../')
  # per-page photos (Gary, 2026-11-11): [left, middle, right] as (file under marketing/images/people, alt, object-position);
  # None keeps smb's photo for that slot.
  SLUG_PHOTOS = {
    'ai-for-small-business': [('smb-left.webp', 'A restaurant owner smiling at the counter', '50% 28%'), ('smb-middle.webp', 'A plant-shop owner working at a laptop among her plants', '50% 40%'), ('smb-right.webp', 'A tradesperson in an apron checking a booking', '60% 30%')],
    'ai-for-agencies': [('agencies-left.webp', 'Two agency colleagues reviewing a build together', '50% 30%'),
                        ('agencies-middle.webp', 'Two agency teammates reviewing work on a laptop', '50% 30%'),
                        ('agencies-right.webp', 'An agency owner with a laptop', '50% 20%')],
  }
  _imgs = re.findall(r'<img class="hero-uc-img"[^>]*>', _col)
  for _i, _ph in enumerate(SLUG_PHOTOS.get(slug, [])):
    if _ph and _i < len(_imgs):
      _col = _col.replace(_imgs[_i], '<img class="hero-uc-img" src="../../images/people/%s" alt="%s" style="object-position:%s" loading="eager" decoding="async">' % _ph, 1)
  main, _n = re.subn(r'<div class="re-prompt-shell hero-prompt-shell">.*?<ul class="hero-pills">.*?</ul>', lambda m: _cta + '\n' + _col, main, count=1, flags=re.S)   # the pills go too (Gary, 2026-11-11)
  assert _n == 1
  main, _n = re.subn(r'<section class="hero-section hero-section--sol"', '<section class="hero-section hero-section--sol hero-section--split"', main, count=1)
  assert _n == 1, 'hero class'

# ── how it works: production still renders the 3-step timeline; the design now
#    uses the five-scene stage (uc2-hiw, synced from smb). Keep production's
#    header copy, swap the body, mark the section so the uc2-hiw script hooks it.
def _balanced(s, start):
    """end index of the element whose open tag starts at `start` (div-balanced)"""
    i = s.index('>', start) + 1; depth = 1
    while depth:
        o = s.find('<div', i); c = s.find('</div>', i)
        if c < 0: raise ValueError('unbalanced')
        if 0 <= o < c: depth += 1; i = s.index('>', o) + 1
        else: depth -= 1; i = c + len('</div>')
    return i
_w = main.find('<div class="how-steps-wrap">')
if _w >= 0:
    _stage = re.search(r'<div class="hm-stage hm-stage--steps">.*?<div class="hm-stage-view"></div>\s*</div>', tpl, re.S).group(0)
    main = main[:_w] + _stage + main[_balanced(main, _w):]
    main, _n = re.subn(r'<section class="section how-section"', '<section class="section how-section section--bordered hm-steps uc2-hiw"', main, count=1)
    assert _n == 1
    # how it works moves up: directly after the four stats (Gary, 2026-11-11)
    _hm = re.search(r'<section class="section how-section section--bordered hm-steps uc2-hiw".*?</section>', main, re.S)
    _sec = _hm.group(0); main = main[:_hm.start()] + main[_hm.end():]
    _we = main.index('</section>', main.index('<section class="section why-section">')) + len('</section>')
    main = main[:_we] + ' ' + _sec + main[_we:]
    # example prompts (uc2-pg) right under it — markup from smb's markers
    _pg = re.search(r'<!-- uc2-pg:.*?-->\s*(<section class="section uc2-pg".*?</section>)\s*<!-- /uc2-pg -->', tpl, re.S).group(1).replace('../../marketing/', '../../')
    _he = main.index('</section>', main.index('<section class="section how-section section--bordered hm-steps uc2-hiw"')) + len('</section>')
    main = main[:_he] + ' ' + _pg + main[_he:]

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
