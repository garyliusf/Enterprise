/* ============================================================================
   HOME PAGE COPY — every section below the hero, from the Figma "Marketing
   home page Sept 2026" (2026-10-16). The hero lives in config.ts (`hero`).
   Placeholder copy the mockup itself leaves open is marked PLACEHOLDER.
   ============================================================================ */
import { asset } from './config';

/* ── Showcase: two drifting rows of "Tell bolt" cards ─────────────────────
   Shots are the template captures we already have until the real app
   screenshots arrive. */
/* url = fork into Bolt ("Open in Bolt"); preview = the live site ("Preview"),
   from production's template data; the sb1-* ones from Notion's "Founders Week
   templates" database (2026-10-20). All are down right now — see SHOW_PREVIEW */
export type ShowcaseCard = { shot: string; prompt: string; url: string; preview?: string; name?: string; tag?: string };
const fork = (id: string) => `https://bolt.new/fork/${id}`;
export const showcase: { rowA: ShowcaseCard[]; rowB: ShowcaseCard[] } = {
  rowA: [
    { shot: asset('/templates/soda.webp'), prompt: 'An online store for my soda brand with a build-your-own flavor menu', url: fork('sb1-r5f2szok'), preview: 'https://template-soda.bolt.host', name: 'Soda Shop', tag: 'Retail' },
    { shot: asset('/templates/wedding.webp'), prompt: 'A portfolio site for my wedding planning business with an inquiry form', url: fork('sb1-xcpxwqz1'), preview: 'https://template-wedding-planner.bolt.host', name: 'Wedding Planner', tag: 'Events' },
    { shot: asset('/templates/catalog/vantage-dashboard.webp'), prompt: 'A real-time analytics dashboard for my product metrics', url: fork('github-bhayfs7z'), preview: 'https://template-vantage-dashboard.bolt.host', name: 'Pooled analytics dashboard', tag: 'Internal tools' },
    { shot: asset('/templates/mow.webp'), prompt: 'A lawn care site that gives instant quotes and books recurring visits', url: fork('sb1-vipe17ab'), preview: 'https://template-lawn-care.bolt.host', name: 'Lawn Care', tag: 'Trades' },
    { shot: asset('/templates/catalog/premium-saas-dashboard-lp.webp'), prompt: 'A landing page for my SaaS with pricing and a waitlist', url: fork('github-xtrskmb3'), preview: 'https://template-premium-saas-dashboard-lp.bolt.host', name: 'SaaS Landing', tag: 'SaaS' },
  ],
  rowB: [
    { shot: asset('/templates/catalog/maison-voyage.webp'), prompt: 'A travel journal with destination guides and stories', url: fork('github-mu7mffmh'), preview: 'https://template-maison-voyage.bolt.host', name: 'Travel Journal', tag: 'Editorial' },
    { shot: asset('/templates/plumbing.webp'), prompt: 'A plumbing company site with online booking and recent jobs', url: fork('sb1-v6i8qmpp'), preview: 'https://template-plumbing.bolt.host', name: 'Plumbing', tag: 'Trades' },
    { shot: asset('/templates/catalog/ledger-finance.webp'), prompt: 'A budgeting app with cash-flow charts for my freelance income', url: fork('github-7mpvjfb3'), preview: 'https://template-ledger-finance.bolt.host', name: 'Finance Tracker', tag: 'Apps' },
    { shot: asset('/templates/rootline.webp'), prompt: 'An editorial site for my landscape design studio', url: fork('sb1-nkwmdgm3'), preview: 'https://template-landscaping.bolt.host', name: 'Landscape Studio', tag: 'Trades' },
  ],
};

/* ── Stats ──────────────────────────────────────────────────────────────── */
export const stats = [
  /* review 2026-10-26: Bolt.new capitalised, time second (1 day → 5 min),
     new 80% line, the 4.9/5 rating dropped */
  { value: '10M+', label: 'builders on Bolt.new' },
  { value: '5 min', label: 'from idea to live site' },
  { value: '80%', label: 'of Bolt.new users are first-time builders' },
];

/* ── Build anything: five use-case cards ───────────────────────────────────
   One feature + four standard cards close a 3-column grid exactly
   (2+1 / 3); six always left an orphan. The mockup repeats one landscaping
   card; these are distinct businesses. Photos reuse the people set. */
export const useCases = {
  eyebrow: 'Build anything',
  title: 'Build exactly what you want.',
  subtitle: 'Make every feature fit your needs.',
  more: { label: 'See All Use Cases', href: 'https://bolt.new/use-cases' },
  items: [
    { tag: 'Landscaping', title: 'Take quote requests with photos', body: 'Customers snap a photo of their yard and get a quote back the same day.', photo: asset('/people/founder-greenhouse.webp'), focus: '38% 30%', href: 'https://bolt.new/use-cases/contractor-invoice-app-builder' },
    { tag: 'Trades', title: 'Book jobs from your phone', body: 'A site that takes the call for you: services, availability and a deposit up front.', photo: asset('/people/founder-glasses.webp'), focus: '62% 30%', href: 'https://bolt.new/use-cases/appointment-booking-app-builder' },
    { tag: 'Restaurants', title: 'Take reservations without the fees', body: 'A booking page on your own domain, with reminders, instead of a cut of every table.', photo: asset('/people/founder-chef.webp'), focus: '50% 28%', href: 'https://bolt.new/use-cases/restaurant-website-builder' },
    { tag: 'Agencies', title: 'Give every client a dashboard', body: 'Project status, files and messages in a portal your clients can log in to.', photo: asset('/people/founder-agency.webp'), focus: '50% 32%', href: 'https://bolt.new/use-cases/dashboard-builder' },
    { tag: 'Retail', title: 'Open an online store this week', body: 'Catalog, checkout and inventory that updates itself as orders come in.', photo: asset('/people/founder-terracotta.webp'), focus: '50% 38%', href: 'https://bolt.new/use-cases/online-store-builder' },
  ],
};

/* ── Customer stories ───────────────────────────────────────────────────── */
export const stories = {
  /* review copy, 2026-10-26 */
  eyebrow: 'Customer stories',
  title: 'Real businesses, built with Bolt',
  subtitle: 'Testimonies from first-time builders who launched their businesses using Bolt.',
  items: [
    /* PLACEHOLDER quotes until real customer stories land — the first is the
       mockup's; the rest are written to the same pattern so the rail has
       enough voices to drift. Replace all five. */
    { quote: 'I quoted three agencies before I found Bolt. I built the whole booking system myself in a weekend, for less than one agency’s deposit.', name: 'Maria R.', role: 'Owner, Verde Landscaping' },
    { quote: 'Our clients used to email for updates. Now they log in to a portal I built in an afternoon, and the emails stopped.', name: 'Daniel K.', role: 'Founder, Northline Studio' },
    { quote: 'I had never built anything before. The first version of our store took a weekend, and it’s what we run on today.', name: 'Priya S.', role: 'Co-owner, Kiln & Clay' },
    { quote: 'Reservations, deposits, reminders. All of it on our own domain, and nobody takes a cut of the table.', name: 'Tomás A.', role: 'Owner, Café Lumen' },
    { quote: 'The site takes the call for me now. Customers pick a time, pay the deposit, and I just show up.', name: 'Jordan W.', role: 'Plumber, Flow State' },
  ],
};

/* ── How it works: five moves ──────────────────────────────────────────── */
export const steps = {
  eyebrow: 'How it works',
  title: 'Bring your idea to life instantly', /* review copy, 2026-10-26 */
  subtitle: 'Describe what you want and Bolt builds it in minutes.',
  /* step titles + copy: review, 2026-10-26 — one header per step, the same open or closed (Gary) */
  items: [
    { kicker: 'Explain in your own words', title: 'Explain in your own words', body: 'Describe your idea and Bolt can start building right away.', visual: 'prompt' as const },
    { kicker: 'Watch Bolt build', title: 'Watch Bolt build', body: 'Bolt builds a real, working website or app in front of you in real time.', visual: 'build' as const },
    { kicker: 'No backend configuration', title: 'No backend configuration', body: 'Whether your site needs payments, a user database, auth, or something else, Bolt automatically configures the backend for you.', visual: 'wired' as const },
    { kicker: 'Secure by design', title: 'Secure by design', body: 'All your data is secure by default. Bolt’s security agent automatically finds and fixes issues as you build.', visual: 'secure' as const },
    { kicker: 'Publish in one click', title: 'Publish in one click', body: 'Go live in one click. No hosting setup or configuration necessary.', visual: 'deploy' as const },
  ],
};

/* ── Templates ──────────────────────────────────────────────────────────── */
export const templatesHome = {
  eyebrow: 'Templates',
  title: 'Start from a template', /* review copy, 2026-10-26 (the mockup's "so you can tou can" typo fixed) */
  subtitle: 'Discover our templates so you can start building your project even faster.',
  more: { label: 'Browse All Templates', href: 'https://bolt.new/resources/templates' },
  /* the solutions page's rail: the catalog's cards (800px-wide full-page
     shots, portrait frame, drift on hover), production's fork links */
  items: [
    { name: 'Architect Portfolio', tag: 'Portfolio', shot: asset('/templates/catalog/architect-portfolio.webp'), url: fork('github-gf8uflaz'), preview: 'https://template-minimalist-architect-portfolio.bolt.host' },
    { name: 'SaaS Landing', tag: 'SaaS', shot: asset('/templates/catalog/premium-saas-dashboard-lp.webp'), url: fork('github-xtrskmb3'), preview: 'https://template-premium-saas-dashboard-lp.bolt.host' },
    { name: 'Finance Tracker', tag: 'Apps', shot: asset('/templates/catalog/ledger-finance.webp'), url: fork('github-7mpvjfb3'), preview: 'https://template-ledger-finance.bolt.host', w: 1100, h: 1447 },
    { name: 'Travel Journal', tag: 'Editorial', shot: asset('/templates/catalog/maison-voyage.webp'), url: fork('github-mu7mffmh'), preview: 'https://template-maison-voyage.bolt.host', w: 1000, h: 1458 },
    { name: 'Studio Portfolio', tag: 'Portfolio', shot: asset('/templates/catalog/noir-agency.webp'), url: fork('github-hnstivng'), preview: 'https://template-noir-agency.bolt.host' },
    { name: 'Venture Capital', tag: 'Finance', shot: asset('/templates/catalog/meridian-capital.webp'), url: fork('github-9c8ejdg2'), preview: 'https://template-meridian-capital.bolt.host' },
    { name: 'Fashion Editorial', tag: 'Editorial', shot: asset('/templates/catalog/vestige-fashion.webp'), url: fork('github-nehpa2f2'), preview: 'https://template-vestige-fashion.bolt.host', w: 1100, h: 1450 },
    { name: 'Events Guide', tag: 'Websites', shot: asset('/templates/catalog/townhall-events.webp'), url: fork('github-pde6glqh'), preview: 'https://template-townhall-events.bolt.host' },
  ],
};

/* ── New this month: the three features, in the solutions page's tab
   slider (Gary, 2026-10-16). Visuals = Gary's clips (public/hero/new-*.webm/mp4 + poster). */
export const platform = {
  eyebrow: 'New this month',
  title: 'Built to keep up with you.',
  subtitle: 'Bolt keeps shipping new ways to build. Here is what just landed.',
  tabs: [
    { label: 'Showcase Slides', title: 'Turn any project into a slide deck', body: 'Generate a polished deck straight from what you already built, with every slide matching your brand and copy.', points: ['Generated from the project you already built', 'Every slide matches your brand and copy', 'Export to PDF or present from Bolt'], link: { label: 'See Showcase Slides', href: 'https://bolt.new/blog' }, video: 'new-slides' },
    { label: 'Security Engineer', title: 'An automatic security review on every publish', body: 'A security agent checks what was built and fixes what it finds before customers see it, with no setup.', points: ['Runs on every publish, no setup', 'Finds and fixes issues before customers see them', 'Plain-language report of what changed'], link: { label: 'See the Security Engineer', href: 'https://bolt.new/platform/security' }, video: 'new-security' },
    { label: 'Dictation Mode', title: 'Say it instead of typing it', body: 'Describe your idea out loud. Bolt builds from your voice just as well as from the keyboard.', points: ['Describe the idea out loud, Bolt builds it', 'Works in the composer and in follow-ups', 'Available on every plan'], link: { label: 'Try Dictation', href: 'https://bolt.new/' }, video: 'new-dictation' },
  ],
};

/* ── Enterprise ─────────────────────────────────────────────────────────── */
export const enterprise = {
  eyebrow: 'For enterprise',
  title: 'Bolt works for teams', /* review copy, 2026-10-26 */
  body: 'Bring Bolt to your organization so your entire team can build.',
  logosLabel: 'Trusted by teams shipping with AI',
  logos: [
    { src: asset('/logos/intel.svg'), alt: 'Intel' },
    { src: asset('/logos/meta.svg'), alt: 'Meta' },
    { src: asset('/logos/salesforce.svg'), alt: 'Salesforce' },
    { src: asset('/logos/shopify.svg'), alt: 'Shopify' },
    { src: asset('/logos/mozilla.svg'), alt: 'Mozilla' },
    { src: asset('/logos/hubspot-logo.svg'), alt: 'HubSpot' },
  ],
  /* review copy, 2026-10-26: plain language, SSO dropped (5 cards) */
  features: [
    { icon: 'users', title: 'Customize your plan', body: 'Decide which team members can build or just view.' },
    { icon: 'list', title: 'Monitor your team’s activity', body: 'Get audit logs so you can know exactly what changed.' },
    { icon: 'shield', title: 'Best-in-class security', body: 'Data protections are written into your contract. Plus, your data is never used for training.' },
    { icon: 'cloud', title: 'Customize your cloud setup', body: 'Run Bolt inside your own AWS or Azure tenant, fully isolated.' },
    { icon: 'chat', title: 'Dedicated support', body: 'You’ll get your own customer rep, a private Slack channel, and more.' },
  ],
  /* the enterprise page's 1:1 strip; the form hands the email to the enterprise page's own form anchor */
  strip: { lead: 'Schedule a 1:1', /* review 2026-10-26: no 'with Mason' */ placeholder: 'Your work email', cta: 'Book a 1:1', action: 'https://bolt.new/enterprise#talk-to-sales' },
  more: { label: 'See Bolt for Enterprise', href: 'https://bolt.new/enterprise' },
};

/* ── Closing CTA ────────────────────────────────────────────────────────── */
export const closing = {
  /* review copy, 2026-10-26: no subtitle, no trust line; the button is the
     hero's (the shared PromptBox) */
  eyebrow: 'Start building',
  title: 'Try Bolt now',
};
