/* ============================================================================
   DATA LAYER — the only file that talks to a backend.

   Built for Supabase (the Pi Day site's backend). It calls Supabase's REST
   API with plain fetch, so there is no client library to install. The tables
   it expects are in supabase/migrations/.

   PREVIEW MODE: while VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are unset
   (local dev before export, or a fresh Bolt import before Supabase is
   connected), every call succeeds without saving anything and the gallery
   shows sample entries. Connecting Supabase in Bolt fills the two env vars
   and the page goes live with no code change.
   ============================================================================ */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isPreview = !SUPABASE_URL || !SUPABASE_KEY;

export type Stage = 'idea' | 'building' | 'launched';

export type SignUp = {
  name: string;
  email: string;
  stage: Stage;
  building?: string;
};

export type Entry = {
  name: string;
  email: string;
  product_name: string;
  product_url: string;
  bolt_project_url?: string;
  tagline: string;
  description: string;
  social_handle?: string;
};

export type GalleryEntry = {
  id: string;
  product_name: string;
  product_url: string;
  tagline: string;
  founder_name: string;
};

async function rest(path: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    /* 23505 = unique violation: this email already signed up / entered */
    if (res.status === 409 || body.includes('23505')) throw new DuplicateError();
    throw new Error(`Request failed (${res.status})`);
  }
  return res;
}

export class DuplicateError extends Error {
  constructor() {
    super('duplicate');
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function joinFoundersWeek(data: SignUp): Promise<void> {
  if (isPreview) {
    await wait(700);
    return;
  }
  await rest('participants', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ ...data, email: data.email.trim().toLowerCase() }),
  });
}

export async function submitEntry(data: Entry): Promise<void> {
  if (isPreview) {
    await wait(900);
    return;
  }
  await rest('entries', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ ...data, email: data.email.trim().toLowerCase() }),
  });
}

/* Participant count for the hero. Null hides the counter, so the page never
   shows "0 founders". */
export async function getParticipantCount(): Promise<number | null> {
  if (isPreview) return null;
  try {
    const res = await rest('rpc/participant_count', { method: 'POST', body: '{}' });
    const n = await res.json();
    return typeof n === 'number' ? n : null;
  } catch {
    return null;
  }
}

/* Approved entries only — new submissions wait for review before they show. */
export async function getGallery(): Promise<GalleryEntry[]> {
  if (isPreview) return SAMPLE_ENTRIES;
  try {
    const res = await rest(
      'gallery_entries?select=id,product_name,product_url,tagline,founder_name&order=approved_at.desc',
    );
    return (await res.json()) as GalleryEntry[];
  } catch {
    return [];
  }
}

/* Preview-only placeholders so the gallery layout can be reviewed. Never
   shown once Supabase is connected. */
const SAMPLE_ENTRIES: GalleryEntry[] = [
  { id: 's1', product_name: 'Sample: Tidy Books', product_url: '#', tagline: 'Bookkeeping for one-person businesses.', founder_name: 'Sample founder' },
  { id: 's2', product_name: 'Sample: Crewcall', product_url: '#', tagline: 'Shift scheduling for small restaurants.', founder_name: 'Sample founder' },
  { id: 's3', product_name: 'Sample: Plotline', product_url: '#', tagline: 'Garden planning that knows your climate.', founder_name: 'Sample founder' },
  { id: 's4', product_name: 'Sample: Quoteflow', product_url: '#', tagline: 'Send a quote from a photo of the job.', founder_name: 'Sample founder' },
  { id: 's5', product_name: 'Sample: Roomly', product_url: '#', tagline: 'Book meeting rooms across buildings.', founder_name: 'Sample founder' },
  { id: 's6', product_name: 'Sample: Petcheck', product_url: '#', tagline: 'Vaccination reminders for pet owners.', founder_name: 'Sample founder' },
];
