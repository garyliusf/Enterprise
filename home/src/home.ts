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

/* ── Build anything: six use-case cards ────────────────────────────────────
   The mockup repeats one landscaping card six times; these are six distinct
   businesses so the section reads as real. Photos reuse the people set. */
export const useCases = {
  eyebrow: 'Build anything',
  title: 'Build anything you need, the way you need it.',
  subtitle: 'No two businesses are alike, so no two Bolt.new projects are either.',
  more: { label: 'See all use cases', href: 'https://bolt.new/use-cases' },
  items: [
    { tag: 'Landscaping', title: 'Take quote requests with photos', body: 'Customers snap a photo of their yard and get a quote back the same day.', photo: asset('/people/founder-laptop.webp'), focus: '62% 35%' },
    { tag: 'Restaurants', title: 'Take reservations without the fees', body: 'A booking page on your own domain, with reminders, instead of a cut of every table.', photo: asset('/people/founder-apron.webp'), focus: '60% 18%' },
    { tag: 'Coaching', title: 'Sell sessions and run the calendar', body: 'Packages, payments and scheduling in one place, so you only have to show up.', photo: asset('/people/founder-coffee.webp'), focus: '55% 32%' },
    { tag: 'Retail', title: 'Open an online store this week', body: 'Catalog, checkout and inventory that updates itself as orders come in.', photo: asset('/people/founder-terracotta.webp'), focus: '50% 38%' },
    { tag: 'Agencies', title: 'Give every client a dashboard', body: 'Project status, files and messages in a portal your clients can log in to.', photo: asset('/people/founder-desk.webp'), focus: '58% 38%' },
    { tag: 'Trades', title: 'Book jobs from your phone', body: 'A site that takes the call for you: services, availability and a deposit up front.', photo: asset('/people/founder-glasses.webp'), focus: '62% 30%' },
  ],
};

/* ── Customer stories ───────────────────────────────────────────────────── */
export const stories = {
  /* PLACEHOLDER: the mockup's header still reads Label / Title / A sentence */
  eyebrow: 'Customer stories',
  title: 'Built by people who had never built before.',
  subtitle: 'Real businesses, built and launched on Bolt.',
  items: [
    /* PLACEHOLDER quotes from the mockup, until real customer stories land */
    { quote: 'I quoted three agencies before I found Bolt. I built the whole booking system myself in a weekend, for less than one agency’s deposit.', name: 'Maria R.', role: 'Owner, Verde Landscaping' },
    { quote: 'I quoted three agencies before I found Bolt. I built the whole booking system myself in a weekend, for less than one agency’s deposit.', name: 'Maria R.', role: 'Owner, Verde Landscaping' },
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
  title: 'Skip the blank page.',
  subtitle: 'Start from something built for a business like yours, then make it your own.',
  more: { label: 'Browse all templates', href: 'https://bolt.new/resources/templates' },
  items: [
    { name: 'Service business site', meta: 'Booking, quotes, contact', shot: asset('/templates/plumbing.webp'), url: fork('sb1-v6i8qmpp') },
    { name: 'Online storefront', meta: 'Catalog, checkout, inventory', shot: asset('/templates/soda.webp'), url: fork('sb1-r5f2szok') },
    { name: 'Client dashboard', meta: 'Status, files, messaging', shot: asset('/templates/catalog/ledger-finance.webp'), url: fork('github-7mpvjfb3'), fill: true },
  ],
};

/* ── New this month ─────────────────────────────────────────────────────── */
export const whatsNew = {
  eyebrow: 'New this month',
  title: 'Built to keep up with you.',
  subtitle: 'Bolt keeps shipping new ways to build. Here is what just landed.',
  items: [
    { title: 'Showcase Slides', body: 'Turn any project into a polished slide deck, generated straight from what you already built.', link: { label: 'See Showcase Slides', href: 'https://bolt.new/blog' } },
    { title: 'Security engineer', body: 'An automatic security review runs on every publish and fixes what it finds, with no setup.', link: { label: 'See the security engineer', href: 'https://bolt.new/platform/security' } },
    { title: 'Dictation mode', body: 'Say your idea out loud instead of typing it. Bolt builds from your voice just as well.', link: { label: 'Try dictation', href: 'https://bolt.new/' } },
  ],
};

/* ── Enterprise ─────────────────────────────────────────────────────────── */
export const enterprise = {
  eyebrow: 'For enterprise',
  title: 'Need it to scale across a team?',
  body: 'SSO, audit logs and compliance support come standard for teams that need to govern how Bolt gets used.',
  pills: ['SSO & SAML', 'Audit logs', 'SOC 2 Type II', 'Role-based access', 'Dedicated support'],
  cta: { label: 'Talk to Sales', href: 'https://bolt.new/enterprise#contact' },
  more: { label: 'See Bolt for enterprise', href: 'https://bolt.new/enterprise' },
};

/* ── Closing CTA ────────────────────────────────────────────────────────── */
export const closing = {
  eyebrow: 'Really',
  title: 'You can just build it.',
  subtitle: 'Free to start. Pro plans from $25/month.',
  trust: ['No credit card', 'No install'],
};
