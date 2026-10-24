-- NRGASM: tastings per user, plus each can's community rating.
-- Run once in the Supabase SQL Editor (see docs/DEPLOY.md).

-- 1. Tastings: one row per user and can -------------------------------------

create table public.tasting_entries (
  user_id uuid not null references auth.users (id) on delete cascade,
  can_id text not null,
  tried boolean not null,
  want_to_try boolean not null default false,
  rating smallint,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, can_id),
  constraint rating_range check (rating is null or rating between 1 and 5),
  constraint note_length check (char_length(note) <= 2000)
);

create index tasting_entries_user_id_idx on public.tasting_entries using btree (user_id);

-- 2. Each user sees and changes only their own rows --------------------------

alter table public.tasting_entries enable row level security;
revoke all on table public.tasting_entries from anon, authenticated;
grant select, insert, update, delete on table public.tasting_entries to authenticated;

create policy "tasting_entries_select" on public.tasting_entries for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "tasting_entries_insert" on public.tasting_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "tasting_entries_update" on public.tasting_entries for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "tasting_entries_delete" on public.tasting_entries for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Community rating: totals only, readable by everyone ---------------------

create table public.can_rating_stats (
  can_id text primary key,
  rating_count integer not null default 0,
  rating_sum integer not null default 0
);

alter table public.can_rating_stats enable row level security;
revoke all on table public.can_rating_stats from anon, authenticated;
grant select on table public.can_rating_stats to anon, authenticated;

create policy "can_rating_stats_read" on public.can_rating_stats for select to anon, authenticated
  using (true);

-- 4. Keep the totals up to date ----------------------------------------------
-- The functions live in a private schema the Data API does not expose. They run
-- as their owner (security definer) to read every user's rating, with an empty
-- search_path and schema-qualified names, as Supabase recommends.

create schema if not exists private;

create or replace function private.refresh_can_rating(target text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.can_rating_stats (can_id, rating_count, rating_sum)
  select target, count(e.rating), coalesce(sum(e.rating), 0)
  from public.tasting_entries as e
  where e.can_id = target
  on conflict (can_id) do update
    set rating_count = excluded.rating_count,
        rating_sum = excluded.rating_sum;
$$;

create or replace function private.on_tasting_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform private.refresh_can_rating(new.can_id);
  end if;
  if tg_op in ('UPDATE', 'DELETE') and (tg_op = 'DELETE' or old.can_id <> new.can_id) then
    perform private.refresh_can_rating(old.can_id);
  end if;
  return null;
end;
$$;

create trigger tasting_entries_rating_stats
  after insert or update or delete on public.tasting_entries
  for each row execute function private.on_tasting_change();

revoke all on schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
