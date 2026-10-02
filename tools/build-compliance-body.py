"""Build bolt-public-pages/src/content/compliance-body.html from the sandbox page
(garyliusf/Enterprise marketing/compliance.html + shared-components.css/js).
Re-run after changing the sandbox page; do not hand-edit the output."""
import re
SB='/Users/garyliu/Desktop/Enterprise/marketing/'
OUT='/Users/garyliu/Projects/bolt-public-pages/src/content/compliance-body.html'
page=open(SB+'compliance.html').read().split('\n')
def L(a,b): return '\n'.join(page[a-1:b])
def find(pat,start=1):
    for i in range(start-1,len(page)):
        if re.search(pat,page[i]): return i+1
    raise SystemExit('not found: '+pat)
# --- page CSS
s0=find(r'^<style>$',200); s1=find(r'^</style>$',s0)
css=L(s0+1,s1-1)
css=css.replace("  * { box-sizing: border-box; margin: 0; padding: 0; }","  /* the sandbox's global reset, scoped to the page body so it cannot touch the site chrome */\n  .compliance-main, .compliance-main * { box-sizing: border-box; margin: 0; padding: 0; }",1)
assert '.compliance-main *' in css
h0=find(r'<style id="hero-stack-standard">'); h1=find(r'^</style>$',h0)
herostack=L(h0+1,h1-1)
# --- markup: hero .. footer CTA (nav, footer columns and wordmark come from Layout)
m0=find(r'^<section class="hero-section">'); m1=find(r'<!-- Subtle divider between')
markup=L(m0,m1-1).rstrip()
assert markup.count('<section')==markup.count('</section>'), (markup.count('<section'),markup.count('</section>'))
# --- page JS
j0=find(r'^<script>$',m1); shim=find(r'^// ── Bolt strip shimmer',j0); dots=find(r'^// ── Hero pixel dots',shim); j1=find(r'^</script>$',dots)
js=[L(j0+1,shim-1), L(dots,j1-1)]
p=j1
blocks=[]
while True:
    try: a=find(r'^<script>$',p)
    except SystemExit: break
    b=find(r'^</script>$',a); blocks.append((a,b)); p=b
for a,b in blocks:
    body=L(a+1,b-1)
    if 'data-theme-set' in body or 'sc-page-nav' in body: continue   # review toggle / Pages navigator
    js.append(body)
shared_css=open(SB+'shared-components.css').read().split('\n')
t=[i for i,l in enumerate(shared_css) if l.startswith('/* ─── DESIGN TOKENS')][0]
shared_css='\n'.join(shared_css[t:])
shared_js=open(SB+'shared-components.js').read()
# strip the review-only page navigator (last module) and the wordmark shimmer
# module (Layout's Footer renders its own FooterWordmark)
i=shared_js.index('/* ═══ REVIEW-ONLY: page navigator'); shared_js=shared_js[:i].rstrip()+chr(10)
i=shared_js.index("bolt-shimmer-canvas"); a0=shared_js.rfind('/* ====',0,i); a1=shared_js.index('})();',i)+5
shared_js=shared_js[:a0]+'/* (wordmark shimmer module removed: Layout Footer renders FooterWordmark) */'+shared_js[a1:]
assert 'sc-page-nav' not in shared_js and 'bolt-shimmer-canvas' not in shared_js
# the footer wordmark belongs to Layout's Footer (FooterWordmark): drop the sandbox's
# own .bolt-image-wrap / #bolt-shimmer-canvas rules so they cannot restyle it
def drop_wordmark(blob):
    keep=[]
    for line in blob.split(chr(10)):
        if re.match(r'^\s*\.bolt-image-wrap[ ,{]',line) and line.rstrip().endswith('}'): continue
        keep.append(line)
    return chr(10).join(keep)
css=drop_wordmark(css); shared_css=drop_wordmark(shared_css)
assert not re.search(r'^\s*\.bolt-image-wrap[ ,{]',css+shared_css,flags=re.M)
out=f'''<!-- ============================================================================
     COMPLIANCE — page body. GENERATED: do not hand-edit.
     Built from the garyliusf/Enterprise sandbox (marketing/compliance.html +
     shared-components.css / .js) by build-compliance.py; change the sandbox
     page and re-run.

     Self-contained by design, matching careers-body.html and
     get-started-body.html: this repo has no shared-components.css/js, so both
     are inlined. Order mirrors the sandbox — page CSS, markup, then the shared
     component CSS (it must win the cascade), page JS, shared JS.

     Nav, footer columns and the wordmark are absent on purpose: Layout.astro
     supplies Header and Footer. The --sc-* theme tokens come from
     src/styles/sc-tokens.css (loaded by Layout theme="light"); only the two
     spacing tokens (--sub-to-cta, --cta-min-w) are defined here. The sandbox's
     review toggle, Pages navigator and its own wordmark shimmer are stripped.
     ============================================================================ -->

<style>
{css}

/* Hero stack standard (the /solutions hero is the reference): H1→subtitle 20px
   at every width; subtitle→CTA 32px, 24px on phones */
{herostack}

/* CTA→footer line = 88px, the staging standard: production's footer has no
   divider element with its own margin, so the section carries all of it */
html .footer-section {{ padding-bottom: 88px; }}
</style>

{markup}

<style>
/* ─── shared-components.css (sandbox canonical components), from DESIGN TOKENS on ─── */
{shared_css}
</style>

<script>
{(chr(10)+'</script>'+chr(10)+'<script>'+chr(10)).join(js)}
</script>

<script>
/* ─── shared-components.js (sandbox canonical component JS) ─── */
{shared_js}
</script>
'''
open(OUT,'w').write(out)
print('written',OUT,len(out.split(chr(10))),'lines; js blocks',len(js),'; sections',markup.count('<section'))
for bad in ('bolt-shimmer-canvas','sc-theme-switch','sc-page-nav','shared-nav-footer','site-footer-cols','../images'):
    print('  contains',bad,':',bad in out)
