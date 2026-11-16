"""Campaign-style motion blur for a portrait photo: the person stays sharp, the room streaks outward
from them (a zoom blur centred on the subject), as on the "Think it. Make it." ads (Gary, 2026-11-16).

    python3 tools/motion-blur-portrait.py <photo> <person-mask.png> <out.webp> <cx> <cy> <strength> [x0,y0,x1,y1 ...]

Trailing boxes (fractions of the photo) are extra areas to keep sharp: the laptop, which the person matte leaves out.

cx, cy = the zoom centre as fractions of the photo (the subject's face / hands). The mask is a white-on-black
person matte (any size); here it comes from macOS Vision's person segmentation.
"""
from PIL import Image, ImageFilter, ImageChops, ImageDraw
import numpy as np, sys

src, mask_p, out, cx, cy = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
strength = float(sys.argv[6]) if len(sys.argv) > 6 else 0.16
im = Image.open(src).convert('RGB')
W, H = im.size
px, py = cx * W, cy * H

# the matte: person, grown a little, plus the extra boxes
m = Image.open(mask_p).convert('L').resize((W, H), Image.LANCZOS)
md = ImageDraw.Draw(m)
for box in sys.argv[7:]:
    x0, y0, x1, y1 = [float(v) for v in box.split(',')]
    md.rounded_rectangle((x0 * W, y0 * H, x1 * W, y1 * H), radius=int(W * 0.02), fill=255)
m = m.filter(ImageFilter.MaxFilter(9))

# lift the subject out of the plate before blurring it (filled from the room around them), so the streaks
# carry no ghost of the person: that ghost is the halo round a head
hole = np.asarray(m.filter(ImageFilter.MaxFilter(21)), dtype=np.float64)[..., None] / 255
arr = np.asarray(im, dtype=np.float64)
plate = arr.copy()
for r in (12, 30, 70, 150):
    num = np.asarray(Image.fromarray((plate * (1 - hole)).astype('uint8')).filter(ImageFilter.GaussianBlur(r)), dtype=np.float64)
    den = np.asarray(Image.fromarray(((1 - hole[..., 0]) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(r)), dtype=np.float64)[..., None] / 255
    fill = num / np.maximum(den, 1e-3)
    ok = (den > 0.08)
    plate = np.where((hole > 0.02) & ok, fill * hole + plate * (1 - hole), plate)
    hole = np.where(ok, 0, hole)
src_plate = Image.fromarray(np.clip(plate, 0, 255).astype('uint8'))

# zoom blur: the average of the plate scaled up about the centre in small steps
N = 40
acc = np.zeros((H, W, 3), dtype=np.float64)
for k in range(N):
    s = 1 + strength * k / (N - 1)
    a = 1 / s
    acc += np.asarray(src_plate.transform((W, H), Image.AFFINE, (a, 0, px - a * px, 0, a, py - a * py), resample=Image.BICUBIC), dtype=np.float64)
blur = Image.fromarray((acc / N).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))

# keep: the person (matte grown a little, feathered) plus a soft pool around the centre so what they hold stays crisp
m = m.filter(ImageFilter.GaussianBlur(5))
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - px) / (W * 0.20)) ** 2 + ((yy - py) / (H * 0.16)) ** 2)
pool = Image.fromarray((np.clip(1 - d, 0, 1) ** 1.5 * 255).astype('uint8'))
keep = ImageChops.lighter(m, pool)
Image.composite(im, blur, keep).save(out, quality=84, method=6)
print(out, im.size)
