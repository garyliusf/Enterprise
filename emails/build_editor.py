#!/usr/bin/env python3
"""Build the email design-token editor from the viewer's captured data.

Reads the EMAILS payload out of index.html (the viewer) and wraps it in an
editor shell. Editing changes DESIGN TOKENS, not individual emails — the whole
point being to show one change reaching all 34.
"""
import re, os, base64, json

def _white_svg():
    path = '/Users/garyliu/Desktop/Logos/logo.svg'
    if os.path.exists(path):
        return open(path, 'rb').read().decode()
    # fall back to the copy embedded in banner-lab.html
    lab = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'banner-lab.html'), encoding='utf-8').read()
    b64 = re.search(r'data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)', lab).group(1)
    return base64.b64decode(b64).decode()

def _tinted_logo(colour):
    svg = _white_svg().replace('fill="white"', f'fill="{colour}"')
    return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()

def _tinted_icon(name, colour="#9E9C99"):
    svg = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons", name + ".svg"), encoding="utf-8").read()
    svg = svg.replace("<svg ", f'<svg fill="{colour}" ', 1)
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()

SOCIALS = json.dumps([
    {"href": "https://x.com/boltdotnew",                 "uri": _tinted_icon("x")},
    {"href": "https://www.linkedin.com/company/boltdotnew/",  "uri": _tinted_icon("linkedin")},
    {"href": "https://www.youtube.com/@BoltDotNew",      "uri": _tinted_icon("youtube")},
    {"href": "https://discord.com/invite/stackblitz",    "uri": _tinted_icon("discord")},
])

FOOTLOGOS = json.dumps({"grey": _tinted_logo("#9E9C99"), "black": _tinted_logo("#161616")})

PROPOSED = json.dumps({
    "pageBg":"#F2F1EF","pagePad":36,"cardBg":"#ffffff","cardRadius":6,"cardPad":36,
    "hFont":"Inter","hSize":24,"hWeight":600,"bFont":"Inter","bSize":16,"bLh":160,
    "linkCol":"#1488FC","btnRadius":2,"btnPy":15,"btnPx":28,"btnSize":15,"btnWeight":600,
    "btnWidth":"hug","btnMinW":180,"bannerPos":"inside","footLogo":"grey","footLogoW":94,
    "socials":"show","fMaxW":420,"fStack":"column","footerGap":24})

def _banner_uri():
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email_banner.svg")
    return "data:image/svg+xml;base64," + base64.b64encode(open(f,"rb").read()).decode()

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()
DATA = re.search(r"const EMAILS = (\[.*?\]);\n", src, re.S).group(1)

SHELL = r"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email design editor</title>
<style>
*{box-sizing:border-box}
:root{--bg:#faf9f8;--panel:#fff;--line:#e6e4e1;--ink:#16151a;--mute:#6d6a66;
  --accent:#1389fd;--sidebar:#f2f0ee}
@media (prefers-color-scheme:dark){:root{--bg:#131316;--panel:#1b1b1f;--line:#2c2c32;
  --ink:#f0eff2;--mute:#94919b;--sidebar:#17171a}}
html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--ink);
  font:13px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  display:grid;grid-template-columns:250px 1fr 290px;height:100vh;overflow:hidden}

/* ---------- left: email list ---------- */
aside{background:var(--sidebar);border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0}
.brand{padding:16px 16px 8px}
.brand h1{font-size:14px;margin:0 0 2px}
.brand p{margin:0;font-size:11px;color:var(--mute)}
.search{padding:0 12px 10px}
.search input{width:100%;padding:7px 9px;border:1px solid var(--line);border-radius:6px;
  background:var(--panel);color:var(--ink);font-size:12px}
.list{overflow-y:auto;flex:1;padding:0 6px 16px;min-height:0}
.grp{font-size:9.5px;text-transform:uppercase;letter-spacing:1.2px;color:var(--mute);
  padding:12px 8px 4px;font-weight:600}
.item{padding:6px 8px;border-radius:5px;cursor:pointer}
.item:hover{background:var(--panel)}
.item.on{background:var(--accent);color:#fff}
.item .a{font:11.5px/1.3 ui-monospace,Menlo,monospace;display:block;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vcount{font-size:9px;padding:0 4px;border-radius:7px;background:var(--accent);
  color:#fff;margin-left:5px;font-weight:700}
.item.on .vcount{background:rgba(255,255,255,.3)}

/* ---------- middle: stage ---------- */
main{display:flex;flex-direction:column;min-width:0;min-height:0}
header{padding:12px 20px;border-bottom:1px solid var(--line);background:var(--panel);
  display:flex;gap:16px;align-items:center;flex-wrap:wrap}
h2{font:600 14px/1 ui-monospace,Menlo,monospace;margin:0}
.seg{display:flex;gap:2px;background:var(--bg);padding:3px;border-radius:6px;
  border:1px solid var(--line);flex-wrap:wrap}
.seg button{border:0;background:transparent;color:var(--mute);font:500 11.5px/1 inherit;
  padding:5px 10px;border-radius:4px;cursor:pointer}
.seg button.on{background:var(--accent);color:#fff}
.lbl{font-size:9.5px;text-transform:uppercase;letter-spacing:1.1px;color:var(--mute);margin-right:-10px}
.stage{flex:1;overflow:auto;padding:24px;display:flex;justify-content:center;
  align-items:flex-start;min-height:0}
.frame{background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden;
  box-shadow:0 4px 20px rgba(0,0,0,.07);flex:none;transition:width .2s}
.frame iframe{display:block;width:100%;height:100%;border:0;background:#fff}

/* ---------- right: controls ---------- */
.ctl{background:var(--panel);border-left:1px solid var(--line);overflow-y:auto;
  padding:0 0 40px;min-height:0}
.ctl h3{font-size:9.5px;text-transform:uppercase;letter-spacing:1.2px;color:var(--mute);
  margin:0;padding:16px 16px 8px;position:sticky;top:0;background:var(--panel);z-index:1}
.row{display:grid;grid-template-columns:74px 1fr 46px;gap:8px;align-items:center;
  padding:4px 16px}
.row label{font-size:11.5px;color:var(--mute)}
.row input[type=range]{width:100%}
.row input[type=color]{width:100%;height:24px;padding:0;border:1px solid var(--line);
  border-radius:4px;background:none;cursor:pointer}
.row select,.row input[type=text]{width:100%;font:11.5px inherit;padding:4px 6px;
  border:1px solid var(--line);border-radius:4px;background:var(--bg);color:var(--ink)}
.row .val{font:11px ui-monospace,Menlo,monospace;color:var(--mute);text-align:right}
.imgctl{display:flex;gap:6px;align-items:center;min-width:0}
.imgctl input[type=file]{flex:1;min-width:0;font-size:10.5px;color:var(--mute)}
.imgctl input[type=file]::file-selector-button{font:500 10.5px inherit;padding:4px 8px;
  margin-right:6px;border:1px solid var(--line);border-radius:4px;background:var(--bg);
  color:var(--ink);cursor:pointer}
.imgctl button{font:500 10.5px inherit;padding:4px 8px;border:1px solid var(--line);
  border-radius:4px;background:var(--bg);color:var(--mute);cursor:pointer}
.row--wide{grid-template-columns:74px 1fr}
.actions{padding:14px 16px;display:grid;gap:8px}
.actions button{padding:9px;border-radius:6px;border:1px solid var(--line);
  background:var(--bg);color:var(--ink);font:500 12px inherit;cursor:pointer}
.actions button.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.actions button:hover{filter:brightness(1.06)}
.hint{padding:0 16px 12px;font-size:11px;color:var(--mute);line-height:1.5}
.flash{animation:fl 1.1s ease}
@keyframes fl{0%,60%{background:rgba(19,137,253,.16)}100%{background:transparent}}
#sel{font-size:10.5px;color:var(--accent);border:1px solid var(--accent);border-radius:4px;
  padding:3px 7px;font-weight:600}
#sel:empty{display:none}
dialog{border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);
  max-width:720px;width:90vw;padding:0}
dialog::backdrop{background:rgba(0,0,0,.5)}
dialog h4{margin:0;padding:14px 18px;border-bottom:1px solid var(--line);font-size:13px}
dialog pre{margin:0;padding:16px 18px;max-height:60vh;overflow:auto;
  font:11.5px/1.6 ui-monospace,Menlo,monospace;white-space:pre-wrap}
dialog .actions{border-top:1px solid var(--line);grid-auto-flow:column}
@media (max-width:1100px){body{grid-template-columns:1fr 290px}aside{display:none}}
</style></head><body>

<aside>
  <div class="brand"><h1>Email design editor</h1><p id="count"></p></div>
  <div class="search"><input id="q" placeholder="Search…" autocomplete="off"></div>
  <div class="list" id="list"></div>
</aside>

<main>
  <header>
    <h2 id="title"></h2>
    <span id="sel"></span>
    <span class="lbl">View</span>
    <div class="seg" id="vp"><button data-w="640" class="on">Desktop</button><button data-w="375">Mobile</button></div>
    <span class="lbl">Design</span>
    <div class="seg" id="mode"><button data-m="after" class="on">Proposed</button><button data-m="before">Current</button></div>
    <div class="seg" id="vars"></div>
  </header>
  <div class="stage" id="stage"></div>
</main>

<div class="ctl" id="ctl"></div>

<dialog id="out"><h4>Design spec — hand this to the engineer</h4><pre id="outbody"></pre>
<div class="actions"><button onclick="copyOut()">Copy to clipboard</button>
<button onclick="document.getElementById('out').close()">Close</button></div></dialog>

<script>
const EMAILS = __DATA__;
const FOOT_LOGOS = __FOOTLOGOS__;
const PROPOSED = __PROPOSED__;
const BANNER_DEFAULT = "__BANNERURI__";
const SOCIALS = __SOCIALS__;

/* Tokens. `now` = what the emails render as today, so "Current" is honest.
   Every control writes into T, and every email re-renders from T. */
const SPEC = [
  {group:'Canvas', keys:[
    {k:'containerW', label:'Width',      type:'range', min:480, max:800, step:10, unit:'px', now:600},
    {k:'pageBg',     label:'Page bg',    type:'color', now:'#ffffff'},
    {k:'pagePad',    label:'Page pad',   type:'range', min:0, max:64, step:4, unit:'px', now:0},
    {k:'cardBg',     label:'Card bg',    type:'color', now:'#ffffff'},
    {k:'cardRadius', label:'Card radius',type:'range', min:0, max:24, step:1, unit:'px', now:6},
    {k:'cardPad',    label:'Card pad',   type:'range', min:10, max:56, step:2, unit:'px', now:10},
    {k:'logoW',      label:'Logo width', type:'range', min:80, max:220, step:5, unit:'px', now:125},
  ]},
  {group:'Heading', keys:[
    {k:'hFont',   label:'Font',      type:'font',  now:'sans-serif'},
    {k:'hSize',   label:'Size',      type:'range', min:18, max:44, step:1, unit:'px', now:32},
    {k:'hWeight', label:'Weight',    type:'select', opts:[400,500,600,700,800], now:700},
    {k:'hColor',  label:'Colour',    type:'color', now:'#000000'},
    {k:'hLh',     label:'Line height',type:'range', min:100, max:170, step:5, unit:'%', now:120},
    {k:'hTrack',  label:'Tracking',  type:'range', min:-20, max:10, step:1, unit:'/100em', now:0},
  ]},
  {group:'Body', keys:[
    {k:'bFont',  label:'Font',       type:'font',  now:'sans-serif'},
    {k:'bSize',  label:'Size',       type:'range', min:12, max:22, step:1, unit:'px', now:16},
    {k:'bColor', label:'Colour',     type:'color', now:'#000000'},
    {k:'bLh',    label:'Line height',type:'range', min:120, max:200, step:5, unit:'%', now:150},
  ]},
  {group:'Button', keys:[
    {k:'btnBg',     label:'Fill',    type:'color', now:'#1389fd'},
    {k:'btnFg',     label:'Label',   type:'color', now:'#ffffff'},
    {k:'btnRadius', label:'Radius',  type:'range', min:0, max:28, step:1, unit:'px', now:10},
    {k:'btnPy',     label:'Pad Y',   type:'range', min:8, max:28, step:1, unit:'px', now:15},
    {k:'btnPx',     label:'Pad X',   type:'range', min:10, max:56, step:2, unit:'px', now:20},
    {k:'btnSize',   label:'Size',    type:'range', min:12, max:20, step:1, unit:'px', now:16},
    {k:'btnWeight', label:'Weight',  type:'select', opts:[400,500,600,700], now:400},
    {k:'btnWidth',  label:'Width',   type:'select', opts:['hug','full','mixed'], now:'mixed'},
    {k:'btnMinW',   label:'Min width', type:'range', min:120, max:320, step:10, unit:'px', now:0},
  ]},
  {group:'Images', keys:[
    {k:'headerBanner', label:'Banner', type:'image', now:''},
    {k:'bannerPos', label:'Banner pos', type:'select', opts:['inside','above'], now:'above'},
    {k:'logoSrc',   label:'Header logo', type:'image', now:''},
    {k:'footerImg', label:'Footer image',type:'image', now:''},
    {k:'footerImgW',label:'Footer width',type:'range', min:60, max:520, step:10, unit:'px', now:180},
    {k:'footerImgPad',label:'Footer pad',type:'range', min:0, max:64, step:4, unit:'px', now:24},
  ]},
  {group:'Footer & links', keys:[
    {k:'footerGap', label:'Footer gap', type:'range', min:0, max:64, step:4, unit:'px', now:0},
    {k:'footLogo',  label:'Logo',       type:'select', opts:['none','grey','black'], now:'none'},
    {k:'footLogoW', label:'Logo width', type:'range', min:56, max:160, step:4, unit:'px', now:84},
    {k:'socials',   label:'Socials',    type:'select', opts:['none','show'], now:'none'},
    {k:'fSize',  label:'Footer size', type:'range', min:9, max:16, step:1, unit:'px', now:12},
    {k:'fColor', label:'Footer col',  type:'color', now:'#999999'},
    {k:'fMaxW',  label:'Max width',   type:'range', min:240, max:600, step:20, unit:'px', now:600},
    {k:'fStack', label:'Address',     type:'select', opts:['inline','column'], now:'inline'},
    {k:'linkCol',label:'Link colour', type:'color', now:'#0000ee'},
  ]},
];
const FONTS = {
  'Inter':'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
  'sans-serif':'sans-serif',
  'System UI':'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  'Helvetica':'Helvetica,Arial,sans-serif',
  'Arial':'Arial,Helvetica,sans-serif',
  'Georgia':'Georgia,"Times New Roman",serif',
  'Verdana':'Verdana,Geneva,sans-serif',
  'Trebuchet':'"Trebuchet MS",Helvetica,sans-serif',
  'Courier':'"Courier New",Courier,monospace',
};
const NOW = {}; SPEC.forEach(g=>g.keys.forEach(d=>NOW[d.k]=d.now));
let T = {...NOW};
let cur = EMAILS[0], vi = 0, vp = 640, mode = 'after', filter = '';
Object.assign(T, PROPOSED);                       // shipped default = the proposed design
T.headerBanner = BANNER_DEFAULT;
try{ const b = localStorage.getItem('emailBanner'); if (b) T.headerBanner = b; }catch(e){}
try{ Object.assign(T, JSON.parse(localStorage.getItem('emailTokens')||'{}')); }catch(e){}
function saveT(){ try{
  const {logoSrc, footerImg, headerBanner, ...rest} = T;
  localStorage.setItem('emailTokens', JSON.stringify(rest));
}catch(e){} }
const $ = s => document.querySelector(s);
$('#count').textContent = EMAILS.length + ' emails · ' + EMAILS.reduce((n,e)=>n+e.variations.length,0) + ' variations';

/* Override CSS injected into each preview. !important because the emails carry
   inline styles. Selectors verified against the real markup:
     h1                     heading (no inline style)
     p:not([style])         body copy
     p[style]               footer line (has color/font-size inline)
     a[style*="1389fd"]     the CTA anchor
     span[style*="1389fd"]  its wrapper span
     table[style*="600px"]  the 600px container                             */
function css(t){
  const f = n => FONTS[n] || n;
  return `
    body{background:${t.pageBg} !important;margin:0 !important;padding:${t.pagePad}px 0 !important}
    table[style*="600px"]{width:100% !important;max-width:${t.containerW}px !important;
       margin-left:auto !important;margin-right:auto !important}
    table[align="center"]:not([width]){width:100% !important}
    td[style*="background-color: #ffffff"],td[bgcolor="#ffffff"]{background-color:${t.cardBg} !important}
    table[style*="background:#ffffff"]{background:${t.cardBg} !important}
    td[style*="border-radius: 6px 6px 0px 0px"]{border-radius:${
      t.headerBanner && t.bannerPos==='inside' ? '0' : t.cardRadius+'px '+t.cardRadius+'px 0 0'} !important}
    td[style*="padding: 0 10px"]{padding:6px ${t.cardPad}px !important}
    td[align="center"][valign="top"]:not([width]){padding-top:8px !important}
    [style*="max-width: 600px"][style*="padding: 0 20px"]{padding-left:0 !important;padding-right:0 !important}
    td[style*="border-radius: 0px 0px 6px 6px"]{border-radius:0 0 ${t.cardRadius}px ${t.cardRadius}px !important;
       padding-bottom:6px !important}
    td[style*="border-radius: 10px 10px 0px 0px"]{border-radius:${
      t.headerBanner && t.bannerPos==='inside' ? '0' : t.cardRadius+'px '+t.cardRadius+'px 0 0'} !important;
       padding:20px ${t.cardPad}px 0 !important}
    ${t.headerBanner && t.bannerPos==='inside'
      ? 'tr:has(> td:only-child:empty:not([style])){display:none !important}' : ''}
    td[style*="border-radius: 0px 0px 10px 10px"]{border-radius:0 0 ${t.cardRadius}px ${t.cardRadius}px !important;
       padding:6px ${t.cardPad}px 6px !important}
    img{width:${t.logoW}px !important;height:auto !important}
    img[data-banner]{width:100% !important}
    img[data-footlogo]{width:${t.footLogoW}px !important}
    img[data-social]{width:18px !important;height:18px !important}
    ${t.headerBanner ? 'td[style*="font-size: 0px"]{display:none !important}' : ''}
    ${t.headerBanner ? '[data-cxbanner]{display:none !important}' : ''}
    h1,h2,h3,h4{font-family:${f(t.hFont)} !important;font-weight:${t.hWeight} !important;
       color:${t.hColor} !important;line-height:${t.hLh/100} !important;
       letter-spacing:${t.hTrack/100}em !important;text-align:left !important}
    h1,h2{font-size:${t.hSize}px !important;margin:0 0 12px !important}
    h3{font-size:${Math.round(t.hSize*0.66)}px !important;margin:0 0 6px !important}
    h4{font-size:${t.bSize}px !important;margin:0 0 6px !important}
    h1 b,h2 b,h3 b,h4 b{font-weight:inherit !important}
    ul,ol{margin:-8px 0 16px !important;padding-left:24px !important}
    li{margin:0 0 8px !important}
    td:has(p > br:only-child) p:not([style]):nth-last-of-type(2){margin:0 0 2px !important}
    li p:not([style]),li p{margin:0 !important}
    td[style*="padding: 30px 0"],td[style*="padding: 40px 0"]{padding:8px 0 24px !important}
    td[style*="padding: 30px 0 0"]{padding:0 0 16px !important}
    td[style*="padding: 30px 0 0"]{padding:0 0 16px !important}
    h1,p:not([style]),ul,li{text-align:left !important}
    td[align="center"]{text-align:left !important;font-family:${f(t.bFont)} !important;
       font-size:${t.bSize}px !important;line-height:${t.bLh/100} !important}
    p:not([style]),li{font-family:${f(t.bFont)} !important;font-size:${t.bSize}px !important;
       color:${t.bColor} !important;line-height:${t.bLh/100} !important}
    p:not([style]){margin:0 0 16px !important}
    p:not([style]):has(> br:only-child){margin:0 !important;height:0 !important;
       font-size:0 !important;line-height:0 !important}
    p[style*="#999999"],p[style*="#666666"]{font-size:${t.fSize}px !important;
       line-height:1.6 !important;
       color:${t.fColor} !important;font-family:${f(t.bFont)} !important;
       max-width:${Math.min(t.fMaxW, t.containerW)}px !important;box-sizing:border-box !important;
       margin:0 0 14px !important;text-align:left !important;
       padding-left:${t.cardPad}px !important;padding-right:${t.cardPad}px !important}
    a:not([style]){color:${t.linkCol} !important;text-decoration:none !important;
       font-weight:600 !important}
    /* CX (HubSpot) normalization — their markup is inline-styled with its own
       palette, so the Rails-shaped rules above never catch it:
         a 4a9eeb/3aa6b9      HubSpot link colours -> token link
         p #2f2f2f            body copy            -> token body
         p color:#111 + 700   section subheads     -> subhead type
         u                    underlined lead-ins  -> bold, no underline
         td 22px / 10-30px    paragraph & CTA rows -> 16px rhythm / 8-24 button */
    a[style*="4a9eeb"],a[style*="3aa6b9"]{color:${t.linkCol} !important;
       font-weight:600 !important;text-decoration:none !important}
    p[style*="#2f2f2f"]{font-family:${f(t.bFont)} !important;font-size:${t.bSize}px !important;
       color:${t.bColor} !important;line-height:${t.bLh/100} !important}
    p[style*="color:#111"]{font-family:${f(t.hFont)} !important;font-size:17px !important;
       color:${t.hColor} !important;font-weight:${t.hWeight} !important}
    u{text-decoration:none !important;font-weight:${t.hWeight} !important}
    b,strong{font-weight:600 !important}
    td[style*="0 0 22px"]{padding:0 0 16px !important}
    td[style*="10px 0 30px"]{padding:8px 0 24px !important}
    table[width="70%"]{width:100% !important}
    td[style*="border-top:1px solid #111"]{border-top:1px solid #EAEAEA !important}
    @media (max-width:480px){
      body{padding:16px 12px !important}
      /* card side padding goes proportional (35/600 = 5.8%) so body text
         stays aligned with the banner wordmark as the banner scales down */
      td[style*="padding: 0 10px"]{padding:6px 5.8% !important}
      /* tighter banner->first-line gap on mobile: kill the rounding strip's
         vertical pad, the content cell's 14px top pad, and CX's 26px spacer */
      td[style*="border-radius: 6px 6px 0px 0px"]{padding:0 5.8% !important}
      td[align="center"][valign="top"]:not([width]){padding-top:13px !important}
      td[style*="height:26px"]{height:12px !important}
      td[style*="border-radius: 10px 10px 0px 0px"]{padding:8px 5.8% 0 !important}
      [data-footrow]{padding-left:5.8% !important;padding-right:5.8% !important}
      [data-footgap]{height:${Math.max(0, t.footerGap - 10)}px !important}
      img[data-footlogo]{width:67px !important}
      [data-footlogo-row]{padding-bottom:16px !important}
      [data-footsoc-row]{padding-bottom:11px !important}
      h1,h2{font-size:${t.hSize - 4}px !important}
      p:not([style]),li,td[align="center"]{font-size:${t.bSize - 1}px !important;
         line-height:1.45 !important}
      td[style*="border-radius: 0px 0px 10px 10px"]{padding:6px 5.8% 6px !important}
      p[style*="#999999"],p[style*="#666666"]{padding-left:5.8% !important;
         padding-right:5.8% !important}
    }
    ${t.btnWidth==='hug'
      ? 'td[style*="1389fd"],span[style*="1389fd"]{background:transparent !important;border-radius:0 !important}'
        + 'td:has(a[style*="1389fd"]),td:has(a[data-btn]){text-align:left !important}'
      : 'span[style*="1389fd"],td[style*="1389fd"]{background:'+t.btnBg+' !important;border-radius:'+t.btnRadius+'px !important}'}
    a[style*="1389fd"],a[data-btn]{background:${t.btnBg} !important;color:${t.btnFg} !important;
       white-space:nowrap !important;line-height:1.25 !important;
       border-radius:${t.btnRadius}px !important;padding:${t.btnPy}px ${t.btnPx}px !important;
       font-family:${f(t.bFont)} !important;font-size:${t.btnSize}px !important;
       font-weight:${t.btnWeight} !important;text-align:center !important;
       ${t.btnWidth==='hug'
         ? 'display:inline-block !important;width:max-content !important;min-width:'+t.btnMinW+'px !important;box-sizing:border-box !important;'
         : t.btnWidth==='mixed' ? '' : 'display:'+(t.btnWidth==='full'?'block':'inline-block')+' !important;'}}
    @media (max-width:480px){
      a[style*="1389fd"],a[data-btn]{font-size:${t.btnSize - 1}px !important}
    }`;
}
const V = () => cur.variations[vi] || cur.variations[0];
/* Injected into every preview. Makes the email itself the control surface:
   hover outlines a component, clicking it postMessages which token group owns it.
   The iframe runs with allow-scripts but NOT allow-same-origin, so it stays a
   separate origin and can only talk back through postMessage. */
const PICK = `<script>(function(){
  var MAP=[['h1','Heading'],
           ['a[style*="1389fd"],a[data-btn]','Button'],
           ['img','Images'],
           ['p[style]','Footer & links'],
           ['p,li,ul','Body']];
  function partFor(el){
    if(!el||!el.closest) return ['Canvas',document.body];
    for(var i=0;i<MAP.length;i++){var m=el.closest(MAP[i][0]);if(m)return [MAP[i][1],m];}
    return ['Canvas',document.body];
  }
  var s=document.createElement('style');
  s.textContent='.__hov{outline:2px dashed #1389fd!important;outline-offset:3px;cursor:pointer}'+
    '.__sel{outline:2px solid #1389fd!important;outline-offset:3px}';
  (document.head||document.documentElement).appendChild(s);
  var hov=null, sel=null;
  document.addEventListener('mouseover',function(e){
    var el=partFor(e.target)[1];
    if(hov&&hov!==el&&hov!==sel) hov.classList.remove('__hov');
    hov=el; if(el!==sel) el.classList.add('__hov');
  });
  document.addEventListener('mouseleave',function(){ if(hov&&hov!==sel) hov.classList.remove('__hov'); });
  var send=function(){ parent.postMessage({__emailh: document.body.scrollHeight}, '*'); };
  window.addEventListener('load', send); setTimeout(send, 60); setTimeout(send, 400);
  document.addEventListener('click',function(e){
    e.preventDefault(); e.stopPropagation();
    var r=partFor(e.target);
    if(sel) sel.classList.remove('__sel');
    sel=r[1]; sel.classList.remove('__hov'); sel.classList.add('__sel');
    parent.postMessage({__emailsel:r[0]},'*');
  },true);
})();<\/script>`;

function docFor(){
  const v = V(); if (!v.html) return null;
  // "Current" renders the email exactly as it ships — no token overrides. That's
  // what makes the toggle honest: today the buttons genuinely differ between
  // emails, and forcing tokens onto them would hide the very thing we're fixing.
  if (mode === 'before') return v.html.replace(/<\/body>/i, PICK+'</body>');
  const t = T;
  let doc = v.html;

  // stock-layout emails (elevated_permission) have no card scaffolding at all —
  // wrap them in the standard structure, emitting the exact style strings the
  // token rules already target, so the whole system lights up
  if (!/max-width:\s*600px/i.test(doc)){
    doc = doc.replace(/<body([^>]*)>([\s\S]*?)<\/body>/i, (m, attrs, inner) =>
      `<body${attrs}><table width="100%" cellpadding="0" cellspacing="0"><tbody><tr><td align="center">` +
      `<table align="center" cellpadding="0" cellspacing="0" style="background-color: transparent; max-width: 600px;"><tbody>` +
      `<tr><td style="border-radius: 6px 6px 0px 0px; background-color: #ffffff; padding: 0 10px;"></td></tr>` +
      `<tr><td align="left" style="background-color: #ffffff;padding: 0 10px;">${inner}</td></tr>` +
      `<tr><td style="background-color: #ffffff; border-radius: 0px 0px 6px 6px; padding: 0 10px;"></td></tr>` +
      `</tbody></table></td></tr></tbody></table></body>`);
  }

  // swap the header logo (first data: image in the doc — that's the brand mark)
  if (t.logoSrc) doc = doc.replace(/(<img[^>]+src=")(data:image\/[^"]+)(")/, '$1'+t.logoSrc+'$3');

  // banner: 'inside' = first row of the card, rounded top (Cosmos-style);
  // 'above' = separate strip on the page. In-card logo hides via css() either way.
  if (t.headerBanner && t.bannerPos === 'inside'){
    doc = doc.replace(/(<table[^>]*max-width:\s*600px[^>]*>\s*(?:<tbody>)?)/i,
      `$1<tr><td style="padding:0;line-height:0;"><img data-banner src="${t.headerBanner}" ` +
      `style="width:100%;display:block;border-radius:${t.cardRadius}px ${t.cardRadius}px 0 0;"></td></tr>`);
  } else if (t.headerBanner){
    doc = doc.replace(/(<body[^>]*>)/i,
      `$1<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">` +
      `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:${t.containerW}px;">` +
      `<tr><td><img data-banner src="${t.headerBanner}" style="width:100%;display:block;"></td></tr>` +
      `</table></td></tr></table>`);
  }

  // append a footer image block below the card
  if (t.footerImg) doc = doc.replace(/<\/body>/i,
    `<table width="100%" cellpadding="0" cellspacing="0"><tr>
       <td align="center" style="padding:${t.footerImgPad}px 0;">
         <img src="${t.footerImg}" style="width:${t.footerImgW}px;max-width:90%;height:auto;display:block;" alt="">
       </td></tr></table></body>`);

  // case-insensitive so CX's "the Bolt team" normalizes to the same signature
  doc = doc.replace(/[Tt]he Bolt [Tt]eam/g, '<span style="font-weight:600;">The Bolt Team ⚡</span>');
  // StackBlitz sends get the same treatment with a BLUE bolt (hue-rotated ⚡ —
  // preview only; real sends need an inline image, CSS filters die in Gmail)
  doc = doc.replace(/The StackBlitz Team/g, '<span style="font-weight:600;">The StackBlitz Team ' +
    '<span style="display:inline-block;filter:hue-rotate(170deg) saturate(1.6);">⚡</span></span>');

  // some templates hard-code width: on the button anchor itself — strip it so
  // the min-width floor + max-content sizing own the box
  doc = doc.replace(/(<a[^>]+style=")([^"]*1389fd[^"]*)(")/gi,
    (m, p1, st, p3) => p1 + st.replace(/width:\s*[^;"]+;?/gi, '') + p3);

  // collapse true double-breaks at the HTML level (CSS br+br skips text nodes
  // and was eating every break in the address column)
  doc = doc.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>');

  if (t.fStack === 'column') doc = doc.replace(
    /StackBlitz, Inc\., 2443 Fillmore Street #380-16814, San Francisco, CA 94115, United States\.?/g,
    'StackBlitz, Inc.<br>2443 Fillmore Street #380-16814<br>San Francisco, CA 94115<br>United States');

  if (t.footerGap) doc = doc.replace(
    /(<tr>\s*<td[^>]*>\s*<p style="[^"]*(?:#999999|#666666))/i,
    `<tr><td data-footgap style="height:${t.footerGap}px;line-height:0;font-size:0;">&nbsp;</td></tr>$1`);

  if (t.footLogo && t.footLogo !== 'none') doc = doc.replace(
    /(<tr>\s*<td[^>]*>\s*<p style="[^"]*(?:#999999|#666666))/i,
    `<tr><td><div data-footrow data-footlogo-row style="max-width:${t.containerW}px;margin:0 auto;box-sizing:border-box;` +
    `padding:0 ${t.cardPad}px 24px;"><img data-footlogo src="${FOOT_LOGOS[t.footLogo]}" ` +
    `style="width:${t.footLogoW}px;display:block;margin:0;"></div></td></tr>$1`);

  if (t.socials === 'show') doc = doc.replace(
    /(<tr>\s*<td[^>]*>\s*<p style="[^"]*(?:#999999|#666666))/i,
    `<tr><td><div data-footrow data-footsoc-row style="max-width:${t.containerW}px;margin:0 auto;box-sizing:border-box;` +
    `padding:0 ${t.cardPad}px 17px;text-align:left;">` +
    SOCIALS.map(so => `<a href="${so.href}" style="text-decoration:none;display:inline-block;` +
    `margin:0 22px 0 0;"><img data-social src="${so.uri}" width="18" height="18" ` +
    `style="display:inline-block;"></a>`).join('') +
    `</div></td></tr>$1`);

  const style = `<style id="__tokens">${css(t)}</style>`;
  doc = doc.includes('</head>') ? doc.replace('</head>', style+'</head>') : style+doc;
  return doc.replace(/<\/body>/i, PICK+'</body>');
}

/* Click inside the preview -> scroll the matching token group into view and flash it. */
addEventListener('message', e => {
  if (e.data && e.data.__emailh){
    const f = document.querySelector('.frame');
    if (f){ const max = Math.max(320, $('#stage').clientHeight - 48);
      f.style.height = Math.min(e.data.__emailh + 10, max) + 'px'; }
    return;
  }
  const part = e.data && e.data.__emailsel; if(!part) return;
  const h = [...document.querySelectorAll('#ctl h3')].find(x => x.textContent === part);
  if(!h) return;
  $('#sel').textContent = part;
  h.scrollIntoView({behavior:'smooth', block:'start'});
  const rows=[h]; let n=h.nextElementSibling;
  while(n && n.tagName!=='H3'){ rows.push(n); n=n.nextElementSibling; }
  rows.forEach(r=>{ r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); });
});

function drawList(){
  const box=$('#list'); box.innerHTML='';
  [...new Set(EMAILS.map(e=>e.group))].forEach(g=>{
    const items=EMAILS.filter(e=>e.group===g&&(!filter||e.action.toLowerCase().includes(filter)));
    if(!items.length) return;
    const h=document.createElement('div'); h.className='grp'; h.textContent=g; box.appendChild(h);
    items.forEach(e=>{
      const d=document.createElement('div');
      d.className='item'+(e.id===cur.id?' on':'');
      d.innerHTML='<span class="a">'+e.action+(e.variations.length>1?'<span class="vcount">'+e.variations.length+'</span>':'')+'</span>';
      d.onclick=()=>{cur=e;vi=0;draw();};
      box.appendChild(d);
    });
  });
}

function drawCtl(){
  const c=$('#ctl'); c.innerHTML='';
  SPEC.forEach(g=>{
    const h=document.createElement('h3'); h.textContent=g.group; c.appendChild(h);
    g.keys.forEach(d=>{
      const row=document.createElement('div');
      row.className='row'+(d.type==='color'||d.type==='font'||d.type==='select'?' row--wide':'');
      const lab=document.createElement('label'); lab.textContent=d.label; row.appendChild(lab);
      let inp;
      if(d.type==='image'){
        // file -> data URI, so the preview stays self-contained
        const wrap=document.createElement('div'); wrap.className='imgctl';
        const file=document.createElement('input'); file.type='file'; file.accept='image/*';
        const clear=document.createElement('button'); clear.textContent='Clear';
        clear.style.display=T[d.k]?'':'none';
        file.onchange=()=>{
          const f=file.files&&file.files[0]; if(!f) return;
          const r=new FileReader();
          r.onload=()=>{ T[d.k]=r.result; clear.style.display='';
            if(mode==='before'){mode='after';syncMode();} paint(); };
          r.readAsDataURL(f);
        };
        clear.onclick=()=>{ T[d.k]=''; file.value=''; clear.style.display='none';
          if(d.k==='headerBanner'){ try{ localStorage.removeItem('emailBanner'); }catch(e){} }
          paint(); };
        wrap.appendChild(file); wrap.appendChild(clear);
        row.appendChild(wrap); c.appendChild(row); return;
      }
      if(d.type==='range'){
        inp=document.createElement('input'); inp.type='range';
        inp.min=d.min; inp.max=d.max; inp.step=d.step; inp.value=T[d.k];
      } else if(d.type==='color'){
        inp=document.createElement('input'); inp.type='color'; inp.value=T[d.k];
      } else if(d.type==='font'){
        inp=document.createElement('select');
        Object.keys(FONTS).forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;inp.appendChild(o);});
        inp.value=T[d.k];
      } else {
        inp=document.createElement('select');
        d.opts.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;inp.appendChild(o);});
        inp.value=T[d.k];
      }
      inp.oninput=()=>{ T[d.k]=inp.type==='range'?+inp.value:inp.value; saveT();
        if(d.type==='range') row.querySelector('.val').textContent=T[d.k]+(d.unit==='/100em'?'':d.unit||'');
        if(mode==='before'){mode='after';syncMode();}
        paint(); };
      row.appendChild(inp);
      if(d.type==='range'){
        const v=document.createElement('span'); v.className='val';
        v.textContent=T[d.k]+(d.unit==='/100em'?'':d.unit||''); row.appendChild(v);
      }
      c.appendChild(row);
    });
  });
  const a=document.createElement('div'); a.className='actions';
  a.innerHTML='<button class="primary" onclick="showSpec()">Export spec</button>'+
              '<button onclick="reset()">Reset to current</button>';
  c.appendChild(a);
  const hint=document.createElement('div'); hint.className='hint';
  hint.textContent='Click any part of the email to jump to its controls. Every control changes shared design tokens, not one email — flip through the list to see the same change land everywhere. "Current" shows how they render today.';
  c.appendChild(hint);
}

function paint(){
  const stage=$('#stage'); const doc=docFor();
  if(!doc){ stage.innerHTML='<div style="padding:40px;color:var(--mute)">No HTML part — plaintext only.</div>'; return; }
  let w=stage.querySelector('.frame');
  if(!w){ stage.innerHTML=''; w=document.createElement('div'); w.className='frame';
    const f=document.createElement('iframe'); f.setAttribute('sandbox','allow-scripts'); w.appendChild(f); stage.appendChild(w); }
  w.style.width=vp+'px'; w.style.height='min(1150px, calc(100vh - 150px))';
  w.querySelector('iframe').srcdoc=doc;
}
function syncMode(){ document.querySelectorAll('#mode button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode)); }
function draw(){
  drawList();
  $('#title').textContent=cur.action;
  const vb=$('#vars'); const multi=cur.variations.length>1;
  vb.style.display=multi?'':'none'; vb.innerHTML='';
  if(multi) cur.variations.forEach((vv,i)=>{
    const b=document.createElement('button'); b.textContent=vv.label;
    b.className=i===vi?'on':''; b.onclick=()=>{vi=i;draw();}; vb.appendChild(b);
  });
  document.querySelectorAll('#vp button').forEach(b=>b.classList.toggle('on',+b.dataset.w===vp));
  syncMode(); paint();
}
function reset(){ T={...NOW};
  try{ localStorage.removeItem('emailTokens'); localStorage.removeItem('emailBanner'); }catch(e){}
  drawCtl(); paint(); }
function showSpec(){
  const changed=Object.keys(T).filter(k=>T[k]!==NOW[k]);
  const lines=changed.length
    ? changed.map(k=>`  ${k}: ${NOW[k]}  ->  ${T[k]}`).join('\n')
    : '  (nothing changed yet)';
  $('#outbody').textContent =
`EMAIL DESIGN TOKENS — proposed
Generated from the review app. ${changed.length} of ${Object.keys(T).length} tokens changed.

CHANGED
${lines}

FULL TOKEN SET
${JSON.stringify(T,null,2)}

APPLIED AS CSS (what the shared partials/layout would carry)
${css(T).trim()}

NOTE FOR ENGINEERING
These are shared tokens, not per-email styles. The point is that one set of
values drives every email — which needs the button/heading/body markup to live
in shared partials first. The Devise emails already work this way
(_call_to_action); it's just not wired to the other 32.

TARGET ARCHITECTURE — ONE TEMPLATE FOR ALL 38
Verified against every captured email: the complete content vocabulary is
title / paragraph / bold subhead / bullet list / link / one button. Therefore:
  1 layout   — banner, card, footer, all plumbing (ghost tables, bgcolor,
               chrome-owned 24px top gap, dark-mode metas)
  ~6 partials — _title, _paragraph, _button (bulletproof td), _list, _subhead,
               footer pieces. Devise already uses this pattern; promote it.
  34 bodies  — copy + ERB conditionals only, zero styling (see compensation
               layer below for why bodies must own no spacing)
  1 HubSpot coded template mirroring the layout; CX edits copy modules only.
Rule of ownership: containers own spacing, components own none.
Regression: re-render all 38, diff against the captured previews in this kit.

WHY CONSOLIDATION FIRST — THE COMPENSATION LAYER
Many rules above exist ONLY to sand down per-template inconsistencies, not to
express design: h1/h2 flattening (templates use either tag for the same title),
td[align=center] text rules (some copy is raw td text, not paragraphs),
the 30px/40px spacer-cell normalizations (hand-set spacing per template),
li p margin reset (some bullets wrap paragraphs), the inner 20px wrapper strip
(one email family adds its own container), the two logo-cell variants, and
hard-coded width: on some button anchors (stripped at render so min-width can
float — partials must never fix a button's width inline).
With shared partials, every one of these rules becomes unnecessary — that list
is the measure of how inconsistent the templates currently are.

TWO IMPLEMENTATION TRACKS
  1. Rails (stackblitz/stackblitz) — the 34 live transactional emails.
     Shared partials + one brand-parameterised layout. Engineering work.
  2. HubSpot — the CX / lifecycle emails, edited manually in HubSpot.
     A Rails refactor will NOT reach these; they need applying by hand.
Same tokens, two places. Worth agreeing who owns keeping them in sync.

PAGE vs CARD BACKGROUND (Gmail/Outlook-safe)
Put the page colour on a 100%-width wrapper TABLE using the bgcolor ATTRIBUTE
(not only on <body> - some clients strip body styles), and the card colour on
the inner table's td (bgcolor attribute + inline background-color, both).
Outlook's Word engine ignores max-width - fix the card at width=600 inside an
MSO conditional "ghost table". border-radius is ignored by Outlook; rounded
corners degrade to square, which is acceptable.

IMAGES
Any image set here is inlined as a data: URI so the preview stays portable.
Real sends can't use those (Gmail/Outlook block them) — in production they
become hosted URLs or cid: attachments, as image_url('bolt_logo.png') already
does today.`;
  $('#out').showModal();
}
function copyOut(){ navigator.clipboard.writeText($('#outbody').textContent); }

$('#vp').onclick=e=>{ if(e.target.dataset.w){vp=+e.target.dataset.w;draw();} };
$('#mode').onclick=e=>{ if(e.target.dataset.m){mode=e.target.dataset.m;draw();} };
$('#q').oninput=e=>{ filter=e.target.value.toLowerCase().trim(); drawList(); };
document.onkeydown=e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
  const i=EMAILS.indexOf(cur);
  if(e.key==='ArrowDown'){cur=EMAILS[Math.min(i+1,EMAILS.length-1)];vi=0;draw();e.preventDefault();}
  if(e.key==='ArrowUp'){cur=EMAILS[Math.max(i-1,0)];vi=0;draw();e.preventDefault();}
  if(e.key==='ArrowRight'){vi=Math.min(vi+1,cur.variations.length-1);draw();e.preventDefault();}
  if(e.key==='ArrowLeft'){vi=Math.max(vi-1,0);draw();e.preventDefault();}
  if(e.key==='b'){mode=mode==='before'?'after':'before';draw();}
};
drawCtl(); draw();
</script></body></html>"""

out = os.path.join(HERE, "editor.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(SHELL.replace("__DATA__", DATA).replace("__FOOTLOGOS__", FOOTLOGOS).replace("__SOCIALS__", SOCIALS).replace("__PROPOSED__", PROPOSED).replace("__BANNERURI__", _banner_uri()))
print(f"editor -> {out} ({os.path.getsize(out)//1024} KB)")
