#!/usr/bin/env python3
"""Add the two CX emails to the viewer's collection.

These are NOT from stackblitz/stackblitz — they live in HubSpot (confirmed by
Gary) and are edited manually there. A Rails-side partial refactor will never
reach them, so any unified design has two implementation tracks.

Reconstructed from screenshots: close approximations of layout and copy, not
byte-accurate captures.

Buttons carry data-btn so the editor's token overrides reach them the same way
they reach the Rails emails' inline-styled buttons.
"""
import re, json, os

HERE = os.path.dirname(os.path.abspath(__file__))

WRAP = """<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><style>
html{{font-family:Arial,Helvetica,sans-serif}}
</style></head><body style="margin:0;background:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;">
{body}
</table></td></tr></table></body></html>"""

def para(text, size=17, color="#2f2f2f", lh=1.6, pad="0 0 22px"):
    return (f'<tr><td align="left" style="padding:{pad};">'
            f'<p style="margin:0;font-size:{size}px;color:{color};line-height:{lh};">{text}</p>'
            f'</td></tr>')

# ---------------------------------------------------------------- CX email 1
cx1_body = "".join([
    '<tr><td style="height:32px;"></td></tr>',
    para("Noticed your team just got bigger on Bolt, love to see it!"),
    para("What are you all working on? Happy to point you toward anything that might "
         "help get up to speed faster."),
    para("Also, totally optional, but we offer a <b>free call</b> with one of our product "
         "experts. No pitch, no agenda, just someone who knows Bolt inside and out helping "
         "you get the most out of it for whatever you're working on."),
    para("Here's a link to grab a time:"),
    # CTA
    '<tr><td align="left" style="padding:10px 0 30px;">'
    '<a href="#" data-btn="1" target="_blank" style="background:#55a5f5;border-radius:8px;'
    'padding:16px 28px;color:#ffffff;text-decoration:none;font-size:19px;font-weight:700;'
    'display:inline-block;">Book your call</a></td></tr>',
    para("Either way, reply anytime if you hit a wall or just want to bounce ideas. We're here!"),
    # signature
    '<tr><td align="left" style="padding:6px 0 0;">'
    '<p style="margin:0;font-size:15px;color:#2f2f2f;line-height:1.6;">Monika Rozanska<br>'
    'Head of Customer Experience, <a href="https://bolt.new" style="color:#3aa6b9;">Bolt.new</a>'
    '</p></td></tr>',
    '<tr><td style="height:56px;"></td></tr>',
    # footer
    '<tr><td align="center" style="padding:0 0 8px;">'
    '<p style="margin:0;font-size:13px;color:#666666;line-height:1.6;">'
    'StackBlitz, Inc., 2443 Fillmore Street #380-16814, San Francisco, CA 94115, United States'
    '</p></td></tr>',
    '<tr><td align="center" style="padding:0 0 40px;">'
    '<p style="margin:0;font-size:13px;color:#666666;line-height:1.6;">'
    '<a href="#" style="color:#3aa6b9;">Unsubscribe</a> &nbsp; '
    '<a href="#" style="color:#3aa6b9;">Manage preferences</a></p></td></tr>',
])

# ---------------------------------------------------------------- CX email 2
def rule():
    return ('<tr><td align="center" style="padding:14px 0 22px;">'
            '<table width="70%" cellpadding="0" cellspacing="0"><tr>'
            '<td style="border-top:1px solid #111;font-size:0;line-height:0;">&nbsp;</td>'
            '</tr></table></td></tr>')

def event(title, date):
    return ('<tr><td align="left" style="padding:0 0 20px;">'
            f'<p style="margin:0;font-size:16px;color:#2f2f2f;line-height:1.6;">{title}<br>'
            f'{date}, <a href="#" style="color:#4a9eeb;">RSVP</a></p></td></tr>')

bullets = ["Connect the Stripe MCP to a Bolt app",
           "Configure products and pricing through Stripe",
           "Set up and test a Stripe Checkout flow in test mode",
           "Handle API keys and environment variables securely",
           "Return customers to the right success or cancel flow after payment",
           "Think through common payment edge cases like failed or cancelled payments "
           "and confirmation"]

cx2_body = "".join([
    # black banner — approximated with a gradient; the real asset is an image
    '<tr><td align="left" style="background:#000000;padding:0;">'
    '<div style="background:linear-gradient(105deg,#000 0%,#000 55%,#0a1a3a 74%,'
    '#1b6fd6 88%,#8fd4ff 96%,#000 100%);padding:34px 30px 40px;">'
    '<span style="font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:800;'
    'font-style:italic;color:#ffffff;letter-spacing:-1px;">bolt</span>'
    '<span style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:400;'
    'color:#ffffff;">.new</span></div></td></tr>',
    '<tr><td style="height:26px;"></td></tr>',
    para("Hi,", size=16),
    para("An app that can't take payments is a project, an app that can is a business. The "
         "purchase flow is where some builders stall, and it's the single feature standing "
         "between you and your first paying customer.", size=16),
    para("In this week's workshop, we'll connect and configure payments with the Stripe MCP "
         "so your app can start earning, without the usual setup headaches.", size=16),
    '<tr><td align="left" style="padding:0 0 14px;">'
    '<p style="margin:0;font-size:16px;color:#2f2f2f;"><u>You\'ll learn how to:</u></p></td></tr>',
    '<tr><td align="left" style="padding:0 0 22px;"><ul style="margin:0;padding-left:26px;">'
    + "".join(f'<li style="font-size:16px;color:#2f2f2f;line-height:1.6;margin-bottom:6px;">{b}</li>'
              for b in bullets)
    + '</ul></td></tr>',
    '<tr><td align="left" style="padding:0 0 6px;">'
    '<a href="#" style="color:#4a9eeb;font-size:16px;font-weight:700;">Register here</a></td></tr>',
    rule(),
    '<tr><td align="left" style="padding:0 0 20px;">'
    '<p style="margin:0;font-size:16px;color:#111;font-weight:700;">Coming up next:</p></td></tr>',
    event("Your Users Have Questions: Answer Them Automatically Inside Your App", "Thursday, August 20"),
    event("Office Hours: Bring your projects, questions, or blockers for live help and feedback",
          "Tuesday, August 25"),
    event("Launch and Grow: Market Your App and Find Your First Users", "Thursday, August 27"),
    '<tr><td align="left" style="padding:0 0 6px;">'
    '<a href="#" style="color:#4a9eeb;font-size:16px;font-weight:700;">See the full lineup</a></td></tr>',
    '<tr><td align="left" style="padding:0 0 6px;">'
    '<a href="#" style="color:#4a9eeb;font-size:16px;font-weight:700;">Watch previous workshops</a></td></tr>',
    rule(),
    '<tr><td align="left" style="padding:0 0 20px;">'
    '<p style="margin:0;font-size:16px;color:#111;font-weight:700;">'
    'Tip of the week: Let the Bolt agent work in your other tools for you</p></td></tr>',
    para("Every new service you add usually means learning a new dashboard. With connectors, "
         "you don't have to. Once you connect a service like Stripe, the Bolt agent can "
         "interact with it directly on your behalf, so you can stay in your build instead of "
         "context switching to figure out someone else's interface.", size=16, pad="0 0 6px"),
    para("Say you need a new product and price for your checkout. Instead of learning where "
         "that lives in the Stripe dashboard, just describe what you want and the agent will "
         "create it in Stripe and wire it into your app.", size=16),
    '<tr><td align="left" style="padding:0 0 22px;">'
    '<p style="margin:0;font-size:16px;color:#2f2f2f;line-height:1.6;">'
    '<b>Try this prompt:</b> <i>"Using the Stripe connector, create a new product called Pro '
    'Plan at $29/month in test mode, then add a checkout flow for it to my app with success '
    'and cancel pages."</i></p></td></tr>',
    rule(),
    '<tr><td align="left" style="padding:0 0 40px;">'
    '<p style="margin:0;font-size:16px;color:#2f2f2f;line-height:1.6;">Keep building,<br>'
    'Monika &amp; the Bolt team</p></td></tr>',
])

CX = [
    {
        "id": "cx__email_1", "group": "CX \u00b7 HubSpot (separate system)", "mailer": "cx_platform",
        "action": "CX email 1", "variations": [{
            "label": "Default",
            "subject": "Noticed your team just got bigger on Bolt",
            "from": '"Monika Rozanska" <monika@bolt.new>', "to": "you@example.com",
            "html": WRAP.format(body=cx1_body), "text": "",
            "path": "HubSpot — not in the Rails app; edited manually there",
        }],
    },
    {
        "id": "cx__email_2", "group": "CX \u00b7 HubSpot (separate system)", "mailer": "cx_platform",
        "action": "CX email 2", "variations": [{
            "label": "Default",
            "subject": "This week: take payments with the Stripe MCP",
            "from": '"Bolt.new" <hello@bolt.new>', "to": "you@example.com",
            "html": WRAP.format(body=cx2_body), "text": "",
            "path": "HubSpot — not in the Rails app; edited manually there",
        }],
    },
]

path = os.path.join(HERE, "index.html")
src = open(path, encoding="utf-8").read()
m = re.search(r"const EMAILS = (\[.*?\]);\n", src, re.S)
E = json.loads(m.group(1))
E = [e for e in E if not e["id"].startswith("cx__")] + CX      # idempotent
new = "const EMAILS = " + json.dumps(E, ensure_ascii=False) + ";\n"
open(path, "w", encoding="utf-8").write(src[:m.start()] + new + src[m.end():])
print(f"viewer now has {len(E)} emails "
      f"({sum(len(e['variations']) for e in E)} variations), incl. 2 CX")
