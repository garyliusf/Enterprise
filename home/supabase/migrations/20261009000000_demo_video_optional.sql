-- The demo video is optional from 2026-10-09: allow an empty value, but keep
-- the YouTube / X format check when one is given.
alter table public.entries alter column demo_video_url drop not null;
