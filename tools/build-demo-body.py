#!/usr/bin/env python3
"""Generate bolt-public-pages' src/content/demo-body.html from marketing/demo.html.

/demo is a hand-built page (the careers pattern): Layout supplies Header/Footer and
src/pages/demo.astro slots this body in whole. The staging page is the design
source; this script is the port:

  - drops the head, navbar, drawer, site footer + divider, wordmark strip (+ its
    shimmer script), the theme resolver and the review toggle
  - `body` rules move to `.demo-main`; shared-components.css/.js are inlined
    WITHOUT the --sc-* token layer (Layout loads sc-tokens.css) and without the
    review-only Pages navigator
  - the prototype's submit handler (success state only) is replaced by the
    HubSpot submission (same endpoint + context as the enterprise DemoForm)

    python3 tools/build-demo-body.py ~/Projects/bolt-public-pages/src/content/demo-body.html
"""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
out = pathlib.Path(sys.argv[1]).expanduser()
h = (ROOT / 'marketing/demo.html').read_text()
shared_css = (ROOT / 'marketing/shared-components.css').read_text()
shared_js = (ROOT / 'marketing/shared-components.js').read_text()
def must(c, m):
    if not c: raise SystemExit('ASSERT: ' + m)

styles = list(re.finditer(r'<style([^>]*)>(.*?)</style>', h, re.S))
by_id = {re.search(r'id="([^"]+)"', m.group(1)).group(1): m.group(2) for m in styles if 'id="' in m.group(1)}
plain = [m.group(2) for m in styles if 'id="' not in m.group(1)]
must(len(plain) == 2 and 'body {' in plain[0], f'style blocks changed: {len(plain)}')
main_css = plain[1]
must(not re.search(r'(?m)^\s*(body|html|:root)\s*[{,]', main_css), 'bare body/html/:root rule in the main style block')
must('theme-review-toggle-style' in by_id, 'review toggle block not found')
hero_blocks = ''.join(f'\n<style>{by_id[k]}</style>\n' for k in ('hero-stack-standard', 'hero-stack-phone'))

m0 = h.index('<section class="demo-section'); m1 = h.index('<!-- Subtle divider between')
markup = h[m0:m1].rstrip() + '\n'
must('<script' not in markup and 'mkt-nav' not in markup and 'site-footer' not in markup, 'unexpected chrome inside the markup slice')
must('id="demo-form"' in markup and 'class="demo-success"' in markup, 'form / success markup')

scripts = re.findall(r'<script>(.*?)</script>', h, re.S)
page_js = [s for s in scripts if 'Hero pixel dots' in s[:200]]
must(len(page_js) == 1 and "getElementById('demo-form')" in page_js[0], 'page script with the form handler')
js = page_js[0]
# swap the prototype submit handler for the HubSpot submission
a = js.index('// ── Demo request form'); b = js.index('})();', a) + 5
HUBSPOT = r'''// ── Demo request form → HubSpot (the same endpoint + context as the enterprise
//    page's DemoForm.tsx). Fields map to the standard contact properties; the
//    success state is the card's .is-sent swap. If HubSpot rejects a field the
//    form definition does not carry (FIELD_NOT_IN_FORM_DEFINITION), the lead is
//    re-sent with the email alone so it is never lost — add the fields to the
//    form in HubSpot (or point HS_FORM at a dedicated demo-request form).
(function () {
  var form = document.getElementById('demo-form');
  if (!form) return;
  var HS_FORM = 'https://api.hsforms.com/submissions/v3/integration/submit/45403856/20f65973-575f-4229-aa78-666ff2b5f2f3';
  var card = form.closest('.demo-form-card');
  var btn = form.querySelector('.demo-submit');
  var MAP = { firstName: 'firstname', lastName: 'lastname', email: 'email', website: 'website', phone: 'phone', solve: 'message' };
  function fields(onlyEmail) {
    var out = [];
    Object.keys(MAP).forEach(function (k) {
      var el = form.elements[k]; var v = el && el.value.trim();
      if (!v) return;
      if (onlyEmail && k !== 'email') return;
      out.push({ name: MAP[k], value: v });
    });
    return out;
  }
  function post(onlyEmail) {
    var hutk = (document.cookie.match(/hubspotutk=([^;]+)/) || [])[1];
    var context = { pageUri: window.location.href, pageName: document.title };
    if (hutk) context.hutk = hutk;
    return fetch(HS_FORM, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields(onlyEmail), context: context }) });
  }
  var busy = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true; form.classList.add('is-submitting'); if (btn) btn.setAttribute('aria-busy', 'true');
    function done(ok) {
      busy = false; form.classList.remove('is-submitting'); if (btn) btn.removeAttribute('aria-busy');
      if (ok) { card.classList.add('is-sent'); card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      else { form.classList.add('is-error'); }
    }
    form.classList.remove('is-error');
    post(false).then(function (r) {
      if (r.ok) return done(true);
      return r.text().then(function (t) {
        if (r.status === 400 && /FIELD_NOT_IN_FORM_DEFINITION/.test(t)) return post(true).then(function (r2) { done(r2.ok); });
        done(false);
      });
    }).catch(function () { done(false); });
  });
})();'''
js = js[:a] + HUBSPOT + js[b:]
must('reportValidity' in js and 'hsforms' in js, 'handler swap')

t0 = shared_css.index(':root,\n.sc-on-light {'); t0 = shared_css.rfind('/*', 0, t0) if shared_css.rfind('*/', 0, t0) > shared_css.rfind('}', 0, t0) else t0
t1 = shared_css.index('--sc-label-weight'); t1 = shared_css.index('\n}', t1) + 2
heads = [' '.join(x.split()) for x in re.findall(r'([^{}]+)\{', re.sub(r'/\*.*?\*/', '', shared_css[t0:t1], flags=re.S))]
must(all(re.fullmatch(r'(@media \(prefers-color-scheme: dark\)|:root(:not\(\[data-theme="light"\]\))?(\[data-theme="dark"\])?(, ?\.sc-on-(light|dark))?)', x) for x in heads), f'token span holds non-token rules: {heads}')
shared_css_out = shared_css[:t0].rstrip() + '\n\n/* (the --sc-* token layer lives in src/styles/sc-tokens.css, loaded by Layout) */\n' + shared_css[t1:]
must('--sc-ink-rgb:' not in shared_css_out, 'token definitions left in shared css')
n0 = shared_js.index('/* ═══ REVIEW-ONLY: page navigator'); shared_js_out = shared_js[:n0].rstrip() + '\n'
must('sc-pages' not in shared_js_out, 'navigator left in shared js')

body = f'''<!-- ============================================================================
     DEMO — page body.
     GENERATED from the garyliusf/Enterprise sandbox (marketing/demo.html) by
     tools/build-demo-body.py — change the staging page and regenerate.
     Order mirrors the sandbox: page CSS → markup → shared component CSS (wins
     the cascade) → page JS → shared JS. Nav and footer come from Layout.
     Light-capable: dark rules are the base, light ones are keyed on
     html[data-theme="light"]; the --sc-* tokens come from sc-tokens.css.
     ============================================================================ -->

<style>
  .demo-main {{
    background: var(--sc-ground, #000);
    color: var(--sc-ink, #fff);
    font-family: var(--sc-font-sans, 'Inter', sans-serif);
    overflow-x: hidden;
    overflow-x: clip;
  }}
  .demo-main, .demo-main *, .demo-main *::before, .demo-main *::after {{ box-sizing: border-box; }}
  .demo-form.is-submitting .demo-submit {{ opacity: 0.7; pointer-events: none; }}
  .demo-form-error {{ display: none; margin-top: 12px; font-size: 14px; color: #c0392b; }}
  .demo-form.is-error .demo-form-error {{ display: block; }}
</style>
{hero_blocks}
<style>{main_css}</style>

{markup.replace('<p class="demo-legal">', '<p class="demo-form-error" role="alert">Something went wrong sending your request. Please try again.</p>\n        <p class="demo-legal">')}
<!-- ── Shared components (buttons, eyebrows) — inlined; loads after the page CSS so it wins the cascade ── -->
<style>
{shared_css_out}</style>

<script>{js}</script>
<!-- ── Shared component JS (scroll reveals, pixel-fill hovers) ── -->
<script>
{shared_js_out}</script>
'''
local = {x for x in set(re.findall(r'''(?:src|href|poster)=["']([^"'#][^"']*)["']''', body)) | set(re.findall(r'''url\(["']?([^"')]+)["']?\)''', body)) if not x.startswith(('http', 'data:', '//', 'mailto:')) and re.fullmatch(r'[\w./-]+', x)}
must(not [x for x in local if not x.startswith('/')], f'relative asset references: {sorted(x for x in local if not x.startswith("/"))}')
out.write_text(body)
print(f'wrote {out}: {len(body):,} chars; markup {len(markup):,}, page css {len(main_css):,}, page js {len(js):,}')
