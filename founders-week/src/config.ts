/* ============================================================================
   BUILDER’S WEEK — every piece of copy and every date that is still moving
   lives here, so a decision lands as a one-line edit.

   Copy rules for every Builder’s Week asset (from the launch page in Notion):
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

export const BOLT_URL = 'https://bolt.new/?utm_source=founders-week&utm_medium=landing';
export const TERMS_PATH = asset('/terms/');

export const hero = {
  eyebrow: 'Builder’s Week · Oct 17–24',
  /* Tagline is an open decision (Marketing drafts, Haily refines, CX signs
     off), and so is "Bolt" in front of the name. */
  titleSerif: 'Unlimited building,',
  titleSans: 'and a shot at $10,000.',
  subtitle:
    'A free build weekend, a week of founder sessions with the Bolt team, and a contest for the new project you build in Bolt.',
  primaryCta: 'Enter to Win $10k',
};

export type Milestone = { date: string; title: string; body: string; tbc?: boolean };

export const timeline: Milestone[] = [
  {
    date: 'Oct 13',
    title: 'Contest Opens',
    body: 'Start building something new in Bolt. Submissions are open from Oct 13 to Oct 20.',
  },
  {
    date: 'Oct 17–18',
    title: 'Free Build Weekend',
    body: 'Unlimited building on open models for everyone on Bolt, free and paid, Teams included.',
  },
  {
    date: 'Oct 19–23',
    title: 'Founder Programming',
    body: 'A live Q&A with the founders, workshops, an AMA and feedback hours on your product.',
  },
  {
    date: 'Oct 31',
    title: 'Winners Announced',
    body: 'Submissions close Oct 20 and judging runs Oct 21 to 31. Winners are announced here and on social.',
  },
];

import type { PixelIconName } from './components/ui';

export const weekend = {
  eyebrow: 'Free build weekend',
  title: 'Two days of unlimited building',
  subtitle:
    'From Saturday morning to Sunday night, everyone on Bolt gets a free open model in the model picker. No plan change, no code to redeem.',
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
    { src: asset('/people/founder-laptop.webp'), focus: '62% 35%' },
    { src: asset('/people/founder-terracotta.webp'), focus: '50% 38%' },
    { src: asset('/people/founder-coffee.webp'), focus: '55% 32%' },
    { src: asset('/people/founder-desk.webp'), focus: '58% 38%' },
    { src: asset('/people/founder-apron.webp'), focus: '60% 18%' },
    { src: asset('/people/founder-glasses.webp'), focus: '62% 30%' },
  ],
  /* Only shown once DigitalOcean confirms they are covering inference. */
  partner: { show: false, name: 'DigitalOcean', line: 'Free inference for the weekend is provided by DigitalOcean.' },
  finePrint:
    'Rate limits apply. Blocks you miss do not carry over. The free allowance is only available Sat Oct 17 and Sun Oct 18 and can only be used on the free weekend model.',
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
  /* ISO start/end — set once confirmed; drives the countdown and calendar link */
  start?: string;
  end?: string;
  tbc?: boolean;
};

/* Descriptions are from the CX program page (Notion). Only the Eric & Pai
   Q&A is confirmed; the rest need dates and times. */
export const sessions: Session[] = [
  {
    day: 'Tue Oct 20',
    time: '10–11am PT',
    title: 'Founder Q&A with Eric & Pai',
    host: 'Bolt co-founders',
    blurb: 'An hour with Bolt’s co-founders on building a startup, from the first prompt to the first customer. Questions are collected in advance.',
    photo: asset('/people/eric-pai.webp'),
    start: '2026-10-20T17:00:00Z',
    end: '2026-10-20T18:00:00Z',
  },
  {
    day: 'Date TBC',
    time: 'Time TBC',
    title: 'Live growth workshop',
    icon: 'rocket',
    host: 'Enrique, Bolt',
    blurb: 'Go-to-market, growth and getting your first users, worked through live.',
    tbc: true,
  },
  { day: 'Date TBC', time: 'Time TBC', title: 'Founder AMA', icon: 'chat', host: 'Bolt team', blurb: 'Ask the Bolt team anything about building and launching on Bolt.', tbc: true },
  {
    day: 'Date TBC',
    time: 'Time TBC',
    title: 'Feedback hours',
    icon: 'speak',
    host: 'Bolt team and peers',
    blurb: 'Bring your product and get live feedback from the team and other founders.',
    tbc: true,
  },
];

export type FounderTemplate = {
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

/* Founder templates (Bolt share links from Gary, 2026-10-07). Shots are
   full-page captures of each project's preview at 1440px, cropped to the
   templates catalog's 800x2245 format. */
export const templates = {
  tbc: false,
  items: [
    {
      name: 'Landscape Studio',
      blurb: 'Rootline: an editorial site for a design-build landscape studio.',
      url: 'https://bolt.new/p/71745514',
      shot: asset('/templates/rootline.webp'),
      tag: 'Services',
    },
    {
      name: 'Lawn Care',
      blurb: 'Mow Problems: instant quotes, plans and a service-area map.',
      url: 'https://bolt.new/p/71745835',
      shot: asset('/templates/mow.webp'),
      tag: 'Services',
    },
    {
      name: 'Plumbing',
      blurb: 'Flow State Plumbing: services, booking and recent jobs.',
      url: 'https://bolt.new/p/71752787',
      shot: asset('/templates/plumbing.webp'),
      tag: 'Services',
    },
    {
      name: 'HVAC Company',
      blurb: 'Comfort Co.: heating and cooling services, plans and reviews.',
      url: 'https://bolt.new/p/71752020',
      shot: asset('/templates/hvac.webp'),
      tag: 'Services',
    },
    /* The first 8 of the templates catalog (marketing/templates), in catalog
       order. Names, tags and shots are the catalog's; the "Open in Bolt" fork
       links are production's (bolt-public-pages src/content/templates/*.json). */
    { name: 'Architect Portfolio', blurb: 'A quiet, typographic studio site.', url: 'https://bolt.new/fork/github-gf8uflaz', shot: asset('/templates/catalog/architect-portfolio.webp'), tag: 'Portfolio' },
    { name: 'SaaS Landing', blurb: 'Metrics, feature grid, and pricing.', url: 'https://bolt.new/fork/github-xtrskmb3', shot: asset('/templates/catalog/premium-saas-dashboard-lp.webp'), h: 3339, tag: 'SaaS' },
    { name: 'Finance Tracker', blurb: 'Budgeting with cash-flow charts.', url: 'https://bolt.new/fork/github-7mpvjfb3', shot: asset('/templates/catalog/ledger-finance.webp'), w: 1100, h: 1447, fill: true, tag: 'Apps' },
    { name: 'Travel Journal', blurb: 'Destinations and atelier stories.', url: 'https://bolt.new/fork/github-mu7mffmh', shot: asset('/templates/catalog/maison-voyage.webp'), w: 1000, h: 1458, tag: 'Editorial' },
    { name: 'Fashion Editorial', blurb: 'A cinematic couture lookbook.', url: 'https://bolt.new/fork/github-nehpa2f2', shot: asset('/templates/catalog/vestige-fashion.webp'), w: 1100, h: 1450, fill: true, tag: 'Editorial' },
    { name: 'Nonprofit Site', blurb: 'Programmes, impact reporting, and donations.', url: 'https://bolt.new/fork/github-ywj4ls7k', shot: asset('/templates/catalog/nonprofit-website.webp'), w: 1000, h: 1458, tag: 'Websites' },
    { name: 'Space Tourism', blurb: 'Booking site for commercial spaceflight.', url: 'https://bolt.new/fork/github-rqpxpvya', shot: asset('/templates/catalog/astralis-space-tourism.webp'), h: 3889, tag: 'Websites' },
    { name: 'Meditation App', blurb: 'Sessions, pricing, and onboarding.', url: 'https://bolt.new/fork/github-7cctkmbu', shot: asset('/templates/catalog/still-meditation.webp'), h: 3217, tag: 'Apps' },
  ] as FounderTemplate[],
};

export type Prize = { place: string; amount: string; extras: string };

/* From the official rules (Terms.tsx). Keep these in step with legal's text. */
export const competition = {
  eyebrow: 'The contest',
  title: 'Show us what you built',
  /* Keep "demo video" in this line: the rules require one with every entry
     (removed once on 2026-10-08, restored the same day at Gary's ask). */
  subtitle:
    'Build a new project in Bolt between Oct 13 and Oct 20, then submit it with a short demo video. Winners are announced on or about Oct 31.',
  prizesTbc: false,
  prizes: [
    { place: 'Grand prize', amount: '$10,000', extras: 'Paid in U.S. dollars.' },
    { place: 'Second prize', amount: '$5,000', extras: 'Paid in U.S. dollars.' },
    { place: 'Third prize', amount: '$2,500', extras: 'Paid in U.S. dollars.' },
  ] as Prize[],
  criteria: 'Judged on use of Bolt, the idea, implementation and design, and potential impact, weighted equally.',
  prizeFinePrint:
    'No purchase necessary. Open to individuals 18 and over, teams and organizations, subject to the eligibility rules. One entry per entrant.',
};

/* Pi Day 2026 grand-prize winners, shown as past winners in the contest
   section (from piday.bolt.host). */
export const pastWinners = {
  label: 'Pi Day 2026 · Grand prize',
  items: [
    { name: 'Pi Symphony', url: 'https://pi-symphony.bolt.host/', img: asset('/winners/pi-symphony.webp') },
    { name: 'AI Stylist', url: 'https://ai-stylist-web-app-u-w5mq.bolt.host/', img: asset('/winners/ai-stylist.webp') },
    { name: 'Mindron Multi Agent System Builder', url: 'https://mindron-core-setup-arnx.bolt.host/', img: asset('/winners/mindron.webp') },
  ],
};

export const faqs: { q: string; a: string }[] = [
  {
    q: 'Who can take part in Builder’s Week?',
    a: 'Anyone with a Bolt account can join the build weekend and the sessions. The contest is open to individuals 18 and over, teams and organizations, with some exclusions listed in the official rules.',
  },
  {
    q: 'Is the build weekend really free?',
    a: 'Yes. From Saturday Oct 17 to Sunday Oct 18 a free open model appears in the model picker for every account, free and paid. Your allowance comes in six-hour blocks and rate limits apply. No paid plan is needed to enter the contest either.',
  },
  {
    q: 'Does my project have to be new?',
    a: 'Yes. Contest entries must be new projects built primarily in Bolt during the submission period, Oct 13 to Oct 20. Bolt starter templates are fine as a starting point. Other tools can play a supporting role if you disclose them.',
  },
  {
    q: 'When are the winners announced?',
    a: 'Submissions close on Tuesday Oct 20. Judging runs Oct 21 to 31, and winners are announced on or about Oct 31 on this page and on social.',
  },
];

export const footerCta = {
  eyebrow: 'Builder’s Week',
  title: 'Your startup starts this weekend',
  subtitle: 'Build something new in Bolt between Oct 13 and Oct 20 and enter to win the grand prize of $10k.',
  cta: 'Enter to Win $10k',
};
