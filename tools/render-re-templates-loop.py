"""Render the real estate hero's middle-card video: the three real estate templates as floating cards
on a deep navy glow. No ring, no spinning (Gary, 2026-11-16): the three stand still in a loose triangle and
the camera visits each one: it pans across, pushes in, the page scrolls, and it pulls back out. The two
cards the camera is not on fall out of focus (a blur, not a fade).

    python3 tools/render-re-templates-loop.py <frames-dir>
    ffmpeg -framerate 30 -i <frames-dir>/f%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 26 -movflags +faststart out.mp4

Seamless: the camera starts and ends wide; each card bobs a whole number of times per loop.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math, os, sys

OUT = sys.argv[1]
W, H = 766, 920            # 2x the 383x460 card
FPS = 30
os.makedirs(OUT, exist_ok=True)

TEMPLATES = ['nestora-real-estate', 'property-listing', 'architect-portfolio']
CARD_W, CARD_H = 300, 400
HI = 3                     # cards are built at 3x so a push-in stays sharp
# a loose triangle, no overlaps: one card up top, two below, each a touch off the grid
SLOTS = [(W * 0.50, 244, 1.00), (W * 0.285, 676, 0.96), (W * 0.722, 664, 0.92)]

# timeline per card (seconds): wide → pan + push in → hold (page scrolls) → pull out
SEG_WIDE, SEG_IN, SEG_HOLD, SEG_OUT = 0.7, 1.2, 3.0, 1.0
SEG = SEG_WIDE + SEG_IN + SEG_HOLD + SEG_OUT
SECS = SEG * len(TEMPLATES)
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
    g = ImageChops.screen(g, Image.merge('RGB', (dots.point(lambda v: v // 3), dots.point(lambda v: v // 2), dots)))
    # a deeper navy ground: the bright blue pulled toward near-black, glow kept as a soft highlight (Gary, 2026-11-16)
    return Image.blend(g, Image.new('RGB', (W, H), (3, 8, 26)), GROUND_DARKEN)

GROUND_DARKEN = 0.5

SHOTS = {}
SOURCES = {'prism': 'marketing/use-cases/images/prompt-results/prism.webp', 'property-listing': 'marketing/use-cases/images/prompt-results/re-maison.webp', 'architect-portfolio': 'marketing/use-cases/images/prompt-results/re-architect.webp'}   # the catalog shot is only 1800px tall; this is the full page
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

def pose(i, t):
    """world position and scale of card i at loop time t (0..1): its slot plus a slow bob"""
    x, y, sc = SLOTS[i]
    return x + 3 * math.sin(2 * math.pi * (t + i / K)), y + 7 * math.sin(2 * math.pi * (2 * t + i / K)), sc

SCROLL_PX = {'nestora-real-estate': 258 * HI, 'property-listing': 397 * HI, 'architect-portfolio': 189 * HI}   # how far each page scrolls while held (card px at HI)

SCROLLED = {}
for f in range(N):
    t = f / N
    sec = f / FPS
    k = min(K - 1, int(sec // SEG))
    local = sec - k * SEG
    fi = k

    # camera: pan (0 centred on the group … 1 centred on the card) leads the push-in on the way in and
    # trails it on the way out, so the card is never cut off by the frame mid-move
    if local < SEG_WIDE:
        pan = z = 0.0; scroll = 0.0
    elif local < SEG_WIDE + SEG_IN:
        u = (local - SEG_WIDE) / SEG_IN
        pan = ease_in_out_quart(min(1.0, u / 0.7)); z = ease_in_out_quart(max(0.0, (u - 0.2) / 0.8)); scroll = 0.0
    elif local < SEG_WIDE + SEG_IN + SEG_HOLD:
        pan = z = 1.0; scroll = smooth((local - SEG_WIDE - SEG_IN) / SEG_HOLD)
    else:
        u = (local - SEG_WIDE - SEG_IN - SEG_HOLD) / SEG_OUT
        z = 1.0 - ease_in_out_quart(min(1.0, u / 0.8)); pan = 1.0 - ease_in_out_quart(max(0.0, (u - 0.2) / 0.8)); scroll = 1.0
    fx, fy, fscale = pose(fi, t)
    z_full = (H * 0.86) / (CARD_H * fscale)        # the card stands at 86% of the frame height, glow still around it
    zoom = 1 + (z_full - 1) * z
    cam_x = W / 2 + (fx - W / 2) * pan
    cam_y = H / 2 + (fy - H / 2) * pan

    frame = ground.copy().convert('RGBA')
    order = [i for i in range(K) if i != fi] + [fi]
    for i in order:
        x, y, scale = pose(i, t)
        sx = W / 2 + (x - cam_x) * zoom
        sy = H / 2 + (y - cam_y) * zoom
        s = scale * zoom
        # a page stays where its scroll ended once the camera pulls out; it only goes back to the top while the
        # camera is held on the NEXT template, where it is out of focus or off screen
        sc = 0.0
        if i == fi: sc = scroll
        elif i == (k - 1) % K and local < SEG_WIDE + SEG_IN + SEG_HOLD / 2: sc = 1.0
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
        if i != fi and z > 0.02:                 # out of focus, and a little quieter, while the camera is on another page
            c = c.filter(ImageFilter.GaussianBlur(9 * z * zoom / z_full + 1.5 * z))
            kk = 1 - 0.25 * z
            c.putalpha(c.split()[3].point(lambda v, kk=kk: int(v * kk)))
        frame.alpha_composite(c, (int(sx - w / 2), int(sy - h / 2)))
    frame.convert('RGB').save('%s/f%05d.jpg' % (OUT, f), quality=90)
print(N, 'frames', round(SECS, 1), 's')
