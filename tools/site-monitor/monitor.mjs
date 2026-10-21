// Weekly audit of the live bolt.new marketing pages.
//
//   node monitor.mjs            full run (every page × 1440/834/390 × light/dark + Lighthouse)
//   node monitor.mjs --quick    3 pages, desktop + phone, light only, no Lighthouse
//   node monitor.mjs --only /enterprise,/pricing
//   node monitor.mjs --no-lighthouse
//
// Writes out/report.json (every finding, with a stable fingerprint for
// de-duplication) and out/summary.md. Exits 0 even when it finds problems:
// triage and filing are the caller's job (see README.md).

import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const QUICK = flag('--quick');
const RUN_LH = !QUICK && !flag('--no-lighthouse');
const cfg = JSON.parse(await readFile(new URL('./pages.json', import.meta.url), 'utf8'));
const ORIGIN = cfg.origin;
const OUT = new URL('./out/', import.meta.url);
await mkdir(OUT, { recursive: true });

const findings = [];
const metrics = [];
const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);

// groupKey ignores the page / viewport / theme, so one Linear issue can cover
// a template-level problem seen on many pages. fingerprint is per page.
function add(f) {
  const tmplPath = f.page?.startsWith('/use-cases/') ? '/use-cases/*' : f.page;
  f.groupKey = sha([f.category, f.rule, f.selector || f.target || ''].join('|'));
  f.fingerprint = sha([f.category, f.rule, tmplPath, f.selector || f.target || ''].join('|'));
  const prev = findings.find((x) => x.fingerprint === f.fingerprint);
  if (prev) {
    for (const k of ['viewports', 'themes', 'pages']) prev[k] = [...new Set([...(prev[k] || []), ...(f[k] || [])])];
    return;
  }
  findings.push(f);
}

// ---------------------------------------------------------------- page list
function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
}

async function rotatingSlice() {
  const r = cfg.rotating;
  const html = await (await fetch(ORIGIN + r.indexPath)).text();
  const re = new RegExp(r.hrefPattern);
  const slugs = [...new Set([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => re.test(h)))].sort();
  if (!slugs.length) return [];
  const start = (isoWeek() * r.perRun) % slugs.length;
  return Array.from({ length: Math.min(r.perRun, slugs.length) }, (_, i) => slugs[(start + i) % slugs.length]);
}

let pages;
if (opt('--only')) pages = opt('--only').split(',');
else if (QUICK) pages = cfg.core.slice(0, 3);
else pages = [...cfg.core, ...(await rotatingSlice())];

const viewports = QUICK ? ['desktop', 'phone'] : Object.keys(cfg.viewports);
const themes = QUICK ? ['light'] : cfg.themes;

// ------------------------------------------------- in-page design checks
// Values from CLAUDE.md (design standards). Each check returns raw
// observations; severity is assigned below.
function designProbe(vpName) {
  const out = [];
  const vw = document.documentElement.clientWidth;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0;
  };
  const sel = (el) => {
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 4; n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(`${s}#${n.id}`); break; }
      const cls = [...n.classList].filter((c) => !/^(is-|word|btn-pixelized|dsa-)/.test(c)).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const inChrome = (el) => !!el.closest('nav, header, .mkt-nav, .mkt-nav-mobile, [class*="mkt-nav"]');
  const scrollsX = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX) && n.scrollWidth > n.clientWidth + 1) return true;
      if (cs.position === 'fixed' || /marquee|logo|rail|train|slider|track/i.test(n.className)) return true;
    }
    return false;
  };

  // 1. Horizontal page scroll
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1) {
    const culprits = [...document.querySelectorAll('body *')]
      .filter((el) => { const r = el.getBoundingClientRect(); return r.right > vw + 1 && r.width > 0 && !scrollsX(el); })
      .slice(0, 3).map(sel);
    out.push({ rule: 'horizontal-scroll', detail: `scrollWidth ${sw}px > viewport ${vw}px`, selector: culprits[0] || 'html', extra: culprits });
  }

  // 2. Marketing buttons: 52px tall, 6px radius (form submit: right side only), 16px type on phones
  for (const b of document.querySelectorAll('main .hero-btn-primary, main .hero-btn-ghost, main .hero-cta-button, .footer-cta-btn')) {
    if (!visible(b) || inChrome(b) || b.closest('.re-prompt-shell, .catalog-card-actions')) continue;
    const cs = getComputedStyle(b);
    const h = b.getBoundingClientRect().height;
    const attached = b.matches('.hero-cta-button') || !!b.closest('form, .hero-form-row, .card-form-strip');
    const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(parseFloat);
    const want = attached ? [0, 6, 6, 0] : [6, 6, 6, 6];
    if (Math.abs(h - 52) > 1) out.push({ rule: 'button-height', detail: `${h.toFixed(1)}px, standard is 52px`, selector: sel(b) });
    if (radii.some((r, i) => Math.abs(r - want[i]) > 0.5)) out.push({ rule: 'button-radius', detail: `${radii.join('/')}px, standard is ${want.join('/')}px`, selector: sel(b) });
    if (vpName === 'phone' && !attached && Math.abs(parseFloat(cs.fontSize) - 16) > 0.5) out.push({ rule: 'button-phone-type', detail: `${cs.fontSize}, phones use 16px`, selector: sel(b) });
  }

  // 3. Section H2 size curve: clamp(40px, 4vw, 52px) desktop / clamp(28px, 8vw, 40px) at ≤768
  const expectH2 = vw <= 768 ? Math.min(40, Math.max(28, vw * 0.08)) : Math.min(52, Math.max(40, vw * 0.04));
  for (const h of document.querySelectorAll('.section-headline, .sc-section-h2')) {
    if (!visible(h)) continue;
    const fs = parseFloat(getComputedStyle(h).fontSize);
    if (Math.abs(fs - expectH2) > 1) out.push({ rule: 'h2-size', detail: `${fs.toFixed(1)}px, the canonical curve gives ${expectH2.toFixed(1)}px at ${vw}px`, selector: sel(h) });
  }

  // 4. 16px gutter floor on phones (text blocks only; rails, marquees and scrollers are excluded)
  if (vpName === 'phone') {
    for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, main li')) {
      if (!visible(el) || scrollsX(el) || !el.textContent.trim()) continue;
      const r = el.getBoundingClientRect();
      if (r.left < 15.5 || r.right > vw - 15.5) {
        out.push({ rule: 'gutter-floor', detail: `text box spans ${r.left.toFixed(0)}–${r.right.toFixed(0)}px in a ${vw}px viewport, the floor is 16px each side`, selector: sel(el) });
      }
    }
  }

  // 5. Eyebrows must not use an opacity variant of the brand blue
  for (const e of document.querySelectorAll('.section-eyebrow, .feat-eyebrow, .ms-faq-eyebrow, .footer-eyebrow, .success-eyebrow')) {
    if (!visible(e)) continue;
    const c = getComputedStyle(e).color;
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (m && m[1].split(',').length === 4 && parseFloat(m[1].split(',')[3]) < 1) out.push({ rule: 'eyebrow-opacity', detail: `color ${c}; eyebrows are solid, never an opacity variant`, selector: sel(e) });
  }

  // 6. Images without alt attribute at all (axe reports these too, but this also catches CSS-hidden-later ones)
  return { out, theme: document.documentElement.getAttribute('data-theme') };
}

// ------------------------------------------------------------- crawl loop
const browser = await chromium.launch();
const links = new Map(); // href -> Set(pages)

async function auditPage(path, vpName, theme) {
  const vp = cfg.viewports[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1,
    colorScheme: theme, reducedMotion: 'reduce',
    userAgent: vp.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1 bolt-site-monitor'
      : undefined,
  });
  const page = await ctx.newPage();
  const base = { page: path, viewports: [vpName], themes: [theme] };
  const errs = [];
  page.on('pageerror', (e) => errs.push({ rule: 'js-exception', target: String(e.message).slice(0, 200) }));
  page.on('console', (m) => { if (m.type() === 'error') errs.push({ rule: 'console-error', target: m.text().slice(0, 200) }); });
  page.on('response', async (res) => {
    const url = res.url();
    const type = res.request().resourceType();
    if (res.status() >= 400 && /^https:\/\/([a-z0-9-]+\.)*bolt\.new\//.test(url)) {
      errs.push({ rule: 'failed-request', target: `${res.status()} ${url.replace(ORIGIN, '')}` });
    }
    // Poisoned edge cache: a stylesheet or script served as HTML (see the pages-asset-cache-poisoning note)
    if (url.startsWith(ORIGIN) && (type === 'stylesheet' || type === 'script') && /text\/html/.test(res.headers()['content-type'] || '')) {
      errs.push({ rule: 'asset-served-as-html', target: url.replace(ORIGIN, '') });
    }
  });

  try {
    const resp = await page.goto(ORIGIN + path, { waitUntil: 'load', timeout: 60000 });
    if (!resp || resp.status() >= 400) {
      add({ ...base, category: 'links', severity: 'high', rule: 'page-down', target: path, detail: `HTTP ${resp?.status()}` });
      return;
    }
    // Walk the page so scroll-triggered reveals and lazy media settle before measuring.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);

    const { out, theme: stamped } = await page.evaluate(designProbe, vpName);
    // Record the theme the page actually rendered: some pages ignore the OS
    // preference (dark-only or light-only), so both passes land on one theme.
    if (stamped && stamped !== theme) base.themes = [stamped];
    for (const o of out) {
      add({ ...base, category: 'design', severity: o.rule === 'horizontal-scroll' ? 'high' : 'medium', ...o });
    }

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .exclude('iframe')
      .analyze();
    for (const v of axe.violations) {
      for (const n of v.nodes.slice(0, 5)) {
        add({
          ...base, category: 'a11y',
          severity: { critical: 'high', serious: 'high', moderate: 'medium', minor: 'low' }[v.impact] || 'medium',
          rule: v.id, selector: n.target.join(' '), detail: `${v.help}. ${n.failureSummary?.split('\n').slice(1, 3).join(' ') || ''}`.trim(),
          helpUrl: v.helpUrl, html: n.html.slice(0, 240),
        });
      }
    }

    for (const e of errs) add({ ...base, category: 'runtime', severity: e.rule === 'console-error' ? 'medium' : 'high', ...e });

    if (vpName === viewports[0] && theme === themes[0]) {
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
      for (const h of hrefs) {
        if (!/^https?:/.test(h)) continue;
        const clean = h.split('#')[0];
        if (!links.has(clean)) links.set(clean, new Set());
        links.get(clean).add(path);
      }
    }
  } catch (e) {
    add({ ...base, category: 'runtime', severity: 'high', rule: 'audit-failed', target: path, detail: String(e.message).slice(0, 200) });
  } finally {
    await ctx.close();
  }
}

for (const path of pages) {
  for (const vpName of viewports) for (const theme of themes) {
    process.stdout.write(`audit ${path} ${vpName} ${theme}\n`);
    await auditPage(path, vpName, theme);
  }
}

// ------------------------------------------------------------- link check
// External hosts that block bots (LinkedIn 999, X 403, rate limits) are
// reported as unverified, not broken.
async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 bolt-site-monitor' } });
      if (r.status < 400 || method === 'GET') return r.status;
    } catch (e) { if (method === 'GET') return 0; }
  }
}
const queue = [...links.keys()];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    const status = await check(url);
    const internal = url.startsWith(ORIGIN);
    const blocked = !internal && [0, 401, 403, 429, 999].includes(status);
    if (status >= 400 || status === 0) {
      add({
        category: 'links', severity: blocked ? 'low' : (internal ? 'high' : 'medium'),
        rule: blocked ? 'link-unverified' : 'broken-link', target: url, detail: `HTTP ${status || 'timeout'}`,
        pages: [...links.get(url)], page: [...links.get(url)][0], viewports: [], themes: [],
      });
    }
  }
}));

// ------------------------------------------------------------- Lighthouse
// Lab numbers from a cloud runner are noisy, so only clearly poor values are
// flagged; the raw numbers go into metrics[] for week-over-week comparison.
if (RUN_LH) {
  const { default: lighthouse } = await import('lighthouse');
  const { launch } = await import('chrome-launcher');
  const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
  for (const path of pages.filter((p) => cfg.core.includes(p))) {
    for (const formFactor of ['mobile', 'desktop']) {
      process.stdout.write(`lighthouse ${path} ${formFactor}\n`);
      try {
        const settings = formFactor === 'desktop'
          ? { formFactor, screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } }
          : { formFactor };
        const r = await lighthouse(ORIGIN + path, { port: chrome.port, output: 'json', onlyCategories: ['performance'], logLevel: 'error' }, { extends: 'lighthouse:default', settings });
        const a = r.lhr.audits;
        const m = {
          page: path, formFactor,
          score: Math.round((r.lhr.categories.performance.score || 0) * 100),
          lcp: Math.round(a['largest-contentful-paint'].numericValue),
          cls: +a['cumulative-layout-shift'].numericValue.toFixed(3),
          tbt: Math.round(a['total-blocking-time'].numericValue),
          weightKB: Math.round(a['total-byte-weight'].numericValue / 1024),
        };
        metrics.push(m);
        const poor = [];
        if (m.lcp > 4000) poor.push(`LCP ${(m.lcp / 1000).toFixed(1)}s (poor > 4s)`);
        if (m.cls > 0.25) poor.push(`CLS ${m.cls} (poor > 0.25)`);
        if (m.tbt > 600) poor.push(`TBT ${m.tbt}ms (poor > 600ms)`);
        for (const p of poor) {
          add({ category: 'perf', severity: 'medium', rule: p.split(' ')[0].toLowerCase() + '-poor', target: formFactor, page: path, detail: p, viewports: [formFactor], themes: [] });
        }
      } catch (e) {
        metrics.push({ page: path, formFactor, error: String(e.message).slice(0, 160) });
      }
    }
  }
  await chrome.kill();
}
await browser.close();

// ---------------------------------------------------------------- output
const order = { high: 0, medium: 1, low: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.category.localeCompare(b.category));
const report = { generatedAt: new Date().toISOString(), origin: ORIGIN, pages, viewports, themes, findings, metrics };
await writeFile(new URL('report.json', OUT), JSON.stringify(report, null, 2));

const count = (s) => findings.filter((f) => f.severity === s).length;
let md = `# bolt.new site monitor, ${report.generatedAt.slice(0, 10)}\n\n`;
md += `${pages.length} pages × ${viewports.join('/')} × ${themes.join('/')}. Findings: **${count('high')} high**, ${count('medium')} medium, ${count('low')} low.\n\n`;
for (const cat of ['a11y', 'design', 'runtime', 'links', 'perf']) {
  const fs = findings.filter((f) => f.category === cat);
  if (!fs.length) continue;
  md += `## ${cat} (${fs.length})\n\n`;
  for (const f of fs.slice(0, 60)) {
    md += `- **${f.severity}** \`${f.rule}\` ${f.page || ''} [${(f.viewports || []).join(',')}${f.themes?.length ? ' ' + f.themes.join(',') : ''}] ${f.selector || f.target || ''}: ${f.detail || ''} \`fp:${f.fingerprint}\`\n`;
  }
  md += '\n';
}
if (metrics.length) {
  md += `## Core Web Vitals (lab)\n\n| Page | Form | Score | LCP | CLS | TBT | KB |\n|---|---|---|---|---|---|---|\n`;
  for (const m of metrics) md += m.error ? `| ${m.page} | ${m.formFactor} | error | | | | |\n` : `| ${m.page} | ${m.formFactor} | ${m.score} | ${(m.lcp / 1000).toFixed(2)}s | ${m.cls} | ${m.tbt}ms | ${m.weightKB} |\n`;
}
await writeFile(new URL('summary.md', OUT), md);
console.log(`\n${findings.length} findings (${count('high')} high). Wrote out/report.json and out/summary.md`);
