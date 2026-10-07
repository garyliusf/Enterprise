-- Founders Week: participant sign-ups + competition entries.
--
-- Security model: the public (anon) key can only INSERT. Nobody can read the
-- raw tables with it — emails stay private. The page reads two things:
--   * participant_count()  — a number, nothing else
--   * gallery_entries      — approved entries, public columns only
-- Entries are approved by setting approved_at in the Supabase dashboard
-- (or an admin page later).

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  stage text not null check (stage in ('idea', 'building', 'launched')),
  building text check (char_length(building) <= 280)
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  product_name text not null check (char_length(product_name) between 1 and 80),
  product_url text not null check (product_url ~* '^https?://'),
  bolt_project_url text not null check (bolt_project_url ~* '^https?://'),
  -- the rules require a public demo video (<= 5 min) on YouTube or X
  demo_video_url text not null check (demo_video_url ~* '^https?://((www|m)\.)?(youtube\.com|youtu\.be|x\.com|twitter\.com)/'),
  tagline text not null check (char_length(tagline) between 1 and 120),
  description text not null check (char_length(description) between 1 and 1200),
  team_name text check (char_length(team_name) <= 120),
  social_handle text check (char_length(social_handle) <= 80),
  approved_at timestamptz,
  starred boolean not null default false
);

alter table public.participants enable row level security;
alter table public.entries enable row level security;

drop policy if exists "anyone can join" on public.participants;
create policy "anyone can join" on public.participants
  for insert to anon, authenticated with check (true);

drop policy if exists "anyone can enter" on public.entries;
create policy "anyone can enter" on public.entries
  for insert to anon, authenticated
  with check (approved_at is null and starred = false);

-- Public view of approved entries, without emails.
create or replace view public.gallery_entries
with (security_invoker = false) as
  select id, product_name, product_url, tagline, name as founder_name, approved_at
  from public.entries
  where approved_at is not null;

grant select on public.gallery_entries to anon, authenticated;

create or replace function public.participant_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$ select count(*) from public.participants $$;

grant execute on function public.participant_count() to anon, authenticated;
