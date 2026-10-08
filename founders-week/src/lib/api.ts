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

export type Entry = {
  name: string;
  email: string;
  product_name: string;
  product_url: string;
  bolt_project_url: string;
  demo_video_url: string;
  tagline: string;
  description: string;
  team_name?: string;
  social_handle?: string;
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
