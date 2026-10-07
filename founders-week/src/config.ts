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
    'A free build weekend, a week of founder sessions with the Bolt team, and a competition for the product you built in Bolt.',
  primaryCta: 'Join Founders Week',
  secondaryCta: 'Enter the Competition',
  finePrint: 'Free build weekend runs Sat Oct 17 to Sun Oct 18 on open models. Rate limits apply.',
};

export type Milestone = { date: string; title: string; body: string; tbc?: boolean };

export const timeline: Milestone[] = [
  {
    /* The launch page says Oct 13–20 in one place and "closes Sat Oct 24"
       in another — confirm with Monika. */
    date: 'Opens Oct 13',
    title: 'Competition opens',
    body: 'Submit the product you built in Bolt. It does not have to be new, and there is no pitch.',
    tbc: true,
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
    date: 'Oct 24',
    title: 'Submissions close',
    body: 'Judging runs the following week. Winners are announced here and on social.',
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
      body: 'Free, Pro and Teams accounts all get it. On Teams, every member gets their own allowance.',
    },
    {
      title: 'Refills every six hours',
      body: 'Usage runs in six-hour blocks that start when you show up, so a long session never locks you out for the weekend.',
    },
    {
      title: 'More on paid plans',
      body: 'Paid plans get five times the free allowance in each block.',
    },
  ],
  /* Only shown once DigitalOcean confirms they are covering inference. */
  partner: { show: false, name: 'DigitalOcean', line: 'Free inference for the weekend is provided by DigitalOcean.' },
  finePrint:
    'Rate limits apply. The free model is only available Sat Oct 17 and Sun Oct 18 and cannot be used for other models.',
};

export type Session = { day: string; time: string; title: string; host: string; tbc?: boolean };

export const sessions: Session[] = [
  { day: 'Tue Oct 20', time: '10–11am PT', title: 'Founder Q&A with Eric & Pai', host: 'Bolt co-founders' },
  { day: 'Date TBC', time: 'Time TBC', title: 'Live growth workshop', host: 'Enrique, Bolt', tbc: true },
  { day: 'Date TBC', time: 'Time TBC', title: 'Founder AMA', host: 'Bolt team', tbc: true },
  { day: 'Date TBC', time: 'Time TBC', title: 'Feedback hours: bring your product', host: 'Bolt team and peers', tbc: true },
];

export type FounderTemplate = { name: string; blurb: string; url?: string };

/* The 10-pack drops before the weekend (Donald). Names are the starter-kit
   ideas from the CX program page; swap in the real list and links. */
export const templates = {
  tbc: true,
  items: [
    { name: 'Landing page', blurb: 'Say what you do and collect interest.' },
    { name: 'Waitlist', blurb: 'Capture sign-ups before launch.' },
    { name: 'Pitch deck', blurb: 'Tell the story in ten slides.' },
    { name: 'Pricing page', blurb: 'Plans, comparisons and a checkout.' },
    { name: 'Investor update', blurb: 'Monthly metrics in one page.' },
    { name: 'Customer portal', blurb: 'Accounts, settings and billing.' },
    { name: 'Admin dashboard', blurb: 'Your numbers at a glance.' },
    { name: 'Booking app', blurb: 'Let customers pick a time.' },
    { name: 'Marketplace', blurb: 'Listings, search and checkout.' },
    { name: 'Help center', blurb: 'Answers before the ticket.' },
  ] as FounderTemplate[],
};

export type Prize = { place: string; amount: string; extras: string };

/* Pitched to Eric at $10K / $5K / $3K plus credits, merch and a 1:1 — not
   approved yet (owner: Monika). */
export const competition = {
  eyebrow: 'The competition',
  title: 'Show us what you built',
  subtitle:
    'Founders submit the product they built in Bolt. It does not have to be new and there is no pitch. Entries close Sat Oct 24 and winners are picked the week after.',
  prizesTbc: true,
  prizes: [
    { place: '1st', amount: '$10,000', extras: 'Plus Bolt credits, founder merch and a 1:1 mentoring session with Eric.' },
    { place: '2nd', amount: '$5,000', extras: 'Plus Bolt credits and founder merch.' },
    { place: '3rd', amount: '$3,000', extras: 'Plus Bolt credits and founder merch.' },
  ] as Prize[],
  prizeFinePrint:
    'Submitting a product does not guarantee a prize. Winners are selected at the discretion of the judging panel.',
};

export const faqs: { q: string; a: string }[] = [
  {
    q: 'Who can take part in Founders Week?',
    a: 'Anyone with a Bolt account. If you have an idea you want to launch or a product you want to take further, the weekend, the sessions and the competition are all open to you.',
  },
  {
    q: 'Is the build weekend really free?',
    a: 'Yes. From Saturday Oct 17 to Sunday Oct 18 a free open model appears in the model picker for every account, free and paid. Usage refills in six-hour blocks and rate limits apply.',
  },
  {
    q: 'Does my product have to be new to enter the competition?',
    a: 'No. Existing products count, as long as they are built in Bolt. There is no pitch to prepare, just submit the live product.',
  },
  {
    q: 'What is the difference between joining and entering?',
    a: 'Joining Founders Week tells us you are taking part, and we send you the session links and reminders. Entering the competition is a separate submission with your product.',
  },
  {
    q: 'When are the winners announced?',
    a: 'Submissions close on Saturday Oct 24. The judging panel picks winners the following week, and they are announced on this page and on social.',
  },
];

export const footerCta = {
  eyebrow: 'Founders Week',
  title: 'Your startup starts this weekend',
  subtitle: 'Join now and we will send you everything you need before Saturday.',
  cta: 'Join Founders Week',
};
