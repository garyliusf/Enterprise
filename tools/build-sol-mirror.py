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
import re, sys, urllib.request, pathlib, html

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
# CMS headlines carry <br>s authored for production's line breaks; the design centres its H2s and the
# word-reveal wraps "building<br>what" as one word (stacked) — drop them in section headlines (the hero H1's
# is hidden by CSS on the split hero).
main = re.sub(r'(<h2 class="section-headline">)(.*?)(</h2>)', lambda m: m.group(1) + re.sub(r'\s*<br\s*/?>\s*', ' ', m.group(2)) + m.group(3), main, flags=re.S)

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
    'ai-for-real-estate': [('re-left.webp', 'A homeowner working on a laptop on the stairs', '50% 40%'), ('re-middle.webp', 'An agent on the phone with a laptop on a sunny terrace', '50% 18%'), ('re-right.webp', 'A broker checking a message at the office', '50% 25%')],
    'ai-for-small-business': [('smb-left.webp', 'A restaurant owner smiling at the counter', '50% 28%'), ('smb-middle.webp', 'A plant-shop owner working at a laptop among her plants', '50% 40%'), ('smb-right.webp', 'A tradesperson in an apron checking a booking', '60% 30%')],
    'ai-for-agencies': [('agencies-left.webp', 'Two agency colleagues reviewing a build together', '50% 30%'),
                        ('agencies-middle.webp', 'Two agency teammates reviewing work on a laptop', '50% 30%'),
                        ('agencies-right.webp', 'An agency lead holding a laptop in a studio', '50% 30%')],
  }
  _imgs = re.findall(r'<img class="hero-uc-img"[^>]*>', _col)
  for _i, _ph in enumerate(SLUG_PHOTOS.get(slug, [])):
    if _ph and _i < len(_imgs):
      _col = _col.replace(_imgs[_i], '<img class="hero-uc-img" src="../../images/people/%s" alt="%s" style="object-position:%s" loading="eager" decoding="async">' % _ph, 1)
  main, _n = re.subn(r'<div class="re-prompt-shell hero-prompt-shell">.*?<ul class="hero-pills">.*?</ul>', lambda m: _cta + '\n' + _col, main, count=1, flags=re.S)   # the pills go too (Gary, 2026-11-11)
  assert _n == 1
  main, _n = re.subn(r'<section class="hero-section hero-section--sol"', '<section class="hero-section hero-section--sol hero-section--split"', main, count=1)
  assert _n == 1, 'hero class'

# ── templates: a page on the CMS "grid" layout (described 4-up cards) gets the standard rail instead
#    (Gary, 2026-11-11): the page's own templates first, then the standard set to fill the rail.
if '<div class="template-grid">' in main:
    RAIL_CARDS = {
      'ai-for-real-estate': [
        ('Real estate listing website', 'Real estate', '/resources/templates/real-estate', '../../templates/images/nestora-real-estate.webp'),
        ('Luxury property listing', 'Real estate', '/resources/templates/property-listing-website', '../../templates/images/property-listing.webp'),
        ('Agency website', 'Portfolio', '/resources/templates/studio-portfolio', 'https://bolt.new/public-page-assets/media/solutions/studio-portfolio/screenshot--template-noir-agency.bolt.host---1-.webp'),   # buyer-rep is hidden from the marketplace (its detail page 404s), so it stays off the rail
        ('Architect portfolio', 'Portfolio', '/resources/templates/architect-portfolio', '../../templates/images/architect-portfolio.webp'),
      ],
    }
    STANDARD_CARDS = [
      ('SaaS product landing page and dashboard', 'SaaS', '/resources/templates/saas-landing', 'https://bolt.new/public-page-assets/media/templates/premium-saas-dashboard-lp.webp'),
      ('Curated, luxury travel site', 'Travel', '/resources/templates/travel-journal', 'https://bolt.new/public-page-assets/media/templates/maison-voyage.webp'),
      ('Pooled analytics dashboard', 'Internal Tools', '/resources/templates/revenue-dashboard', 'https://bolt.new/public-page-assets/media/templates/vantage-dashboard.webp'),
      ('Community event board', 'Websites', '/resources/templates/events-guide', 'https://bolt.new/public-page-assets/media/templates/townhall-events.webp'),
    ]
    def _card(name, tag, href, shot):
        return ('<a class="tmpl-card" href="%s"> <div class="tmpl-card-preview" aria-hidden="true"> <img class="tmpl-card-shot" src="%s" alt="" loading="lazy" decoding="async"> '
                '<div class="tmpl-card-overlay"><span>View details</span></div> </div> <div class="tmpl-card-meta"> <h3 class="tmpl-card-name">%s</h3> <span class="tmpl-card-tag">%s</span> </div> </a>' % (href, shot, name, tag))
    _cards = ''.join(_card(*c) for c in RAIL_CARDS.get(slug, []) + STANDARD_CARDS)
    _rail = ('<section class="section tmpl-section" id="templates"> <div class="section-inner"> <div class="section-header center dsa-reveal"> '
             '<p class="section-eyebrow eyebrow-scramble">Templates</p> <h2 class="section-headline">Start from a template, not a blank prompt</h2> '
             '<p class="section-sub">Bolt-built templates give you a working foundation, styled and wired up, so you&#39;re customizing instead of starting from nothing.</p> </div> '
             '<div class="tmpl-rail js-tmpl-rail" id="tmpl-rail"> <div class="tmpl-track js-tmpl-track"> ' + _cards + ' </div> </div> '
             '<div class="section-cta"> <a href="https://bolt.new/resources/templates" class="hero-btn-primary"> <div class="btn-bg-hover"></div> '
             '<div class="btn-text-wrap"><div class="btn-text-inner"><span>Browse all templates</span><span>Browse all templates</span></div></div> </a> </div> </div> </section>')
    _gs = main.rfind('<section', 0, main.index('<div class="template-grid">')); _ge = main.index('</section>', _gs) + len('</section>')
    main = main[:_gs] + _rail + main[_ge:]

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
    # per-page how-it-works preset + example prompts (Gary, 2026-11-11) — the use-case types' logic:
    # the preset is a key in uc2-hiw-js PRESETS (data-business on the section); prompts are (label, shot, text[, start, nav]),
    # shots from marketing/use-cases/images/prompt-results. Reused from the use-case type sets where they fit.
    PROMPTS = {
      'marketing':  ('Marketing website', 'prism', 'Build a marketing website for my AI vision API with an early-access signup, customer logos, and key stats.'),
      'startup':    ('Startup landing page', 'kova', 'Build a landing page for my fintech app with a waitlist signup, a card preview, and send, exchange, and hold features.'),
      'restaurant': ('Restaurant website', 'pizzeria', 'Make a website for my pizza parlor with the full menu, daily specials, party packages, and our hours and location.', 400, 84),
      'business':   ('Business website', 'emberoak', 'Make a website for my coffee roastery with subscription plans, a build-your-box flow, and how it works in three steps.'),
      'portfolio':  ('Portfolio website', 'structured', 'Make a portfolio for my design studio with a bold hero, selected work, and a way to start a project.'),
      'photo':      ('AI photo studio', 'shotkit', 'Build an AI photo studio that removes the background from my product shots and places them in styled scenes for my store.'),
      'calendar':   ('Content calendar', 'cadence', 'Build a content calendar where I can plan, draft, and schedule posts for Instagram, LinkedIn, X, and TikTok.'),
      'coach':      ('AI career coach', 'trailmark', 'Build an AI career coach that maps out a step-by-step roadmap to my target role, with projects and interview prep.'),
      'queue':      ('Walk-in queue', 'lineup', 'Build a walk-in queue for my barbershop with a live waitlist, wait-time estimates, and a customer display.'),
      'pos':        ('Caf\u00e9 POS', 'kitchenstock', 'Build a point-of-sale and stock tracker for my caf\u00e9 with daily sales, low-stock alerts, and restock suggestions.'),
      'crm':        ('Client CRM', 'lightkeep', 'Build a CRM that shows which accounts are going quiet, with deals, tasks, and one-click check-in drafts.'),
      'events':     ('Event manager', 'attendly', 'Build an event manager for my community with ticket sales, attendee lists, and revenue for each event.'),
      'agency-site':   ('Agency website', 'noir', 'Build a website for my design agency that leads with our work: case studies, a services page, and a project inquiry form.'),
      'client-landing': ('Client landing page', 'prism', "Build a landing page for a client's AI product launch with an early-access signup, customer logos, and key stats."),
      'agency-crm':    ('Agency CRM', 'lightkeep', 'Build a CRM for my agency that shows which client accounts are going quiet, with deals, tasks, and one-click check-in drafts.'),
      'client-site':   ('Architect portfolio', 're-architect', "Build a portfolio website for an architecture client with a bold hero, selected projects, and a contact page."),
      'fashion':       ('Editorial fashion website', 'ag-vestige', "Build an editorial website for a fashion label's new collection with a full-bleed lookbook, a manifesto page, and a shop."),
      'saas':          ('SaaS landing page', 'ag-saas', "Build a landing page for a client's analytics SaaS with a product dashboard preview, customer logos, pricing, and a free-trial signup."),
      're-listings': ('Real estate listings', 're-nestora', 'Build a real estate website for my brokerage with searchable listings, saved homes, and a mortgage calculator.'),
      're-property': ('Property listing site', 're-maison', 'Make a listing website for a luxury property with a photo gallery, amenities, a lease calculator, and a private-tour booking form.'),
      're-buyer':    ('Buyer rep calculator', 're-buyer-rep', 'Build a buyer representation calculator that shows clients what my agent fee costs them under each compensation structure.'),
      're-portfolio': ('Architect portfolio', 're-architect', 'Make a portfolio for my architecture studio with a bold hero, selected projects, and a contact page.'),
    }
    SLUG_KIT = {
      'ai-for-entrepreneurs':  {'hiw': 'prism',      'prompts': ['marketing', 'photo', 'coach', 'calendar']},
      'ai-for-small-business': {'hiw': 'tonys', 'prompts': ['restaurant', 'pos', 'queue', 'business']},
      'ai-for-agencies':       {'hiw': 'noir',       'prompts': ['agency-site', 'fashion', 'client-site', 'saas']},
      'ai-for-real-estate':    {'hiw': 'maison',    'prompts': ['re-property', 're-portfolio', 're-listings', 're-buyer']},
    }
    _kit = SLUG_KIT.get(slug)
    if _kit:
      main, _n = re.subn(r'<section class="section how-section section--bordered hm-steps uc2-hiw"', '<section class="section how-section section--bordered hm-steps uc2-hiw" data-business="%s"' % _kit['hiw'], main, count=1)
      assert _n == 1
      def _btn(key, i):
        p = PROMPTS[key]; label, shot, text = p[0], p[1], p[2]; on = 'true' if i == 0 else 'false'
        extra = (' data-start="%d"' % p[3] if len(p) > 3 else '') + (' data-nav="%d"' % p[4] if len(p) > 4 else '')
        return ('<button type="button" class="uc2-pg-item%s" role="tab" aria-selected="%s" aria-controls="uc2-pg-panel" data-prompt="%s" data-shot="../../use-cases/images/prompt-results/%s.webp"%s>'
                '<i class="uc2-pg-timer" aria-hidden="true"></i><span class="uc2-pg-label">%s</span><span class="uc2-pg-body"><span class="uc2-pg-text">%s</span></span></button>'
                % (' is-active' if i == 0 else '', on, html.escape(text, quote=True), shot, extra, html.escape(label), html.escape(text)))
      _list = ''.join(_btn(k, i) for i, k in enumerate(_kit['prompts']))
      main, _n = re.subn(r'(<div class="uc2-pg-list"[^>]*>).*?(</div>)', lambda m: m.group(1) + _list + m.group(2), main, count=1, flags=re.S)
      assert _n == 1
      _first = PROMPTS[_kit['prompts'][0]]
      main = re.sub(r'(<img class="uc2-pg-shot"[^>]*src=")[^"]*(")', lambda m: m.group(1) + '../../use-cases/images/prompt-results/%s.webp' % _first[1] + m.group(2), main, count=1)
      main = re.sub(r'(<img class="uc2-pg-shot"[^>]*alt=")[^"]*(")', lambda m: m.group(1) + 'Example of a %s built with Bolt' % _first[0].lower() + m.group(2), main, count=1)
      main = re.sub(r'(<textarea id="uc2-pg-input"[^>]*data-example=")[^"]*(")', lambda m: m.group(1) + html.escape(_first[2], quote=True) + m.group(2), main, count=1)   # the box's seed text
      main = re.sub(r'(<textarea id="uc2-pg-input"[^>]*>)[^<]*(</textarea>)', lambda m: m.group(1) + html.escape(_first[2]) + m.group(2), main, count=1)   # and its initial value

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
