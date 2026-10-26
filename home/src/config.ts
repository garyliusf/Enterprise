/* ============================================================================
   BUILDER’S WEEK — every piece of copy and every date that is still moving
   lives here, so a decision lands as a one-line edit.

   Copy rules for every Builders Week asset (from the launch page in Notion):
   - "Unlimited" in the headline, rate limits in the fine print.
   - No token counts. Never name a default model. Percentages only.
   - Say "open models" in public.
   - Anything that links here deep-links to this page, never the homepage.

   Anything marked TBC is a placeholder waiting on a decision. `tbc: true`
   renders a small "TBC" tag on the page so nobody mistakes it for final copy;
   flip it off once the value is confirmed.
   ============================================================================ */

/* Public files are referenced root-relative ('/people/x.webp'); asset() adds
   Vite's base so the same build works at the site root (Bolt) and in a
   subfolder (the GitHub Pages staging preview). */
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, '');

/* Home hero (Figma: "Marketing home page Sept 2026", 2026-10-16). */
export const hero = {
  titleSerif: 'Describe it.',
  titleSans: 'Bolt builds it.',
  subtitle:
    'Describe your idea in your own words and get a real website or app you can publish today. No code. No developer.',
  /* the prompt box: example prompt (also the SEO-crawlable placeholder),
     suggestion pills that fill it, and the submit label */
  promptExample: 'Create a client dashboard for my design studio that includes files and messaging',
  /* the examples typed out in the empty box, in order (Gary, 2026-10-26) */
  promptPills: [
    { label: 'Client dashboard', prompt: 'Create a client dashboard for my design studio that includes files and messaging' },
    { label: 'Online storefront', prompt: 'Build an online store for my ceramics studio that tracks inventory automatically' },
    { label: 'Booking site', prompt: 'My dog walking business needs a booking site that takes customer deposits' },
  ],
  promptCta: 'Build Now',
  trust: ['Free to start', 'No credit card required'],
  /* what to build, under the prompt: bolt.new's intent picker, same ids,
     labels and instructions as the app (packages/bolt/app/components/chat/
     intents.ts); App second here (Gary, 2026-10-26). A tile selects one
     intent (click again to clear) and its instruction is prepended to the
     prompt on send, exactly as Chat.client.tsx does */
  projectTypes: [
    { id: 'website', label: 'Website', icon: 'globe', instruction: 'Build this as a website or web app.' },
    { id: 'app', label: 'App', icon: 'devices', instruction: 'Build this as a web app.' },
    { id: 'slides', label: 'Slides', icon: 'slides', instruction: 'Build this as a presentation slide deck.' },
    { id: 'prototype', label: 'Prototype', icon: 'flask', instruction: 'Build this as an interactive UI prototype.' },
  ] as { id: string; label: string; icon: 'globe' | 'devices' | 'slides' | 'flask'; instruction: string; isNew?: boolean }[],
};

import type { PixelIconName } from './components/ui';

export const weekend = {
  eyebrow: 'Free build weekend',
  title: 'Two days of free building', /* not "unlimited": rate limits apply */
  subtitle:
    'From Saturday morning to Sunday night, every Bolt user gets GLM 5.3 Flash free in the model picker. No plan change, no code to redeem.',
  points: [
    {
      icon: 'plus' as PixelIconName,
      title: 'Everyone gets access',
      body: 'Free, personal paid and Teams accounts all get it. On Teams, every member gets their own allowance.',
    },
    {
      icon: 'clock' as PixelIconName,
      title: 'A fresh block every six hours',
      body: 'Your allowance comes in six-hour blocks. A block starts when you open Bolt, and your first visit after it ends starts the next one.',
    },
    {
      icon: 'up' as PixelIconName,
      title: 'More on paid plans',
      body: 'Paid plans get five times the free allowance in every block.',
    },
  ],
  /* Mosaic photos (public/people). Placeholders: three photos repeat until
     the final set arrives — add files here and they slot into the grid in
     order. `focus` is the object-position that keeps the person in frame. */
  /* flip: mirror horizontally so the edge tiles face into the grid (only
     for shots with no visible text) */
  photos: [
    { src: asset('/people/founder-greenhouse.webp'), alt: 'A gardener crouching among plants in a greenhouse, tablet in hand', focus: '38% 30%' },
    { src: asset('/people/founder-terracotta.webp'), alt: 'A woman typing on a laptop against a terracotta wall', focus: '50% 38%' },
    { src: asset('/people/founder-coffee.webp'), alt: 'A woman talking across her laptop in a bright café', focus: '55% 32%' },
    { src: asset('/people/founder-agency.webp'), alt: 'Two colleagues reviewing work together on a laptop', focus: '50% 32%' },
    { src: asset('/people/founder-chef.webp'), alt: 'A smiling chef in an apron, arms folded on the counter', focus: '50% 28%' },
    { src: asset('/people/founder-glasses.webp'), alt: 'A man in glasses and an apron reviewing notes at his counter', focus: '62% 30%' },
  ],
  /* Only shown once DigitalOcean confirms they are covering inference. */
  partner: { show: false, name: 'DigitalOcean', line: 'Free inference for the weekend is provided by DigitalOcean.' },
  finePrint:
    'The free weekend runs from Saturday Oct 17 at 12:00am PDT to Sunday Oct 18 at 11:59pm PDT. GLM 5.3 Flash is the only free model during the weekend. Rate limits apply. Blocks you miss do not carry over.',
};

export type Session = {
  day: string;
  time: string;
  title: string;
  host: string;
  blurb: string;
  icon?: PixelIconName;
  /* featured card only: a photo of the hosts, blended into the card's right edge */
  photo?: string;
  /* names along the bottom of the photo */
  photoCaption?: string;
  /* Luma event page (RSVP) */
  url?: string;
  /* speaker headshot (public/people), shown in the card's host row; initials until set */
  hostPhoto?: string;
  /* ISO start/end — set once confirmed; drives the countdown and calendar link */
  start?: string;
  end?: string;
  tbc?: boolean;
};

/* Descriptions are from the CX program page (Notion). Only the Eric & Pai
   Q&A is confirmed; the rest need dates and times. */
export const sessions: Session[] = [
  /* All four from Luma (Blake, 2026-10-12); times are PT. */
  {
    day: 'Tue Oct 20',
    time: '10–11am PT',
    title: 'Ask Eric & Albert anything',
    host: 'Eric Simons, CEO, and Albert Pai, CTO',
    blurb: 'Bolt’s co-founders take your questions live and unscripted: the turnaround, the riskiest product bets, and the advice they think is overrated. Send your questions in advance.',
    photo: asset('/people/eric-pai.webp'),
    photoCaption: 'Eric Simons & Albert Pai',
    url: 'https://luma.com/bolt-y5tz',
    start: '2026-10-20T17:00:00Z',
    end: '2026-10-20T18:00:00Z',
  },
  {
    day: 'Wed Oct 21',
    time: '10:30–11am PT',
    title: 'Help customers find you',
    icon: 'up',
    host: 'Alberto Aviles, Head of Demand Generation',
    hostPhoto: asset('/people/alberto-aviles.webp'),
    blurb: 'Three SEO tips for your Bolt site: titles that earn the click, getting your pages found, and one search term per page.',
    url: 'https://luma.com/bolt-nk7v',
    start: '2026-10-21T17:30:00Z',
    end: '2026-10-21T18:00:00Z',
  },
  {
    day: 'Thu Oct 22',
    time: '10:30–11:30am PT',
    title: 'Turn sign-ups into regulars',
    icon: 'rocket',
    host: 'Enrique Hoyos, Growth Marketing Lead',
    hostPhoto: asset('/people/enrique-hoyos.webp'),
    blurb: 'Onboarding, adoption and retention: get new users to a first win, keep them coming back, and spot who is about to leave.',
    url: 'https://luma.com/bolt-ueio',
    start: '2026-10-22T17:30:00Z',
    end: '2026-10-22T18:30:00Z',
  },
  {
    day: 'Fri Oct 23',
    time: '10:30–11:30am PT',
    title: 'How to stand out',
    icon: 'chat',
    host: 'Qian Yu, Head of Design',
    hostPhoto: asset('/people/qian-yu.webp'),
    blurb: 'A design and branding clinic: what makes customers choose you, then live reviews of founder projects. Share yours in the chat.',
    url: 'https://luma.com/bolt-pli7',
    start: '2026-10-23T17:30:00Z',
    end: '2026-10-23T18:30:00Z',
  },
];

type FounderTemplate = {
  name: string;
  blurb: string;
  url?: string;
  /* Full-page screenshot of the template's landing page, in public/templates/
     (e.g. '/templates/waitlist.webp', 800px wide). Without one the card shows
     a placeholder page mock. */
  shot?: string;
  /* intrinsic size of the shot (defaults to the 800x2245 capture format) */
  w?: number;
  h?: number;
  /* single-screen app view: cover-fill the card, no hover drift (catalog `fill`) */
  fill?: boolean;
  tag?: string;
};

export const templates = {
  tbc: false,
  items: [
    /* Business templates, public fork links (Gary, 2026-10-14). They replace
       the private bolt.new/p/ share links, which sent visitors to login or
       "Request access". Shots: full-page captures at 1440px, cropped to the
       catalog's 800x2245. */
    { name: 'Landscape Studio', blurb: 'Rootline: an editorial site for a design-build landscape studio.', url: 'https://bolt.new/fork/sb1-nkwmdgm3', shot: asset('/templates/rootline.webp'), tag: 'Services' },
    { name: 'Lawn Care', blurb: 'Mow Problems: instant quotes, plans and a service-area map.', url: 'https://bolt.new/fork/sb1-vipe17ab', shot: asset('/templates/mow.webp'), tag: 'Services' },
    { name: 'Plumbing', blurb: 'Flow State Plumbing: services, booking and recent jobs.', url: 'https://bolt.new/fork/sb1-v6i8qmpp', shot: asset('/templates/plumbing.webp'), tag: 'Services' },
    { name: 'HVAC Company', blurb: 'Comfort Co.: heating and cooling services, plans and reviews.', url: 'https://bolt.new/fork/sb1-mvfl725s', shot: asset('/templates/hvac.webp'), tag: 'Services' },
    { name: 'Construction', blurb: 'Northfield Builders: services, projects and quotes.', url: 'https://bolt.new/fork/sb1-34h1wpsy', shot: asset('/templates/construction.webp'), tag: 'Services' },
    { name: 'Home Cleaning', blurb: 'Clearwater: services, service area and quote requests.', url: 'https://bolt.new/fork/sb1-33phwvdj', shot: asset('/templates/cleaning.webp'), tag: 'Services' },
    { name: 'Soda Shop', blurb: 'Groovy Gulp: a playful menu and build-your-own drinks.', url: 'https://bolt.new/fork/sb1-r5f2szok', shot: asset('/templates/soda.webp'), tag: 'Food & Drink' },
    { name: 'Wedding Planner', blurb: 'Clara Hooshmand: real weddings, services and inquiries.', url: 'https://bolt.new/fork/sb1-xcpxwqz1', shot: asset('/templates/wedding.webp'), tag: 'Events' },
    /* The first 8 of the templates catalog (marketing/templates), in catalog
       order. Names, tags and shots are the catalog's; the "Open in Bolt" fork
       links are production's (bolt-public-pages src/content/templates/*.json). */
    { name: 'Architect Portfolio', blurb: 'A quiet, typographic studio site.', url: 'https://bolt.new/fork/github-gf8uflaz', shot: asset('/templates/catalog/architect-portfolio.webp'), tag: 'Portfolio' },
    { name: 'SaaS Landing', blurb: 'Metrics, feature grid, and pricing.', url: 'https://bolt.new/fork/github-xtrskmb3', shot: asset('/templates/catalog/premium-saas-dashboard-lp.webp'), h: 3339, tag: 'SaaS' },
    { name: 'Finance Tracker', blurb: 'Budgeting with cash-flow charts.', url: 'https://bolt.new/fork/github-7mpvjfb3', shot: asset('/templates/catalog/ledger-finance.webp'), w: 1100, h: 1447, fill: true, tag: 'Apps' },
    { name: 'Travel Journal', blurb: 'Destinations and atelier stories.', url: 'https://bolt.new/fork/github-mu7mffmh', shot: asset('/templates/catalog/maison-voyage.webp'), w: 1000, h: 1458, tag: 'Editorial' },
  ] as FounderTemplate[],
};

[] = [
  {
    q: 'Who can take part in Builders Week?',
    a: 'Anyone with a Bolt account can join the build weekend and the sessions. The contest is open to individuals 18 and over, teams and organizations, with some exclusions listed in the official rules.',
  },
  {
    q: 'Is the build weekend really free?',
    a: 'Yes. From Saturday Oct 17 at 12:00am PDT to Sunday Oct 18 at 11:59pm PDT, GLM 5.3 Flash is free in the model picker for every account, free and paid. It is the only free model that weekend. Your allowance comes in six-hour blocks and rate limits apply. No paid plan is needed to enter the contest either.',
  },
  {
    q: 'Does my project have to be new?',
    /* Gary, 2026-10-09: projects don't have to be new. NOTE the rules page (Terms.tsx, legal's text) still says "a new application, created during the Submission Period" — legal to reconcile. */
    a: 'No. Your project doesn’t have to be new, it just has to be built in Bolt. Submit it between Oct 13 and Oct 20. Other tools can play a supporting role if you disclose them.',
  },
  {
    q: 'When are the winners announced?',
    a: 'Submissions close on Tuesday Oct 20. Judging runs Oct 21 to 31, and winners are announced on or about Oct 31 on this page and on social.',
  },
];

