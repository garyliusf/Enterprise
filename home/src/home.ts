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
    { shot: asset('/templates/catalog/kern-studio.webp'), prompt: 'A portfolio site for my creative agency that leads with our work', url: fork('github-kwsc4fm6'), preview: 'https://template-kern-studio.bolt.host', name: 'Creative agency website', tag: 'Portfolio' },
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
  title: 'Build what you have in mind',
  subtitle: 'Whether you’re building a customer-facing app or an internal tool for your team, Bolt allows you to customize every feature to fit your needs.',
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
    /* the Customer Showcase page's quotes, as Gary pasted them (2026-10-27).
       logo = the company's own mark (home/public/customers, 96px tiles cut from
       each site's header/icon); plate = dark ink, gets a white plate in dark
       mode. No logo → initials. Super LLM, VISION-LINK and Moj-kat were cut
       (Gary, 2026-10-27). The Scratch tile is the golf store Sky
       Lubreski runs the command center for. */
    { quote: "We were paying $70,000 a year for EDI software, so we had Bolt build our own. Two days in, I knew it would work. What would have taken years and a fortune in development was live in weeks, and ten carriers are now paying us every month.", name: "Paul Laviolette", role: "Founder, TradeWeave", logo: asset('/customers/tradeweave.webp') },
    { quote: "I’m not an engineer. I had a vision for connected healthcare and no team to build it. What really hit me was when outside organizations started validating what I’d built alone: approval on Zoom Marketplace, then a live Mercado Pago integration. That’s when I thought, okay, this actually works.", name: "Martin", role: "Founder, NetDoctor", logo: asset('/customers/netdoctor.webp'), plate: true },
    { quote: "The last time I wrote code, Cold Fusion was still owned by Allaire, 23 years ago. I set out to build a personal app to track my range progress, and a few hours in I had a working prototype that did almost everything I asked. By the next Monday it had become a multi-tenant SaaS. Coding it myself would have taken close to a thousand hours. Honestly, without Bolt I never would have built it at all.", name: "Larry Schlack", role: "Designer/PM, Range Tracker", logo: asset('/customers/range-tracker.webp'), plate: true },
    { quote: "I’d carried this idea, inspired by my own diabetes journey, for years and never had the time. With Bolt I described features in plain English and watched them come to life in minutes. Within days I had onboarding, nutrition tracking, dashboards, and auth running. I’d been quoted 80 to 90 thousand dollars just for the MVP. Instead I launched a beta and 100 people signed up in the first week.", name: "Jai Saini", role: "Founder, Ginger Pulse", logo: asset('/customers/ginger-pulse.webp'), plate: true },
    { quote: "I started out just wanting to experiment with AI, and almost immediately I could see how well Bolt understood what we were going for. Flag football is exploding, and we now have customers in eight states and 50,000 pageviews in two months. We’re about to close a pre-seed round to build ten more sports apps on top of it.", name: "Bradley Metrock", role: "Founder, FlagStat", logo: asset('/customers/flagstat.webp'), plate: true },
    { quote: "Bolt let me play with ideas that used to be out of reach. I was juggling a full-time job and dabbling at being a developer, and it worked the moment I tried it. I’m not dabbling anymore: I built a working lean-improvement tool and founded a company, EightCountyDigital, around it. On my own it would have taken thousands in investment and a team, and it simply wouldn’t have been feasible.", name: "Charles Revill", role: "Founder, E.L.I", logo: asset('/customers/eli.webp') },
    { quote: "We needed off WooCommerce, and I was a week into a standard Shopify build when it hit me, while vacuuming, that Bolt could do a headless site far faster. I ran to the computer. The new store is so much faster that the whole team breathed a sigh of relief, our email campaigns are easier to run, and we’ve been winning back about 10% a month.", name: "Michael Mastropasqua", role: "Agency/freelancer, Ole Florida Fly Shop", logo: asset('/customers/ole-florida.webp') },
    { quote: "After a few simple Bolt sites, I set out to rebuild my clients’ complex WooCommerce stores as headless Shopify sites. The built-in IDE is what sealed it for me. Ancient Tallow came out fast and beautiful, the founder is genuinely proud of it, and we launched on the biggest sales day the business has ever had.", name: "Michael Mastropasqua", role: "Agency/freelancer, Ancient Tallow", logo: asset('/customers/ancient-tallow.webp') },
    { quote: "I acquired a golf-simulator store and the operations were a mess. Once I realized I could wire the app into absolutely everything, it went from a neat idea to the thing our whole team relies on every day. We replaced a dozen separate tools, like Quo, Tidio, and QuickBooks, with one system built in-house, and the storefront was landing high-ticket sales in its first week.", name: "Sky Lubreski", role: "Founder, Ecom Command Center", logo: asset('/customers/scratch-golf.webp'), plate: true },
    { quote: "I’m building several businesses in Uganda, and traditional development was going to slow everything down. With Bolt, systems that would normally take weeks of engineering started working in hours. I realized it wasn’t just helping me build pages, it was helping me build an entire payments platform: mobile money, cards, QR, merchant onboarding. What used to take months now takes days.", name: "Ssebandeke Dullaart", role: "Founder, Orventa Payments", logo: asset('/customers/orventa.webp') },
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
