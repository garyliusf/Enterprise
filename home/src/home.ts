/* ============================================================================
   HOME PAGE COPY — every section below the hero, from the Figma "Marketing
   home page Sept 2026" (2026-10-16). The hero lives in config.ts (`hero`).
   Placeholder copy the mockup itself leaves open is marked PLACEHOLDER.
   ============================================================================ */
import { asset } from './config';

/* ── Showcase: two drifting rows of "Tell bolt" cards ─────────────────────
   Shots are the template captures we already have until the real app
   screenshots arrive. */
export type ShowcaseCard = { shot: string; prompt: string; url: string };
const fork = (id: string) => `https://bolt.new/fork/${id}`;
export const showcase: { rowA: ShowcaseCard[]; rowB: ShowcaseCard[] } = {
  rowA: [
    { shot: asset('/templates/soda.webp'), prompt: 'An online store for my soda brand with a build-your-own flavor menu', url: fork('sb1-r5f2szok') },
    { shot: asset('/templates/wedding.webp'), prompt: 'A portfolio site for my wedding planning business with an inquiry form', url: fork('sb1-xcpxwqz1') },
    { shot: asset('/templates/mow.webp'), prompt: 'A lawn care site that gives instant quotes and books recurring visits', url: fork('sb1-vipe17ab') },
    { shot: asset('/templates/catalog/premium-saas-dashboard-lp.webp'), prompt: 'A landing page for my SaaS with pricing and a waitlist', url: fork('github-xtrskmb3') },
    { shot: asset('/templates/cleaning.webp'), prompt: 'A home cleaning site with a service area map and quote requests', url: fork('sb1-33phwvdj') },
  ],
  rowB: [
    { shot: asset('/templates/catalog/maison-voyage.webp'), prompt: 'A travel journal with destination guides and stories', url: fork('github-mu7mffmh') },
    { shot: asset('/templates/plumbing.webp'), prompt: 'A plumbing company site with online booking and recent jobs', url: fork('sb1-v6i8qmpp') },
    { shot: asset('/templates/catalog/ledger-finance.webp'), prompt: 'A budgeting app with cash-flow charts for my freelance income', url: fork('github-7mpvjfb3') },
    { shot: asset('/templates/rootline.webp'), prompt: 'An editorial site for my landscape design studio', url: fork('sb1-nkwmdgm3') },
    { shot: asset('/templates/construction.webp'), prompt: 'A construction company site with projects and a quote form', url: fork('sb1-34h1wpsy') },
  ],
};

/* ── Stats ──────────────────────────────────────────────────────────────── */
export const stats = [
  { value: '10M+', label: 'builders on bolt.new' },
  { value: '80%', label: 'never shipped an app before' },
  { value: '4.9/5', label: 'average user rating' },
  { value: '1 day', label: 'idea to live site' },
];

/* ── Build anything: five use-case cards ───────────────────────────────────
   One feature + four standard cards close a 3-column grid exactly
   (2+1 / 3); six always left an orphan. The mockup repeats one landscaping
   card; these are distinct businesses. Photos reuse the people set. */
export const useCases = {
  eyebrow: 'Build anything',
  title: 'Build anything you need, the way you need it.',
  subtitle: 'No two businesses are alike, so no two Bolt.new projects are either.',
  more: { label: 'See All Use Cases', href: 'https://bolt.new/use-cases' },
  items: [
    { tag: 'Landscaping', title: 'Take quote requests with photos', body: 'Customers snap a photo of their yard and get a quote back the same day.', photo: asset('/people/founder-laptop.webp'), focus: '62% 35%' },
    { tag: 'Restaurants', title: 'Take reservations without the fees', body: 'A booking page on your own domain, with reminders, instead of a cut of every table.', photo: asset('/people/founder-chef.webp'), focus: '50% 28%' },
    { tag: 'Trades', title: 'Book jobs from your phone', body: 'A site that takes the call for you: services, availability and a deposit up front.', photo: asset('/people/founder-glasses.webp'), focus: '62% 30%' },
    { tag: 'Retail', title: 'Open an online store this week', body: 'Catalog, checkout and inventory that updates itself as orders come in.', photo: asset('/people/founder-terracotta.webp'), focus: '50% 38%' },
    { tag: 'Agencies', title: 'Give every client a dashboard', body: 'Project status, files and messages in a portal your clients can log in to.', photo: asset('/people/founder-agency.webp'), focus: '62% 40%' },
  ],
};

/* ── Customer stories ───────────────────────────────────────────────────── */
export const stories = {
  /* PLACEHOLDER: the mockup's header still reads Label / Title / A sentence */
  eyebrow: 'Customer stories',
  title: 'Built by people who had never built before.',
  subtitle: 'Real businesses, built and launched on Bolt.',
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
  title: 'From idea to live, in five moves.',
  subtitle: 'You never have to learn a complicated tool. You just describe what you want.',
  items: [
    { kicker: 'Describe what you need', title: 'Just tell it, like you would a friend', body: 'No forms, no templates to pick through, no technical spec to write. Type what you need the way you would explain it out loud, and that is enough to start.', visual: 'prompt' as const },
    { kicker: 'Watch it build instantly', title: 'See a real, working version take shape', body: 'Bolt writes and assembles an actual website or app in front of you, live. Not a mockup, not a wireframe, not a preview you wait days to see.', visual: 'build' as const },
    { kicker: 'Everything configured', title: 'Hosting, database, payments and auth, already wired up', body: 'You do not connect a single service yourself. Every project ships with its backend configured, so the thing you described actually works the moment it exists.', visual: 'wired' as const },
    { kicker: 'Built securely', title: 'Every project is reviewed before it goes live', body: 'A security agent checks what was built and fixes what it finds, so the version your customers touch is safe by default. You do not need to know what any of it means.', visual: 'secure' as const },
    { kicker: 'Deployed with one click', title: 'Publish it live, whenever you are ready', body: 'No hosting setup, no server configuration, no separate deploy step. One click and it is on the web, on your own domain, in front of customers.', visual: 'deploy' as const },
  ],
};

/* ── Templates ──────────────────────────────────────────────────────────── */
export const templatesHome = {
  eyebrow: 'Templates',
  title: 'Start from a template, not a blank prompt',
  subtitle: 'Bolt-built templates give you a working foundation, styled and wired up, so you’re customizing instead of starting from nothing.',
  more: { label: 'Browse All Templates', href: 'https://bolt.new/resources/templates' },
  /* the solutions page's rail: the catalog's cards (800px-wide full-page
     shots, portrait frame, drift on hover), production's fork links */
  items: [
    { name: 'Architect Portfolio', tag: 'Portfolio', shot: asset('/templates/catalog/architect-portfolio.webp'), url: fork('github-gf8uflaz') },
    { name: 'SaaS Landing', tag: 'SaaS', shot: asset('/templates/catalog/premium-saas-dashboard-lp.webp'), url: fork('github-xtrskmb3') },
    { name: 'Finance Tracker', tag: 'Apps', shot: asset('/templates/catalog/ledger-finance.webp'), url: fork('github-7mpvjfb3'), w: 1100, h: 1447 },
    { name: 'Travel Journal', tag: 'Editorial', shot: asset('/templates/catalog/maison-voyage.webp'), url: fork('github-mu7mffmh'), w: 1000, h: 1458 },
    { name: 'Studio Portfolio', tag: 'Portfolio', shot: asset('/templates/catalog/noir-agency.webp'), url: fork('github-hnstivng') },
    { name: 'Venture Capital', tag: 'Finance', shot: asset('/templates/catalog/meridian-capital.webp'), url: fork('github-9c8ejdg2') },
    { name: 'Fashion Editorial', tag: 'Editorial', shot: asset('/templates/catalog/vestige-fashion.webp'), url: fork('github-nehpa2f2'), w: 1100, h: 1450 },
    { name: 'Events Guide', tag: 'Websites', shot: asset('/templates/catalog/townhall-events.webp'), url: fork('github-pde6glqh') },
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
    { label: 'Security engineer', title: 'An automatic security review on every publish', body: 'A security agent checks what was built and fixes what it finds before customers see it, with no setup.', points: ['Runs on every publish, no setup', 'Finds and fixes issues before customers see them', 'Plain-language report of what changed'], link: { label: 'See the Security Engineer', href: 'https://bolt.new/platform/security' }, video: 'new-security' },
    { label: 'Dictation mode', title: 'Say it instead of typing it', body: 'Describe your idea out loud. Bolt builds from your voice just as well as from the keyboard.', points: ['Describe the idea out loud, Bolt builds it', 'Works in the composer and in follow-ups', 'Available on every plan'], link: { label: 'Try Dictation', href: 'https://bolt.new/' }, video: 'new-dictation' },
  ],
};

/* ── Enterprise ─────────────────────────────────────────────────────────── */
export const enterprise = {
  eyebrow: 'For enterprise',
  title: 'Need it to scale across a team?',
  body: 'The same Bolt your builders already use, with the governance, security and support an organization needs to roll it out.',
  logosLabel: 'Trusted by teams shipping with AI',
  logos: [
    { src: asset('/logos/intel.svg'), alt: 'Intel' },
    { src: asset('/logos/meta.svg'), alt: 'Meta' },
    { src: asset('/logos/salesforce.svg'), alt: 'Salesforce' },
    { src: asset('/logos/shopify.svg'), alt: 'Shopify' },
    { src: asset('/logos/mozilla.svg'), alt: 'Mozilla' },
    { src: asset('/logos/hubspot-logo.svg'), alt: 'HubSpot' },
  ],
  features: [
    { icon: 'key', title: 'SSO & SAML', body: 'Okta, Azure AD and every major SAML provider, with domain restrictions.' },
    { icon: 'list', title: 'Audit logs', body: 'Every project, publish and seat change, exportable to your SIEM.' },
    { icon: 'shield', title: 'SOC 2 Type II', body: 'Certified controls, DPA and MSA. Enterprise data is never used for training.' },
    { icon: 'cloud', title: 'BYOK deployment', body: 'Run Bolt inside your own AWS or Azure tenant, fully isolated.' },
    { icon: 'users', title: 'Role-based access', body: 'Admin, builder and viewer roles, provisioned from your directory.' },
    { icon: 'chat', title: 'Dedicated support', body: 'A named customer success manager and a private Slack channel.' },
  ],
  /* the enterprise page's 1:1 strip; the form hands the email to the enterprise page's own form anchor */
  strip: { lead: 'Schedule a 1:1 with', name: 'Mason', placeholder: 'Your work email', cta: 'Book a 1:1', action: 'https://bolt.new/enterprise#talk-to-sales' },
  more: { label: 'See Bolt for Enterprise', href: 'https://bolt.new/enterprise' },
};

/* ── Closing CTA ────────────────────────────────────────────────────────── */
export const closing = {
  eyebrow: 'Really',
  title: 'You can just build it.',
  subtitle: 'Free to start. Pro plans from $25/month.',
  trust: ['No credit card', 'No install'],
};
