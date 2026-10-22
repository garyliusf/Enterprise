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
    if t['slug'] in RELATED:
        return [BY_SLUG[s] for s in RELATED[t['slug']]]
    same = [x for x in TERMS if x['cat'] == t['cat'] and x['slug'] != t['slug']]
    i = next(i for i, x in enumerate(TERMS) if x['slug'] == t['slug'])
    same.sort(key=lambda x: abs(TERMS.index(x) - i))     # nearest neighbours first
    return same[:5]


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
FOOTER = FOOTER.replace('placeholder="Describe what you want to build…"',
                        'placeholder="Build a client portal where each customer signs in to see their own invoices, documents, and project status."')
FOOTER = re.sub(r'\s*<ul class="hero-pills footer-cta-pills">.*?</ul>', '', FOOTER, flags=re.S)
assert 'Now build the thing' in FOOTER and 'hero-pills' not in FOOTER

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
.gl-label {
  font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700);
  font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--sc-text-faint); margin: 0;
}
.gl-label--blue { color: var(--sc-blue, #1488FC); }

/* ── INDEX: hero ─────────────────────────────────────────────────────────── */
.gl-h1-serif {
  font-family: var(--sc-font-serif); font-style: var(--sc-serif-style, italic);
  font-weight: 400; font-size: 1.06em; letter-spacing: 0;
  color: #EDDCC6;   /* warm beige (success pull-quote colour), as in the reference; the warm token reads salmon */
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

/* ── TERM PAGE ───────────────────────────────────────────────────────────── */
.gl-term-main { padding: 32px 0 clamp(80px, 12vh, 140px); border-bottom: 1px solid var(--sc-line-soft, rgba(var(--sc-ink-rgb), 0.08)); }
.gl-term-grid {
  display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: clamp(48px, 7vw, 120px);
  align-items: start;
}
.gl-back {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 500; color: var(--sc-text-desc);
  transition: color 0.2s ease;
}
.gl-back:hover { color: var(--sc-ink); }
.gl-crumbs { margin: 40px 0 16px; }
.gl-crumbs ol { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 10px; }
.gl-crumbs li { display: inline-flex; align-items: center; gap: 10px; }
.gl-crumbs li + li::before { content: "/"; color: var(--sc-text-faint); font-weight: 400; }
.gl-crumbs a, .gl-crumbs span { font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sc-text-faint); }
.gl-crumbs a:hover { color: var(--sc-ink); }
.gl-crumbs [aria-current] { color: var(--sc-blue, #1488FC); }
/* The term H1 rides the canonical section-H2 curve: it heads an article, not a hero. */
.gl-term-h1 {
  font-size: clamp(40px, 4vw, 52px); font-weight: 500; line-height: 1.15; letter-spacing: -1px;
  color: var(--sc-ink); margin: 0; max-width: 820px; text-wrap: balance;
}
.gl-term-lead {
  margin: 24px 0 0; max-width: 680px;
  font-size: clamp(17px, 1.3vw, 19px); line-height: 1.65; color: var(--sc-text-sub);
}
.gl-term-lead strong { color: var(--sc-ink); font-weight: 600; }
.gl-related { margin-top: clamp(64px, 10vh, 120px); }
.gl-related .gl-label { padding-bottom: 16px; border-bottom: 1px solid var(--sc-line-soft, rgba(var(--sc-ink-rgb), 0.08)); }
.gl-chips { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.gl-chip {
  display: inline-flex; align-items: center; height: 36px; padding: 0 14px;
  border: 1px solid rgba(var(--sc-ink-rgb), 0.14); border-radius: 999px;
  font-size: 14px; font-weight: 500; color: var(--sc-text-sub);
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}
.gl-chip:hover { color: var(--sc-ink); border-color: var(--sc-blue, #1488FC); background: rgba(20,136,252,0.05); }

.gl-aside { position: sticky; top: calc(var(--gl-nav-h, 68px) + 32px); margin-top: 96px; }
.gl-reading {
  padding: 24px; border-radius: 2px;
  border: 1px solid rgba(var(--sc-ink-rgb), 0.10);
  background: linear-gradient(180deg, rgba(var(--sc-ink-rgb), 0.03) 0%, rgba(var(--sc-ink-rgb), 0.005) 100%);
}
html[data-theme="light"] .gl-reading { background: var(--sc-surface); box-shadow: 0 4px 16px rgba(15,26,42,0.04); }
.gl-reading > .gl-label { margin-bottom: 8px; }
.gl-reading-item {
  display: block; padding: 16px 0;
  border-bottom: 1px solid var(--sc-line-soft, rgba(var(--sc-ink-rgb), 0.08));
}
.gl-reading-kind { display: block; font-family: var(--sc-font-label); font-weight: var(--sc-label-weight, 700); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sc-text-faint); margin-bottom: 6px; }
.gl-reading-title { display: block; font-size: 15px; font-weight: 500; line-height: 1.4; color: var(--sc-text-sub); transition: color 0.2s ease; }
.gl-reading-item:hover .gl-reading-title { color: var(--sc-ink); }
.gl-reading-all { display: inline-flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 14px; font-weight: 600; color: #1488FC; }
.gl-reading-all:hover { color: #0f6fd0; }
html[data-theme="dark"] .gl-reading-all { color: #4DA6FF; }
html[data-theme="dark"] .gl-reading-all:hover { color: #7CBFFF; }

/* "Get to know Bolt.new" — three standard stack cards */
.gl-know .section-header { align-items: center; text-align: center; }
.gl-know .section-sub { max-width: 600px; }
.gl-know-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.gl-know-grid .int-card { min-height: 0; }
.gl-know-grid .int-name { font-size: 18px; font-weight: 600; letter-spacing: -0.2px; display: inline-flex; align-items: center; gap: 10px; }
.gl-know-grid .int-name .gl-arrow { color: var(--sc-blue, #1488FC); transition: transform 0.2s ease; }
.gl-know-grid .int-card:hover .int-name .gl-arrow { transform: translateX(3px); }
.gl-know-grid .int-desc { font-size: 14px; line-height: 1.55; }

@media (max-width: 1024px) {
  .gl-az-inner { width: min(900px, calc(100vw - 80px)); }
  .gl-list-section, .gl-term-main { padding-bottom: 64px; }
  .gl-term-grid { grid-template-columns: 1fr; gap: 56px; }
  .gl-aside { position: static; margin-top: 0; max-width: 560px; }
  .gl-related { margin-top: 56px; }
}
@media (max-width: 768px) {
  html .gl-hero .hero-eyebrow { margin-bottom: -12px; }            /* eyebrow→H1 12 on phones */
  /* phones: search takes its own full-width row above the letters */
  .gl-az-inner { width: calc(100vw - 32px); flex-wrap: wrap; gap: 8px; }
  .gl-search, .gl-search:focus-within { order: -1; width: 100%; height: 40px; }
  .gl-search input { font-size: 16px; }   /* 16px stops iOS zooming on focus */
  .gl-az-letters { flex-basis: 100%; }
  .gl-list-section, .gl-term-main { padding-bottom: 48px; }
  .gl-letter { margin-top: 32px; }
  .gl-row { padding: 18px 0; grid-template-columns: 1fr; }
  .gl-row::before { inset: 0 -8px; }
  .gl-row .gl-arrow { display: none; }
  .gl-term { font-size: 17px; }
  .gl-def { font-size: 14px; }
  .gl-term-main { padding-top: 20px; }
  .gl-crumbs { margin-top: 28px; }
  .gl-term-h1 { font-size: clamp(28px, 8vw, 40px); }
  .gl-term-lead { font-size: 17px; margin-top: 16px; }
  .gl-know-grid { grid-template-columns: 1fr; }
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

    desc = 'Every term you will meet while building software with AI, explained in plain language. %d definitions, from 301 redirect to workflow automation.' % len(TERMS)
    ld = jsonld({
        '@context': 'https://schema.org',
        '@graph': [
            {'@type': 'DefinedTermSet', '@id': SITE + '#set', 'name': 'Bolt.new Glossary', 'url': SITE,
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
    <h1 class="hero-h1">Know what it all <em class="gl-h1-serif">means</em></h1>
    <p class="hero-subtitle">Every term you will meet while building software with AI, explained in plain language. No jargon, no computer science degree.</p>
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

    page = (head('Glossary: AI App Building Terms, Explained | Bolt.new', desc, SITE, ld)
            + NAV + body + FOOTER + NAV_H_JS + INDEX_JS + SCRIPTS)
    write(os.path.join(OUT, 'index.html'), page)


# ── Template 2: term page ──────────────────────────────────────────────────
KNOW = [
    ('All solutions', 'https://bolt.new/solutions',
     'From solo builders to enterprise organizations, build what your business needs to grow the way your business needs it.',
     '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),
    ('All use cases', 'https://bolt.new/use-cases',
     'Build apps, websites, internal tools, and dashboards from a single prompt.',
     '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'),
    ('All templates', 'https://bolt.new/resources/templates',
     'Start from a build that already works, then customize it until it matches what your business actually does. Quicker than starting from nothing.',
     '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
]


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
             'url': url, 'inDefinedTermSet': {'@type': 'DefinedTermSet', '@id': SITE + '#set', 'name': 'Bolt.new Glossary', 'url': SITE}},
            {'@type': 'WebPage', '@id': url, 'url': url, 'name': h1, 'description': plain_lead,
             'about': {'@id': url + '#term'}},
            {'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Resources', 'item': 'https://bolt.new/resources'},
                {'@type': 'ListItem', 'position': 2, 'name': 'Glossary', 'item': SITE},
                {'@type': 'ListItem', 'position': 3, 'name': t['name'], 'item': url}]},
        ]})

    chips = '\n'.join('          <li><a class="gl-chip" href="../%s/">%s</a></li>' % (r['slug'], esc(r['name'])) for r in rel)
    reading = '\n'.join(
        '        <a class="gl-reading-item" href="%s"><span class="gl-reading-kind">%s</span><span class="gl-reading-title">%s</span></a>'
        % (u, esc(k), esc(ti)) for k, ti, u in READING)
    cards = '\n'.join(
        '      <a href="%s" class="int-card">\n'
        '        <canvas class="int-card-hover-canvas" aria-hidden="true"></canvas>\n'
        '        <div class="int-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg></div>\n'
        '        <h3 class="int-name">%s <span class="gl-arrow" aria-hidden="true"></span></h3>\n'
        '        <p class="int-desc">%s</p>\n'
        '      </a>' % (u, icon, esc(n), esc(d)) for n, u, d, icon in KNOW)

    body = """<!-- ─── TERM ──────────────────────────────────────────────────────────────── -->
<main class="gl-term-main">
  <div class="section-inner gl-term-grid">
    <article class="gl-article">
      <a class="gl-back" href="../"><span class="gl-arrow gl-arrow--back" aria-hidden="true"></span>All terms</a>
      <nav class="gl-crumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="https://bolt.new/resources">Resources</a></li>
          <li><a href="../">Glossary</a></li>
          <li><span aria-current="page">%s</span></li>
        </ol>
      </nav>
      <h1 class="gl-term-h1">%s</h1>
      <p class="gl-term-lead">%s</p>
      <div class="gl-related">
        <h2 class="gl-label">Related terms</h2>
        <ul class="gl-chips">
%s
        </ul>
      </div>
    </article>
    <aside class="gl-aside" aria-label="Related reading">
      <div class="gl-reading">
        <p class="gl-label gl-label--blue">Related reading</p>
%s
        <a class="gl-reading-all" href="https://bolt.new/blog">All articles <span class="gl-arrow" aria-hidden="true"></span></a>
      </div>
    </aside>
  </div>
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
    <div class="gl-know-grid">
%s
    </div>
  </div>
</section>

""" % (esc(t['name']), esc(h1), lead, chips, reading, cards)

    # The term page has no hero, so the nav sits solid in flow (the over-hero
    # variant is transparent with white ink and would vanish on a light ground).
    nav = NAV.replace('class="mkt-nav mkt-nav--over-hero"', 'class="mkt-nav"')
    desc = plain_lead if len(plain_lead) <= 158 else plain_lead[:155].rsplit(' ', 1)[0] + '…'
    # Only the lifted chrome sits one level deeper than its source; the
    # body's own links (../ = the index, ../<slug>/ = siblings) are already right.
    page = (rebase(head(h1 + ' Definition | Bolt.new Glossary', desc, url, ld) + nav)
            + body + rebase(FOOTER + NAV_H_JS + SCRIPTS))
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
