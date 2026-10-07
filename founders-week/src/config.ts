/* ============================================================================
   FOUNDERS WEEK — every piece of copy and every date that is still moving
   lives here, so a decision lands as a one-line edit.

   Copy rules for every Founders Week asset (from the launch page in Notion):
   - "Unlimited" in the headline, rate limits in the fine print.
   - No token counts. Never name a default model. Percentages only.
   - Say "open models" in public.
   - Anything that links here deep-links to this page, never the homepage.

   Anything marked TBC is a placeholder waiting on a decision. `tbc: true`
   renders a small "TBC" tag on the page so nobody mistakes it for final copy;
   flip it off once the value is confirmed.
   ============================================================================ */

export const BOLT_URL = 'https://bolt.new/?utm_source=founders-week&utm_medium=landing';
export const TERMS_PATH = '/terms';

export const hero = {
  eyebrow: 'Founders Week · Oct 17–24',
  /* Tagline is an open decision (Marketing drafts, Haily refines, CX signs
     off), and so is "Bolt" in front of the name. */
  titleSerif: 'Unlimited building,',
  titleSans: 'one weekend, on us.',
  subtitle:
    'A free build weekend, a week of founder sessions with the Bolt team, and a contest for the new app you build in Bolt.',
  primaryCta: 'Join Founders Week',
  secondaryCta: 'Enter the Contest',
  finePrint: 'Free build weekend runs Sat Oct 17 to Sun Oct 18 on open models. Rate limits apply.',
};

export type Milestone = { date: string; title: string; body: string; tbc?: boolean };

export const timeline: Milestone[] = [
  {
    date: 'Oct 13',
    title: 'Contest opens',
    body: 'Start building something new in Bolt. Submissions are open from Oct 13 to Oct 20.',
  },
  {
    date: 'Oct 17–18',
    title: 'Free build weekend',
    body: 'Unlimited building on open models for everyone on Bolt, free and paid, Teams included.',
  },
  {
    date: 'Oct 19–23',
    title: 'Founder programming',
    body: 'A live Q&A with the founders, workshops, an AMA and feedback hours on your product.',
  },
  {
    date: 'Oct 31',
    title: 'Winners announced',
    body: 'Submissions close Oct 20 and judging runs Oct 21 to 31. Winners are announced here and on social.',
  },
];

export const weekend = {
  eyebrow: 'Free build weekend',
  title: 'Two days of unlimited building',
  subtitle:
    'From Saturday morning to Sunday night, everyone on Bolt gets a free open model in the model picker. No plan change, no code to redeem.',
  points: [
    {
      title: 'Everyone is in',
      body: 'Free, personal paid and Teams accounts all get it. On Teams, every member gets their own allowance.',
    },
    {
      title: 'A fresh block every six hours',
      body: 'Your allowance comes in six-hour blocks. A block starts when you open Bolt, and your first visit after it ends starts the next one.',
    },
    {
      title: 'More on paid plans',
      body: 'Paid plans get five times the free allowance in every block. Blocks you miss do not carry over.',
    },
  ],
  /* Only shown once DigitalOcean confirms they are covering inference. */
  partner: { show: false, name: 'DigitalOcean', line: 'Free inference for the weekend is provided by DigitalOcean.' },
  finePrint:
    'Rate limits apply. The free allowance is only available Sat Oct 17 and Sun Oct 18 and can only be used on the free weekend model.',
};

export type Session = { day: string; time: string; title: string; host: string; tbc?: boolean };

export const sessions: Session[] = [
  { day: 'Tue Oct 20', time: '10–11am PT', title: 'Founder Q&A with Eric & Pai', host: 'Bolt co-founders' },
  { day: 'Date TBC', time: 'Time TBC', title: 'Live growth workshop', host: 'Enrique, Bolt', tbc: true },
  { day: 'Date TBC', time: 'Time TBC', title: 'Founder AMA', host: 'Bolt team', tbc: true },
  { day: 'Date TBC', time: 'Time TBC', title: 'Feedback hours: bring your product', host: 'Bolt team and peers', tbc: true },
];

export type FounderTemplate = {
  name: string;
  blurb: string;
  url?: string;
  /* Full-page screenshot of the template's landing page, in public/templates/
     (e.g. '/templates/waitlist.webp', 800px wide). Without one the card shows
     a placeholder page mock. */
  shot?: string;
  tag?: string;
};

/* Founder templates (Bolt share links from Gary, 2026-10-07). The share
   pages need a Bolt login to read, so names and blurbs are still TBC —
   fill them in from the projects. Add more links as they come. */
export const templates = {
  tbc: true,
  items: [
    { name: 'Founder template 1', blurb: 'Name and description coming soon.', url: 'https://bolt.new/p/71745514' },
    { name: 'Founder template 2', blurb: 'Name and description coming soon.', url: 'https://bolt.new/p/71745835' },
    { name: 'Founder template 3', blurb: 'Name and description coming soon.', url: 'https://bolt.new/p/71752787' },
    { name: 'Founder template 4', blurb: 'Name and description coming soon.', url: 'https://bolt.new/p/71752020' },
  ] as FounderTemplate[],
};

export type Prize = { place: string; amount: string; extras: string };

/* From the official rules (Terms.tsx). Keep these in step with legal's text. */
export const competition = {
  eyebrow: 'The contest',
  title: 'Show us what you built',
  subtitle:
    'Build a new app in Bolt between Oct 13 and Oct 20, then submit it with a short demo video. Winners are announced on or about Oct 31.',
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

export const faqs: { q: string; a: string }[] = [
  {
    q: 'Who can take part in Founders Week?',
    a: 'Anyone with a Bolt account can join the build weekend and the sessions. The contest is open to individuals 18 and over, teams and organizations, with some exclusions listed in the official rules.',
  },
  {
    q: 'Is the build weekend really free?',
    a: 'Yes. From Saturday Oct 17 to Sunday Oct 18 a free open model appears in the model picker for every account, free and paid. Your allowance comes in six-hour blocks and rate limits apply. No paid plan is needed to enter the contest either.',
  },
  {
    q: 'Does my app have to be new?',
    a: 'Yes. Contest entries must be new apps built primarily in Bolt during the submission period, Oct 13 to Oct 20. Bolt starter templates are fine as a starting point. Other tools can play a supporting role if you disclose them.',
  },
  {
    q: 'What is the difference between joining and entering?',
    a: 'Joining Founders Week tells us you are taking part, and we send you the session links and reminders. Entering the contest is a separate submission with your app, its Bolt project link and a demo video.',
  },
  {
    q: 'When are the winners announced?',
    a: 'Submissions close on Tuesday Oct 20. Judging runs Oct 21 to 31, and winners are announced on or about Oct 31 on this page and on social.',
  },
];

export const footerCta = {
  eyebrow: 'Founders Week',
  title: 'Your startup starts this weekend',
  subtitle: 'Join now and we will send you everything you need before Saturday.',
  cta: 'Join Founders Week',
};
