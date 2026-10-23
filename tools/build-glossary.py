#!/usr/bin/env python3
"""Build the glossary sandbox pages from one term list.

  marketing/glossary/index.html          the A-Z index (template 1)
  marketing/glossary/<slug>/index.html   one page per term (template 2)

Chrome (head, nav, footer CTA, site footer, wordmark, theme scripts) is lifted
from marketing/use-cases/index.html at build time, so the glossary follows that
page's standards without carrying a third inline copy to hand-edit. Every term
row and definition is written into the HTML (not injected by JS) so crawlers
see the full list; the index JS only filters.

Re-run after editing TERMS or the templates:  python3 tools/build-glossary.py
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'marketing', 'use-cases', 'index.html')
OUT = os.path.join(ROOT, 'marketing', 'glossary')
SITE = 'https://bolt.new/glossary'

# name | article | category | definition  (article: '', 'a', 'an' — used in
# the "What is ...?" H1 and the term page's lead sentence)
TERMS_RAW = """
301 redirect|a|web|An instruction that permanently sends anyone requesting one URL to a different one, and tells search engines to transfer the old page's standing to the new address.
404 error page|a|web|The response a server returns when a visitor requests a page that does not exist at that address.
A/B testing||biz|Showing two versions of a page or feature to different groups of visitors at the same time and measuring which one produces more of the outcome you want.
Abandoned cart|an|biz|An order a shopper began by adding items but left without completing checkout.
Above the fold||design|The part of a web page visible on screen before a visitor scrolls.
AI agent|an|ai|Software that uses an AI model to plan and carry out multi-step tasks on its own, such as writing code, running it, and fixing what breaks.
AI app builder|an|build|A tool that turns a plain-language description into a working application, generating the interface, logic, and database for you.
API|an|build|A set of rules that lets one piece of software request data or actions from another, like an app asking a payment service to charge a card.
Authentication||build|The process of confirming who a user is, usually with a password, a one-time code, or a sign-in from another account like Google.
Backend|a|build|The part of an application that runs on a server, storing data, enforcing rules, and answering requests from the screens users see.
Bounce rate||biz|The share of visitors who leave a site after viewing only one page.
Call to action (CTA)|a|biz|A button or link that tells a visitor the next step to take, such as Sign Up, Book a Demo, or Buy Now.
Client portal|a|biz|A private, signed-in area of a website where each customer can see their own documents, invoices, and project status.
CMS (content management system)|a|web|Software that lets people create, edit, and publish website content without touching code.
Context engineering||ai|The practice of choosing what information an AI model sees alongside a request, such as files, rules, and examples, so its answer fits the task.
Context window|a|ai|The maximum amount of text, measured in tokens, that an AI model can consider at once, including the prompt and its own reply.
Conversion rate||biz|The percentage of visitors who complete a goal, such as buying, signing up, or booking a call.
CRM (customer relationship management)|a|biz|A system for tracking every contact, conversation, and deal a business has with its customers and leads.
Database|a|build|An organized store of information, such as users, orders, or bookings, that an application reads from and writes to.
Deployment||build|The step that takes an application from your workspace and puts it on a server so anyone with the link can use it.
Domain name|a|web|The human-readable address of a website, such as bolt.new, that points visitors to the server hosting it.
Edge function|an|build|A small piece of server code that runs in data centers close to the visitor, so responses arrive faster.
Environment variable|an|build|A setting stored outside the code, such as an API key, that an app reads at run time so secrets never sit in the source.
Frontend|a|build|The part of an application people see and click, built from the pages, layouts, and interactions that run in the browser.
Full-stack app|a|build|An application that includes both the frontend people use and the backend that stores data and runs logic.
Funnel|a|biz|The series of steps a visitor takes toward a goal, such as visiting, signing up, and paying, with some dropping off at each step.
Hallucination|a|ai|An answer from an AI model that sounds confident but is false or made up.
Hosting||web|The service that keeps a website or app on a server connected to the internet so people can reach it at any time.
Integration|an|build|A connection between two pieces of software that lets them share data or trigger actions, like syncing new orders to a spreadsheet.
Internal tool|an|biz|Software a company builds for its own team, such as an admin panel, inventory tracker, or approval workflow.
Landing page|a|biz|A single web page built for one goal, such as collecting sign-ups for a launch or selling one product.
Large language model (LLM)|a|ai|An AI model trained on large amounts of text that can read, write, summarize, and generate code from plain-language instructions.
Lead magnet|a|biz|Something useful offered free, such as a checklist or template, in exchange for a visitor's email address.
Meta description|a|web|The short summary of a page written in its code, which search engines often show under the page title in results.
MVP (minimum viable product)|an|build|The simplest version of a product that still solves the core problem, built to learn from real users before investing more.
No-code||build|A way of building software through visual tools or plain language instead of writing programming code by hand.
Onboarding||biz|The first steps a new user takes in a product, designed to get them to their first success quickly.
Open source||build|Software whose source code is published so anyone can read, use, change, and share it.
Payment gateway|a|biz|The service that securely sends a customer's card details to the bank and confirms whether a payment went through.
Prompt|a|ai|The instruction or question you give an AI model, written in plain language, describing what you want it to produce.
Prompt engineering||ai|The skill of wording and structuring prompts so an AI model returns more accurate and useful results.
Prototype|a|build|An early, interactive version of an idea built to test how it looks and works before building the real thing.
Rate limit|a|build|A cap on how many requests a user or app can send to a service in a set period of time.
Responsive design||design|A design that rearranges itself to fit any screen size, from a phone to a wide desktop monitor.
Row level security||build|A database rule that controls which rows each signed-in user can read or change, so customers only see their own data.
SaaS (software as a service)||biz|Software you use through a browser on a subscription, rather than installing and owning a copy.
Schema markup||web|Code added to a page that describes its content to search engines in a standard format, which can earn richer search results.
SEO (search engine optimization)||web|The work of making a site easier for search engines to understand and rank, so more people find it through search.
Serverless||build|A way of running backend code where the hosting provider manages the servers and you pay only when the code runs.
SSL certificate|an|web|A file that lets a website use an encrypted HTTPS connection, shown as a padlock in the browser.
Staging environment|a|build|A private copy of an app used to test changes before they go live to real users.
Template|a|build|A ready-made starting point for an app or site that already works, which you customize instead of starting from nothing.
Token|a|ai|A small chunk of text, often part of a word, that AI models read and write; usage and limits are counted in tokens.
UI (user interface)|a|design|Everything a person sees and interacts with on screen, including buttons, menus, forms, and text.
Uptime||web|The share of time a website or service is online and working, usually given as a percentage like 99.9%.
UX (user experience)||design|How easy and pleasant a product is to use from start to finish, beyond how it looks.
Version control||build|A system that records every change to a project's files so you can see who changed what and roll back mistakes.
Vibe coder|a|ai|Someone who builds software mainly by describing what they want to an AI and refining the result, rather than writing code line by line.
Vibe coding||ai|Building software by describing what you want in plain language and letting AI write the code, then steering it by reacting to what it builds.
Web app|a|build|An application that runs in a web browser, so people can use it from any device without installing anything.
Webhook|a|build|An automatic message one app sends to another the moment something happens, like a new payment or a form submission.
White label software||biz|A product built by one company and sold under another company's brand, so the reseller's customers see only the reseller.
Wireframe|a|design|A stripped-down layout sketch of a page or screen that shows structure, hierarchy, and placement before any visual design is applied.
Workflow automation||biz|The use of software to run a sequence of business steps without manual handoffs, so a trigger causes the next actions to happen on their own.
"""

# Hand-picked related terms (slugs); anything not listed falls back to five
# terms from the same category.
RELATED = {
    'vibe-coding': ['vibe-coder', 'prompt', 'prompt-engineering', 'context-engineering', 'ai-app-builder'],
    'vibe-coder': ['vibe-coding', 'prompt', 'ai-app-builder', 'no-code', 'prototype'],
    'white-label-software': ['saas', 'client-portal', 'internal-tool', 'crm', 'workflow-automation'],
    'prompt': ['prompt-engineering', 'context-engineering', 'context-window', 'token', 'vibe-coding'],
}

# Sidebar on every term page (Gary's reference: guide / use cases / templates).
READING = [
    ('Guide', 'How to create stunning websites in 2026 with Bolt.new', 'https://bolt.new/blog'),
    ('Use cases', 'What can you actually build with Bolt? 10 real use cases', 'https://bolt.new/use-cases'),
    ('Templates', 'Top 5 templates to jumpstart your next project', 'https://bolt.new/resources/templates'),
]

CATS = {'ai': 'AI & LLMs', 'build': 'Building apps', 'web': 'Web & SEO',
        'biz': 'Business & growth', 'design': 'Design'}

LETTERS = ['#'] + [chr(c) for c in range(ord('A'), ord('Z') + 1)]


def slugify(name):
    base = re.sub(r'\s*\(.*?\)', '', name).lower()       # drop "(expansion)"
    base = base.replace('/', '')
    return re.sub(r'[^a-z0-9]+', '-', base).strip('-')


def lower_name(name):
    first, _, rest = name.partition(' ')
    if len(first) > 1 and first[0].isupper() and first[1:].islower():
        first = first.lower()
    return first + ((' ' + rest) if rest else '')


def letter_of(name):
    c = name[0].upper()
    return c if c.isalpha() else '#'


TERMS = []
for line in TERMS_RAW.strip().splitlines():
    name, art, cat, d = line.split('|', 3)
    TERMS.append({'name': name, 'art': art, 'cat': cat, 'def': d,
                  'slug': slugify(name), 'letter': letter_of(name)})
TERMS.sort(key=lambda t: (LETTERS.index(t['letter']), t['name'].lower()))
BY_SLUG = {t['slug']: t for t in TERMS}
assert len(BY_SLUG) == len(TERMS), 'duplicate slug'


def h1_of(t):
    n = lower_name(t['name'])
    return 'What is ' + (t['art'] + ' ' if t['art'] else '') + n + '?'


def lead_of(t):
    """'White label software is a product built ...' with the term in bold."""
    n = lower_name(t['name'])
    subject = (t['art'].capitalize() + ' ' + n) if t['art'] else (n[0].upper() + n[1:])
    d = t['def']
    first = d.split(' ', 1)[0]
    if first in ('A', 'An', 'The') or (first[0].isupper() and first[1:].islower()):
        d = d[0].lower() + d[1:]
    if t['art']:
        return t['art'].capitalize() + ' <strong>' + esc(n) + '</strong> is ' + esc(d)
    return '<strong>' + esc(subject) + '</strong> is ' + esc(d)


def related_of(t):
    picked = [BY_SLUG[s] for s in RELATED.get(t['slug'], [])]
    same = [x for x in TERMS if x['cat'] == t['cat'] and x['slug'] != t['slug'] and x not in picked]
    i = next(i for i, x in enumerate(TERMS) if x['slug'] == t['slug'])
    same.sort(key=lambda x: abs(TERMS.index(x) - i))     # nearest neighbours first
    return (picked + same)[:6]                           # 6 = two full rows of three


def esc(s):
    return html.escape(s, quote=True)


# ── Pull the shared pieces out of the use-cases page ────────────────────────
src = open(SRC, encoding='utf-8').read()


def between(a, b, s=src):
    i = s.index(a)
    j = s.index(b, i)
    return s[i:j]


HEAD_TOP = src[:src.index('<title>')]
HEAD_REST = between('<link rel="preconnect"', '</head>')
NAV = between('<!-- ─── NAVBAR', '<!-- ─── HERO')
FOOTER = between('<!-- ─── FOOTER (verbatim', '<script src="../shared-components.js')
SCRIPTS = src[src.index('<script src="../shared-components.js'):]

# Page-specific JS of the use-cases page comes out (data, icons, card renders);
# the hover field, pixel canvases, prompt box and theme scripts stay.
SCRIPTS = SCRIPTS.replace(between('/* ── Use case data', '/* ── Card hover pixel field', SCRIPTS), '')
SCRIPTS = SCRIPTS.replace(between('/* ── Render featured grid', '/* ── Hero pixel-dots', SCRIPTS), '')

# Footer CTA: the glossary copy from the reference.
FOOTER = FOOTER.replace('>Start Building</p>', '>Stop Reading, Start Building</p>')
FOOTER = FOOTER.replace("Don't see your use case? Build it.", 'You know the words.<br>Now build the thing.')
FOOTER = re.sub(r'<p class="footer-subtitle">.*?</p>',
                '<p class="footer-subtitle">No code. No developer. No $100K project.</p>', FOOTER, flags=re.S)
# The prompt box stays the standard one (placeholder + pill row) — dropping the
# pills left the box flush with the section's clipped bottom edge.
assert 'Now build the thing' in FOOTER and 'hero-pills footer-cta-pills' in FOOTER

ARROW_PATH = "M1 7h13M9 2l5 5-5 5"

GLOSSARY_CSS = """
<style id="glossary">
/* ═══ GLOSSARY (both templates) ═════════════════════════════════════════════
   Built by tools/build-glossary.py on top of the use-cases page's styles.
   Surfaces 2px, buttons/controls 6px, pills 999px (CLAUDE.md). */
.gl-arrow { display: inline-block; width: 14px; height: 12px; flex-shrink: 0; background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 14'%3E%3Cpath d='M1 7h13M9 2l5 5-5 5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 14'%3E%3Cpath d='M1 7h13M9 2l5 5-5 5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; }
.gl-arrow--back { transform: scaleX(-1); }

/* ── INDEX: hero ─────────────────────────────────────────────────────────── */
.gl-h1-serif {
  font-family: var(--sc-font-serif); font-style: var(--sc-serif-style, italic);
  font-weight: 400; font-size: 1.06em; letter-spacing: 0;
  color: #fff;   /* white like the rest of the H1 (Gary) — the serif face alone carries the accent */
}
/* COMPACT hero (Gary, 2026-10-22): the templates catalog's browsing hero,
   not the 65vh short variant — the list is the page, so it starts sooner.
   Geometry copied from marketing/templates/index.html: 42vh/430px floor,
   copy rides high (flex-start + 20px ease), viewport-height top pad. */
html .hero-section.gl-hero {
  min-height: calc(min(42vh, 430px) + var(--sc-nav-overlap, 0px));
  min-height: calc(min(42dvh, 430px) + var(--sc-nav-overlap, 0px));
  justify-content: flex-start;
  /* bottom pad is the one deviation from templates (8–26px): this stack carries
     an eyebrow the templates hero doesn't, which pushed the subtitle onto the
     light dome's white rim. The extra room keeps it on blue (~78% of the box). */
  padding: calc(clamp(90px, calc(24px + 8.5vh), 148px) + var(--sc-nav-overlap, 0px)) 0 clamp(96px, 13vh, 150px);
}
html .gl-hero .hero-inner { margin-top: 20px; }
@media (max-width: 768px) {
  html .hero-section.gl-hero { min-height: 0; padding: calc(52px + var(--sc-nav-overlap, 0px)) 0 96px; }
}
html .gl-hero .hero-eyebrow { margin-bottom: -8px; }            /* eyebrow→H1 16 (gap 24) */
/* ── INDEX: A–Z bar (pins under the nav) ─────────────────────────────────── */
.gl-az {
  position: sticky; top: var(--gl-nav-h, 68px); z-index: 20;
  background: var(--sc-ground);
  border-top: 1px solid var(--sc-line-soft, rgba(var(--sc-ink-rgb), 0.08));
  border-bottom: 1px solid var(--sc-line-soft, rgba(var(--sc-ink-rgb), 0.08));
}
.gl-az-inner {
  width: min(1200px, calc(100vw - 160px)); margin: 0 auto;
  display: flex; align-items: center; gap: 24px; padding: 10px 0;
}
.gl-az-letters { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.gl-az-letters::-webkit-scrollbar { display: none; }
/* search lives in the pinned bar (moved out of the compact hero, as on the templates catalog) */
.gl-search {
  flex: 0 0 auto; width: 200px; height: 36px;
  display: flex; align-items: center; gap: 8px; padding: 0 14px;
  border: 1px solid rgba(var(--sc-ink-rgb), 0.12); border-radius: 999px;
  background: rgba(var(--sc-ink-rgb), 0.02);
  transition: width 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.gl-search:focus-within { width: 260px; border-color: #1488FC; box-shadow: 0 0 0 1px #1488FC; }
.gl-search svg { color: rgba(var(--sc-ink-rgb), 0.45); flex-shrink: 0; transition: color 0.2s ease; }
.gl-search:focus-within svg { color: #1488FC; }
.gl-search input {
  flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent;
  font: 400 14px/1 var(--sc-font-sans); color: var(--sc-ink); caret-color: #1488FC;
}
.gl-search input::placeholder { color: rgba(var(--sc-ink-rgb), 0.45); }
.gl-search input::-webkit-search-cancel-button { -webkit-appearance: none; }
.gl-az-btn {
  flex: 0 0 auto; min-width: 30px; height: 32px; padding: 0 6px;
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700);
  font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
  color: var(--sc-text-desc); background: none;
  border: 1px solid transparent; border-radius: 6px; cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.gl-az-btn:hover:not(:disabled) { color: var(--sc-ink); background: rgba(var(--sc-ink-rgb), 0.04); }
.gl-az-btn.is-active { color: var(--sc-blue, #1488FC); border-color: var(--sc-blue, #1488FC); background: rgba(20,136,252,0.06); }
.gl-az-btn[data-letter="all"] { padding: 0 12px; margin-right: 6px; }
.gl-az-btn:disabled { color: var(--sc-text-faint); opacity: 0.45; cursor: default; }

/* ── INDEX: term list ────────────────────────────────────────────────────── */
.gl-list-section { padding: 16px 0 clamp(80px, 12vh, 140px); }
.gl-group { scroll-margin-top: calc(var(--gl-nav-h, 68px) + 64px); }
.gl-group[hidden], .gl-row-item[hidden] { display: none; }
.gl-letter {
  display: flex; align-items: center; gap: 20px;
  margin: 40px 0 8px;
  font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700);
  font-size: var(--sc-eyebrow-size, 13px); letter-spacing: 2px; text-transform: uppercase;
  color: var(--sc-blue, #1488FC);
}
.gl-letter::after { content: ""; flex: 1; height: 1px; background: var(--sc-line-soft, rgba(var(--sc-ink-rgb), 0.08)); }
.gl-rows { list-style: none; margin: 0; padding: 0; }
.gl-row {
  position: relative; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid var(--sc-line-soft, rgba(var(--sc-ink-rgb), 0.08));
}
/* hover tint bleeds 16px past the text column; the hairlines stay on the container edge */
.gl-row::before { content: ""; position: absolute; inset: 0 -16px; border-radius: 2px; background: rgba(var(--sc-ink-rgb), 0.03); opacity: 0; transition: opacity 0.2s ease; pointer-events: none; }
.gl-row:hover::before { opacity: 1; }
.gl-row-item:last-child .gl-row { border-bottom: 0; }
.gl-term { font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.2px; color: var(--sc-ink); margin: 0 0 6px; }
.gl-def { font-size: 15px; line-height: 1.6; color: var(--sc-text-desc); margin: 0; max-width: 720px; }
.gl-row .gl-arrow { color: var(--sc-blue, #1488FC); opacity: 0; transform: translateX(-6px); transition: opacity 0.2s ease, transform 0.2s ease; }
.gl-row:hover .gl-arrow, .gl-row:focus-visible .gl-arrow { opacity: 1; transform: none; }
/* letter switch: the list fades out, swaps, fades back in (JS toggles .is-fading) */
#terms .section-inner { transition: opacity 0.28s ease, transform 0.28s ease; }
#terms .section-inner.is-fading { opacity: 0; transform: translateY(6px); transition-duration: 0.16s; }
@media (prefers-reduced-motion: reduce) { #terms .section-inner { transition: none; } }
.gl-empty {
  padding: 56px 24px; margin-top: 32px; text-align: center;
  font-size: 15px; color: var(--sc-text-desc);
  border: 1px dashed rgba(var(--sc-ink-rgb), 0.12); border-radius: 2px;
}
.gl-empty[hidden] { display: none; }
.gl-empty a { color: #1488FC; font-weight: 600; }
html[data-theme="dark"] .gl-empty a { color: #4DA6FF; }

/* Footer CTA: the section clips (overflow: hidden, for its pixel canvas) and
   its bottom pad is 0, so the light pill row's soft shadow was cut flat.
   24px of room inside, the same 24 taken off the divider's margin — pills →
   divider stays the 88px standard. */
.footer-section { padding-bottom: 24px !important; }
.footer-section + .site-footer-divider { margin-top: 64px !important; }

/* ── TERM PAGE — the template detail layout (marketing/templates/detail/index.html).
   Values copied verbatim and scoped to .detail-shell, so they can't reach the
   lifted chrome (whose .section-eyebrow / .section-header differ). */
.detail-shell {
  width: min(1200px, calc(100vw - 160px));
  margin: 0 auto;
  padding: clamp(40px, 5vh, 60px) 0 clamp(40px, 5vh, 56px);
}
.detail-shell .breadcrumb {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700);
  font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
  color: rgba(var(--sc-ink-rgb), 0.45);
  margin-bottom: 40px;
}
.detail-shell .breadcrumb a { color: var(--sc-text-desc); transition: color 0.2s ease; }
.detail-shell .breadcrumb a:hover { color: var(--sc-ink); }
.detail-shell .breadcrumb .sep { color: rgba(var(--sc-ink-rgb), 0.25); }
.detail-shell .breadcrumb .current { color: rgba(var(--sc-ink-rgb), 0.85); }
.detail-hero {
  display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 48px; align-items: start;
  margin-bottom: clamp(64px, 9vh, 120px);
}
.detail-info { display: flex; flex-direction: column; gap: 20px; }
.detail-category {
  margin: 0 0 -4px;
  font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700);
  font-size: var(--sc-eyebrow-size, 13px); letter-spacing: 2px; text-transform: uppercase;
  color: #1488FC;
}
.detail-name { font-size: 40px; font-weight: 500; letter-spacing: -0.8px; line-height: 1.05; margin: 0; color: var(--sc-ink); text-wrap: balance; }
.detail-desc { font-size: 16px; line-height: 1.6; color: rgba(var(--sc-ink-rgb), 0.65); margin: -10px 0 0; }
.detail-desc strong { color: var(--sc-ink); font-weight: 600; }
.detail-cta-row { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.detail-cta-row .hero-btn-primary,
.detail-cta-row .hero-btn-ghost { width: 100%; min-width: 0; height: 52px; }
.detail-cta-help { font-size: 13px; font-weight: 500; color: rgba(var(--sc-ink-rgb), 0.45); line-height: 1.5; margin: 2px 0 0; }
.detail-cta-help-em { color: #4DA6FF; font-weight: 600; transition: color 0.2s ease; }
.detail-cta-help-em:hover { color: #7CBFFF; }
html[data-theme="light"] .detail-cta-help-em { color: #1488FC; }
html[data-theme="light"] .detail-cta-help-em:hover { color: #0f6fd0; }
.detail-facts { margin-top: 8px; display: flex; flex-direction: column; gap: 12px; padding-top: 24px; border-top: 1px solid rgba(var(--sc-ink-rgb), 0.08); }
.detail-fact { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 13px; color: var(--sc-text-desc); }
.detail-fact b { color: rgba(var(--sc-ink-rgb), 0.85); font-weight: 500; text-align: right; }

/* Reading column (single column since 2026-10-23: the term plate was
   duplicative — SEO review). Type = template detail's prose scale. */
.gl-article { max-width: 780px; margin-bottom: clamp(64px, 9vh, 120px); }   /* the divider's offsets are tuned against this gap (it was .detail-hero's) */
.gl-article .detail-category { margin: 0 0 16px; }
.gl-article .detail-name { font-size: clamp(40px, 4vw, 52px); letter-spacing: -1px; line-height: 1.15; }
.gl-lead { margin: 20px 0 0; font-size: 17px; line-height: 1.75; color: rgba(var(--sc-ink-rgb), 0.72); }
.gl-lead strong { color: var(--sc-ink); font-weight: 600; }
.gl-cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.gl-cta-row .hero-btn-primary, .gl-cta-row .hero-btn-ghost { min-width: 180px; }
.gl-article .detail-cta-help { margin-top: 14px; }

/* Body prose — template detail's .about-* values */
.gl-body { margin-top: 56px; padding-top: 48px; border-top: 1px solid rgba(var(--sc-ink-rgb), 0.08); }
.gl-body h2 { font-size: 20px; font-weight: 600; color: var(--sc-ink); letter-spacing: -0.2px; line-height: 1.35; margin: 48px 0 14px; }
.gl-body > h2:first-child { margin-top: 0; }
.gl-body p { font-size: 16px; line-height: 1.75; color: rgba(var(--sc-ink-rgb), 0.72); margin: 0 0 20px; }
.gl-body ul, .gl-body ol { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 12px; }
.gl-body li { position: relative; padding-left: 22px; font-size: 15px; line-height: 1.65; color: rgba(var(--sc-ink-rgb), 0.62); }
.gl-body ul > li::before { content: ''; position: absolute; left: 2px; top: 9px; width: 5px; height: 5px; border-radius: 50%; background: #1488FC; }
.gl-body ol { counter-reset: gl; }
.gl-body ol > li { counter-increment: gl; padding-left: 30px; }
.gl-body ol > li::before { content: counter(gl, decimal-leading-zero); position: absolute; left: 0; top: 1px; font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700); font-size: 11px; letter-spacing: 1px; color: #1488FC; }
.gl-body li b { color: rgba(var(--sc-ink-rgb), 0.92); font-weight: 600; }
.gl-body code { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 0.88em; padding: 1px 6px; border-radius: 2px; background: rgba(var(--sc-ink-rgb), 0.06); color: var(--sc-ink); }
.gl-body pre { margin: 0 0 20px; padding: 16px 18px; border-radius: 2px; overflow-x: auto; border: 1px solid rgba(var(--sc-ink-rgb), 0.10); background: rgba(var(--sc-ink-rgb), 0.03); }
.gl-body pre code { padding: 0; background: none; font-size: 13px; line-height: 1.6; }
.gl-code-label { display: block; margin: 0 0 8px; font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sc-text-faint); }
.gl-table-wrap { margin: 0 0 20px; overflow-x: auto; border: 1px solid rgba(var(--sc-ink-rgb), 0.10); border-radius: 2px; }
.gl-body table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5; }
.gl-body th { text-align: left; padding: 12px 16px; font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sc-text-desc); background: rgba(var(--sc-ink-rgb), 0.03); border-bottom: 1px solid rgba(var(--sc-ink-rgb), 0.10); }
.gl-body td { padding: 14px 16px; color: rgba(var(--sc-ink-rgb), 0.72); border-top: 1px solid rgba(var(--sc-ink-rgb), 0.06); vertical-align: top; }
.gl-body tr:first-child td { border-top: 0; }
.gl-body td:first-child { color: var(--sc-ink); font-weight: 600; white-space: nowrap; }
.gl-body .ms-faq-list { margin-top: 8px; border-bottom: 1px solid var(--sc-line-soft); }

/* See also — clickable pills, below all the content */
.gl-see-also { margin-top: 64px; padding-top: 32px; border-top: 1px solid rgba(var(--sc-ink-rgb), 0.08); }
.gl-pills { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
.gl-pill {
  display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 18px;
  border-radius: 999px; border: 1px solid rgba(var(--sc-ink-rgb), 0.14);
  background: var(--sc-surface); box-shadow: 0 2px 8px rgba(15,26,42,0.04);
  font-size: 15px; font-weight: 500; color: var(--sc-ink);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.gl-pill .gl-arrow { color: #1488FC; transition: transform 0.2s ease; }
.gl-pill:hover { border-color: #1488FC; background: rgba(20,136,252,0.06); color: #1488FC; transform: translateY(-1px); }
.gl-pill:hover .gl-arrow { transform: translateX(3px); }
html[data-theme="dark"] .gl-pill { box-shadow: none; }
html[data-theme="dark"] .gl-pill:hover { color: #4DA6FF; border-color: #4DA6FF; }
html[data-theme="dark"] .gl-pill .gl-arrow { color: #4DA6FF; }
@media (max-width: 768px) {
  .gl-article .detail-name { font-size: clamp(28px, 8vw, 40px); }
  .gl-lead { font-size: 16px; margin-top: 12px; }
  .gl-cta-row { flex-direction: column; margin-top: 24px; }
  .gl-cta-row .hero-btn-primary, .gl-cta-row .hero-btn-ghost { width: 100%; }
  .gl-body { margin-top: 40px; padding-top: 36px; }
  .gl-body h2 { font-size: 18px; margin-top: 36px; }
  .gl-body p { font-size: 15px; }
  .gl-body li { font-size: 14px; }
  .gl-see-also { margin-top: 48px; }
  .gl-pill { height: 40px; padding: 0 16px; font-size: 14px; }
}

/* Divider + sections (verbatim template-detail values) */
.detail-shell .section-divider {
  position: relative; width: 100%; height: 210px; margin: -115px auto -72px;
  overflow: hidden; pointer-events: none; z-index: 1;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 30%, #000 76%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 30%, #000 76%, transparent 100%);
}
.detail-shell .section-divider canvas { display: block; width: 100%; height: 100%; }
@media (prefers-reduced-motion: reduce) { .detail-shell .section-divider { display: none; } }
.detail-shell .section-block { margin-bottom: clamp(64px, 9vh, 120px); }
.detail-shell .section-block:last-child { margin-bottom: 0; }
.detail-shell .section-eyebrow { margin: 0 0 16px; display: inline-block; }
.detail-shell .section-headline { font-size: clamp(28px, 3.4vw, 40px); font-weight: 500; letter-spacing: -0.6px; line-height: 1.15; margin: 0 0 32px; color: var(--sc-ink); }

/* Related terms + related reading — the standard stack card (2px surface) */
.gl-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.gl-card {
  position: relative; display: flex; flex-direction: column; gap: 10px;
  padding: 24px 24px 28px; border-radius: 2px;
  border: 1px solid rgba(var(--sc-ink-rgb), 0.10);
  background: linear-gradient(180deg, rgba(var(--sc-ink-rgb), 0.03) 0%, rgba(var(--sc-ink-rgb), 0.005) 100%);
  transition: border-color 0.3s ease, transform 0.25s ease;
}
.gl-card:hover { border-color: rgba(var(--sc-ink-rgb), 0.22); transform: translateY(-2px); }
.gl-card-kind { font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sc-text-faint); }
.gl-card-title { margin: 0; font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.2px; color: var(--sc-ink); }
.gl-card-desc { margin: 0; font-size: 14px; line-height: 1.55; color: var(--sc-text-desc); }
.gl-card-more { margin-top: auto; padding-top: 8px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1488FC; }
html[data-theme="dark"] .gl-card-more { color: #4DA6FF; }
.gl-card-more .gl-arrow { transition: transform 0.2s ease; }
.gl-card:hover .gl-card-more .gl-arrow { transform: translateX(3px); }

/* Seam (CLAUDE.md adjacent-section rule): the term hero and "Get to know"
   share the ground, so the seam is trimmed to ~one unit on the lower side. */
.detail-shell { padding-bottom: 0 !important; }   /* the hero is now the shell's last block */
.detail-shell + .gl-know { padding-top: clamp(24px, 4vh, 48px); }
@media (max-width: 1024px) { .detail-shell + .gl-know { padding-top: 24px; } }
@media (max-width: 768px) { .detail-shell + .gl-know { padding-top: 16px; } }

/* "Get to know Bolt.new" — three standard stack cards */
.gl-know .section-header { align-items: center; text-align: center; }
.gl-know .section-sub { max-width: 600px; }

@media (max-width: 1024px) {
  .gl-az-inner { width: min(900px, calc(100vw - 80px)); }
  .gl-list-section { padding-bottom: 64px; }
  .detail-shell { width: min(900px, calc(100vw - 80px)); }
  .detail-hero { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .detail-info { max-width: 700px; }
  .detail-shell .section-divider { height: 160px; margin: -92px auto -56px; }
  .detail-shell .section-eyebrow { margin-bottom: 12px; }
  .gl-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  html .gl-hero .hero-eyebrow { margin-bottom: -12px; }            /* eyebrow→H1 12 on phones */
  /* phones: search takes its own full-width row above the letters */
  .gl-az-inner { width: calc(100vw - 32px); flex-wrap: wrap; gap: 8px; }
  .gl-search, .gl-search:focus-within { order: -1; width: 100%; height: 40px; }
  .gl-search input { font-size: 16px; }   /* 16px stops iOS zooming on focus */
  .gl-az-letters { flex-basis: 100%; }
  .gl-list-section { padding-bottom: 48px; }
  .gl-letter { margin-top: 32px; }
  .gl-row { padding: 18px 0; grid-template-columns: 1fr; }
  .gl-row::before { inset: 0 -8px; }
  .gl-row .gl-arrow { display: none; }
  .gl-term { font-size: 17px; }
  .gl-def { font-size: 14px; }
  .detail-shell { width: calc(100vw - 32px); padding-top: 40px; padding-bottom: 40px; }
  .detail-shell .breadcrumb { margin-bottom: 28px; }
  .detail-name { font-size: 32px; }
  .detail-category { margin-bottom: -8px; }
  .detail-shell .section-divider { height: 110px; margin: -60px auto -40px; }
  .gl-card-grid { grid-template-columns: 1fr; gap: 12px; }
  }
</style>
"""

NAV_H_JS = """<script>
/* Pin the A–Z bar / sidebar under the nav at whatever height the nav renders. */
(function () {
  var nav = document.querySelector('.mkt-nav');
  if (!nav) return;
  function set() { document.documentElement.style.setProperty('--gl-nav-h', nav.offsetHeight + 'px'); }
  set(); window.addEventListener('resize', set);
})();
</script>
"""

INDEX_JS = """<script>
/* ── Glossary index: letter + search filter (rows are static HTML) ─────── */
(function () {
  var input = document.getElementById('gl-search');
  var btns = document.querySelectorAll('.gl-az-btn');
  var groups = document.querySelectorAll('.gl-group');
  var empty = document.getElementById('gl-empty');
  var emptyQ = document.getElementById('gl-empty-q');
  var list = document.getElementById('terms');
  var letter = 'all';
  function apply() {
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    groups.forEach(function (g) {
      var inLetter = letter === 'all' || g.getAttribute('data-letter') === letter;
      var n = 0;
      g.querySelectorAll('.gl-row-item').forEach(function (li) {
        var hit = inLetter && (!q || li.getAttribute('data-search').indexOf(q) !== -1);
        li.hidden = !hit; if (hit) n++;
      });
      g.hidden = n === 0; shown += n;
    });
    empty.hidden = shown > 0;
    emptyQ.textContent = q ? '\\u201c' + input.value.trim() + '\\u201d' : 'this letter';
  }
  /* fade out → filter + scroll while hidden → fade in. A token drops stale
     swaps when letters are clicked faster than the fade. */
  var inner = list.querySelector('.section-inner');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var token = 0;
  function swap() {
    if (reduce) { apply(); scrollToList(); return; }
    var mine = ++token;
    inner.classList.add('is-fading');
    setTimeout(function () {
      if (mine !== token) return;
      apply(); scrollToList();
      requestAnimationFrame(function () { if (mine === token) inner.classList.remove('is-fading'); });
    }, 160);
  }
  function scrollToList() {
    var bar = document.querySelector('.gl-az');
    var pin = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gl-nav-h')) || 68;
    var target = list.offsetTop - pin - bar.offsetHeight;
    if (window.scrollY > target) window.scrollTo({ top: target, behavior: 'smooth' });
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.disabled) return;
      btns.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
      letter = b.getAttribute('data-letter');
      swap();
    });
  });
  input.addEventListener('input', apply);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); list.scrollIntoView({ behavior: 'smooth' }); }
  });
  var reset = document.getElementById('gl-empty-reset');
  if (reset) reset.addEventListener('click', function (e) {
    e.preventDefault(); input.value = ''; btns[0].click();
  });
  /* deep link: /glossary#letter-v */
  var m = /^#letter-([a-z0])$/.exec(location.hash);
  if (m) { var t = document.querySelector('.gl-az-btn[data-letter="' + m[1] + '"]'); if (t && !t.disabled) t.click(); }
})();
</script>
"""


def jsonld(obj):
    return '<script type="application/ld+json">\n' + json.dumps(obj, indent=2, ensure_ascii=False) + '\n</script>\n'


def head(title, desc, canonical, extra):
    return (HEAD_TOP
            + '<title>' + esc(title) + '</title>\n'
            + '<meta name="description" content="' + esc(desc) + '">\n'
            + '<meta name="robots" content="noindex,nofollow"><!-- sandbox only: production drops this -->\n'
            + '<link rel="canonical" href="' + canonical + '">\n'
            + '<meta property="og:type" content="website">\n'
            + '<meta property="og:title" content="' + esc(title) + '">\n'
            + '<meta property="og:description" content="' + esc(desc) + '">\n'
            + '<meta property="og:url" content="' + canonical + '">\n'
            # share image + Twitter card: the production default set (same as marketing/404.html)
            + '<meta property="og:site_name" content="Bolt">\n'
            + '<meta property="og:image" content="https://bolt.new/public-page-assets/og-image-default-centred.jpg">\n'
            + '<meta property="og:image:width" content="1200">\n'
            + '<meta property="og:image:height" content="630">\n'
            + '<meta property="og:image:alt" content="bolt.new">\n'
            + '<meta name="twitter:card" content="summary_large_image">\n'
            + '<meta name="twitter:title" content="' + esc(title) + '">\n'
            + '<meta name="twitter:description" content="' + esc(desc) + '">\n'
            + '<meta name="twitter:image" content="https://bolt.new/public-page-assets/og-image-default-centred.jpg">\n'
            + extra
            + HEAD_REST + GLOSSARY_CSS + '</head>\n<body>\n\n')


def rebase(s):
    """One directory deeper: ../x → ../../x (covers ../../ too)."""
    return re.sub(r'''(["'])\.\./''', r'\1../../', s)


def letter_id(L):
    return '0' if L == '#' else L.lower()


# ── Template 1: index ──────────────────────────────────────────────────────
def build_index():
    present = {t['letter'] for t in TERMS}
    az = ['<button type="button" class="gl-az-btn is-active" data-letter="all" aria-pressed="true">All</button>']
    for L in LETTERS:
        dis = '' if L in present else ' disabled'
        az.append('<button type="button" class="gl-az-btn" data-letter="%s" aria-pressed="false"%s aria-label="Terms starting with %s">%s</button>'
                  % (letter_id(L), dis, 'a number' if L == '#' else L, esc(L)))

    groups = []
    for L in LETTERS:
        items = [t for t in TERMS if t['letter'] == L]
        if not items:
            continue
        rows = []
        for t in items:
            rows.append(
                '        <li class="gl-row-item" data-search="%s">\n'
                '          <a class="gl-row" href="%s/">\n'
                '            <div><h3 class="gl-term">%s</h3><p class="gl-def">%s</p></div>\n'
                '            <span class="gl-arrow" aria-hidden="true"></span>\n'
                '          </a>\n'
                '        </li>' % (esc((t['name'] + ' ' + t['def']).lower()), t['slug'], esc(t['name']), esc(t['def'])))
        groups.append(
            '    <div class="gl-group" id="letter-%s" data-letter="%s">\n'
            '      <h2 class="gl-letter">%s</h2>\n'
            '      <ul class="gl-rows">\n%s\n      </ul>\n'
            '    </div>' % (letter_id(L), letter_id(L), esc(L), '\n'.join(rows)))

    desc = 'Get the definition of every term you will meet while building apps and websites with AI, explained in plain language.'
    ld = jsonld({
        '@context': 'https://schema.org',
        '@graph': [
            {'@type': 'DefinedTermSet', '@id': SITE + '#set', 'name': 'AI Building Glossary', 'url': SITE,
             'description': desc,
             'hasDefinedTerm': [{'@type': 'DefinedTerm', 'name': t['name'], 'description': t['def'],
                                 'url': SITE + '/' + t['slug']} for t in TERMS]},
            {'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Resources', 'item': 'https://bolt.new/resources'},
                {'@type': 'ListItem', 'position': 2, 'name': 'Glossary', 'item': SITE}]},
        ]})

    body = """<!-- ─── HERO ──────────────────────────────────────────────────────────────── -->
<section class="hero-section gl-hero">
  <canvas id="hero-pixel-dots" aria-hidden="true"></canvas>
  <canvas id="hero-dither-light" aria-hidden="true"></canvas>
  <div class="hero-inner sc-on-dark">
    <p class="hero-eyebrow eyebrow-scramble">Glossary</p>
    <h1 class="hero-h1">AI Building <em class="gl-h1-serif">Glossary</em></h1>
    <p class="hero-subtitle">Get the definition of every term you will meet while building apps and websites with AI, explained in plain language.</p>
  </div>
</section>

<!-- ─── A–Z BAR ───────────────────────────────────────────────────────────── -->
<nav class="gl-az" aria-label="Filter by letter">
  <div class="gl-az-inner">
    <div class="gl-az-letters">
    %s
    </div>
    <div class="gl-search" role="search">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
      <input type="search" id="gl-search" placeholder="Search a term" aria-label="Search the glossary" autocomplete="off">
    </div>
  </div>
</nav>

<!-- ─── TERMS (static HTML so every definition is crawlable) ──────────────── -->
<section class="gl-list-section" id="terms">
  <div class="section-inner">
%s
    <p class="gl-empty" id="gl-empty" hidden>No terms match <span id="gl-empty-q"></span>. <a href="#" id="gl-empty-reset">Show all terms</a></p>
  </div>
</section>

""" % ('\n    '.join(az), '\n'.join(groups))

    page = (head('AI Building Glossary | Bolt.new', desc, SITE, ld)
            + NAV + body + FOOTER + NAV_H_JS + INDEX_JS + SCRIPTS)
    write(os.path.join(OUT, 'index.html'), page)


# ── Template 2: term page ──────────────────────────────────────────────────
# "Get to know Bolt.new" — the 404 page's gallery cards (same photos and copy).
GALLERY = [
    ('https://bolt.new/use-cases', 'founder-greenhouse.webp', '38% 30%', 'Use Cases', 'Build anything you need',
     'AI website builder, AI app builder and 70+ more ways people use Bolt.', 'Browse Use Cases'),
    ('https://bolt.new/resources/templates', 'founder-terracotta.webp', '55% 38%', 'Templates', 'Start from a finished site',
     'Production-ready starting points. Fork one and make it yours.', 'Browse Templates'),
    ('https://bolt.new/solutions', 'founder-agency.webp', '50% 32%', 'Solutions', 'Software for how you work',
     'For small businesses, entrepreneurs, agencies and enterprise teams.', 'Explore Solutions'),
    ('https://bolt.new/blog', 'founder-coffee.webp', '50% 28%', 'Blog', 'Stories from people shipping',
     'Product news, build guides and customer stories from the Bolt team.', 'Read the Blog'),
]
GALLERY_CSS = '/* ── Gallery cards: verbatim from marketing/404.html ("Where people usually head\n   next", itself the home page\'s use-case card). Keep in step with that page. */\n/* four portrait photo cards — the home page\'s use-case card (home/\n   src/styles/page.css .hm-uc-card): full-bleed photo, scrim, glass tag,\n   white copy at the foot, the blue pixel field + "See how" line on hover */\n.nf-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }\n.nf-card {\n  position: relative; display: block; overflow: hidden; isolation: isolate;\n  aspect-ratio: 3 / 4; border-radius: 12px; background: var(--sc-surface-strong);\n  color: #fff; text-decoration: none;\n}\n.nf-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1); }\n.nf-card:hover .nf-img { transform: scale(1.04); }\n.nf-scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,8,16,0.86) 0%, rgba(5,8,16,0.5) 34%, rgba(5,8,16,0) 64%), linear-gradient(to bottom, rgba(5,8,16,0.28), rgba(5,8,16,0) 30%); }\n.nf-field { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; opacity: 0; transition: opacity 0.45s ease; pointer-events: none; }\n.nf-card:hover .nf-field { opacity: 1; }\n.nf-tag {\n  position: absolute; left: 18px; top: 18px; z-index: 2; padding: 7px 11px; border-radius: 999px;\n  background: rgba(10,13,20,0.62); -webkit-backdrop-filter: blur(10px) saturate(1.2); backdrop-filter: blur(10px) saturate(1.2);\n  font: 700 10.5px/1 var(--sc-font-label, var(--sc-font-sans)); letter-spacing: 1.5px; text-transform: uppercase; color: #fff;\n}\n.nf-copy { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; display: flex; flex-direction: column; gap: 6px; padding: 22px; }\n.nf-title { font-size: 22px; font-weight: 600; letter-spacing: -0.4px; line-height: 1.2; text-wrap: balance; }\n.nf-desc { font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.78); }\n.nf-more { display: inline-flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 13px; font-weight: 600; color: #fff; opacity: 0; transform: translateY(6px); transition: opacity 0.35s ease, transform 0.35s ease; }\n.nf-card:hover .nf-more, .nf-card:focus-visible .nf-more { opacity: 1; transform: none; }\n.nf-card:focus-visible { outline: 2px solid #1488FC; outline-offset: 3px; }\n/* the site\'s one arrow (thin shafted, 1.5px stroke) as a currentColor mask */\n.nf-arrow {\n  display: inline-block; width: 14px; height: 12px; flex: 0 0 auto; background: currentColor;\n  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 14\' fill=\'none\' stroke=\'black\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M1 7h13M9 2l5 5-5 5\'/%3E%3C/svg%3E") center / contain no-repeat;\n          mask: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 14\' fill=\'none\' stroke=\'black\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M1 7h13M9 2l5 5-5 5\'/%3E%3C/svg%3E") center / contain no-repeat;\n}\n\n@media (max-width: 1024px) {\n  .nf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .nf-card { aspect-ratio: 4 / 5; }\n}\n@media (max-width: 768px) {\n  .nf-grid { grid-template-columns: 1fr; gap: 12px; }\n  .nf-card { aspect-ratio: auto; height: 340px; }\n  .nf-copy { padding: 20px; }\n  .nf-tag { left: 14px; top: 14px; }\n  .nf-more { display: none; }\n}\n/* cards: two portrait columns down to 600 (one 736px-wide card read as a\n   banner at 768), single column only on real phones */\n@media (max-width: 768px) and (min-width: 601px) {\n  .nf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }\n  .nf-card { aspect-ratio: 4 / 5; height: auto; }\n  .nf-copy { padding: 20px; }\n}\n@media (prefers-reduced-motion: reduce) { .nf-img, .nf-more, .nf-field { transition: none; } .nf-card:hover .nf-img { transform: none; } }\n'
GALLERY_JS = "/* ── Card hover dot field (attachHoverField — the compliance-card treatment).\n   Colour follows --sc-dot-rgb so it is blue on light, grey on dark. ── */\n(function () {\n  var rgb = '140,195,255';   /* over photos in both themes, as on the home cards */\n  function attach(tile, canvas, idx) {\n    var ctx = canvas.getContext('2d');\n    var SPACING = 9, DOT = 2, cols = 0, rows = 0, phases = [], hovered = false, t = 0, phase = idx * 1.7;\n    function resize() {\n      var w = tile.offsetWidth, h = tile.offsetHeight; if (!w || !h) return;\n      canvas.width = w; canvas.height = h;\n      cols = Math.ceil(w / SPACING) + 1; rows = Math.ceil(h / SPACING) + 1;\n      phases = Array.from({ length: rows }, function () { return Array.from({ length: cols }, function () { return Math.random() * Math.PI * 2; }); });\n    }\n    try { new ResizeObserver(resize).observe(tile); } catch (e) {}\n    requestAnimationFrame(resize);\n    tile.addEventListener('mouseenter', function () { hovered = true; });\n    tile.addEventListener('mouseleave', function () { hovered = false; });\n    function draw() {\n      if (!hovered || !cols) { requestAnimationFrame(draw); return; }\n      t += 0.03;\n      var W = canvas.width, H = canvas.height;\n      ctx.clearRect(0, 0, W, H);\n      var angle = t * 0.16 + phase, ca = Math.cos(angle), sa = Math.sin(angle);\n      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {\n        var px = c * SPACING, py = r * SPACING, ph = (phases[r] && phases[r][c]) || 0;\n        var wave = Math.sin((px * ca + py * sa) / 58 + t + ph) * Math.cos((px * -sa + py * ca) / 90 + t * 0.6);\n        var op = Math.max(0, wave) * 0.45 * (px / W);\n        if (op < 0.04) continue;\n        ctx.fillStyle = 'rgba(' + rgb + ',' + op.toFixed(3) + ')';\n        ctx.fillRect(px, py, DOT, DOT);\n      }\n      requestAnimationFrame(draw);\n    }\n    requestAnimationFrame(draw);\n  }\n  document.querySelectorAll('.nf-card').forEach(function (el, i) {\n    var cv = document.createElement('canvas'); cv.className = 'nf-field'; cv.setAttribute('aria-hidden', 'true');\n    el.insertBefore(cv, el.firstChild); attach(el, cv, i);\n  });\n})();\n"

# Divider: template detail's traveling shimmer (makePixelCanvas comes with the
# lifted scripts).
TERM_JS = """
if (typeof makePixelCanvas === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  makePixelCanvas('divider-pixel-canvas', 11, 2,
    function (c, r, t, p) {
      var px = c * 11, py = r * 11;
      var phase = (px * 0.012 + py * 0.018) - t * 0.0018 + 1.0;
      var band = Math.sin(phase) * 0.5 + 0.5;
      return 0.06 + Math.pow(band, 3) * 0.32 + (Math.sin(p * 53.7 + t * 0.004) * 0.5 + 0.5) * 0.07;
    }, 1.0, '170,185,210');
}
"""


# Long-form body per term (optional). 301 redirect carries a DRAFT written to
# show the content blocks; replace it with the SEO brief's copy.
BODY = {
    '301-redirect': {'html': '      <h2>How a 301 redirect works</h2>\n      <p>When a browser or a search engine asks for the old address, the server answers with status code 301 and a <code>Location</code> header naming the new one. The browser follows it on its own, so the visitor lands on the right page without doing anything.</p>\n      <ol>\n        <li>A visitor or crawler requests <code>example.com/old-page</code>.</li>\n        <li>The server replies <code>301 Moved Permanently</code> with <code>Location: example.com/new-page</code>.</li>\n        <li>The browser requests the new address and loads it.</li>\n        <li>Search engines swap the old URL for the new one in their index and pass its ranking signals along.</li>\n      </ol>\n\n      <h2>301 vs. 302, 307 and 308 redirects</h2>\n      <p>The status code tells search engines whether a move is permanent. Pick the wrong one and the old URL can linger in results.</p>\n      <div class="gl-table-wrap"><table>\n        <thead><tr><th>Code</th><th>Type</th><th>Use it when</th></tr></thead>\n        <tbody>\n          <tr><td>301</td><td>Permanent</td><td>A page has moved for good</td></tr>\n          <tr><td>302</td><td>Temporary</td><td>A short-term swap, like a seasonal promo page</td></tr>\n          <tr><td>307</td><td>Temporary, keeps the request method</td><td>Temporary moves for forms or API calls</td></tr>\n          <tr><td>308</td><td>Permanent, keeps the request method</td><td>Permanent moves for forms or API endpoints</td></tr>\n        </tbody>\n      </table></div>\n\n      <h2>When to use a 301 redirect</h2>\n      <ul>\n        <li><b>Changing a URL:</b> a new slug, a renamed section or a restructured site.</li>\n        <li><b>Moving domains:</b> a rebrand, or the switch from http to https.</li>\n        <li><b>Merging pages:</b> two pages that cover the same topic become one.</li>\n        <li><b>Retiring a page:</b> send it to the closest replacement, not the homepage.</li>\n        <li><b>Picking one version:</b> www or non-www, with or without a trailing slash.</li>\n      </ul>\n\n      <h2>How to set up a 301 redirect</h2>\n      <p>Where the rule lives depends on your host. Two common setups:</p>\n      <span class="gl-code-label">Netlify (_redirects file)</span>\n      <pre><code>/old-page   /new-page   301</code></pre>\n      <span class="gl-code-label">Nginx</span>\n      <pre><code>location = /old-page {\n  return 301 /new-page;\n}</code></pre>\n      <p>Building in Bolt? Ask for it in plain language, like &ldquo;redirect /pricing-old to /pricing with a 301&rdquo;, and Bolt can add the rule for you.</p>\n\n      <h2>Common 301 redirect mistakes</h2>\n      <ul>\n        <li><b>Redirect chains:</b> A goes to B goes to C. Each hop slows the page, so point A straight at C.</li>\n        <li><b>Redirect loops:</b> two URLs that redirect to each other, so the page never loads.</li>\n        <li><b>Everything to the homepage:</b> search engines can treat it as a soft 404 and drop the old page\'s signals.</li>\n        <li><b>A 302 for a permanent move:</b> the old URL can stay in search results.</li>\n      </ul>\n\n      <h2>Frequently asked questions</h2>\n      <div class="ms-faq-list">\n        <div class="ms-faq-item">\n          <button class="ms-faq-q">Do 301 redirects hurt SEO?<span class="ms-faq-icon"><svg class="ms-faq-icon-plus" width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><svg class="ms-faq-icon-minus" width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></button>\n          <div class="ms-faq-a"><div class="ms-faq-a-inner">No. Google passes a 301\'s ranking signals to the new address. Expect some movement while search engines recrawl the old URL, then the new page carries the old page\'s standing.</div></div>\n        </div>\n        <div class="ms-faq-item">\n          <button class="ms-faq-q">How long should I keep a 301 redirect in place?<span class="ms-faq-icon"><svg class="ms-faq-icon-plus" width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><svg class="ms-faq-icon-minus" width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></button>\n          <div class="ms-faq-a"><div class="ms-faq-a-inner">At least a year, and ideally for good, especially when other sites still link to the old URL. Removing it turns those links into 404 errors.</div></div>\n        </div>\n        <div class="ms-faq-item">\n          <button class="ms-faq-q">Can I undo a 301 redirect?<span class="ms-faq-icon"><svg class="ms-faq-icon-plus" width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><svg class="ms-faq-icon-minus" width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></button>\n          <div class="ms-faq-a"><div class="ms-faq-a-inner">Yes, by removing the rule. Browsers cache 301s, though, so people who already followed it may keep landing on the new page until their cache clears.</div></div>\n        </div>\n      </div>', 'faq': [('Do 301 redirects hurt SEO?', "No. Google passes a 301's ranking signals to the new address. Expect some movement while search engines recrawl the old URL, then the new page carries the old page's standing."), ('How long should I keep a 301 redirect in place?', 'At least a year, and ideally for good, especially when other sites still link to the old URL. Removing it turns those links into 404 errors.'), ('Can I undo a 301 redirect?', 'Yes, by removing the rule. Browsers cache 301s, though, so people who already followed it may keep landing on the new page until their cache clears.')]},
}


def build_term(t):
    url = SITE + '/' + t['slug']
    h1 = h1_of(t)
    lead = lead_of(t)
    plain_lead = re.sub('<[^>]+>', '', lead)
    plain_lead = html.unescape(plain_lead)
    rel = related_of(t)
    ld = jsonld({
        '@context': 'https://schema.org',
        '@graph': [
            {'@type': 'DefinedTerm', '@id': url + '#term', 'name': t['name'], 'description': t['def'],
             'url': url, 'inDefinedTermSet': {'@type': 'DefinedTermSet', '@id': SITE + '#set', 'name': 'AI Building Glossary', 'url': SITE}},
            {'@type': 'WebPage', '@id': url, 'url': url, 'name': h1, 'description': plain_lead,
             'about': {'@id': url + '#term'}},
            {'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Resources', 'item': 'https://bolt.new/resources'},
                {'@type': 'ListItem', 'position': 2, 'name': 'Glossary', 'item': SITE},
                {'@type': 'ListItem', 'position': 3, 'name': t['name'], 'item': url}]},
        ] + ([{'@type': 'FAQPage', 'mainEntity': [
                {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                for q, a in BODY[t['slug']]['faq']]}] if BODY.get(t['slug'], {}).get('faq') else [])})

    pills = '\n'.join(
        '        <li><a class="gl-pill" href="../%s/">%s <span class="gl-arrow" aria-hidden="true"></span></a></li>'
        % (r['slug'], esc(r['name'])) for r in rel)
    body = BODY.get(t['slug'], {}).get('html', '')
    body = ('    <div class="gl-body">\n' + body + '\n    </div>\n') if body else ''
    cards = '\n'.join(
        '      <a class="nf-card" href="%s">\n'
        '        <img class="nf-img" src="../../images/404/%s" alt="" loading="lazy" decoding="async" style="object-position:%s">\n'
        '        <span class="nf-scrim" aria-hidden="true"></span>\n'
        '        <span class="nf-tag">%s</span>\n'
        '        <span class="nf-copy">\n'
        '          <span class="nf-title">%s</span>\n'
        '          <span class="nf-desc">%s</span>\n'
        '          <span class="nf-more">%s <i class="nf-arrow" aria-hidden="true"></i></span>\n'
        '        </span>\n'
        '      </a>' % (u, img, pos, esc(tag), esc(ti), esc(d), esc(more)) for u, img, pos, tag, ti, d, more in GALLERY)

    page_body = """<!-- ─── TERM (template-detail layout) ─────────────────────────────────────── -->
<main class="detail-shell">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="https://bolt.new/resources">Resources</a>
    <span class="sep">/</span>
    <a href="../">Glossary</a>
    <span class="sep">/</span>
    <span class="current" aria-current="page">%(name)s</span>
  </nav>

  <article class="gl-article">
    <p class="detail-category">%(cat)s</p>
    <h1 class="detail-name">%(h1)s</h1>
    <p class="gl-lead">%(lead)s</p>
    <div class="gl-cta-row">
      <a href="https://bolt.new/" target="_blank" rel="noopener" class="hero-btn-primary">
        <div class="btn-bg-hover"></div>
        <div class="btn-text-wrap"><div class="btn-text-inner"><span>Start Building</span><span>Start Building</span></div></div>
      </a>
      <a href="../" class="hero-btn-ghost">
        <div class="btn-bg-hover"></div>
        <div class="btn-text-wrap"><div class="btn-text-inner"><span>Browse All Terms</span><span>Browse All Terms</span></div></div>
      </a>
    </div>
    <p class="detail-cta-help">New to Bolt? <a href="https://bolt.new/?get_started=true" target="_blank" rel="noopener" class="detail-cta-help-em">Sign up</a> free.</p>
%(body)s
    <nav class="gl-see-also" aria-label="See also">
      <p class="detail-category">See also</p>
      <ul class="gl-pills">
%(pills)s
      </ul>
    </nav>
  </article>

  <div class="section-divider" aria-hidden="true"><canvas id="divider-pixel-canvas"></canvas></div>

</main>

<!-- ─── GET TO KNOW BOLT.NEW ───────────────────────────────────────────────── -->
<section class="section gl-know">
  <div class="section-inner">
    <div class="dsa-reveal">
      <div class="section-header">
        <p class="section-eyebrow eyebrow-scramble">Get to Know Bolt.new</p>
        <h2 class="sc-section-h2">Build what you need with Bolt.new</h2>
        <p class="section-sub">Describe what you need in plain language. Bolt.new writes the code, connects the database, and puts the result online.</p>
      </div>
    </div>
    <div class="nf-grid">
%s
    </div>
  </div>
</section>

""".replace('%s\n    </div>\n  </div>\n</section>', '%(cards)s\n    </div>\n  </div>\n</section>') % dict(
        name=esc(t['name']), cat=esc(CATS[t['cat']]), h1=esc(h1), lead=lead,
        body=body, pills=pills, cards=cards)

    # The term page has no hero, so the nav sits solid in flow (the over-hero
    # variant is transparent with white ink and would vanish on a light ground).
    nav = NAV.replace('class="mkt-nav mkt-nav--over-hero"', 'class="mkt-nav"')
    desc = plain_lead if len(plain_lead) <= 158 else plain_lead[:155].rsplit(' ', 1)[0] + '…'
    # Only the lifted chrome sits one level deeper than its source; the
    # body's own links (../ = the index, ../<slug>/ = siblings) are already right.
    page = (rebase(head(h1 + ' Definition | Bolt.new Glossary', desc, url, ld) + nav)
            + page_body + rebase(FOOTER + NAV_H_JS + SCRIPTS))
    page = page.replace('</style>\n</head>', '</style>\n<style id="glossary-gallery">\n' + GALLERY_CSS + '</style>\n</head>', 1)
    page = page.replace('</body>', '<script>\n' + GALLERY_JS + TERM_JS + '</script>\n</body>', 1)
    write(os.path.join(OUT, t['slug'], 'index.html'), page)


def write(path, s):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s)


if __name__ == '__main__':
    build_index()
    for t in TERMS:
        build_term(t)
    print('glossary: index + %d term pages -> %s' % (len(TERMS), os.path.relpath(OUT, ROOT)))
