#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bake comment pins into the design preview served by the comment emails.

WHY BAKED, NOT CSS: a pin is a marker at an (x, y) on the design. Email has no
reliable way to position one — absolute positioning is dead in Outlook's Word
engine, and every overlay trick (background-image + padding, nested tables)
breaks somewhere. The pin has to be part of the image.

So this is the mock of a SERVER-SIDE step: when the notification is composed,
the backend takes the project's preview render, crops it to the email band,
draws one pin per comment at that comment's stored coordinates, and uploads the
result. The numbers drawn here are the same numbers shown beside each comment
in the email body — that correspondence is the whole point.

Source: a 2x render of the commenting prototype
(feat-commenting--bolt-skeleton-ui.netlify.app/project).
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "va", "bolt-preview-2x.png")
OUT = os.path.join(HERE, "va", "gen")
os.makedirs(OUT, exist_ok=True)

BLUE = (20, 136, 252)
BAND = (1052, 600)          # 2x of the 526x300 email band

# The preview pane inside the app chrome, in 2x source pixels.
PANE = (910, 96, 2850, 1780)

FONT_PATHS = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]


def _font(size):
    for p in FONT_PATHS:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def _pin(img, x, y, label, d=56):
    """Bolt's comment marker: brand-blue disc, white ring, soft drop shadow.
    x/y are the comment's position, normalised 0-1 over the cropped band."""
    px, py = int(x * img.width), int(y * img.height)
    r = d // 2

    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse((px - r, py - r + 5, px + r, py + r + 5), fill=(0, 0, 0, 70))
    img.alpha_composite(shadow)

    dr = ImageDraw.Draw(img)
    dr.ellipse((px - r - 4, py - r - 4, px + r + 4, py + r + 4), fill=(255, 255, 255, 255))
    dr.ellipse((px - r, py - r, px + r, py + r), fill=BLUE + (255,))
    f = _font(int(d * 0.56))
    t = str(label)
    bb = dr.textbbox((0, 0), t, font=f)
    dr.text((px - (bb[2] - bb[0]) / 2 - bb[0], py - (bb[3] - bb[1]) / 2 - bb[1]),
            t, font=f, fill=(255, 255, 255, 255))
    return img


def build(name, rows, pins, band=BAND, src=SRC, pane=None):
    """rows = (top, bottom) as fractions of the preview pane, picked to frame
    the commented area; pins = [(x, y, label), ...] normalised over the crop."""
    img = Image.open(src).convert("RGBA")
    x0, y0, x1, y1 = pane or (0, 0, img.width, img.height) if src != SRC else PANE
    ph = y1 - y0
    top, bot = int(y0 + rows[0] * ph), int(y0 + rows[1] * ph)
    crop = img.crop((x0, top, x1, bot))

    # centre-crop to the band ratio, then scale — never squash
    tr, cr = band[0] / band[1], crop.width / crop.height
    if cr > tr:
        w = int(crop.height * tr)
        crop = crop.crop(((crop.width - w) // 2, 0, (crop.width - w) // 2 + w, crop.height))
    else:
        h = int(crop.width / tr)
        crop = crop.crop((0, 0, crop.width, h))
    crop = crop.resize(band, Image.LANCZOS)

    for x, y, label in pins:
        _pin(crop, x, y, label)

    p = os.path.join(OUT, name + ".jpg")
    crop.convert("RGB").save(p, "JPEG", quality=84, optimize=True)
    print("wrote va/gen/%s.jpg" % name, os.path.getsize(p) // 1024, "KB")


if __name__ == "__main__":
    # Nestly / Home — the three open comments, numbered as in the email body
    # 1 = headline wrap, 2 = primary CTA label, 3 = "Watch 90s tour" label
    build("nestly-home", (0.13, 0.79),
          [(0.818, 0.212, 1), (0.468, 0.742, 2), (0.693, 0.742, 3)])
    # single comment / mention / reply — one pin only
    build("nestly-home-1", (0.13, 0.79), [(0.818, 0.212, 1)])
    # multi-project digest: three different framings stand in for three designs
    build("nestly-hero", (0.30, 1.00), [(0.30, 0.22, 1), (0.74, 0.62, 2)])
    build("nestly-pricing", (0.34, 1.00), [(0.30, 0.66, 1)])
    # a second project, so the multi-project digest is pinned end to end
    build("soulpress-reader", (0.00, 1.00), [(0.30, 0.52, 1)],
          src=os.path.join(HERE, "va", "soulpress-app.jpg"))

    # reply state points at the primary-CTA comment only
    build("nestly-home-2", (0.13, 0.79), [(0.468, 0.742, 2)])
