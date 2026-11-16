"""Render the real estate hero's middle-card video: template screenshots as floating cards
orbiting on a blue bokeh glow, after the team's `newloop.mp4` reference (Gary, 2026-11-16).

    python3 tools/render-re-templates-loop.py <frames-dir>
    ffmpeg -framerate 30 -i <frames-dir>/f%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 26 -movflags +faststart out.mp4

Seamless loop: the ring advances exactly one card slot per cycle and every bob has a whole number of periods.
"""
from PIL import Image, ImageDraw, ImageFilter
import math, os, sys

OUT = sys.argv[1]
W, H = 766, 920            # 2x the 383x460 card
FPS = 30
SECS = 6.0                 # one slot of the ring per loop
N = int(SECS * FPS)
os.makedirs(OUT, exist_ok=True)

TEMPLATES = ['nestora-real-estate', 'property-listing', 'buyer-rep-calc', 'architect-portfolio',
             'tenant-screening', 'noir-agency', 'vantage-dashboard', 'meridian-capital']
CARD_W, CARD_H = 198, 264  # 3:4 at the front of the ring
RADIUS_X, RADIUS_Y = 262, 300
CENTER = (W // 2, H // 2 - 26)

# ── ground: blue bokeh with a soft light streak top-right and a faint dot grid ─────────────
def make_ground():
    g = Image.new('RGB', (W, H), (7, 34, 110))
    d = ImageDraw.Draw(g)
    # vertical depth: lighter mid, darker foot
    for y in range(H):
        t = y / H
        r = int(8 + 12 * (1 - abs(t - 0.4) * 2))
        gg = int(40 + 50 * (1 - abs(t - 0.35) * 1.6))
        b = int(120 + 90 * (1 - abs(t - 0.35) * 1.4))
        d.line((0, y, W, y), fill=(max(4, r), max(20, gg), max(70, min(255, b))))
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((W * 0.45, -H * 0.25, W * 1.35, H * 0.42), fill=(150, 200, 255))      # the light streak
    gd.ellipse((W * 0.66, -H * 0.16, W * 1.22, H * 0.26), fill=(245, 250, 255))      # its hot core
    gd.ellipse((-W * 0.3, H * 0.55, W * 0.35, H * 1.15), fill=(20, 80, 200))         # a cool bloom bottom-left
    glow = glow.filter(ImageFilter.GaussianBlur(110))
    g = Image.blend(g, Image.eval(glow, lambda v: v), 0.0)
    from PIL import ImageChops
    g = ImageChops.screen(g, glow)
    # faint dot grid, fading toward the bottom
    dots = Image.new('L', (W, H), 0)
    dd = ImageDraw.Draw(dots)
    for y in range(6, H, 16):
        a = int(60 * (1 - y / H))
        for x in range(6, W, 16):
            dd.rectangle((x, y, x + 1, y + 1), fill=a)
    g = ImageChops.screen(g, Image.merge('RGB', (dots.point(lambda v: v // 3), dots.point(lambda v: v // 2), dots)))
    return g

# ── cards: top of each screenshot, rounded, with a soft drop shadow baked in ───────────────
def make_card(name):
    im = Image.open('marketing/templates/images/%s.webp' % name).convert('RGB')
    s = CARD_W / im.width
    im = im.resize((CARD_W, int(im.height * s)), Image.LANCZOS).crop((0, 0, CARD_W, CARD_H))
    mask = Image.new('L', (CARD_W, CARD_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, CARD_W - 1, CARD_H - 1), radius=10, fill=255)
    pad = 48
    card = Image.new('RGBA', (CARD_W + pad * 2, CARD_H + pad * 2), (0, 0, 0, 0))
    sh = Image.new('L', card.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 18, pad + CARD_W, pad + CARD_H + 18), radius=12, fill=150)
    sh = sh.filter(ImageFilter.GaussianBlur(22))
    card.paste((5, 12, 40, 255), (0, 0), sh)
    face = im.convert('RGBA'); face.putalpha(mask)
    card.alpha_composite(face, (pad, pad))
    return card

ground = make_ground()
cards = [make_card(n) for n in TEMPLATES]
K = len(cards)

for f in range(N):
    t = f / N
    frame = ground.copy().convert('RGBA')
    items = []
    for i, card in enumerate(cards):
        ang = (i / K + t / K) * 2 * math.pi          # one slot per loop → seamless
        x = CENTER[0] + RADIUS_X * math.cos(ang)
        y = CENTER[1] + RADIUS_Y * math.sin(ang)
        depth = (math.sin(ang) + 1) / 2              # 0 at the back (top), 1 at the front (bottom)
        scale = 0.62 + 0.40 * depth
        bob = 6 * math.sin(2 * math.pi * (2 * t + i / K))   # two whole bobs per loop
        items.append((depth, card, x, y + bob, scale))
    for depth, card, x, y, scale in sorted(items, key=lambda it: it[0]):
        w, h = int(card.width * scale), int(card.height * scale)
        c = card.resize((w, h), Image.LANCZOS)
        if depth < 0.5:                                # cards at the back sit softer and dimmer
            a = c.split()[3].point(lambda v, k=0.62 + 0.76 * depth: int(v * k))
            c.putalpha(a)
        frame.alpha_composite(c, (int(x - w / 2), int(y - h / 2)))
    frame.convert('RGB').save('%s/f%05d.jpg' % (OUT, f), quality=90)
print(N, 'frames', SECS, 's')
