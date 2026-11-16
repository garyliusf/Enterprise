"""Render the real estate hero's middle-card video: the three real estate templates as a stacked deck
on a deep navy glow (Gary, 2026-11-16: "change the animation altogether"; no ring, no camera). The front
page fills the card and scrolls, then drops away; the two behind step forward and it rejoins at the back.

    python3 tools/render-re-templates-loop.py <frames-dir>
    ffmpeg -framerate 30 -i <frames-dir>/f%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 26 -movflags +faststart out.mp4

Seamless: three identical beats, one per template.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math, os, sys

OUT = sys.argv[1]
W, H = 766, 920            # 2x the 383x460 card
FPS = 30
os.makedirs(OUT, exist_ok=True)

TEMPLATES = ['nestora-real-estate', 'property-listing', 'architect-portfolio']
CARD_W, CARD_H = 280, 373
HI = 2                     # the front card is drawn at its native 560px
FRONT_Y = 506              # centre of the front card; each step back is smaller, higher and dimmer
def slot(d): return 1 - 0.10 * d, FRONT_Y - 88 * d, min(0.6, 0.24 * d)   # scale, centre y, dim

# one beat (seconds): rest → the page scrolls → rest → the deck advances
SEG_REST, SEG_SCROLL, SEG_END, SEG_SWAP = 0.5, 2.9, 0.35, 0.95
SEG = SEG_REST + SEG_SCROLL + SEG_END + SEG_SWAP
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
NAVY = (4, 12, 40)
SCROLL_PX = {'nestora-real-estate': 500, 'property-listing': 741, 'architect-portfolio': 353}   # how far each page scrolls (px at the 560px front size)
def ease_in_cubic(t): return t ** 3
def ease_out_cubic(t): return 1 - (1 - t) ** 3

def draw(frame, card, scale, cx, cy, dim=0.0, alpha=1.0, rot=0.0):
    w, h = int(card.width * scale), int(card.height * scale)   # cards are built at the front size
    c = card.resize((w, h), Image.LANCZOS)
    if dim > 0:      # further back = darker, toward the ground colour (not see-through)
        c = Image.composite(Image.blend(c.convert('RGB'), Image.new('RGB', c.size, NAVY), dim).convert('RGBA'), c, c.split()[3].point(lambda v: 255 if v else 0))
        c.putalpha(card.resize((w, h), Image.LANCZOS).split()[3])
    if rot: c = c.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1: c.putalpha(c.split()[3].point(lambda v: int(v * alpha)))
    frame.alpha_composite(c, (int(cx - c.width / 2), int(cy - c.height / 2)))

SCROLLED = {}
for f in range(N):
    sec = f / FPS
    k = min(K - 1, int(sec // SEG))
    local = sec - k * SEG
    if local < SEG_REST: scroll, e = 0.0, 0.0
    elif local < SEG_REST + SEG_SCROLL: scroll, e = smooth((local - SEG_REST) / SEG_SCROLL), 0.0
    elif local < SEG_REST + SEG_SCROLL + SEG_END: scroll, e = 1.0, 0.0
    else: scroll, e = 1.0, (local - SEG_REST - SEG_SCROLL - SEG_END) / SEG_SWAP

    frame = ground.copy().convert('RGBA')
    front = k
    px_off = int(scroll * SCROLL_PX[TEMPLATES[front]])
    if px_off > 0:
        if px_off not in SCROLLED:
            if len(SCROLLED) > 4: SCROLLED.clear()
            SCROLLED[px_off] = make_card(TEMPLATES[front], px_off)
        fcard = SCROLLED[px_off]
    else:
        fcard = base_cards[front]
    step = ease_in_out_quart(min(1.0, e / 0.85)) if e else 0.0   # how far the two behind have stepped forward
    # the page that just left comes back in at the rear, at the top of its scroll
    if e > 0.35:
        a = ease_out_cubic((e - 0.35) / 0.65)
        sc, cy, dim = slot(3 - a)
        draw(frame, base_cards[front], sc, W / 2, cy, dim, alpha=a)
    for j in (2, 1):
        sc, cy, dim = slot(j - step)
        draw(frame, base_cards[(front + j) % K], sc, W / 2, cy, dim)
    if e < 0.62:      # the front page: tips and drops out of the bottom of the frame
        g = ease_in_cubic(e / 0.62)
        sc, cy, dim = slot(0)
        draw(frame, fcard, sc, W / 2 + 40 * g, cy + 1000 * g, rot=-7 * g)
    frame.convert('RGB').save('%s/f%05d.jpg' % (OUT, f), quality=90)
print(N, 'frames', round(SECS, 1), 's')
