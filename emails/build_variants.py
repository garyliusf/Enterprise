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

# ---- variant definitions: token overrides on top of the proposed design ----
# Edit these to fork a variant (e.g. "B": {"btnRadius": 0, "hWeight": 500}).
VARIANTS = {
    "A": {},   # baseline — the agreed proposed design
    "B": {},
    "C": {},
    "D": {},
    "E": {},
    "F": {},
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

/* globals the extracted editor pipeline expects */
let cur = EMAILS.find(e => e.id === 'cx__email_2') || EMAILS[0], vi = 0, T = {};
let mode = 'after', vp = 640, sel = 'A';
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
  T = tokensFor(letter);
  const doc = docFor();
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
        .replace("__FONTS__", FONTS_C)
        .replace("__CSS_FN__", CSS_FN)
        .replace("__DOC_FN__", DOC_FN))
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"variants -> {out} ({os.path.getsize(out)//1024} KB, {len(VARIANTS)} variants)")
