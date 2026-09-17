#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build the COMMENT NOTIFICATION email mocks.

New transactional family: "someone commented on a design in your project"
(modelled on Figma's comment email; Notion/Linear as secondary references).

Every file is generated from emails/reference.html — the agreed target markup —
so the page bg, ghost table, 600px card, banner, footer wordmark/socials/fine
print and all the token values come from ONE source. Only the card body and the
notification-specific footer line are swapped per state.

Output:
  emails/comments/<state>.html   real, sendable email markup
  emails/comments.html           viewer (state switcher + desktop/mobile)
"""
import os, re, json

HERE = os.path.dirname(os.path.abspath(__file__))
REF = open(os.path.join(HERE, "reference.html"), encoding="utf-8").read()

F = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
BLUE = "#1488FC"
BTN = "#1389fd"
INK = "#000000"
MUTE = "#6B6B6B"
FAINT = "#999999"
LINE = "#E6E4E1"

# ───────────────────────── components ─────────────────────────

def crumb(project, design):
    """Breadcrumb chip above the title — Figma's file chip, our type scale."""
    return f'''<p class="cm-crumb" style="margin:0 0 10px; font-family:{F}; font-size:13px; line-height:1.4; color:{MUTE};">
              <span style="color:{INK}; font-weight:600;">{project}</span>
              <span style="color:#C9C6C2;"> &#47; </span>{design}
            </p>'''

def title(text):
    return f'''<h1 class="cm-h1" style="margin:0 0 20px; font-family:{F}; font-size:26px; font-weight:600; line-height:1.2; color:{INK};">{text}</h1>'''

def preview(img, caption, meta):
    """Design preview card: thumbnail + caption strip. 528 = 600 card - 2x36 pad."""
    return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid {LINE}; border-radius:6px; margin:0 0 24px;">
              <tr>
                <td bgcolor="#F7F6F4" style="padding:0; line-height:0; background-color:#F7F6F4; border-radius:6px 6px 0 0;">
                  <img src="{img}" width="526" alt="{caption}" style="width:100%; max-width:526px; height:auto; display:block; border:0; border-radius:6px 6px 0 0;">
                </td>
              </tr>
              <tr>
                <td bgcolor="#FBFAF9" style="background-color:#FBFAF9; border-top:1px solid {LINE}; border-radius:0 0 6px 6px; padding:11px 16px; font-family:{F}; font-size:13px; line-height:1.4; color:{MUTE};">
                  <span style="color:{INK}; font-weight:600;">{caption}</span>
                  <span style="color:#C9C6C2;"> &middot; </span>{meta}
                </td>
              </tr>
            </table>'''

def comment(initials, tint, name, when, body, pin=None, last=True, compact=False):
    """One comment row: avatar + name/time + text. Hairline between rows.
    compact=True is the in-card size used by the multi-project digest."""
    av = 28 if compact else 36
    gap = 11 if compact else 14
    fs = 15 if compact else 16
    pad = "0 0 0 0" if last else ("0 0 14px 0" if compact else "0 0 18px 0")
    rule = "" if last else f' border-bottom:1px solid {LINE}; padding-bottom:{14 if compact else 18}px;'
    pinchip = (f'<span class="cm-pin" style="display:inline-block; min-width:18px; padding:1px 5px; margin-right:8px;'
               f' background-color:{BLUE}; border-radius:999px; font-family:{F}; font-size:11px; font-weight:600;'
               f' line-height:16px; color:#ffffff; text-align:center;">{pin}</span>') if pin else ""
    return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:{pad};">
              <tr>
                <td valign="top" width="{av}" style="width:{av}px; padding:0 {gap}px 0 0;{rule}">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td class="cm-av" width="{av}" height="{av}" align="center" bgcolor="{tint}" style="width:{av}px; height:{av}px; background-color:{tint}; border-radius:999px; font-family:{F}; font-size:{11 if compact else 13}px; font-weight:600; line-height:{av}px; color:#ffffff; text-align:center;">{initials}</td>
                  </tr></table>
                </td>
                <td valign="top" style="{rule}">
                  <p style="margin:0 0 4px; font-family:{F}; font-size:{14 if compact else 15}px; line-height:1.4; color:{INK};">
                    {pinchip}<span class="cm-name" style="font-weight:600;">{name}</span>
                    <span style="color:{FAINT}; font-weight:400;">&nbsp;&nbsp;{when}</span>
                  </p>
                  <p class="cm-text" style="margin:0; font-family:{F}; font-size:{fs}px; line-height:{"155%" if compact else "160%"}; color:{INK};">{body}</p>
                </td>
              </tr>
            </table>'''


def project_card(img, project, design, rows, link, href=None, last=False):
    """One card per design — the multi-project digest's unit.
    Thumbnail + caption strip (project / design + count) + its comments + link.
    Mirrors Figma's per-file card; the CTA is a link, not a second button,
    so the email keeps one primary action.

    PRODUCTION: the thumbnail must be served PRE-CROPPED at 526x240 (2x =
    1052x480). object-fit below only holds the mock together — Outlook's Word
    engine ignores it and would squash an off-ratio source to 240px tall."""
    href = href or URL
    mb = "0" if last else "0 0 20px"
    return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid {LINE}; border-radius:6px; margin:{mb};">
              <tr>
                <td bgcolor="#F7F6F4" style="padding:0; line-height:0; background-color:#F7F6F4; border-radius:6px 6px 0 0;">
                  <img src="{img}" width="526" height="240" alt="{design}" style="width:100%; max-width:526px; height:240px; object-fit:cover; display:block; border:0; border-radius:6px 6px 0 0;">
                </td>
              </tr>
              <tr>
                <td bgcolor="#FBFAF9" style="background-color:#FBFAF9; border-top:1px solid {LINE}; border-bottom:1px solid {LINE}; padding:11px 16px; font-family:{F}; font-size:13px; line-height:1.4; color:{MUTE};">
                  <span style="color:{INK}; font-weight:600;">{project}</span>
                  <span style="color:#C9C6C2;"> &#47; </span>{design}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 16px 0;">{rows}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px 16px; font-family:{F}; font-size:14px; line-height:1.5;">
                  <a href="{href}" style="color:{BLUE}; font-weight:600; text-decoration:none;">{link} &rarr;</a>
                </td>
              </tr>
            </table>'''


def lede(text):
    return f'''<p style="margin:0 0 22px; font-family:{F}; font-size:16px; line-height:160%; color:{MUTE};">{text}</p>'''


def quoted(name, when, body):
    """The comment being replied to — quiet, rule on the left."""
    return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
              <tr>
                <td style="border-left:2px solid {LINE}; padding:2px 0 2px 14px;">
                  <p style="margin:0 0 4px; font-family:{F}; font-size:13px; line-height:1.4; color:{FAINT};">
                    <span style="font-weight:600;">{name}</span>&nbsp;&nbsp;{when}
                  </p>
                  <p style="margin:0; font-family:{F}; font-size:15px; line-height:155%; color:{MUTE};">{body}</p>
                </td>
              </tr>
            </table>'''

def more(text, href="https://bolt.new"):
    return f'''<p style="margin:18px 0 0; font-family:{F}; font-size:14px; line-height:1.5; color:{MUTE};">
              <a href="{href}" style="color:{BLUE}; font-weight:600; text-decoration:none;">{text}</a>
            </p>'''

def rule():
    return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="border-top:1px solid {LINE}; font-size:0; line-height:0; padding:24px 0 0;">&nbsp;</td>
            </tr></table>'''

def button(label, href):
    """Reference button spec verbatim: 15/600, radius 2, 15x28, 180 min, hug."""
    return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:24px 0 8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td bgcolor="{BTN}" style="background-color:{BTN}; border-radius:2px; mso-padding-alt:15px 28px;">
                        <a href="{href}" class="btn-a" style="display:inline-block; min-width:180px; box-sizing:border-box; padding:15px 28px; font-family:{F}; font-size:15px; font-weight:600; line-height:1.25; color:#ffffff; text-align:center; text-decoration:none; border-radius:2px;">{label}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>'''

def reply_hint():
    return f'''<p style="margin:8px 0 0; font-family:{F}; font-size:14px; line-height:1.6; color:{MUTE};">
              Replying to this email won&rsquo;t reach your team &mdash; open the design to answer in the thread.
            </p>'''

def mention(name):
    return f'<span style="color:{BLUE}; font-weight:600;">@{name}</span>'

# ───────────────────────── content ─────────────────────────

PROJECT, DESIGN = "Nexal", "Checkout flow"
IMG = "../va/nexal-dashboard.jpg"
URL = "https://bolt.new/projects/nexal/checkout-flow"

A = ("AR", "#1488FC", "Alberto Ruiz")      # commenter
M = ("MK", "#0F8A55", "Mira Kade")         # second commenter

STATES = [
    dict(
        key="single",
        label="Single comment",
        note="One new comment. The base case — everything else is this plus context.",
        subject="Alberto Ruiz commented on Checkout flow",
        preheader="“The total should update the moment a promo code is applied.”",
        footer_reason=f"You&rsquo;re receiving this because you&rsquo;re a collaborator on <b style=\"font-weight:600;\">{PROJECT}</b>.",
        body=(
            crumb(PROJECT, DESIGN)
            + title("Alberto Ruiz left a comment")
            + preview(IMG, DESIGN, "1 new comment")
            + comment(A[0], A[1], A[2], "2:41 PM", "The total should update the moment a promo code is applied &mdash; right now it only refreshes after you hit Continue, which reads like the discount didn&rsquo;t land.", pin=1)
            + button("View Comment", URL)
            + reply_hint()
        ),
    ),
    dict(
        key="digest",
        label="Digest (4 comments)",
        note="Batched thread &mdash; Figma&rsquo;s case. Caps at three previews, the rest roll up into a link.",
        subject="4 new comments on Checkout flow",
        preheader="Alberto Ruiz and Mira Kade commented while you were away.",
        footer_reason=f"You&rsquo;re receiving this because you&rsquo;re a collaborator on <b style=\"font-weight:600;\">{PROJECT}</b>. Comment emails are batched every 30 minutes.",
        body=(
            crumb(PROJECT, DESIGN)
            + title("4 new comments on Checkout flow")
            + preview(IMG, DESIGN, "4 new comments")
            + comment(A[0], A[1], A[2], "2:41 PM", "The total should update the moment a promo code is applied &mdash; right now it only refreshes after you hit Continue.", pin=1, last=False)
            + comment(A[0], A[1], A[2], "2:44 PM", "Same on mobile. The summary card also clips the tax line at 390px.", pin=2, last=False)
            + comment(M[0], M[1], M[2], "3:02 PM", "Can we drop the second address field? Everyone I watched in testing skipped straight past it.", pin=3, last=True)
            + more("Show 1 more comment &rarr;", URL)
            + button("View Comments", URL)
            + reply_hint()
        ),
    ),
    dict(
        key="mention",
        label="@mention",
        note="Direct mention &mdash; never batched, own subject line, highest priority of the three.",
        subject="Alberto Ruiz mentioned you in Checkout flow",
        preheader="“@Gary can you confirm the promo rules before Thursday?”",
        footer_reason="You&rsquo;re receiving this because you were mentioned. Mentions are always sent immediately.",
        body=(
            crumb(PROJECT, DESIGN)
            + title("Alberto Ruiz mentioned you")
            + preview(IMG, DESIGN, "1 mention")
            + comment(A[0], A[1], A[2], "2:41 PM", f"{mention('Gary')} can you confirm the promo rules before Thursday? If stacking is allowed I&rsquo;ll need a second line in the summary card.", pin=1)
            + button("Reply in Bolt", URL)
            + reply_hint()
        ),
    ),
    dict(
        key="reply",
        label="Reply to you",
        note="Reply on your own thread &mdash; your comment is quoted above it so the reply has context.",
        subject="Alberto Ruiz replied to your comment",
        preheader="“Agreed &mdash; I&rsquo;ll move it under the summary card.”",
        footer_reason="You&rsquo;re receiving this because you started this comment thread.",
        body=(
            crumb(PROJECT, DESIGN)
            + title("Alberto Ruiz replied to you")
            + preview(IMG, DESIGN, "1 reply")
            + quoted("You", "Yesterday, 4:12 PM", "Promo field feels buried down here. Does it need to sit this far below the fold?")
            + comment(A[0], A[1], A[2], "2:41 PM", "Agreed &mdash; I&rsquo;ll move it under the summary card so it&rsquo;s visible without scrolling. Pushing a revision this afternoon.")
            + button("View Thread", URL)
            + reply_hint()
        ),
    ),
    dict(
        key="multi",
        label="Across projects",
        note="Comments spread over several designs &mdash; one card per design, Figma-style. Three cards max, the rest roll up.",
        subject="7 new comments across 3 projects",
        preheader="Nexal, Soul Press and Atlas all have new comments.",
        footer_reason="You&rsquo;re receiving this because you&rsquo;re a collaborator on these projects. Comment emails are batched every 30 minutes.",
        body=(
            title("7 new comments across 3 projects")
            + lede("Here&rsquo;s what came in while you were away.")
            + project_card(
                "../va/nexal-dashboard.jpg", "Nexal", "Checkout flow",
                comment(A[0], A[1], A[2], "2:41 PM", "The total should update the moment a promo code is applied &mdash; right now it only refreshes after you hit Continue.", pin=1, last=False, compact=True)
                + comment(M[0], M[1], M[2], "3:02 PM", "Can we drop the second address field? Everyone I watched in testing skipped straight past it.", pin=3, compact=True),
                "View 4 comments")
            + project_card(
                "../va/soulpress-app.jpg", "Soul Press", "Reader &mdash; mobile",
                comment(M[0], M[1], M[2], "1:18 PM", "Type size in the article body is a notch small on a 390px screen. 17px reads much better.", pin=1, compact=True),
                "View 2 comments")
            + project_card(
                "../va/bolt-templates.jpg", "Atlas", "Pricing page",
                comment(A[0], A[1], A[2], "11:04 AM", "Annual toggle should be the default &mdash; it&rsquo;s the plan we want people landing on.", pin=1, compact=True),
                "View 1 comment", last=True)
            + more("1 more design has new comments &rarr;")
            + button("View All Comments", "https://bolt.new/inbox")
            + reply_hint()
        ),
    ),
]

# ───────────────────────── render ─────────────────────────

EXTRA_CSS = """
  /* comment-notification additions */
  @media only screen and (max-width: 620px) {
    .cm-h1 { font-size: 22px !important; }
    .cm-crumb { font-size: 12px !important; }
    .cm-text { font-size: 15px !important; }
    .cm-av { width: 32px !important; height: 32px !important; line-height: 32px !important; font-size: 12px !important; }
  }
"""

HEADER_NOTE = """<!--
  COMMENT NOTIFICATION — {label}
  Generated by emails/build_comments.py from emails/reference.html.
  Edit the builder, not this file. Subject: {subject}
-->"""


def render(st):
    html = REF
    # swap the reference's doc comment for a short per-file note
    html = re.sub(r"<!--\n  ═{10,}.*?-->",
                  HEADER_NOTE.format(label=st["label"], subject=st["subject"]),
                  html, count=1, flags=re.S)
    html = html.replace("<title>Bolt email &mdash; reference template</title>",
                        f'<title>{st["subject"]}</title>')
    html = html.replace("<title>Bolt email — reference template</title>",
                        f'<title>{st["subject"]}</title>')
    html = html.replace("</style>", EXTRA_CSS + "</style>", 1)
    # preheader
    html = re.sub(r'(mso-hide:all;">\n  ).*?(\n</div>)',
                  lambda m: m.group(1) + st["preheader"] + m.group(2), html, count=1, flags=re.S)
    # card body
    html = re.sub(r"<!-- ═ PARTIAL: _title.*?\n\n          </td>",
                  st["body"].replace("\\", "\\\\") + "\n\n          </td>", html, count=1, flags=re.S)
    # footer reason line
    html = re.sub(r"You&rsquo;re receiving this email because you signed up for.*?manage preferences</a>\.",
                  st["footer_reason"] +
                  '\n              <a href="https://bolt.new/settings/notifications" style="color:#1488FC; font-weight:600; text-decoration:none;">Manage notification settings</a>'
                  ' or <a href="https://bolt.new/unsubscribe" style="color:#1488FC; font-weight:600; text-decoration:none;">turn off comment emails</a>.',
                  html, count=1, flags=re.S)
    # assets live one level up now
    html = html.replace('src="email_banner@2x.png"', 'src="../email_banner@2x.png"')
    return html


out_dir = os.path.join(HERE, "comments")
os.makedirs(out_dir, exist_ok=True)
for st in STATES:
    with open(os.path.join(out_dir, st["key"] + ".html"), "w", encoding="utf-8") as f:
        f.write(render(st))
    print("wrote comments/%s.html" % st["key"])

# ───────────────────────── viewer ─────────────────────────

VIEW = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Comment notification emails</title>
<style>
*{box-sizing:border-box}
:root{--bg:#faf9f8;--panel:#fff;--line:#e6e4e1;--ink:#16151a;--mute:#6d6a66;--accent:#1389fd}
@media (prefers-color-scheme:dark){:root{--bg:#131316;--panel:#1b1b1f;--line:#2c2c32;--ink:#f0eff2;--mute:#94919b}}
html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--ink);display:flex;flex-direction:column;height:100vh;overflow:hidden;
  font:13px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
header{padding:14px 22px;border-bottom:1px solid var(--line);background:var(--panel)}
.top{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
h1{font:600 14px/1 ui-monospace,Menlo,monospace;margin:0}
.lbl{font-size:9.5px;text-transform:uppercase;letter-spacing:1.1px;color:var(--mute);margin-right:-10px}
.seg{display:flex;gap:2px;background:var(--bg);padding:3px;border-radius:6px;border:1px solid var(--line)}
.seg button{border:0;background:transparent;color:var(--mute);font:500 11.5px/1 inherit;
  padding:6px 11px;border-radius:4px;cursor:pointer}
.seg button.on{background:var(--accent);color:#fff}
.meta{margin:12px 0 0;display:grid;gap:3px;font-size:12.5px;color:var(--mute);max-width:820px}
.meta b{color:var(--ink);font-weight:600}
.note{font-size:12px;color:var(--mute);margin-top:6px}
.stage{flex:1;overflow:auto;padding:26px;display:flex;justify-content:center;align-items:flex-start}
.frame{background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden;
  box-shadow:0 4px 24px rgba(0,0,0,.08);transition:width .2s ease;flex:none}
.frame iframe{display:block;width:100%;height:100%;border:0;background:#fff}
a.raw{color:var(--accent);text-decoration:none;font-size:11.5px}
</style></head><body>
<header>
  <div class="top">
    <h1>comment-notification/</h1>
    <span class="lbl">State</span>
    <div class="seg" id="states"></div>
    <span class="lbl">Width</span>
    <div class="seg" id="widths">
      <button data-w="632" class="on">Desktop 600</button>
      <button data-w="390">iPhone 390</button>
    </div>
    <a class="raw" id="raw" href="#" target="_blank">open raw &rarr;</a>
  </div>
  <div class="meta">
    <div><b>Subject</b> &nbsp;<span id="subj"></span></div>
    <div><b>Preview</b> &nbsp;<span id="pre"></span></div>
    <div class="note" id="note"></div>
  </div>
</header>
<div class="stage"><div class="frame" id="frame" style="width:632px;height:1400px"><iframe id="f"></iframe></div></div>
<script>
const STATES = __STATES__;
let cur = 0, w = 632;
const seg = document.getElementById('states');
STATES.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.label;
  b.onclick=()=>{cur=i;render()};seg.appendChild(b)});
document.querySelectorAll('#widths button').forEach(b=>b.onclick=()=>{
  w=+b.dataset.w;document.querySelectorAll('#widths button').forEach(x=>x.classList.toggle('on',x===b));render()});
function fit(){const f=document.getElementById('f');try{
  const h=f.contentDocument.documentElement.scrollHeight;
  document.getElementById('frame').style.height=(h+2)+'px';}catch(e){}}
function render(){
  const s=STATES[cur];
  [...seg.children].forEach((b,i)=>b.classList.toggle('on',i===cur));
  document.getElementById('subj').textContent=s.subject;
  document.getElementById('pre').textContent=s.preheader;
  document.getElementById('note').innerHTML=s.note;
  document.getElementById('raw').href='comments/'+s.key+'.html';
  const fr=document.getElementById('frame');fr.style.width=w+'px';
  const f=document.getElementById('f');f.onload=()=>{fit();setTimeout(fit,260)};
  f.src='comments/'+s.key+'.html';
}
window.addEventListener('resize',fit);
render();
</script></body></html>"""

meta = [dict(key=s["key"], label=s["label"], note=s["note"],
             subject=s["subject"], preheader=s["preheader"]) for s in STATES]
with open(os.path.join(HERE, "comments.html"), "w", encoding="utf-8") as f:
    f.write(VIEW.replace("__STATES__", json.dumps(meta)))
print("wrote comments.html")
