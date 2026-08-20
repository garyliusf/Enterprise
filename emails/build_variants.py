#!/usr/bin/env python3
"""Build the email VARIANTS tool — the same email rendered under six design
variants (A–F) for side-by-side comparison.

Each variant is a token-override dict applied on top of the agreed proposed
design (see VARIANTS below — all start empty = identical to proposed; edit a
variant's dict to fork it). The render pipeline (css() + docFor()) is
EXTRACTED from build_editor.py's SHELL at build time, so the two tools cannot
drift — build_editor.py stays the single source of truth for the transform.
"""
import re, os, json

HERE = os.path.dirname(os.path.abspath(__file__))

# ---- variant definitions ----
# A variant is either token overrides on top of the proposed design
# (e.g. "B": {"btnRadius": 0}) or {"custom": True} with a full template in
# CUSTOM_DOCS below (built in python, CX email 2 content).
VARIANTS = {
    "A": {"custom": True},   # Claude-newsletter layout, brand colors
    "B": {"custom": True},   # Musicbed-style dark layout, wordmark inside
    "C": {"custom": True},   # Surface-style editorial: mono uppercase, photo-led, b/w
    "D": {"custom": True},   # KLAFS-style luxury editorial: centered, tracked caps, underlined links
    "E": {},
}

# ---- pull data + pipeline out of the existing tools ----
viewer = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()
DATA = re.search(r"const EMAILS = (\[.*?\]);\n", viewer, re.S).group(1)

editor_src = open(os.path.join(HERE, "build_editor.py"), encoding="utf-8").read()

def _slice(src, start, end):
    i = src.index(start); j = src.index(end, i)
    return src[i:j]

FONTS_C = _slice(editor_src, "const FONTS = {", "const NOW")        # FONTS map (css() uses it)
CSS_FN  = _slice(editor_src, "function css(t){", "const V = ")      # css() complete
DOC_FN  = _slice(editor_src, "function docFor(){", "/* Click inside")  # docFor() complete
PROPOSED = re.search(r"PROPOSED = json\.dumps\((\{.*?\})\)", editor_src, re.S).group(1)

# base token values the editor calls NOW (defaults of the SPEC controls) —
# css() reads keys PROPOSED doesn't override, so the full set must exist
BASE = json.dumps({
    "containerW": 600, "logoW": 125,
    "hColor": "#000000", "hLh": 120, "hTrack": 0,
    "bColor": "#000000",
    "btnBg": "#1389fd", "btnFg": "#ffffff", "btnSize": 16,
    "fSize": 12, "fColor": "#999999",
    "headerBanner": "", "logoSrc": "", "footerImg": "",
    "footerImgW": 180, "footerImgPad": 24,
})

# reuse the editor's asset builders (banner, tinted logos/icons)
import importlib.util as _ilu
_spec = _ilu.spec_from_loader("editor_assets", loader=None)
_banner = re.search(r'data:image/svg\+xml;base64,[A-Za-z0-9+/=]+', open(os.path.join(HERE, "editor.html"), encoding="utf-8").read()).group(0)
FOOTLOGOS = re.search(r"const FOOT_LOGOS = (\{.*?\});\n", open(os.path.join(HERE, "editor.html"), encoding="utf-8").read(), re.S).group(1)
SOCIALS = re.search(r"const SOCIALS = (\[.*?\]);\n", open(os.path.join(HERE, "editor.html"), encoding="utf-8").read(), re.S).group(1)

# ---- custom variant templates (full HTML, CX email 2 content) ----
import base64 as _b64
_foot = json.loads(FOOTLOGOS)
def _recolor(uri, colour):
    svg = _b64.b64decode(uri.split(",", 1)[1]).decode()
    svg = re.sub(r'fill="#[0-9A-Fa-f]{6}"', f'fill="{colour}"', svg)
    return "data:image/svg+xml;base64," + _b64.b64encode(svg.encode()).decode()
LOGO_BLACK = _foot["black"]
LOGO_WHITE = _recolor(_foot["grey"], "#ffffff")
_socials = json.loads(SOCIALS)

_F = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

def _event(img, title, date):
    return f'''<table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:10px;margin:0 0 12px;"><tr>
      <td width="92" style="padding:16px 0 16px 16px;"><img src="{img}" width="76" style="width:76px;height:56px;object-fit:cover;border-radius:6px;display:block;"></td>
      <td style="padding:16px 18px;font-family:{_F};">
        <div style="font-size:15px;font-weight:600;color:#000000;line-height:1.4;">{title}</div>
        <div style="font-size:13px;color:#999999;margin-top:3px;">{date} &nbsp;&middot;&nbsp; <a href="#" style="color:#1488FC;font-weight:600;text-decoration:none;">RSVP</a></div>
      </td></tr></table>'''

VARIANT_A = f'''<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body {{ margin:0; }}
  @media (max-width:480px) {{
    .wrap {{ width:100% !important; }}
    .px {{ padding-left:20px !important; padding-right:20px !important; }}
    .h1 {{ font-size:22px !important; }}
  }}
</style></head>
<body style="margin:0;background:#F2F1EF;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F2F1EF"><tr><td align="center" style="padding:28px 12px;">
<table class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

  <tr><td class="px" style="padding:4px 8px 22px;"><img src="{LOGO_BLACK}" width="88" style="width:88px;display:block;" alt="Bolt"></td></tr>

  <tr><td><img src="va/nexal-dashboard.jpg" width="600" style="width:100%;border-radius:10px;display:block;" alt=""></td></tr>

  <tr><td class="px" style="padding:28px 8px 0;font-family:{_F};">
    <h1 class="h1" style="margin:0 0 14px;font-size:26px;font-weight:600;color:#000000;line-height:1.25;">This week: take payments with the Stripe MCP</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#000000;">An app that can't take payments is a project, an app that can is a business. The purchase flow is where some builders stall, and it's the single feature standing between you and your first paying customer.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#000000;">In this week's workshop, we'll connect and configure payments with the Stripe MCP so your app can start earning, without the usual setup headaches.</p>
    <p style="margin:0 0 6px;font-size:16px;line-height:1.6;color:#000000;font-weight:600;">You'll learn how to:</p>
    <ul style="margin:0 0 22px;padding:0 0 0 24px;">
      <li style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#000000;">Connect the Stripe MCP to a Bolt app</li>
      <li style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#000000;">Configure products and pricing through Stripe</li>
      <li style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#000000;">Set up and test a Stripe Checkout flow in test mode</li>
      <li style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#000000;">Handle API keys and environment variables securely</li>
      <li style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#000000;">Return customers to the right success or cancel flow after payment</li>
      <li style="margin:0;font-size:16px;line-height:1.6;color:#000000;">Think through common payment edge cases like failed or cancelled payments and confirmation</li>
    </ul>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;"><tr>
      <td style="background:#1389fd;border-radius:8px;"><a href="#" style="display:inline-block;min-width:220px;box-sizing:border-box;padding:16px 28px;font-family:{_F};font-size:16px;font-weight:600;line-height:1.25;color:#fff;text-align:center;text-decoration:none;border-radius:8px;">Register here</a></td>
    </tr></table>
  </td></tr>

  <tr><td class="px" style="padding:0 8px;font-family:{_F};">
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#000000;">Coming up next</h2>
    {_event("va/build-with-voice.jpg", "Your Users Have Questions: Answer Them Automatically Inside Your App", "Thursday, August 20")}
    {_event("va/soulpress-app.jpg", "Office Hours: Bring your projects, questions, or blockers for live help and feedback", "Tuesday, August 25")}
    {_event("va/bolt-templates.jpg", "Launch and Grow: Market Your App and Find Your First Users", "Thursday, August 27")}
    <p style="margin:14px 0 36px;font-size:15px;">
      <a href="#" style="color:#1488FC;font-weight:600;text-decoration:none;">See the full lineup &rarr;</a>
      &nbsp;&nbsp;&nbsp;<a href="#" style="color:#1488FC;font-weight:600;text-decoration:none;">Watch previous workshops &rarr;</a></p>
  </td></tr>

  <tr><td class="px" style="padding:0 8px;font-family:{_F};">
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#000000;">Tip of the week</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:10px;margin:0 0 36px;"><tr><td style="padding:22px 24px;font-family:{_F};">
      <div style="font-size:16px;font-weight:600;color:#000000;margin:0 0 8px;">Let the Bolt agent work in your other tools for you</div>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#000000;">Every new service you add usually means learning a new dashboard. With connectors, you don't have to. Once you connect a service like Stripe, the Bolt agent can interact with it directly on your behalf &mdash; describe what you want and it creates it in Stripe and wires it into your app.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F1EF;border-radius:8px;"><tr><td style="padding:14px 16px;font-family:{_F};font-size:14px;line-height:1.6;color:#000000;">
        <span style="font-weight:600;">Try this prompt:</span> <i>"Using the Stripe connector, create a new product called Pro Plan at $29/month in test mode, then add a checkout flow for it to my app with success and cancel pages."</i>
      </td></tr></table>
    </td></tr></table>
    <p style="margin:0 0 36px;font-size:16px;line-height:1.6;color:#000000;">Keep building,<br><span style="font-weight:600;">Monika &amp; The Bolt Team &#9889;</span></p>
  </td></tr>

  <tr><td style="background:#0A0A0A;border-radius:12px;padding:30px 24px;" align="center">
    <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #2b2b2b;border-radius:10px;"><tr>
      <td align="center" style="padding:18px;font-family:{_F};">
        <div style="font-size:16px;color:#ffffff;margin:0 0 10px;">Was this email useful?</div>
        <a href="#" style="text-decoration:none;font-size:22px;margin:0 10px;">&#128077;</a>
        <a href="#" style="text-decoration:none;font-size:22px;margin:0 10px;">&#128078;</a>
      </td></tr></table>
    <img src="{LOGO_WHITE}" width="84" style="width:84px;display:block;margin:24px auto 14px;" alt="Bolt">
    <div>{''.join(f'<a href="{s["href"]}" style="text-decoration:none;display:inline-block;margin:0 10px;"><img src="{s["uri"]}" width="16" height="16" style="display:inline-block;"></a>' for s in _socials)}</div>
    <p style="margin:16px 0 0;font-family:{_F};font-size:12px;line-height:1.7;color:#999999;">
      StackBlitz, Inc. &middot; 2443 Fillmore Street #380-16814 &middot; San Francisco, CA 94115<br>
      This email was sent to you@example.com. To opt out of future emails, <a href="#" style="color:#1488FC;">unsubscribe</a>.</p>
  </td></tr>
  <tr><td style="height:28px;"></td></tr>
</table></td></tr></table></body></html>'''


# ---- Variant B: Musicbed-style dark layout — wordmark inside the canvas ----
_SOC_WHITE = [dict(s, uri=_recolor(s["uri"], "#ffffff")) for s in _socials]

def _b_event(img, title, date):
    return f'''<tr><td style="padding:0 40px 8px;"><img src="{img}" width="520" style="width:100%;border-radius:8px;display:block;" alt=""></td></tr>
    <tr><td style="padding:10px 40px 2px;font-family:{_F};font-size:18px;font-weight:600;color:#ffffff;line-height:1.4;">{title}</td></tr>
    <tr><td style="padding:0 40px 28px;font-family:{_F};font-size:14px;color:#ABABAB;">{date} &nbsp;&middot;&nbsp; <a href="#" style="color:#4DA6FF;font-weight:600;text-decoration:none;">RSVP</a></td></tr>'''

def _b_ghost(label):
    return f'''<tr><td style="padding:4px 40px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td align="center" style="border:1px solid rgba(255,255,255,0.4);border-radius:8px;">
          <a href="#" style="display:block;padding:16px 28px;font-family:{_F};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;text-align:center;">{label}</a>
        </td></tr></table></td></tr>'''

VARIANT_B = f'''<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body {{ margin:0; }}
  @media (max-width:480px) {{
    .wrap {{ width:100% !important; }}
    td[style*="padding:0 40px"], td[style*="padding: 0 40px"], .px {{ padding-left:20px !important; padding-right:20px !important; }}
    .h1 {{ font-size:28px !important; }}
  }}
</style></head>
<body style="margin:0;background:#F2F1EF;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F2F1EF"><tr><td align="center" style="padding:28px 12px;">
<table class="wrap" width="600" cellpadding="0" cellspacing="0" bgcolor="#000000" style="width:600px;max-width:600px;background:#000000;border-radius:12px;overflow:hidden;">

  <tr><td align="center" style="padding:34px 40px 26px;"><img src="{LOGO_WHITE}" width="96" style="width:96px;display:block;" alt="Bolt"></td></tr>

  <tr><td class="px" style="padding:0 40px;"><img src="va/nexal-dashboard.jpg" width="520" style="width:100%;border-radius:8px;display:block;" alt=""></td></tr>

  <tr><td class="px" style="padding:30px 40px 0;font-family:{_F};">
    <div style="font-size:16px;font-weight:600;color:#ffffff;margin:0 0 6px;">This week on Bolt</div>
    <h1 class="h1" style="margin:0 0 18px;font-size:34px;font-weight:700;color:#ffffff;line-height:1.15;letter-spacing:-0.5px;">Take payments with the Stripe&nbsp;MCP</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#ABABAB;">An app that can\'t take payments is a project, an app that can is a business. The purchase flow is the single feature standing between you and your first paying customer.</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#ABABAB;">In this week\'s workshop, we\'ll connect and configure payments with the Stripe MCP so your app can start earning, without the usual setup headaches.</p>
  </td></tr>
  {_b_ghost("Register Now")}

  <tr><td class="px" style="padding:6px 40px 8px;font-family:{_F};">
    <h2 style="margin:0 0 14px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">You\'ll learn how to:</h2>
    <ul style="margin:0 0 30px;padding:0 0 0 22px;">
      <li style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#ABABAB;">Connect the Stripe MCP to a Bolt app</li>
      <li style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#ABABAB;">Configure products and pricing through Stripe</li>
      <li style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#ABABAB;">Set up and test a Stripe Checkout flow in test mode</li>
      <li style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#ABABAB;">Handle API keys and environment variables securely</li>
      <li style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#ABABAB;">Return customers to the right success or cancel flow after payment</li>
      <li style="margin:0;font-size:15px;line-height:1.6;color:#ABABAB;">Think through common payment edge cases like failed or cancelled payments</li>
    </ul>
  </td></tr>

  <tr><td class="px" style="padding:0 40px 18px;font-family:{_F};">
    <h2 style="margin:0 0 22px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Coming up next:</h2>
  </td></tr>
  {_b_event("va/build-with-voice.jpg", "Your Users Have Questions: Answer Them Automatically Inside Your App", "Thursday, August 20")}
  {_b_event("va/soulpress-app.jpg", "Office Hours: Bring your projects, questions, or blockers for live help", "Tuesday, August 25")}
  {_b_event("va/bolt-templates.jpg", "Launch and Grow: Market Your App and Find Your First Users", "Thursday, August 27")}

  <tr><td class="px" style="padding:8px 40px 8px;font-family:{_F};">
    <h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Tip of the week</h2>
    <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#ffffff;line-height:1.5;">Let the Bolt agent work in your other tools for you</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#ABABAB;">Once you connect a service like Stripe, the Bolt agent can interact with it directly on your behalf &mdash; describe what you want and it creates it in Stripe and wires it into your app.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #2b2b2b;border-radius:8px;"><tr><td style="padding:14px 16px;font-family:{_F};font-size:14px;line-height:1.6;color:#ABABAB;">
      <span style="font-weight:600;color:#ffffff;">Try this prompt:</span> <i>"Using the Stripe connector, create a new product called Pro Plan at $29/month in test mode, then add a checkout flow for it to my app with success and cancel pages."</i>
    </td></tr></table>
  </td></tr>
  {_b_ghost("Start Building")}

  <tr><td align="center" style="padding:10px 40px 6px;font-family:{_F};font-size:12px;line-height:1.7;color:#8a8a8a;">
    Keep building,<br><span style="font-weight:600;color:#ffffff;">Monika &amp; The Bolt Team &#9889;</span></td></tr>
  <tr><td align="center" style="padding:40px 40px 0;"><img src="{LOGO_WHITE}" width="88" style="width:88px;display:block;" alt="Bolt"></td></tr>
  <tr><td align="center" style="padding:26px 40px 0;">
    {"".join(f'<a href="{s["href"]}" style="text-decoration:none;display:inline-block;margin:0 10px;"><img src="{s["uri"]}" width="16" height="16" style="display:inline-block;"></a>' for s in _SOC_WHITE)}
  </td></tr>
  <tr><td align="center" style="padding:26px 40px 44px;font-family:{_F};font-size:12px;line-height:1.8;color:#8a8a8a;">
    StackBlitz, Inc. | 2443 Fillmore Street #380-16814, San Francisco, CA 94115<br>
    <a href="#" style="color:#8a8a8a;">Unsubscribe or Manage Preferences</a></td></tr>
</table></td></tr></table></body></html>'''


# ---- Variant C: Microsoft-Surface-style editorial — mono uppercase, photo-led ----
_SOC_DARK = [dict(s, uri=_recolor(s["uri"], "#161616")) for s in _socials]
_M = "'Courier New',Courier,monospace"

def _c_h2(text):
    return f'''<tr><td class="px" style="padding:36px 32px 12px;font-family:{_M};font-size:21px;font-weight:700;letter-spacing:1px;color:#000000;">{text}</td></tr>'''

def _c_event(date, title):
    return f'''<td width="33%" valign="top" style="padding:0 10px 0 0;font-family:{_M};">
      <div style="display:inline-block;border:1px solid #c9c9c9;border-radius:999px;padding:3px 9px;font-size:10px;letter-spacing:1px;color:#555;">{date}</div>
      <div style="font-family:{_F};font-size:13px;font-weight:600;color:#000;line-height:1.45;margin:9px 0 6px;">{title}</div>
      <a href="#" style="font-family:{_M};font-size:11px;letter-spacing:1px;color:#000;font-weight:700;">RSVP &rarr;</a>
    </td>'''

VARIANT_C = f'''<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body {{ margin:0; }}
  @media (max-width:480px) {{
    .wrap {{ width:100% !important; }}
    .px {{ padding-left:20px !important; padding-right:20px !important; }}
    .disp {{ font-size:24px !important; }}
    .evcol td {{ display:block; width:100% !important; padding:0 0 18px !important; }}
  }}
</style></head>
<body style="margin:0;background:#F2F1EF;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F2F1EF"><tr><td align="center" style="padding:28px 12px;">
<table class="wrap" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background:#ffffff;">

  <tr><td class="px" style="padding:24px 32px 18px;"><img src="{LOGO_BLACK}" width="76" style="width:76px;display:block;" alt="Bolt"></td></tr>

  <tr><td class="px" style="padding:0 32px 16px;font-family:{_M};font-size:13px;font-weight:700;letter-spacing:2px;color:#000;">THIS WEEK&rsquo;S WORKSHOP: stripe mcp</td></tr>

  <tr><td><img src="va/maker-photo.jpg" width="600" style="width:100%;display:block;" alt=""></td></tr>

  <tr><td class="px" style="padding:26px 32px 6px;font-family:{_M};">
    <div class="disp" style="font-size:30px;font-weight:700;letter-spacing:1px;line-height:1.25;color:#000;">MAKE YOUR APP<br>A BUSINESS.</div>
    <div style="font-family:{_F};font-size:14px;color:#555;margin-top:10px;">This week: connect and configure payments with the Stripe MCP.</div>
  </td></tr>

  {_c_h2("BUILT TO GET PAID.")}
  <tr><td class="px" style="padding:0 32px;font-family:{_F};">
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3c3c3c;">An app that can&rsquo;t take payments is a project, an app that can is a business. The purchase flow is where some builders stall, and it&rsquo;s the single feature standing between you and your first paying customer.</p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#3c3c3c;">In this week&rsquo;s workshop, we&rsquo;ll connect and configure payments with the Stripe MCP so your app can start earning, without the usual setup headaches.</p>
  </td></tr>

  <tr><td class="px" style="padding:0 32px;"><img src="va/soulpress-app.jpg" width="536" style="width:100%;display:block;" alt=""></td></tr>
  <tr><td class="px" style="padding:22px 32px 6px;font-family:{_F};">
    <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#000;line-height:1.5;">&ldquo;Say what you want the checkout to do. The agent creates it in Stripe and wires it into your app.&rdquo;</p>
    <p style="margin:0 0 10px;font-size:13px;color:#999;">Soul Press Records &mdash; storefront built and monetized on Bolt</p>
  </td></tr>

  {_c_h2("YOU&rsquo;LL LEARN HOW TO.")}
  <tr><td class="px" style="padding:0 32px;font-family:{_F};">
    <ul style="margin:0 0 24px;padding:0 0 0 22px;">
      <li style="margin:0 0 7px;font-size:15px;line-height:1.65;color:#3c3c3c;">Connect the Stripe MCP to a Bolt app</li>
      <li style="margin:0 0 7px;font-size:15px;line-height:1.65;color:#3c3c3c;">Configure products and pricing through Stripe</li>
      <li style="margin:0 0 7px;font-size:15px;line-height:1.65;color:#3c3c3c;">Set up and test a Stripe Checkout flow in test mode</li>
      <li style="margin:0 0 7px;font-size:15px;line-height:1.65;color:#3c3c3c;">Handle API keys and environment variables securely</li>
      <li style="margin:0 0 7px;font-size:15px;line-height:1.65;color:#3c3c3c;">Return customers to the right success or cancel flow after payment</li>
      <li style="margin:0;font-size:15px;line-height:1.65;color:#3c3c3c;">Think through failed or cancelled payments and confirmation</li>
    </ul>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 10px;"><tr>
      <td bgcolor="#000000" style="background:#000000;"><a href="#" style="display:inline-block;min-width:220px;box-sizing:border-box;padding:16px 28px;font-family:{_M};font-size:13px;font-weight:700;letter-spacing:2px;color:#ffffff;text-align:center;text-decoration:none;">REGISTER HERE</a></td>
    </tr></table>
  </td></tr>

  {_c_h2("COMING UP NEXT.")}
  <tr><td class="px" style="padding:4px 32px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" class="evcol"><tr>
      {_c_event("AUG 20", "Your Users Have Questions: Answer Them Automatically")}
      {_c_event("AUG 25", "Office Hours: Live Help &amp; Feedback on Your Project")}
      {_c_event("AUG 27", "Launch and Grow: Find Your First Users")}
    </tr></table>
  </td></tr>

  {_c_h2("TIP OF THE WEEK.")}
  <tr><td class="px" style="padding:0 32px 8px;font-family:{_F};">
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#3c3c3c;">Once you connect a service like Stripe, the Bolt agent can work in it on your behalf &mdash; describe what you want and it creates it in Stripe and wires it into your app. No new dashboard to learn.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #000;"><tr><td style="padding:14px 16px;font-family:{_M};font-size:12px;line-height:1.7;color:#000;">
      TRY THIS PROMPT: "Using the Stripe connector, create a new product called Pro Plan at $29/month in test mode, then add a checkout flow for it to my app with success and cancel pages."
    </td></tr></table>
    <p style="margin:20px 0 28px;font-size:15px;line-height:1.6;color:#3c3c3c;">Keep building,<br><span style="font-weight:600;color:#000;">Monika &amp; The Bolt Team &#9889;</span></p>
  </td></tr>

  <tr><td bgcolor="#F4F4F2" align="center" style="background:#F4F4F2;padding:22px 32px;">
    <a href="#" style="font-family:{_M};font-size:13px;font-weight:700;letter-spacing:2px;color:#000;text-decoration:none;">EXPLORE MORE WORKSHOPS &rarr;</a>
    <div style="margin-top:16px;">{"".join(f'<a href="{s["href"]}" style="text-decoration:none;display:inline-block;margin:0 9px;"><img src="{s["uri"]}" width="15" height="15" style="display:inline-block;"></a>' for s in _SOC_DARK)}</div>
  </td></tr>
  <tr><td align="center" style="padding:18px 32px;font-family:{_F};font-size:11px;line-height:1.8;color:#999999;">
    You are receiving this email because you opted in to product updates from Bolt.new.<br>
    <a href="#" style="color:#666;">Unsubscribe</a> &middot; <a href="#" style="color:#666;">Manage Preferences</a><br>
    StackBlitz, Inc. &middot; 2443 Fillmore Street #380-16814 &middot; San Francisco, CA 94115
  </td></tr>
  <tr><td bgcolor="#000000" style="background:#000000;padding:28px 32px;"><img src="{LOGO_WHITE}" width="80" style="width:72px;display:block;" alt="Bolt"></td></tr>
</table></td></tr></table></body></html>'''


# ---- Variant D: KLAFS-style luxury editorial — centered, tracked caps, no buttons ----
def _d_h2(text, dark=False):
    c = "#ffffff" if dark else "#000000"
    return f'''<div style="font-family:{_F};font-size:17px;font-weight:600;letter-spacing:3px;color:{c};margin:0 0 14px;">{text}</div>'''

def _d_link(label):
    return f'''<a href="#" style="font-family:{_F};font-size:13px;font-weight:700;letter-spacing:1px;color:#000;text-decoration:underline;text-underline-offset:4px;">{label}</a>'''

VARIANT_D = f'''<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body {{ margin:0; }}
  @media (max-width:480px) {{
    .wrap {{ width:100% !important; }}
    .px {{ padding-left:22px !important; padding-right:22px !important; }}
  }}
</style></head>
<body style="margin:0;background:#F2F1EF;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#F2F1EF"><tr><td align="center" style="padding:28px 12px;">
<table class="wrap" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background:#ffffff;">

  <tr><td align="center" style="padding:30px 32px 8px;"><img src="{LOGO_BLACK}" width="86" style="width:86px;display:block;" alt="Bolt"></td></tr>
  <tr><td align="center" class="px" style="padding:14px 32px 6px;font-family:{_F};font-size:15px;font-weight:600;letter-spacing:4px;color:#000;">THIS WEEK&rsquo;S WORKSHOP</td></tr>
  <tr><td align="center" style="padding:6px 0 26px;">{_d_link("Register Here")}</td></tr>

  <tr><td><img src="va/maker-photo.jpg" width="600" style="width:100%;display:block;" alt=""></td></tr>

  <tr><td class="px" style="padding:34px 32px 6px;font-family:{_F};">
    {_d_h2("MAKE IT A BUSINESS")}
    <p style="margin:0 0 14px;font-size:14px;line-height:1.75;color:#333;">An app that can&rsquo;t take payments is a project &mdash; an app that can is a business. In this week&rsquo;s workshop we connect and configure payments with the Stripe MCP so your app can start earning, without the usual setup headaches.</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.75;color:#333;">You&rsquo;ll connect the Stripe MCP to a Bolt app, configure products and pricing, test a full Checkout flow, handle API keys securely, and design for the edge cases &mdash; failed payments, cancellations, confirmation.</p>
    <p style="margin:0 0 34px;">{_d_link("Save Your Seat")}</p>
  </td></tr>

  <tr><td class="px" style="padding:0 32px;"><img src="va/soulpress-app.jpg" width="536" style="width:100%;display:block;" alt=""></td></tr>
  <tr><td class="px" style="padding:14px 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="49%" style="padding:0 6px 0 0;"><img src="va/build-with-voice.jpg" width="260" style="width:100%;display:block;" alt=""></td>
      <td width="49%" style="padding:0 0 0 6px;"><img src="va/bolt-templates.jpg" width="260" style="width:100%;display:block;" alt=""></td>
    </tr></table>
  </td></tr>
  <tr><td class="px" style="padding:26px 32px 6px;font-family:{_F};">
    {_d_h2("BUILT ON BOLT")}
    <p style="margin:0 0 14px;font-size:14px;line-height:1.75;color:#333;">Soul Press Records &mdash; a storefront built, launched, and monetized on Bolt. Every workshop works toward an app like this one: real products, real checkout, real customers.</p>
    <p style="margin:0 0 34px;">{_d_link("View the Example")}</p>
  </td></tr>

  <tr><td><img src="va/nexal-dashboard.jpg" width="600" style="width:100%;display:block;" alt=""></td></tr>

  <tr><td bgcolor="#EFEDE8" class="px" style="background:#EFEDE8;padding:34px 32px 30px;font-family:{_F};">
    {_d_h2("COMING UP NEXT")}
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#333;font-weight:600;">Your Users Have Questions: Answer Them Automatically</p>
    <p style="margin:0 0 16px;font-size:13px;color:#777;">Thursday, August 20 &nbsp;&middot;&nbsp; {_d_link("RSVP")}</p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#333;font-weight:600;">Office Hours: Live Help &amp; Feedback on Your Project</p>
    <p style="margin:0 0 16px;font-size:13px;color:#777;">Tuesday, August 25 &nbsp;&middot;&nbsp; {_d_link("RSVP")}</p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#333;font-weight:600;">Launch and Grow: Find Your First Users</p>
    <p style="margin:0;font-size:13px;color:#777;">Thursday, August 27 &nbsp;&middot;&nbsp; {_d_link("RSVP")}</p>
  </td></tr>

  <tr><td class="px" style="padding:34px 32px 8px;font-family:{_F};">
    {_d_h2("TIP OF THE WEEK")}
    <p style="margin:0 0 12px;font-size:14px;line-height:1.75;color:#333;">Let the Bolt agent work in your other tools for you. Once a service like Stripe is connected, describe what you want &mdash; <i>&ldquo;create a Pro Plan at $29/month in test mode and add a checkout flow&rdquo;</i> &mdash; and the agent creates it in Stripe and wires it into your app.</p>
    <p style="margin:0 0 30px;">{_d_link("Try It in Bolt")}</p>
    <p style="margin:0 0 34px;font-size:14px;line-height:1.7;color:#333;">Keep building,<br><span style="font-weight:600;color:#000;">Monika &amp; The Bolt Team &#9889;</span></p>
  </td></tr>

  <tr><td class="px" style="border-top:1px solid #e5e5e5;padding:18px 32px;font-family:{_F};">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:12px;font-weight:600;letter-spacing:2px;color:#000;">STAY CONNECTED</td>
      <td align="right">{_d_link("Follow Us")}</td>
    </tr></table>
  </td></tr>

  <tr><td bgcolor="#000000" class="px" style="background:#000000;padding:30px 32px;font-family:{_F};">
    <img src="{LOGO_WHITE}" width="80" style="width:80px;display:block;margin:0 0 22px;" alt="Bolt">
    <p style="margin:0 0 8px;"><a href="#" style="font-size:12px;font-weight:600;letter-spacing:2px;color:#fff;text-decoration:none;">REGISTER</a></p>
    <p style="margin:0 0 8px;"><a href="#" style="font-size:12px;font-weight:600;letter-spacing:2px;color:#fff;text-decoration:none;">WATCH PREVIOUS WORKSHOPS</a></p>
    <p style="margin:0 0 22px;"><a href="#" style="font-size:12px;font-weight:600;letter-spacing:2px;color:#fff;text-decoration:none;">DISCORD</a></p>
    <p style="margin:0 0 4px;font-size:11px;line-height:1.8;color:#8a8a8a;">You have received this email because you are signed up for updates at bolt.new. If you no longer wish to receive emails from us, <a href="#" style="color:#c9c9c9;">unsubscribe</a> here.</p>
    <p style="margin:0;font-size:11px;line-height:1.8;color:#8a8a8a;">StackBlitz, Inc. &middot; 2443 Fillmore Street #380-16814 &middot; San Francisco, CA 94115<br>&copy;2026 Bolt.new. All rights reserved.</p>
  </td></tr>
</table></td></tr></table></body></html>'''


# ---- dark/light twins: controlled color transforms per template ----
def _swap(html, pairs):
    for old, new in pairs:
        assert old in html, f"transform anchor missing: {old[:60]}"
        html = html.replace(old, new)
    return html

def _swap_socials(html, frm, to):
    for a, b in zip(frm, to):
        html = html.replace(a["uri"], b["uri"])
    return html

# A dark: near-black page, #161616 cards, white text; footer lifts to #141414
A_DARK = _swap(VARIANT_A, [
    ('style="background:#0A0A0A;border-radius:12px', 'style="background:#141414;border-radius:12px'),
    ('background:#F2F1EF;border-radius:8px;', 'background:#0F0F0F;border-radius:8px;'),
    ('background:#F2F1EF;">', 'background:#0A0A0A;">'),
    ('bgcolor="#F2F1EF"', 'bgcolor="#0A0A0A"'),
    ('background:#FFFFFF;border-radius:10px', 'background:#161616;border-radius:10px'),
    ('color:#000000', 'color:#FFFFFF'),
])
A_DARK = A_DARK.replace(LOGO_BLACK, LOGO_WHITE)
A_DARK = _swap_socials(A_DARK, _socials, _SOC_WHITE)

# B light: white canvas, black type, dark ghost outlines
B_LIGHT = _swap(VARIANT_B, [
    ('bgcolor="#000000"', 'bgcolor="#FFFFFF"'),
    ('background:#000000;border-radius:12px', 'background:#FFFFFF;border-radius:12px'),
    ('border:1px solid rgba(255,255,255,0.4)', 'border:1px solid rgba(0,0,0,0.35)'),
    ('background:#111111;border:1px solid #2b2b2b', 'background:#F5F4F2;border:1px solid #E2E0DC'),
    ('color:#ffffff', 'color:#000000'),
    ('color:#ABABAB', 'color:#444444'),
])
B_LIGHT = B_LIGHT.replace(LOGO_WHITE, LOGO_BLACK)
B_LIGHT = _swap_socials(B_LIGHT, _SOC_WHITE, _SOC_DARK)

# C dark: black canvas, white mono, inverted button, band #161616
C_DARK = _swap(VARIANT_C, [
    ('bgcolor="#ffffff" style="width:600px;max-width:600px;background:#ffffff;"',
     'bgcolor="#0E0E0E" style="width:600px;max-width:600px;background:#0E0E0E;"'),
    ('<td bgcolor="#000000" style="background:#000000;"><a href="#" style="display:inline-block;min-width:220px',
     '<td bgcolor="#FFFFFF" style="background:#FFFFFF;"><a href="#" style="display:inline-block;min-width:220px'),
    ('letter-spacing:2px;color:#ffffff;text-align:center', 'letter-spacing:2px;color:#000000;text-align:center'),
    ('border:1px solid #000;', 'border:1px solid #FFFFFF;'),
    ('bgcolor="#F4F4F2" align="center" style="background:#F4F4F2;', 'bgcolor="#161616" align="center" style="background:#161616;'),
    ('border:1px solid #c9c9c9', 'border:1px solid #555555'),
    ('color:#000000', 'color:#FFFFFF'),
    ('color:#000;', 'color:#ffffff;'),
    ('color:#3c3c3c', 'color:#C9C9C9'),
    ('color:#555;', 'color:#9a9a9a;'),
    ('style="background:#000000;padding:28px 32px;', 'style="background:#000000;border-top:1px solid #2b2b2b;padding:28px 32px;'),
])
C_DARK = C_DARK.replace(LOGO_BLACK, LOGO_WHITE)
C_DARK = _swap_socials(C_DARK, _SOC_DARK, _SOC_WHITE)

# D dark: black canvas, white tracked caps, beige section goes charcoal
D_DARK = _swap(VARIANT_D, [
    ('bgcolor="#ffffff" style="width:600px;max-width:600px;background:#ffffff;"',
     'bgcolor="#0E0E0E" style="width:600px;max-width:600px;background:#0E0E0E;"'),
    ('bgcolor="#EFEDE8" class="px" style="background:#EFEDE8;', 'bgcolor="#1A1918" class="px" style="background:#1A1918;'),
    ('border-top:1px solid #e5e5e5', 'border-top:1px solid #262626'),
    ('color:#000000', 'color:#FFFFFF'),
    ('color:#000;', 'color:#ffffff;'),
    ('color:#333;', 'color:#C9C9C9;'),
    ('color:#777;', 'color:#8f8f8f;'),
])
D_DARK = D_DARK.replace(LOGO_BLACK, LOGO_WHITE)

# E dark: token overrides on the proposed baseline
DARK_TOKENS = json.dumps({
    "pageBg": "#0A0A0A", "cardBg": "#161616", "hColor": "#ffffff",
    "bColor": "#D9D9D9", "fColor": "#8a8a8a", "linkCol": "#4DA6FF",
})

CUSTOM_DOCS = {
    "A": {"light": VARIANT_A, "dark": A_DARK},
    "B": {"light": B_LIGHT, "dark": VARIANT_B},
    "C": {"light": VARIANT_C, "dark": C_DARK},
    "D": {"light": VARIANT_D, "dark": D_DARK},
}

SHELL = r"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email variants</title>
<style>
*{box-sizing:border-box}
:root{--bg:#faf9f8;--panel:#fff;--line:#e6e4e1;--ink:#16151a;--mute:#6d6a66;--accent:#1389fd}
@media (prefers-color-scheme:dark){:root{--bg:#131316;--panel:#1b1b1f;--line:#2c2c32;--ink:#f0eff2;--mute:#94919b}}
html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--ink);display:flex;flex-direction:column;height:100vh;overflow:hidden;
  font:13px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
header{padding:12px 20px;border-bottom:1px solid var(--line);background:var(--panel);
  display:flex;gap:16px;align-items:center;flex-wrap:wrap}
h1{font:600 14px/1 ui-monospace,Menlo,monospace;margin:0}
select{font:12px inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;
  background:var(--bg);color:var(--ink);max-width:320px}
.lbl{font-size:9.5px;text-transform:uppercase;letter-spacing:1.1px;color:var(--mute);margin-right:-10px}
.seg{display:flex;gap:2px;background:var(--bg);padding:3px;border-radius:6px;border:1px solid var(--line)}
.seg button{border:0;background:transparent;color:var(--mute);font:500 11.5px/1 inherit;
  padding:5px 10px;border-radius:4px;cursor:pointer}
.seg button.on{background:var(--accent);color:#fff}
.stage{flex:1;overflow:auto;padding:24px;display:flex;justify-content:safe center;
  align-items:flex-start;gap:20px}
.cell{flex:none;display:flex;flex-direction:column;gap:8px;align-items:center}
.tag{font:600 11px/1 ui-monospace,Menlo,monospace;color:var(--mute);letter-spacing:1px;
  padding:3px 10px;border:1px solid var(--line);border-radius:999px;background:var(--panel)}
.frame{background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden;
  box-shadow:0 4px 20px rgba(0,0,0,.07)}
.frame iframe{display:block;border:0;background:#fff}
.hint{font-size:11px;color:var(--mute);margin-left:auto}
</style></head><body>

<header>
  <h1>Email variants</h1>
  <select id="email"></select>
  <span class="lbl">View</span>
  <div class="seg" id="vp"><button data-w="640" class="on">Desktop</button><button data-w="375">Mobile</button></div>
  <span class="lbl">Mode</span>
  <div class="seg" id="theme"><button data-m="light" class="on">Light</button><button data-m="dark">Dark</button></div>
  <span class="lbl">Variant</span>
  <div class="seg" id="vars"></div>
  <span class="hint">Variants are token overrides in build_variants.py — edit VARIANTS there.</span>
</header>
<div class="stage" id="stage"></div>

<script>
const EMAILS = __DATA__;
const FOOT_LOGOS = __FOOTLOGOS__;
const SOCIALS = __SOCIALS__;
const BANNER_DEFAULT = "__BANNERURI__";
const BASE = __BASE__;
const PROPOSED = __PROPOSED__;
const VARIANTS = __VARIANTS__;
const CUSTOM_DOCS = __CUSTOM__;
const DARK_TOKENS = __DARKTOKENS__;

/* globals the extracted editor pipeline expects */
let cur = EMAILS.find(e => e.id === 'cx__email_2') || EMAILS[0], vi = 0, T = {};
let mode = 'after', vp = 640, sel = 'A', theme = 'light';
const V = () => cur.variations[vi] || cur.variations[0];
const PICK = '';

/* ---- extracted verbatim from build_editor.py (single source of truth) ---- */
__FONTS__
__CSS_FN__
__DOC_FN__
/* ------------------------------------------------------------------------- */

function tokensFor(letter){
  return Object.assign({}, BASE, PROPOSED, {headerBanner: BANNER_DEFAULT}, VARIANTS[letter] || {});
}
function renderFrame(letter, scale){
  let doc;
  if (VARIANTS[letter] && VARIANTS[letter].custom) { doc = CUSTOM_DOCS[letter][theme]; }
  else { T = Object.assign(tokensFor(letter), theme === 'dark' ? DARK_TOKENS : {}); doc = docFor(); }
  const cell = document.createElement('div'); cell.className = 'cell';
  const tag = document.createElement('div'); tag.className = 'tag'; tag.textContent = letter;
  const wrap = document.createElement('div'); wrap.className = 'frame';
  const f = document.createElement('iframe'); f.setAttribute('sandbox','');
  f.width = vp; f.style.width = vp + 'px';
  const h = Math.max(420, innerHeight - 190);
  f.style.height = (scale ? h / scale : h) + 'px';
  if (scale){ f.style.transform = 'scale(' + scale + ')'; f.style.transformOrigin = 'top left';
    f.style.width = vp + 'px';
    wrap.style.width = (vp * scale) + 'px'; wrap.style.height = h + 'px'; }
  f.srcdoc = doc || '<body style="font:13px sans-serif;color:#999;padding:30px">plaintext only</body>';
  wrap.appendChild(f); cell.appendChild(tag); cell.appendChild(wrap);
  return cell;
}
function draw(){
  const stage = document.getElementById('stage'); stage.innerHTML = '';
  if (sel === 'All'){
    const scale = vp == 375 ? 0.62 : 0.38;
    Object.keys(VARIANTS).forEach(k => stage.appendChild(renderFrame(k, scale)));
    stage.style.justifyContent = 'safe center';
  } else {
    stage.appendChild(renderFrame(sel, 0));
  }
  document.querySelectorAll('#vars button').forEach(b=>b.classList.toggle('on', b.textContent===sel));
  document.querySelectorAll('#vp button').forEach(b=>b.classList.toggle('on', +b.dataset.w===vp));
  document.querySelectorAll('#theme button').forEach(b=>b.classList.toggle('on', b.dataset.m===theme));
}
const es = document.getElementById('email');
let g = null;
EMAILS.forEach((e,i)=>{
  if (e.group !== g){ g = e.group; const og = document.createElement('optgroup'); og.label = g; es.appendChild(og); }
  const o = document.createElement('option'); o.value = i; o.textContent = e.action;
  es.lastElementChild.appendChild(o);
});
es.value = EMAILS.indexOf(cur);
es.onchange = () => { cur = EMAILS[+es.value]; vi = 0; draw(); };
const vb = document.getElementById('vars');
[...Object.keys(VARIANTS), 'All'].forEach(k=>{
  const b = document.createElement('button'); b.textContent = k;
  b.onclick = () => { sel = k; draw(); }; vb.appendChild(b);
});
document.getElementById('vp').onclick = e => { if (e.target.dataset.w){ vp = +e.target.dataset.w; draw(); } };
document.getElementById('theme').onclick = e => { if (e.target.dataset.m){ theme = e.target.dataset.m; draw(); } };
addEventListener('resize', () => draw());
draw();
</script></body></html>"""

out = os.path.join(HERE, "variants.html")
html = (SHELL
        .replace("__DATA__", DATA)
        .replace("__FOOTLOGOS__", FOOTLOGOS)
        .replace("__SOCIALS__", SOCIALS)
        .replace("__BANNERURI__", _banner)
        .replace("__BASE__", BASE)
        .replace("__PROPOSED__", PROPOSED)
        .replace("__VARIANTS__", json.dumps(VARIANTS))
        .replace("__CUSTOM__", json.dumps(CUSTOM_DOCS))
        .replace("__DARKTOKENS__", DARK_TOKENS)
        .replace("__FONTS__", FONTS_C)
        .replace("__CSS_FN__", CSS_FN)
        .replace("__DOC_FN__", DOC_FN))
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"variants -> {out} ({os.path.getsize(out)//1024} KB, {len(VARIANTS)} variants)")
