#!/usr/bin/env python3
"""Generate bolt-public-pages' src/content/integrations-body.html from
marketing/integrations/index.html.

/platform/integrations is a hand-built page (the careers / demo pattern):
Layout supplies Header/Footer and src/pages/platform/integrations/index.astro
slots this body in whole. The staging page is the design source; this script
is the port:

  - drops the head, navbar, drawer, site footer + divider, wordmark strip (+ its
    shimmer script), the theme resolver and the review toggle
  - the page's `body` / `*` / `a` rules move under `.integrations-main`;
    shared-components.css/.js are inlined WITHOUT the --sc-* token layer
    (Layout loads sc-tokens.css) and without the review-only Pages navigator
  - logos/<slug>.svg -> /public-page-assets/integrations/logos/<slug>.svg
  - the footer email strip gets the enterprise page's HubSpot submission (the
    prototype's button does nothing)
  - production's footer has no divider element, so .footer-section carries
    the 88px button->line standard as padding-bottom

    python3 tools/build-integrations-body.py ~/Projects/bpp-solutions-route/src/content/integrations-body.html
"""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
out = pathlib.Path(sys.argv[1]).expanduser()
h = (ROOT / 'marketing/integrations/index.html').read_text()
shared_css = (ROOT / 'marketing/shared-components.css').read_text()
shared_js = (ROOT / 'marketing/shared-components.js').read_text()
ASSETS = '/public-page-assets/integrations/'
def must(c, m):
    if not c: raise SystemExit('ASSERT: ' + m)

# ── page CSS: ONE plain block (it starts with the page-level resets) + the two hero-stack blocks ──
styles = list(re.finditer(r'<style([^>]*)>(.*?)</style>', h, re.S))
by_id = {re.search(r'id="([^"]+)"', m.group(1)).group(1): m.group(2) for m in styles if 'id="' in m.group(1)}
plain = [m.group(2) for m in styles if 'id="' not in m.group(1)]
must(len(plain) == 1, f'style blocks changed: {len(plain)} plain')
must('theme-review-toggle-style' in by_id, 'review toggle block not found')
css = plain[0]
R = '.integrations-main'
reps = [
    ('  *, *::before, *::after { box-sizing: border-box; }', f'  {R}, {R} *, {R} *::before, {R} *::after {{ box-sizing: border-box; }}'),
    ('  html, body { margin: 0; padding: 0; }\n', ''),
    ('  body {\n    background: var(--sc-ground);', f'  {R} {{\n    line-height: normal;   /* the staging page is browser-normal; Tailwind\'s base 1.5 makes unset blocks taller */\n    background: var(--sc-ground);'),
    # :where() keeps the bare rule's (0,0,1) specificity — `.integrations-main a` would outrank `.hero-btn-primary` and ink the buttons
    ('  a { color: inherit; text-decoration: none; }', f'  :where({R}) a {{ color: inherit; text-decoration: none; }}'),
]
for a, b in reps:
    must(css.count(a) == 1, 'page reset changed: ' + a.strip()[:40])
    css = css.replace(a, b)
must(not re.search(r'(?m)^\s*(body|html|:root|a|\*)\s*[{,]', css), 'bare body/html/:root/a/* rule left in the page css')
must('url(logos/' not in css and '../' not in css, 'relative asset in the page css')
hero_blocks = ''.join(f'\n<style>{by_id[k]}</style>\n' for k in ('hero-stack-standard', 'hero-stack-phone'))

# ── markup: hero -> the divider before the site footer ──
m0 = h.index('<section class="hero-section">'); m1 = h.index('<!-- Subtle divider between')
markup = h[m0:m1].rstrip() + '\n'
must('<script' not in markup and '<style' not in markup and 'mkt-nav' not in markup and 'site-footer' not in markup, 'unexpected chrome inside the markup slice')
must('id="featured-grid"' in markup and 'id="catalog-grid"' in markup and 'id="contact"' in markup, 'grids / contact anchor')

# ── page JS: the data/render script + the hero dither; NOT the shimmer or the review toggle ──
scripts = re.findall(r'<script>(.*?)</script>', h, re.S)
page_js = [s for s in scripts if 'Integration data' in s[:200]]
dither = [s for s in scripts if 'Hero dither' in s[:200]]
must(len(page_js) == 1 and len(dither) == 1, f'page scripts: data {len(page_js)}, dither {len(dither)}')
must(len([s for s in scripts if 'Bolt strip shimmer' in s[:200]]) == 1, 'shimmer script (dropped knowingly) not found')
js = page_js[0]
must(js.count("url(logos/") == 1, 'logo url builder changed')
js = js.replace("url(logos/", f"url({ASSETS}logos/")
must("data-theme-set" not in js and 'bolt-shimmer' not in js, 'review / shimmer code inside the page script')

HUBSPOT = r'''
/* ── Footer email strip → HubSpot (the enterprise page's wiring: same portal,
      form and fields). The prototype's button did nothing. ──────────────── */
(function () {
  var HUBSPOT_PORTAL = '45403856';
  var HUBSPOT_FORM = '20f65973-575f-4229-aa78-666ff2b5f2f3';
  var ENDPOINT = 'https://api.hsforms.com/submissions/v3/integration/submit/' + HUBSPOT_PORTAL + '/' + HUBSPOT_FORM;
  function submitToHubspot(email) {
    var hutk = (document.cookie.match(/hubspotutk=([^;]+)/) || [])[1];
    var context = { pageUri: window.location.href, pageName: document.title };
    if (hutk) context.hutk = hutk;
    return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: [{ name: 'email', value: email }], context: context }) })
      .then(function (r) { return r.ok; });
  }
  function setButtonText(button, text) {
    button.querySelectorAll('.btn-text-inner span').forEach(function (s) { s.textContent = text; });
  }
  function showStatus(row, message, type) {
    var anchor = row.closest('.card-form-strip') || row;
    if (type === 'success') {
      var sib = anchor.nextElementSibling;
      if (sib && sib.classList && sib.classList.contains('ep-form-status')) sib.remove();
      if (row.style.position !== 'relative') row.style.position = 'relative';
      var overlay = row.querySelector('.ep-form-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'ep-form-overlay';
        overlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--sc-ink,#000);color:var(--sc-ground,#fff);font-size:15px;font-weight:500;text-align:center;padding:0 16px;z-index:5;border-radius:inherit;';
        row.appendChild(overlay);
      }
      overlay.textContent = message;
      return;
    }
    var existing = row.querySelector('.ep-form-overlay');
    if (existing) existing.remove();
    var el = anchor.nextElementSibling;
    if (!el || !el.classList || !el.classList.contains('ep-form-status')) {
      el = document.createElement('div');
      el.className = 'ep-form-status';
      el.style.cssText = 'display:block;width:100%;margin:14px auto 0;font-size:15px;font-weight:500;text-align:center;line-height:1.4;';
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
    }
    el.textContent = message;
    el.style.color = type === 'error' ? '#f87171' : 'var(--sc-text-sub, #bbb)';
  }
  function handleSubmit(row, input, button) {
    var email = (input.value || '').trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { showStatus(row, 'Please enter a valid email.', 'error'); input.focus(); return; }
    var span = button.querySelector('.btn-text-inner span');
    var originalText = span ? span.textContent : 'Get Started';
    button.disabled = true; setButtonText(button, 'Submitting…');
    submitToHubspot(email).catch(function () { return false; }).then(function (ok) {
      setButtonText(button, ok ? 'Thanks!' : 'Try again');
      showStatus(row, ok ? "Thanks! We'll be in touch soon." : 'Submission failed. Please try again.', ok ? 'success' : 'error');
      if (ok) {
        input.value = '';
        try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'hubspot_form_submit', form_location: 'footer-section' }); } catch (_) {}
      }
      setTimeout(function () { button.disabled = false; setButtonText(button, originalText); }, 2500);
    });
  }
  function wireRow(row) {
    if (!row || row.dataset.wired) return;
    var input = row.querySelector('input[type="email"]'); var button = row.querySelector('.hero-cta-button');
    if (!input || !button) return;
    row.dataset.wired = '1'; button.setAttribute('type', 'button');
    button.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); handleSubmit(row, input, button); }, true);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(row, input, button); } });
  }
  document.querySelectorAll('.hero-form-row').forEach(wireRow);
})();
'''
js = js.rstrip() + '\n' + HUBSPOT

# ── shared CSS without the token layer (palette x3 + type families) ──
t0 = shared_css.index(':root,\n.sc-on-light {'); t0 = shared_css.rfind('/*', 0, t0) if shared_css.rfind('*/', 0, t0) > shared_css.rfind('}', 0, t0) else t0
t1 = shared_css.index('--sc-label-weight'); t1 = shared_css.index('\n}', t1) + 2
heads = [' '.join(x.split()) for x in re.findall(r'([^{}]+)\{', re.sub(r'/\*.*?\*/', '', shared_css[t0:t1], flags=re.S))]
must(all(re.fullmatch(r'(@media \(prefers-color-scheme: dark\)|:root(:not\(\[data-theme="light"\]\))?(\[data-theme="dark"\])?(, ?\.sc-on-(light|dark))?)', x) for x in heads), f'token span holds non-token rules: {heads}')
shared_css_out = shared_css[:t0].rstrip() + '\n\n/* (the --sc-* token layer lives in src/styles/sc-tokens.css, loaded by Layout) */\n' + shared_css[t1:]
must('--sc-ink-rgb:' not in shared_css_out, 'token definitions left in shared css')
n0 = shared_js.index('/* ═══ REVIEW-ONLY: page navigator'); shared_js_out = shared_js[:n0].rstrip() + '\n'
must('sc-pages' not in shared_js_out, 'navigator left in shared js')

body = f'''<!-- ============================================================================
     INTEGRATIONS — page body.
     GENERATED from the garyliusf/Enterprise sandbox
     (marketing/integrations/index.html) by tools/build-integrations-body.py —
     change the staging page and regenerate. Order mirrors the sandbox:
     page CSS → markup → shared component CSS (wins the cascade) → page JS →
     shared JS. Nav, footer and wordmark come from Layout. Light-capable: dark
     rules are the base, light ones are keyed on html[data-theme="light"]; the
     --sc-* tokens come from sc-tokens.css.
     ============================================================================ -->

<style>{css}</style>
{hero_blocks}
<style>
  /* Production's footer has no divider element of its own: the section carries
     the 88px button→line standard (CLAUDE.md footer stack). */
  .integrations-main .footer-section {{ padding-bottom: 88px; }}
  @media (max-width: 768px) {{ .integrations-main .footer-section {{ padding-bottom: 88px; }} }}
</style>

{markup}
<!-- ── Shared components (buttons, eyebrows, FAQ) — inlined; loads after the page CSS so it wins the cascade ── -->
<style>
{shared_css_out}</style>

<script>{js}</script>
<script>{dither[0]}</script>
<!-- ── Shared component JS (scroll reveals, pixel-fill hovers) ── -->
<script>
{shared_js_out}</script>
'''
local = {x for x in set(re.findall(r'''(?:src|href|poster)=["']([^"'#][^"']*)["']''', body)) | set(re.findall(r'''url\(["']?([^"')]+)["']?\)''', body)) if not x.startswith(('http', 'data:', '//', 'mailto:')) and re.fullmatch(r'[\w./-]+', x)}
must(not [x for x in local if not x.startswith('/')], f'relative asset references: {sorted(x for x in local if not x.startswith("/"))}')
for slug in re.findall(r"'([a-z0-9]+)'(?=,|\s*}|\s*\n)", js[js.index('var ICONS'):js.index('var BRAND_HEX')]):
    must((ROOT / 'marketing/integrations/logos' / f'{slug}.svg').exists(), f'logo missing in the sandbox: {slug}')
out.write_text(body)
print(f'wrote {out}: {len(body):,} chars; markup {len(markup):,}, page css {len(css):,}, page js {len(js):,}')
