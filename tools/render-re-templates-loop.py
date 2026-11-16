from PIL import Image, ImageDraw
import random, os, sys
random.seed(7)
S = sys.argv[1]
W, H = 766, 920
FPS = 30
os.makedirs(S, exist_ok=True)

def load(n):
    im = Image.open('marketing/templates/images/%s.webp' % n).convert('RGB')
    s = W / im.width
    im = im.resize((W, int(im.height * s)), Image.LANCZOS)
    if im.height < H:
        im = im.crop((0, 0, W, H))
    return im

# brand-blue dotted ground, shown while a screen moves in
ground = Image.new('RGB', (W, H), (10, 46, 120))
d = ImageDraw.Draw(ground)
for y in range(8, H, 18):
    for x in range(8, W, 18):
        d.ellipse((x - 1.5, y - 1.5, x + 1.5, y + 1.5), fill=(70, 130, 230))

def smooth(t): return t * t * (3 - 2 * t)
def out_back(t, s=1.4):
    t -= 1
    return 1 + t * t * ((s + 1) * t + s)
def out_cubic(t): return 1 - (1 - t) ** 3

def view(im, y=0, zoom=1.0):
    """crop the screenshot at scroll y with an optional centre zoom"""
    if zoom == 1.0:
        return im.crop((0, y, W, y + H))
    cw, ch = int(W / zoom), int(H / zoom)
    cx = (W - cw) // 2
    y = min(y, im.height - ch)
    return im.crop((cx, y, cx + cw, y + ch)).resize((W, H), Image.LANCZOS)

def hold(frames, img, n):
    frames.extend([img] * n)

def scroll(frames, im, y0, y1, n, zoom=1.0):
    for i in range(n):
        t = smooth(i / max(1, n - 1))
        frames.append(view(im, int(y0 + (y1 - y0) * t), zoom))

def kenburns(frames, im, y, z0, z1, n):
    for i in range(n):
        t = i / max(1, n - 1)
        frames.append(view(im, y, z0 + (z1 - z0) * t))

# ── intros ─────────────────────────────────────────────────────────────────
def intro_slide_up(frames, shot, n):
    for i in range(n):
        t = out_back(i / (n - 1))
        f = ground.copy()
        f.paste(shot, (0, int(H * (1 - t))))
        frames.append(f)

def intro_slide_side(frames, shot, n, from_right=True):
    for i in range(n):
        t = out_back(i / (n - 1), 1.1)
        f = ground.copy()
        x = int(W * (1 - t)) * (1 if from_right else -1)
        f.paste(shot, (x, 0))
        frames.append(f)

def intro_pixels(frames, shot, n, block=38):
    cols, rows = W // block + 1, H // block + 1
    order = [(c, r) for c in range(cols) for r in range(rows)]
    random.shuffle(order)
    thr = {cr: i / len(order) for i, cr in enumerate(order)}
    for i in range(n):
        t = i / (n - 1)
        mask = Image.new('L', (W, H), 0)
        md = ImageDraw.Draw(mask)
        for (c, r), v in thr.items():
            if v <= t:
                md.rectangle((c * block, r * block, c * block + block - 1, r * block + block - 1), fill=255)
        frames.append(Image.composite(shot, ground, mask))

def intro_wipe(frames, shot, n):
    for i in range(n):
        t = out_cubic(i / (n - 1))
        mask = Image.new('L', (W, H), 0)
        md = ImageDraw.Draw(mask)
        edge = int((W + H) * t)
        md.polygon([(0, 0), (edge, 0), (edge - H, H), (0, H)], fill=255)
        frames.append(Image.composite(shot, ground, mask))

def intro_pop(frames, shot, n):
    for i in range(n):
        t = out_back(i / (n - 1), 1.2)
        s = 0.72 + 0.28 * t
        sw, sh = max(1, int(W * s)), max(1, int(H * s))
        small = shot.resize((sw, sh), Image.LANCZOS)
        f = ground.copy()
        f.paste(small, ((W - sw) // 2, (H - sh) // 2))
        a = min(1.0, i / max(1, n * 0.5))
        frames.append(Image.blend(ground, f, a))

def intro_tilt_drop(frames, shot, n):
    """drops in from above, a little rotation that settles"""
    for i in range(n):
        t = out_back(i / (n - 1), 1.6)
        ang = (1 - t) * -6
        y = int(-H * (1 - t) * 0.6)
        rot = shot.rotate(ang, resample=Image.BICUBIC, expand=True, fillcolor=(10, 46, 120))
        f = ground.copy()
        f.paste(rot, ((W - rot.width) // 2, y + (H - rot.height) // 2))
        frames.append(f)

# ── outros (how a screen leaves before the next intro) ──────────────────────
def outro_cut(frames, last, n): pass
def outro_fade_ground(frames, last, n):
    for i in range(n):
        frames.append(Image.blend(last, ground, smooth((i + 1) / n)))
def outro_slide_left(frames, last, n):
    for i in range(n):
        t = smooth((i + 1) / n)
        f = ground.copy()
        f.paste(last, (int(-W * t), 0))
        frames.append(f)
def outro_pixels(frames, last, n):
    tmp = []
    intro_pixels(tmp, ground, n)      # ground over last, reversed role
    # composite: pixels of ground appear over last
    for f in tmp:
        frames.append(f)

# the show ──────────────────────────────────────────────────────────────────
F = []
s = int

nestora = load('nestora-real-estate')
maison = load('property-listing')
calc = load('buyer-rep-calc')
arch = load('architect-portfolio')
tenant = load('tenant-screening')
noir = load('noir-agency')

# 1 Nestora: springs up from the bottom, holds, then a long scroll through the listings
intro_slide_up(F, view(nestora), s(0.8 * FPS))
hold(F, view(nestora), s(0.5 * FPS))
scroll(F, nestora, 0, 1000, s(2.1 * FPS))
hold(F, view(nestora, 1000), s(0.3 * FPS))
outro_slide_left(F, view(nestora, 1000), s(0.35 * FPS))

# 2 Maison: pixel mosaic reveal, then a static hold with a slow push-in on the house
intro_pixels(F, view(maison), s(0.9 * FPS))
hold(F, view(maison), s(0.4 * FPS))
kenburns(F, maison, 0, 1.0, 1.12, s(2.0 * FPS))
outro_fade_ground(F, view(maison, 0, 1.12), s(0.35 * FPS))

# 3 Calculator: diagonal wipe, static, then a quick hop down to the fee breakdown
intro_wipe(F, view(calc, 0), s(0.6 * FPS))
hold(F, view(calc, 0), s(0.6 * FPS))
kenburns(F, calc, 0, 1.0, 1.1, s(1.8 * FPS))   # the screenshot ends 40px below the frame, so no scroll
# hard cut out

# 4 Architect: pops in from small, static beat, then a gentle scroll
intro_pop(F, view(arch), s(0.6 * FPS))
hold(F, view(arch), s(0.7 * FPS))
scroll(F, arch, 0, 800, s(1.7 * FPS))
hold(F, view(arch, 800), s(0.25 * FPS))
# ground pixels appear over the last frame and take it out
last = view(arch, 800)
cols, rows = W // 46 + 1, H // 46 + 1
order = [(c, r) for c in range(cols) for r in range(rows)]; random.shuffle(order)
n = s(0.6 * FPS)
for i in range(n):
    t = (i + 1) / n
    mask = Image.new('L', (W, H), 0); md = ImageDraw.Draw(mask)
    for k, (c, r) in enumerate(order):
        if k / len(order) <= t:
            md.rectangle((c * 46, r * 46, c * 46 + 45, r * 46 + 45), fill=255)
    F.append(Image.composite(ground, last, mask))

# 5 Tenant screening: drops in with a tilt, static with a slow zoom out
intro_tilt_drop(F, view(tenant, 0, 1.08), s(0.8 * FPS))
hold(F, view(tenant, 0, 1.08), s(0.5 * FPS))
kenburns(F, tenant, 0, 1.08, 1.0, s(1.5 * FPS))
outro_slide_left(F, view(tenant), s(0.35 * FPS))

# 6 Noir agency: slides in from the right, static, then scrolls to the manifesto
intro_slide_side(F, view(noir), s(0.7 * FPS), from_right=True)
hold(F, view(noir), s(0.5 * FPS))
scroll(F, noir, 0, 1000, s(1.9 * FPS))
hold(F, view(noir, 1000), s(0.25 * FPS))
outro_fade_ground(F, view(noir, 1000), s(0.35 * FPS))
hold(F, ground, s(0.25 * FPS))   # a beat on the ground before the loop springs Nestora back up

for i, f in enumerate(F):
    f.save('%s/f%05d.jpg' % (S, i), quality=90)
print(len(F), 'frames', round(len(F) / FPS, 1), 's')
