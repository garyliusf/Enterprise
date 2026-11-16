"""Render the real estate hero's middle-card video: template screenshots as floating cards on a
slowly orbiting ring over the blue bokeh glow (the team's `newloop.mp4` look), with the camera
pushing in on the three real estate templates in turn (Gary, 2026-11-16).

    python3 tools/render-re-templates-loop.py <frames-dir>
    ffmpeg -framerate 30 -i <frames-dir>/f%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 26 -movflags +faststart out.mp4

Seamless: the ring advances one card slot per loop; the camera starts and ends wide.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math, os, sys

OUT = sys.argv[1]
W, H = 766, 920            # 2x the 383x460 card
FPS = 30
os.makedirs(OUT, exist_ok=True)

# ring order; the three FEATURED real estate templates sit a third of the ring apart
# slots run right (0) → bottom (2) → left (4) → top (6); the featured three take right, bottom and left so a
# pull-out never lands at the back of the ring (Gary, 2026-11-16)
TEMPLATES = ['nestora-real-estate', 'noir-agency', 'property-listing', 'buyer-rep-calc',
             'architect-portfolio', 'tenant-screening', 'vantage-dashboard', 'meridian-capital']
FEATURED = [0, 2, 4]
CARD_W, CARD_H = 198, 264
HI = 4                     # cards are built at 4x so a push-in stays sharp
RADIUS_X, RADIUS_Y = 262, 300
CENTER = (W // 2, H // 2 - 26)

# timeline per featured card (seconds): wide → push in → hold (page scrolls) → pull out → wide
SEG_WIDE, SEG_IN, SEG_HOLD, SEG_OUT = 1.2, 1.1, 2.6, 1.0
SEG = SEG_WIDE + SEG_IN + SEG_HOLD + SEG_OUT
SECS = SEG * len(FEATURED)
N = int(SECS * FPS)

def make_ground():
    g = Image.new('RGB', (W, H), (7, 34, 110))
    d = ImageDraw.Draw(g)
    for y in range(H):
        t = y / H
        r = int(8 + 12 * (1 - abs(t - 0.4) * 2)); gg = int(40 + 50 * (1 - abs(t - 0.35) * 1.6)); b = int(120 + 90 * (1 - abs(t - 0.35) * 1.4))
        d.line((0, y, W, y), fill=(max(4, r), max(20, gg), max(70, min(255, b))))
    glow = Image.new('RGB', (W, H), (0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse((W * 0.45, -H * 0.25, W * 1.35, H * 0.42), fill=(150, 200, 255))
    gd.ellipse((W * 0.66, -H * 0.16, W * 1.22, H * 0.26), fill=(245, 250, 255))
    gd.ellipse((-W * 0.3, H * 0.55, W * 0.35, H * 1.15), fill=(20, 80, 200))
    g = ImageChops.screen(g, glow.filter(ImageFilter.GaussianBlur(110)))
    dots = Image.new('L', (W, H), 0); dd = ImageDraw.Draw(dots)
    for y in range(6, H, 16):
        a = int(60 * (1 - y / H))
        for x in range(6, W, 16):
            dd.rectangle((x, y, x + 1, y + 1), fill=a)
    return ImageChops.screen(g, Image.merge('RGB', (dots.point(lambda v: v // 3), dots.point(lambda v: v // 2), dots)))

SHOTS = {}
SOURCES = {'property-listing': 'marketing/use-cases/images/prompt-results/re-maison.webp', 'architect-portfolio': 'marketing/use-cases/images/prompt-results/re-architect.webp'}   # the catalog shot is only 1800px tall; this is the full page
def shot(name):
    if name not in SHOTS:
        im = Image.open(SOURCES.get(name, 'marketing/templates/images/%s.webp' % name)).convert('RGB')
        s = CARD_W * HI / im.width
        im = im.resize((CARD_W * HI, int(im.height * s)), Image.LANCZOS)
        if im.height < CARD_H * HI:   # a short page: extend it with its own ground colour
            ext = Image.new('RGB', (im.width, CARD_H * HI), im.getpixel((8, im.height - 8)))
            ext.paste(im, (0, 0)); im = ext
        SHOTS[name] = im
    return SHOTS[name]

PAD = 48 * HI
def make_card(name, y_off=0):
    """a 4x card: the screenshot from y_off down, rounded, with a soft shadow baked in"""
    im = shot(name)
    cw, ch = CARD_W * HI, CARD_H * HI
    y_off = max(0, min(int(y_off), im.height - ch))
    face = im.crop((0, y_off, cw, y_off + ch)).convert('RGBA')
    mask = Image.new('L', (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=10 * HI, fill=255)
    face.putalpha(mask)
    card = Image.new('RGBA', (cw + PAD * 2, ch + PAD * 2), (0, 0, 0, 0))
    sh = Image.new('L', card.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle((PAD, PAD + 18 * HI, PAD + cw, PAD + ch + 18 * HI), radius=12 * HI, fill=150)
    card.paste((5, 12, 40, 255), (0, 0), sh.filter(ImageFilter.GaussianBlur(22 * HI)))
    card.alpha_composite(face, (PAD, PAD))
    return card

def smooth(t): return t * t * (3 - 2 * t)
def ease_in_out_quart(t): return 8 * t ** 4 if t < 0.5 else 1 - (-2 * t + 2) ** 4 / 2

ground = make_ground()
base_cards = [make_card(n) for n in TEMPLATES]
K = len(TEMPLATES)

def ring_pose(i, t):
    """world position, depth and scale of card i at loop time t (0..1)"""
    ang = (i / K + t / K) * 2 * math.pi
    x = CENTER[0] + RADIUS_X * math.cos(ang)
    y = CENTER[1] + RADIUS_Y * math.sin(ang)
    depth = (math.sin(ang) + 1) / 2
    scale = 0.62 + 0.40 * depth
    bob = 6 * math.sin(2 * math.pi * (3 * t + i / K))   # whole bobs per loop → seamless
    return x, y + bob, depth, scale

SCROLL_PX = {'nestora-real-estate': 170 * HI, 'property-listing': 262 * HI, 'architect-portfolio': 125 * HI}   # how far each featured page scrolls while held (4x card px)

SCROLLED = {}
for f in range(N):
    t = f / N
    sec = f / FPS
    k = min(len(FEATURED) - 1, int(sec // SEG))
    local = sec - k * SEG
    fi = FEATURED[k]

    # camera: amount of push-in (0 wide … 1 on the card) and the page scroll while held
    if local < SEG_WIDE:
        z = 0.0; scroll = 0.0
    elif local < SEG_WIDE + SEG_IN:
        z = ease_in_out_quart((local - SEG_WIDE) / SEG_IN); scroll = 0.0
    elif local < SEG_WIDE + SEG_IN + SEG_HOLD:
        z = 1.0; scroll = smooth((local - SEG_WIDE - SEG_IN) / SEG_HOLD)
    else:
        z = 1.0 - ease_in_out_quart((local - SEG_WIDE - SEG_IN - SEG_HOLD) / SEG_OUT); scroll = 1.0
    fx, fy, fdepth, fscale = ring_pose(fi, t)
    z_full = (H * 0.84) / (CARD_H * fscale)        # the featured card stands at 84% of the frame height, glow still around it
    zoom = 1 + (z_full - 1) * z
    cam_x = CENTER[0] + (fx - CENTER[0]) * z
    cam_y = CENTER[1] + (fy - CENTER[1]) * z

    # stacking: the three featured cards always sit above the other five in the ring, so a card the
    # camera pulls out of is already in its final place and nothing slides over it (Gary, 2026-11-16)
    frame = ground.copy().convert('RGBA')
    items = []
    for i in range(K):
        x, y, depth, scale = ring_pose(i, t)
        sx = CENTER[0] + (x - cam_x) * zoom
        sy = CENTER[1] + (y - cam_y) * zoom
        s = scale * zoom
        # a featured page stays where its scroll ended once it is back in the ring; it only resets to the
        # top while the camera is held on the NEXT template, where it is off screen (Gary, 2026-11-16)
        sc = 0.0
        if i == fi: sc = scroll
        elif i == FEATURED[(k - 1) % len(FEATURED)] and local < SEG_WIDE + SEG_IN + SEG_HOLD / 2: sc = 1.0
        px_off = int(sc * SCROLL_PX.get(TEMPLATES[i], 0))
        if px_off > 0:
            key = (i, px_off)
            if key not in SCROLLED:
                if len(SCROLLED) > 6: SCROLLED.clear()
                SCROLLED[key] = make_card(TEMPLATES[i], px_off)
            card = SCROLLED[key]
        else:
            card = base_cards[i]
        w, h = int(card.width * s / HI), int(card.height * s / HI)
        if w < 2 or h < 2: continue
        if sx + w / 2 < -20 or sx - w / 2 > W + 20 or sy + h / 2 < -20 or sy - h / 2 > H + 20: continue
        c = card.resize((w, h), Image.LANCZOS)
        kk = (0.62 + 0.76 * depth) if depth < 0.5 else 1.0
        if i != fi: kk *= 1 - 0.7 * z            # the ring dims while the camera is on a featured page
        if kk < 1: c.putalpha(c.split()[3].point(lambda v, kk=kk: int(v * kk)))
        items.append((depth + (10 if i in FEATURED else 0), i, c, int(sx - w / 2), int(sy - h / 2)))
    items.sort(key=lambda it: it[0])
    for depth, i, c, px, py in items:
        frame.alpha_composite(c, (px, py))
    frame.convert('RGB').save('%s/f%05d.jpg' % (OUT, f), quality=90)
print(N, 'frames', round(SECS, 1), 's')
