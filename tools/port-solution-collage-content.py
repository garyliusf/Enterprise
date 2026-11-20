"""Content half of tools/port-solution-collage.py (run with --content): lifts each
staging page's collage content into its CMS entry. The staging pages are the
source; re-running overwrites heroCollage / useCases / howItWorksExample /
promptExamples / layout on the four entries (every other field is kept)."""
import json, re
from bs4 import BeautifulSoup, NavigableString

ROOT = __import__('pathlib').Path(__file__).resolve().parents[1]
SLUGS = ['ai-for-real-estate', 'ai-for-small-business', 'ai-for-entrepreneurs', 'ai-for-agencies']
HIW_TEMPLATE = {'ai-for-entrepreneurs': 'lineup-walk-in-queue'}   # the walkthrough builds LineUp (Gary)


def text(el):
    """element text with the design's swap spans written back as {before|after}"""
    out = ''
    for ch in el.children:
        if isinstance(ch, NavigableString):
            out += str(ch)
        elif ch.name == 'span' and set(ch.get('class', [])) & {'rx-sw', 'rx-n'}:
            a, b = ch.find_all('i', recursive=False)[:2]
            out += '{%s|%s}' % (a.get_text(), b.get_text())
        else:
            out += text(ch)
    return re.sub(r'\s+', ' ', out).strip()


def style_val(el, prop):
    m = re.search(r'(?:^|;)\s*%s\s*:\s*([^;]+)' % re.escape(prop), el.get('style', '') or '')
    return m.group(1).strip() if m else None


def phone_rules(page):
    """page-local phone crops: selector → object-position (+ the left photo's shift)"""
    rules = {}
    for sid in ('sol-left-photo', 'sol-right-photo', 'sol-tile-photos', 're-tile-photos'):
        m = re.search(r'<style id="%s">(.*?)</style>' % sid, page, re.S)
        if not m: continue
        for sel, body in re.findall(r'([^{}@]+)\{([^{}]*)\}', m.group(1)):
            pos = re.search(r'object-position:\s*([^;!]+)', body)
            shift = re.search(r'\*\s*-([\d.]+)\)', body)
            rules[sel.strip()] = (pos.group(1).strip() if pos else None, float(shift.group(1)) if shift else None)
    return rules


def tile_phone(rules, src):
    name = src.rsplit('/', 1)[-1]
    for sel, (pos, _) in rules.items():
        if f'src$="{name}"' in sel or f"src$=\\\"{name}\\\"" in sel: return pos
    return None


def presets():
    R = (ROOT / 'marketing/solutions/ai-for-real-estate-templates/index.html').read_text()
    js = re.search(r'<script id="uc2-hiw-js">(.*?)</script>', R, re.S).group(1)
    a = js.index('var PRESETS = ') + len('var PRESETS = ')
    b = js.index('\n};', a) + 2
    return json.loads(js[a:b])


def run(repo, asset):
    P = presets()
    for slug in SLUGS:
        page_dir = ROOT / 'marketing/solutions' / (slug + '-templates')
        page = (page_dir / 'index.html').read_text()
        soup = BeautifulSoup(page, 'html.parser')
        A = lambda rel: asset(rel, page_dir)
        rules = phone_rules(page)
        entry_path = repo / 'src/content/solutions' / (slug + '.json')
        d = json.loads(entry_path.read_text())

        # ── hero ──
        hero = soup.select_one('.hero-section--split')
        btn = hero.select_one('.hero-btn-primary')
        imgs = hero.select('.hero-uc-img')
        def photo(img, col):
            p = {'image': A(img['src']), 'alt': img.get('alt', ''), 'position': style_val(img, 'object-position')}
            for sel, (pos, shift) in rules.items():
                if f'nth-child({col}) .hero-uc-img' in sel:
                    if pos: p['phonePosition'] = pos
                    if shift is not None: p['phoneShift'] = shift
            return p
        deck = hero.select_one('#re-deck')
        crm = hero.select_one('.hv-tile--crm')
        cols = crm.select('.rx-col')
        def col(c):
            p = c.find('p')
            dot = p.select_one('.rx-stage-dot')
            label = ''.join(s for s in p.find_all(string=True, recursive=False)).strip()
            return {'label': label, 'dot': style_val(dot, '--d')}
        deals = [cols[0].select('.rx-deal')[0], cols[0].select('.rx-deal')[1], cols[1].select('.rx-deal')[0]]
        dl = lambda e: {'name': e.select_one('b').get_text(), 'text': text(e.select_one('small'))}
        hc = {
            'ctaText': btn.select_one('.btn-text-inner span').get_text().strip(),
            'ctaUrl': btn['href'],
            'keepKeywordLine': bool(hero.select_one('.hero-h1-line')),
            'leftPhoto': photo(imgs[0], 1),
            'rightPhoto': photo(imgs[1], 3),
            'deckLabel': deck['aria-label'],
            'deck': [dict({'image': A(c.img['src']), 'prompt': c['data-prompt'], 'scroll': float(c['data-scroll'])},
                          **({'background': style_val(c, 'background')} if style_val(c, 'background') else {}))
                     for c in deck.select('.re-deck-card')],
            'board': {
                'inbox': hero.select_one('.hv-tile--inq b').get_text(),
                'columns': [col(c) for c in cols],
                'moving': dl(deals[0]), 'waiting': dl(deals[1]), 'done': dl(deals[2]),
                'incoming': {'name': crm.get('data-new-name') or 'Jordan Reyes', 'text': crm.get('data-new-sub') or 'New inquiry'},
            },
        }

        # ── prompt tabs ──
        old_tpl = {p['label']: p.get('template') for p in d.get('promptExamples', [])}
        prompts = []
        for b in soup.select('.uc2-pg-item'):
            p = {'label': b.select_one('.uc2-pg-label').get_text(), 'prompt': b['data-prompt'], 'image': A(b['data-shot'])}
            if old_tpl.get(p['label']): p['template'] = old_tpl[p['label']]
            if b.get('data-start'): p['startAt'] = int(b['data-start'])
            if b.get('data-nav'): p['pinnedNavHeight'] = int(b['data-nav'])
            prompts.append({k: p[k] for k in ('label', 'prompt', 'template', 'image', 'startAt', 'pinnedNavHeight') if k in p})

        # ── use-case tiles ──
        sec = soup.select_one('#use-cases')
        def base(t):
            img = t.select_one('.rx-photo')
            o = {'title': t.select_one('.rx-title').get_text(), 'description': t.select_one('.rx-desc').get_text(),
                 'link': t['href'], 'photo': A(img['src']), 'photoPosition': style_val(img, 'object-position')}
            ph = tile_phone(rules, img['src'])
            if ph: o['photoPositionPhone'] = ph
            return o
        def row(e):
            o = {}
            av_ = e.select_one('.rx-av')
            if av_: o['color'] = style_val(av_, '--c'); o['initials'] = av_.get_text()
            o['name'] = e.select_one('.rx-deal-txt b').get_text()
            o['text'] = text(e.select_one('.rx-deal-txt small'))
            return o
        T = {k: sec.select_one('.rx-tile--' + k) for k in ('web', 'crm', 'app', 'calc', 'tenant', 'parcel')}
        web = T['web']
        website = dict(base(web), domain=web.select_one('.rx-browser-bar span').get_text(),
                       screenshot=A(web.select_one('.rx-scroll')['src']), toast=row(web.select_one('.rx-toast')))
        bcols = []
        for c in T['crm'].select('.rx-col'):
            p = c.find('p')
            dot = p.select_one('.rx-stage-dot')
            label = ''.join(s for s in p.find_all(string=True, recursive=False)).strip()
            cards = [dict(row(k), moves='rx-deal--hot' in k['class']) for k in c.select('.rx-deal')]
            o = {'label': label}
            if dot: o['dot'] = style_val(dot, '--d')
            cnt = p.select_one('.rx-n')
            if cnt: o['count'] = text(p).split(label, 1)[-1].strip()
            else:
                plain = p.find_all('span', recursive=False)[-1].get_text()
                if plain != str(len(cards)): o['count'] = plain
            o['cards'] = cards
            bcols.append(o)
        board = dict(base(T['crm']), columns=bcols)
        ap_ = T['app']
        ph = ap_.select_one('.rx-ph-photo')
        app = dict(base(ap_), notification={'title': ap_.select_one('.rx-notif b').get_text(), 'text': text(ap_.select_one('.rx-notif small'))})
        bg = style_val(ph, 'background-image')
        if bg:
            app['image'] = A(re.search(r"url\(['\"]?([^'\")]+)", bg).group(1))
            app['imagePosition'] = style_val(ph, 'background-position')
            app['imageSize'] = style_val(ph, 'background-size')
        if ph.select_one('.rx-ph-count'): app['imageCount'] = ph.select_one('.rx-ph-count').get_text()
        app.update(price=ap_.select_one('.rx-ph-price').get_text(), name=ap_.select_one('.rx-ph-name').get_text(),
                   detail=text(ap_.select_one('.rx-ph-loc')), button=text(ap_.select_one('.rx-ph-cta')))
        ca = T['calc']
        crows = []
        for r, tr in zip(ca.select('.rx-row'), ca.select('.rx-track')):
            f, t_ = r.b['data-rx-num'].split(',')
            crows.append({'label': r.select_one('.rx-lbl').get_text(), 'from': f, 'to': t_, 'format': r.b['data-rx-fmt'],
                          'fill': int(style_val(tr.i, '--v').rstrip('%'))})
        net = ca.select_one('.rx-net')
        f, t_ = net.b['data-rx-num'].split(',')
        calc = dict(base(ca), heading=ca.select_one('.rx-ui-head b').get_text(), bigLabel=ca.select_one('p.rx-lbl').get_text(),
                    bigValue=ca.select_one('.rx-big').get_text(), rows=crows,
                    total={'label': net.span.get_text(), 'from': f, 'to': t_, 'format': net.b['data-rx-fmt']})
        li = T['tenant']
        lrows = [dict(row(e), status=text(e.select_one('.rx-pill'))) for e in li.select('.rx-app')]
        lst = dict(base(li), heading=li.select_one('.rx-ui-head b').get_text(), chip=li.select_one('.rx-chip').get_text(), rows=lrows)
        mp = T['parcel']
        card = mp.select_one('.rx-parcel-card')
        mapt = dict(base(mp), cardTitle=card.b.get_text(),
                    details=[{'label': dt.get_text(), 'value': dd.get_text()} for dt, dd in zip(card.select('dt'), card.select('dd'))])
        hdr = sec.select_one('.section-header')
        uc = {'eyebrow': hdr.select_one('.section-eyebrow').get_text(), 'heading': hdr.select_one('.section-headline').get_text()}
        if hdr.select_one('.section-sub'): uc['sub'] = hdr.select_one('.section-sub').get_text()
        uc.update(website=website, board=board, app=app, calculator=calc, list=lst, map=mapt)

        # ── how it works example (the staging preset the section names) ──
        key = soup.select_one('.uc2-hiw')['data-business']
        pr = P[key]
        h = dict(d.get('howItWorksExample') or {})
        if slug in HIW_TEMPLATE: h['template'] = HIW_TEMPLATE[slug]
        h.update(prompt=pr['prompt'], reply=pr['reply'], followUps=pr['followUps'], services=pr['services'], domain=pr['site'],
                 name=pr['name'], cardImage=A(pr['shot']), dashboardImage=A(pr['shotWb']), mark=pr['mark'], colors=pr['colors'])
        if pr.get('shotWbFit'): h['dashboardFit'] = pr['shotWbFit']
        else: h.pop('dashboardFit', None)

        # templates rail header + button as staging shows them (the cards stay the CMS's)
        ts = soup.select_one('#templates')
        d['templatesHeading'] = ts.select_one('.section-headline').get_text()
        sub = ts.select_one('.section-header .section-sub')
        if sub: d['templatesSub'] = sub.get_text()
        cta = ts.select_one('.tmpl-cta a, .section-cta a, a.hero-btn-primary')
        if cta:
            d['templatesCtaText'] = cta.select_one('.btn-text-inner span').get_text().strip() if cta.select_one('.btn-text-inner span') else cta.get_text().strip()
            d['templatesCtaUrl'] = cta['href']
        d['templatesLayout'] = 'rail'

        d['heroCollage'] = hc
        d['useCases'] = uc
        d['howItWorksExample'] = h
        d['promptExamples'] = prompts
        d['layout'] = 'collage'
        if not soup.select_one('.why-section'):   # real estate: the stats strip is hidden (Gary, #703)
            d['hiddenSections'] = sorted(set(d.get('hiddenSections', [])) | {'why'})
        entry_path.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\n')
        print('content', slug, 'prompts', len(prompts), 'hiw', key, 'tiles ok')
