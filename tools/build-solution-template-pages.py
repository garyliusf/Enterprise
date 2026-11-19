#!/usr/bin/env python3
"""Build the solutions "templates" pages from the real estate experiment (Gary, 2026-11-19).

  marketing/solutions/ai-for-real-estate-templates/index.html  = the design (R)
  marketing/solutions/<slug>/index.html                       = each page's own copy (T: hero copy, prompts,
                                                                  how it works, templates rail, stories, FAQ, closing)
  -> marketing/solutions/<slug>-templates/index.html

R's design layers are copied verbatim: the experiment style blocks, the hero collage (photos + template deck + the
two floating cards), the use-case bento and its scripts. Per page this script swaps the photos, the three deck
templates, the float copy and the six bento cards. The page's "why" stats and "who" cards are dropped (R has
neither). Re-run after changing R; never hand-edit the outputs' design layers.
"""
import html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R_PATH = os.path.join(ROOT, 'marketing/solutions/ai-for-real-estate-templates/index.html')
SHOTS = '../../use-cases/images/prompt-results/'
PEOPLE = '../../images/people/'
ARROW = '<svg class="rx-arrow" width="14" height="12" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h13M9 2l5 5-5 5"/></svg>'
E = html.escape

PAGES = {
  'ai-for-small-business': dict(
    audience='small businesses',
    left_y='0%', left_shift='0.06',   # phones: his face sits high and right in the photo, under the Orders tile at 30%
    photos=[('smb-left', 'A café owner smiling behind the counter', '50% 30%'), ('smb-right', 'A shop owner in an apron working on a laptop', '50% 25%')],
    deck_label='Three small business sites built with Bolt: a coffee subscription shop, a pilates studio and a café point of sale',
    deck=[('sol-ember', 0.5, 'Build a coffee subscription site where customers pick a roast, grind and delivery cadence, with a shop for one-off bags.'),
          ('sol-pilates', 0.5, 'Make a website for my pilates studio with the class schedule, instructor bios, pricing and online booking.'),
          ('sol-kitchen', 0.0, 'Build a point of sale for my café with a menu grid, open tabs, and stock levels that update with every order.')],
    inbox='Orders', col_a='Preparing', col_b='Ready', dot_a='#F59E0B', dot_b='#0d9b7a',
    hot=('Maya R.', '2 lattes &middot; $11.40', 'Ready for pickup'), second=('Order #212', 'Oat flat white'), third=('Ben T.', 'Croissant box &middot; $18'),
    new=('Lena K.', 'New order'),
    bento_head='What small businesses build with Bolt',
    bento=[
      dict(kind='web', href='business-website-builder', title='Business website', desc='Menu, hours, ordering and reviews, on your own domain.',
           photo=('founder-coffee', '50% 30%'), domain='tonyspizza.com', shot='sol-tonys', toast=('#E8590C', 'AR', 'New order &middot; Ana R.', 'Large margherita, pickup 6:30')),
      dict(kind='app', href='appointment-booking-app-builder', title='Booking app', desc='Classes, appointments and reminders your customers book themselves.',
           photo=('smb-middle', '50% 25%'), notif=('Class booked', 'Sat 9:00 AM &middot; Reformer'), bg=('sol-pilates', '50% 3%'),
           price='$28', name='Reformer Flow', loc='with Ana &middot; 50 min', cta=('Book a class', 'Booked &check;')),
      dict(kind='crm', href='custom-pos-system', title='Order board', desc='Every order from the counter, the site and delivery apps, in one place.',
           photo=('founder-terracotta', '80% 30%'), cols=[
             ('New', None, [('#F59E0B', 'JR', 'Jo R.', 'Pickup &middot; 6:15')]),
             ('Preparing', '#F59E0B', [('#0d9b7a', 'ML', 'Maya L.', ('2 lattes &middot; $11.40', 'Ready')), ('#EC4899', 'TP', 'Table 4', '3 items')], (2, 1)),
             ('Ready', '#1488FC', [('#1488FC', 'BT', 'Ben T.', 'Croissant box')], (1, 2))]),
      dict(kind='calc', href='invoice-generator-app-builder', title='Quotes and invoices', desc='Estimates, deposits and invoices, worked out and sent in seconds.',
           photo=('collage-desk', '50% 30%'), head='Estimate', big_lbl='Job total', big='$4,800',
           r1=('Markup', '15,20', 'pct', '15.0%', 50), r2=('Deposit / balance', '50,40', 'split', '50 / 50', 50), net=('Deposit due today', '2400,1920', 'usd', '$2,400')),
      dict(kind='list', href='custom-inventory-management-system', title='Inventory tracker', desc='Stock levels, reorder alerts and suppliers, without the spreadsheet.',
           photo=('re-right', '30% 25%'), head='Stock', chip='2 low', rows=[
             ('#0d9b7a', 'OM', 'Oat milk', '24 cartons &middot; supplier Oatly', ('ok', 'In stock')),
             ('#E8590C', 'CB', 'Cold brew beans', '3 bags &middot; reorder at 5', ('flip', 'Low', 'Ordered'))]),
      dict(kind='map', href='food-delivery-app-builder', title='Delivery map', desc='Delivery zones, fees and live drivers on one map.',
           photo=('agencies-middle', '50% 20%'), card=('Order #214', [('Zone', 'B'), ('Distance', '1.2 mi'), ('Driver', 'Sam K.')])),
    ]),
  'ai-for-entrepreneurs': dict(
    audience='entrepreneurs',
    photos=[('collage-laptop', 'A founder working on a laptop', '50% 30%'), ('collage-desk', 'A founder at her desk', '50% 25%')],
    deck_label='Three products built with Bolt: an AI analytics tool, a pet care app and an AI marketing agent',
    deck=[('sol-quarry', 0.45, 'Build an analytics app where I drop in a CSV and get a dashboard plus answers to questions in plain English.'),
          ('sol-tailwise', 0.45, 'Make an AI pet care companion with pet profiles, reminders, a care library and a chat for quick questions.'),
          ('sol-amplio', 0.45, 'Build an AI marketing agent that takes a product description and drafts the strategy, ads, emails and a landing page.')],
    inbox='Signups', col_a='Trial', col_b='Paid', dot_a='#F59E0B', dot_b='#0d9b7a',
    hot=('Acme Studio', 'Trial &middot; day 12', 'Upgraded to Pro'), second=('Northwind', 'Trial &middot; day 3'), third=('Lumen Co.', '$99 / month'),
    new=('Ivy Labs', 'New signup'),
    bento_head='What entrepreneurs build with Bolt',
    bento=[
      dict(kind='web', href='ai-landing-page-builder', title='Landing page', desc='A launch page with a waitlist, pricing and sign-up, live today.',
           photo=('collage-founders', '50% 10%'), domain='getnorthstar.app', shot='sol-saas', toast=('#7C3AED', 'AM', 'New signup &middot; Alex M.', 'Joined the waitlist')),
      dict(kind='app', href='ai-app-builder', title='Mobile app', desc='Accounts, subscriptions and push notifications in a real app.',
           photo=('founder-coffee', '50% 30%'), notif=('New subscriber', 'Pro plan &middot; $9.99 / month'), bg=('sol-tailwise', '0% 3%'),
           price='$9.99', name='Tailwise Pro', loc='Billed monthly &middot; cancel anytime', cta=('Start free trial', 'Subscribed &check;')),
      dict(kind='crm', href='task-management-app-builder', title='Product roadmap', desc='Feedback, what is being built and what shipped, in one board.',
           photo=('founder-agency', '100% 30%'), cols=[
             ('Ideas', None, [('#F59E0B', 'DM', 'Dark mode', '14 votes')]),
             ('Building', '#F59E0B', [('#0d9b7a', 'CE', 'CSV export', ('Due Fri', 'Shipped')), ('#EC4899', 'TS', 'Team seats', 'In design')], (2, 1)),
             ('Shipped', '#1488FC', [('#1488FC', 'SS', 'Stripe sync', 'v1.4')], (1, 2))]),
      dict(kind='calc', href='calculator-app-maker', title='Pricing model', desc='Plans, churn and revenue, worked out before you launch.',
           photo=('smb-middle', '50% 25%'), head='Revenue model', big_lbl='Price per seat', big='$29 / month',
           r1=('Monthly churn', '5.0,3.6', 'pct', '5.0%', 50), r2=('Annual / monthly', '40,55', 'split', '40 / 60', 40), net=('Monthly revenue', '12400,14120', 'usd', '$12,400')),
      dict(kind='list', href='dashboard-builder', title='Admin dashboard', desc='Customers, plans and usage, the way you want to see them.',
           photo=('agencies-right', '50% 12%'), head='Customers', chip='2 new', rows=[
             ('#0d9b7a', 'PR', 'Priya Rao', 'Pro &middot; 4 seats', ('ok', 'Active')),
             ('#1488FC', 'MO', 'Marcus Ode', 'Trial &middot; day <span class="rx-sw"><i>13</i><i>14</i></span>', ('flip', 'Trial', 'Paid'))]),
      dict(kind='map', href='directory-website-builder', title='Local marketplace', desc='Listings, search and a map for a local directory business.',
           photo=('founder-terracotta', '80% 30%'), card=('Hayes Valley Florist', [('Rating', '4.9'), ('Distance', '0.8 mi'), ('Open', 'till 7pm')])),
    ]),
  'ai-for-agencies': dict(
    audience='agencies',
    photos=[('agencies-left', 'Two agency designers reviewing work together', '50% 30%'), ('agencies-right', 'An agency lead holding a laptop', '50% 15%')],
    deck_label='Three client projects built with Bolt: a creative agency site, a fashion store and a content calendar',
    deck=[('sol-kern', 0.5, 'Build a site for our creative studio with a bold type-led hero, selected work and a services page.'),
          ('sol-ashcombe', 0.5, 'Make an online store for a heritage clothing brand with collections, a gift finder and seasonal sales.'),
          ('sol-cadence', 0.0, 'Build a content calendar for our clients with a month view, post statuses and an approval step.')],
    inbox='Clients', col_a='In review', col_b='Live', dot_a='#F59E0B', dot_b='#0d9b7a',
    hot=('Hayes Bakery', 'Homepage v3', 'Approved'), second=('Orbit Fitness', 'Landing page'), third=('Kova Finance', 'Client portal'),
    new=('Fern &amp; Co.', 'New brief'),
    bento_head='What agencies build with Bolt',
    bento=[
      dict(kind='web', href='ai-website-builder', title='Client websites', desc='Brand sites, built and handed over in days instead of months.',
           photo=('founder-agency', '100% 30%'), domain='digitalexperiences.studio', shot='sol-studio', toast=('#0d9b7a', 'HB', 'Approved &middot; Hayes Bakery', 'Homepage v3, ready to publish')),
      dict(kind='app', href='custom-event-management-system', title='Client apps', desc='Event, booking and loyalty apps your clients can put in front of customers.',
           photo=('collage-founders', '50% 10%'), notif=('Registration', 'Spring Launch &middot; Apr 18'), bg=('sol-attendly', '50% 3%'),
           price='$45', name='Spring Launch', loc='Pier 27, San Francisco', cta=('Register', 'Registered &check;')),
      dict(kind='crm', href='task-management-app-builder', title='Project board', desc='Every client project from brief to launch, in one board.',
           photo=('collage-laptop', '50% 30%'), cols=[
             ('Brief', None, [('#F59E0B', 'FC', 'Fern &amp; Co.', 'Brand site')]),
             ('In review', '#F59E0B', [('#0d9b7a', 'HB', 'Hayes Bakery', ('Homepage v3', 'Approved')), ('#EC4899', 'OF', 'Orbit Fitness', 'Landing page')], (2, 1)),
             ('Live', '#1488FC', [('#1488FC', 'KF', 'Kova Finance', 'Client portal')], (1, 2))]),
      dict(kind='calc', href='invoice-generator-app-builder', title='Project quotes', desc='Scopes, rates and margins, priced before the pitch.',
           photo=('founder-coffee', '50% 30%'), head='Quote', big_lbl='Project fee', big='$24,000',
           r1=('Contingency', '5,8', 'pct', '5.0%', 40), r2=('Design / build', '60,45', 'split', '60 / 40', 60), net=('Your margin', '7200,8640', 'usd', '$7,200')),
      dict(kind='list', href='custom-consulting-crm', title='Client portal', desc='Approvals, files and feedback for every client in one place.',
           photo=('agencies-middle', '50% 20%'), head='Approvals', chip='2 new', rows=[
             ('#0d9b7a', 'OF', 'Orbit Fitness', 'Landing page &middot; 3 comments', ('ok', 'Approved')),
             ('#1488FC', 'KF', 'Kova Finance', 'Portal &middot; files <span class="rx-sw"><i>4/5</i><i>5/5</i></span>', ('flip', 'In review', 'Approved'))]),
      dict(kind='map', href='directory-website-builder', title='Store locators', desc='Locations, hours and directions for a retail client.',
           photo=('smb-left', '50% 30%'), card=('Hayes Valley', [('Open', 'till 8pm'), ('Distance', '0.8 mi'), ('Pickup', 'Yes')])),
    ]),
}


def tile_open(t, kind):
    p, pos = t['photo']
    return ('      <a class="rx-tile rx-tile--%s" href="https://bolt.new/use-cases/%s">\n'
            '        <img class="rx-photo" src="%s%s.webp" alt="" loading="lazy" decoding="async" style="object-position:%s"><span class="rx-scrim" aria-hidden="true"></span>\n'
            '        <div class="rx-stage" aria-hidden="true"><div class="rx-float">\n') % (kind, t['href'], PEOPLE, p, pos)


def tile_close(t):
    return ('        </div></div>\n        <div class="rx-copy"><h3 class="rx-title">%s</h3><p class="rx-desc">%s</p><span class="rx-more">See how %s</span></div>\n      </a>\n'
            % (t['title'], t['desc'], ARROW))


def sw(v):
    return v if isinstance(v, str) else '<span class="rx-sw"><i>%s</i><i>%s</i></span>' % v


def deal(c, av, name, sub, hot=False):
    return '<div class="rx-deal%s"><span class="rx-av" style="--c:%s">%s</span><span class="rx-deal-txt"><b>%s</b><small>%s</small></span></div>' % (' rx-deal--hot' if hot else '', c, av, name, sw(sub))


def tile(t):
    k = t['kind']
    if k == 'web':
        c, av, b, sm = t['toast']
        body = ('          <div class="rx-browser"><div class="rx-browser-bar"><i></i><i></i><i></i><span>%s</span></div>\n'
                '            <div class="rx-browser-view"><img class="rx-scroll" src="%s%s.webp" alt="" loading="lazy" decoding="async"></div>\n'
                '            <div class="rx-toast"><span class="rx-av" style="--c:%s">%s</span><span class="rx-deal-txt"><b>%s</b><small>%s</small></span><span class="rx-toast-time">now</span></div></div>\n'
                ) % (t['domain'], SHOTS, t['shot'], c, av, b, sm)
        return tile_open(t, 'web') + body + tile_close(t)
    if k == 'app':
        bg, pos = t['bg']
        body = ('          <div class="rx-phone"><div class="rx-phone-screen">\n'
                '            <div class="rx-ph-status"><span>9:41</span><i></i></div>\n'
                '            <div class="rx-notif"><b>%s</b><small>%s</small></div>\n'
                '            <div class="rx-ph-photo" style="background-image:url(\'%s%s.webp\');background-position:%s;background-size:240%% auto"><span class="rx-ph-heart"></span><span class="rx-ph-count">1/8</span></div>\n'
                '            <div class="rx-ph-body"><p class="rx-ph-price">%s</p><p class="rx-ph-name">%s</p><p class="rx-ph-loc">%s</p></div>\n'
                '            <div class="rx-ph-cta"><span class="rx-sw"><i>%s</i><i>%s</i></span></div>\n'
                '          </div></div>\n') % (t['notif'][0], t['notif'][1], SHOTS, bg, pos, t['price'], t['name'], t['loc'], t['cta'][0], t['cta'][1])
        return tile_open(t, 'app') + body + tile_close(t)
    if k == 'crm':
        cols = []
        for col in t['cols']:
            label, dot, deals = col[0], col[1], col[2]
            head = ('<span class="rx-stage-dot" style="--d:%s"></span>' % dot if dot else '') + label + ' '
            head += ('<span class="rx-n"><i>%d</i><i>%d</i></span>' % col[3]) if len(col) > 3 else '<span>%d</span>' % len(deals)
            ds = ''.join(deal(c, av, n, sub, hot=not isinstance(sub, str)) for c, av, n, sub in deals)
            cols.append('              <div class="rx-col"><p>%s</p>%s</div>' % (head, ds))
        body = '          <div class="rx-ui rx-crm">\n            <div class="rx-cols">\n%s\n            </div>\n          </div>\n' % '\n'.join(cols)
        return tile_open(t, 'crm') + body + tile_close(t)
    if k == 'calc':
        def row(r):
            lbl, rng, fmt, txt, v = r
            return ('            <div class="rx-row"><span class="rx-lbl">%s</span><b data-rx-num="%s" data-rx-fmt="%s">%s</b></div>\n'
                    '            <div class="rx-track%s"><i style="--v:%d%%"></i></div>\n') % (lbl, rng, fmt, txt, ' rx-track--split' if fmt == 'split' else '', v)
        n = t['net']
        body = ('          <div class="rx-ui rx-calc">\n            <div class="rx-ui-head"><b>%s</b></div>\n'
                '            <p class="rx-lbl">%s</p><p class="rx-big">%s</p>\n%s%s'
                '            <div class="rx-net"><span>%s</span><b data-rx-num="%s" data-rx-fmt="%s">%s</b></div>\n          </div>\n'
                ) % (t['head'], t['big_lbl'], t['big'], row(t['r1']), row(t['r2']), n[0], n[1], n[2], n[3])
        return tile_open(t, 'calc') + body + tile_close(t)
    if k == 'list':
        rows = []
        for c, av, name, sub, st in t['rows']:
            pill = ('<span class="rx-pill rx-pill--ok">%s</span>' % st[1]) if st[0] == 'ok' else \
                   ('<span class="rx-pill rx-pill--rev rx-pill--flip"><span class="rx-sw"><i>%s</i><i>%s</i></span></span>' % (st[1], st[2]))
            rows.append('            <div class="rx-app"><span class="rx-av" style="--c:%s">%s</span><span class="rx-deal-txt"><b>%s</b><small>%s</small></span>%s</div>' % (c, av, name, sub, pill))
        body = ('          <div class="rx-ui rx-tenant">\n            <div class="rx-ui-head"><b>%s</b><span class="rx-ui-sp"></span><span class="rx-chip rx-chip--blue">%s</span></div>\n%s\n          </div>\n'
                ) % (t['head'], t['chip'], '\n'.join(rows))
        return tile_open(t, 'tenant') + body + tile_close(t)
    if k == 'map':
        return None  # filled from R's parcel tile (the map art), see below
    raise ValueError(k)


def block(s, start, end_pat, include_end=True):
    i = s.index(start)
    j = s.index(end_pat, i)
    return i, j + (len(end_pat) if include_end else 0)


def main():
    R = open(R_PATH).read()
    # design layers from R
    head_js = re.search(r'<script>/\* HERO VARIANTS \(review only\) \*/.*?</script>\n', R).group(0)
    i = R.index('<style id="hero-templates-experiment">')
    j = R.index('</style>', R.index('<style id="re-use-cases">')) + len('</style>')
    styles = R[i:j]
    a, b = block(R, '<div class="hero-collage hero-collage--templates">', '      </div> </div> </div> </section> <section class="section uc2-pg"', include_end=False)
    collage = R[a:b]
    a, b = block(R, '<section class="section re-uc-section" id="use-cases">', '</section>')
    bento_r = R[a:b]
    parcel = re.search(r'      <a class="rx-tile rx-tile--parcel".*?</a>\n', bento_r, re.S).group(0)
    scripts = ''.join(re.search(r'<script id="%s">.*?</script>\n' % k, R, re.S).group(0) for k in ('re-uc-js', 're-deck-js', 'hv-place-js', 'hv-switch-js'))
    # the new card in the inquiry -> lead flow comes from the page's data attributes
    scripts = scripts.replace("'<span class=\"hv-new-pill\"><span class=\"hv-bar\"></span></span><span class=\"rx-deal-txt\"><b>Jordan Reyes</b><small>New inquiry</small></span>'",
                              "'<span class=\"hv-new-pill\"><span class=\"hv-bar\"></span></span><span class=\"rx-deal-txt\"><b>' + (apps.dataset.newName || '') + '</b><small>' + (apps.dataset.newSub || '') + '</small></span>'")
    assert 'apps.dataset.newName' in scripts

    only = sys.argv[1:] or list(PAGES)
    for slug in only:
        P = PAGES[slug]
        T = open(os.path.join(ROOT, 'marketing/solutions', slug, 'index.html')).read()
        out = T.replace('/solutions/%s/' % slug, '/solutions/%s-templates/' % slug)
        out = out.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + head_js.rstrip('\n'), 1) if '<meta charset="UTF-8">' in out else out.replace('<head>', '<head>\n' + head_js, 1)
        assert 'HERO VARIANTS (review only) */' in out
        # styles: R's taller live card on desktop + the experiment blocks, right after the page's last head style
        out = out.replace('.hm-dep-site .pp--shot { aspect-ratio: 1280 / 620; }', '.hm-dep-site .pp--shot { aspect-ratio: 1280 / 620; }\n@media (min-width: 1025px) { .hm-dep-site .pp--shot { aspect-ratio: 1280 / 900; } }', 1)
        k = out.index('</style>', out.index('.hm-dep-site .pp--shot')) + len('</style>')
        left = '\n<style id="sol-left-photo">@media (max-width: 768px) { .hero-collage--templates .hero-collage-col:nth-child(1) .hero-uc-img { object-position: 100%% %s !important; transform: translateX(calc(var(--hc-h) * -%s)); } }</style>' % (P.get('left_y', '30%'), P.get('left_shift', '0.12'))
        out = out[:k] + '\n' + styles + left + out[k:]
        # hero collage
        c = collage
        (l, la, lp), (r, ra, rp) = P['photos']
        c = re.sub(r'(hero-collage-col">\s*<figure class="hero-uc-card sc-on-dark">\s*<img class="hero-uc-img" src=")[^"]*(" alt=")[^"]*(" style="object-position:)[^"]*', lambda m: m.group(1) + PEOPLE + l + '.webp' + m.group(2) + E(la) + m.group(3) + lp, c, count=1)
        last = c.rindex('<img class="hero-uc-img"')
        c = c[:last] + re.sub(r'src="[^"]*" alt="[^"]*" style="object-position:[^"]*"', 'src="%s%s.webp" alt="%s" style="object-position:%s"' % (PEOPLE, r, E(ra), rp), c[last:], count=1)
        c = re.sub(r'aria-label="Three real estate[^"]*"', 'aria-label="%s"' % E(P['deck_label']), c)
        cards = re.findall(r'          <div class="re-deck-card".*?</div>\n', c)
        assert len(cards) == 3
        for old, (img, scroll, prompt) in zip(cards, P['deck']):
            c = c.replace(old, '          <div class="re-deck-card" data-scroll="%s" data-prompt="%s"><img src="%s%s.webp" alt="" decoding="async"></div>\n' % (scroll, E(prompt), SHOTS, img), 1)
        c = re.sub(r'(<p class="re-deck-prompt-text" id="re-deck-prompt-text">)[^<]*', lambda m: m.group(1) + E(P['deck'][0][2]), c)
        hot, sec, third, new = P['hot'], P['second'], P['third'], P['new']
        crm = ('          <div class="hv-tile hv-tile--apps hv-tile--crm rx-ui rx-crm" data-new-name="%s" data-new-sub="%s">\n            <div class="rx-cols">\n'
               '              <div class="rx-col"><p><span class="rx-stage-dot" style="--d:%s"></span>%s <span class="rx-n"><i>2</i><i>1</i></span></p><div class="rx-deal rx-deal--hot"><span class="rx-deal-txt"><b>%s</b><small><span class="rx-sw"><i>%s</i><i>%s</i></span></small></span></div><div class="rx-deal"><span class="rx-deal-txt"><b>%s</b><small>%s</small></span></div></div>\n'
               '              <div class="rx-col"><p><span class="rx-stage-dot" style="--d:%s"></span>%s <span class="rx-n"><i>1</i><i>2</i></span></p><div class="rx-deal"><span class="rx-deal-txt"><b>%s</b><small>%s</small></span></div></div>\n'
               '            </div>\n          </div>\n') % (new[0], new[1], P['dot_a'], P['col_a'], hot[0], hot[1], hot[2], sec[0], sec[1], P['dot_b'], P['col_b'], third[0], third[1])
        c = re.sub(r'          <div class="hv-tile hv-tile--apps.*?\n          </div>\n(?=          <div class="hv-tile hv-toast)', lambda m: crm, c, flags=re.S)
        c = c.replace('<div class="hv-tile hv-toast hv-tile--inq"><b>Inquiries</b>', '<div class="hv-tile hv-toast hv-tile--inq"><b>%s</b>' % P['inbox'])
        assert P['inbox'] in c and 'data-new-name' in c and 'Marsh family' not in c
        a, b = block(out, '<div class="hero-collage">', '      </div> </div> </div> </section> <section class="section uc2-pg"', include_end=False)
        out = out[:a] + c + out[b:]
        # bento in place of the why stats; the who cards go
        tiles = []
        for t in P['bento']:
            if t['kind'] == 'map':
                m = parcel
                m = re.sub(r'href="[^"]*"', 'href="https://bolt.new/use-cases/%s"' % t['href'], m, count=1)
                m = re.sub(r'src="[^"]*" alt="" loading="lazy" decoding="async" style="object-position:[^"]*"', 'src="%s%s.webp" alt="" loading="lazy" decoding="async" style="object-position:%s"' % (PEOPLE, t['photo'][0], t['photo'][1]), m, count=1)
                b0, rows = t['card']
                m = re.sub(r'<div class="rx-parcel-card">.*?</div>', '<div class="rx-parcel-card"><b>%s</b><dl>%s</dl></div>' % (b0, ''.join('<dt>%s</dt><dd>%s</dd>' % r for r in rows)), m, flags=re.S)
                m = re.sub(r'<h3 class="rx-title">[^<]*</h3><p class="rx-desc">[^<]*</p>', '<h3 class="rx-title">%s</h3><p class="rx-desc">%s</p>' % (t['title'], t['desc']), m)
                tiles.append(m)
            else:
                tiles.append(tile(t))
        bento = re.sub(r'(<div class="rx-bento">\n).*(    </div>\n  </div>\n</section>)$', lambda m: m.group(1) + ''.join(tiles) + m.group(2), bento_r, flags=re.S)
        bento = bento.replace('What real estate pros build with Bolt', P['bento_head'])
        assert bento.count('<a class="rx-tile') == 6
        a, b = block(out, '<section class="section why-section">', '</section>')
        out = out[:a] + bento + out[b:]
        a, b = block(out, '<section class="section section--bordered">', '</section>')
        assert '<section' not in out[a + 10:b]
        out = out[:a] + out[b:]
        # phones: the left photo slides left inside its frame so the face clears the template deck (the real estate
        # fix for the woman's photo, mirrored); the strip it uncovers on the right sits behind the front template
        # scripts
        out = out.replace('</body>', scripts + '</body>', 1)
        dst = os.path.join(ROOT, 'marketing/solutions', slug + '-templates')
        os.makedirs(dst, exist_ok=True)
        open(os.path.join(dst, 'index.html'), 'w').write(out)
        print('wrote', os.path.relpath(os.path.join(dst, 'index.html'), ROOT), len(out))


if __name__ == '__main__':
    main()
