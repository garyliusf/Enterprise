"""Render the channel banners to PNG at exact pixel size.
Usage: python3 marketing/banners/render.py [--guide]
Needs the sandbox served on :8765 (python3 -m http.server 8765 from the repo root)."""
import glob, os, sys
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)
exe = (glob.glob(os.path.expanduser('~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell')) or [None])[-1]
guide = '&guide=1' if '--guide' in sys.argv else ''
SIZES = {'luma': (2100, 600), 'yt': (2560, 1440)}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe)
    for v, (w, h) in SIZES.items():
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
        pg.goto(f'http://localhost:8765/marketing/banners/channel-banners.html?v={v}{guide}')
        pg.wait_for_function('document.fonts.status === "loaded"')
        pg.wait_for_timeout(400)
        path = os.path.join(OUT, f'bolt-{v}-banner{"-guide" if guide else ""}.png')
        pg.locator(f'#{v}').screenshot(path=path)
        print('wrote', path)
    b.close()
