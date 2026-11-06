-- DuoChinese — cloud progress schema.
-- .github/workflows/schema.yml applies this to the project once the tests
-- pass; the SQL editor (Dashboard → SQL Editor → New query) still works if you
-- would rather paste it. Safe to re-run either way: every statement is
-- idempotent.

-- ---------------------------------------------------------------------------
-- 1. One row per user, mirroring the shape app.js keeps in localStorage.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  xp         integer     not null default 0 check (xp >= 0),
  streak     integer     not null default 0 check (streak >= 0),
  last_day   date,
  progress   jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may only ever touch their own row. This is the only thing standing
-- between one learner's progress and another's, since the anon key is public.
drop policy if exists "own row select" on public.profiles;
drop policy if exists "own row insert" on public.profiles;
drop policy if exists "own row update" on public.profiles;
drop policy if exists "own row delete" on public.profiles;

create policy "own row select" on public.profiles
  for select using (auth.uid() = id);
create policy "own row insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "own row update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- needed by Reset, which clears the cloud copy as well as the local one;
-- without this the delete silently affects zero rows.
create policy "own row delete" on public.profiles
  for delete using (auth.uid() = id);

-- Table privileges, stated explicitly rather than inherited from Supabase's
-- default privileges. That default is the "Automatically expose new tables"
-- switch on the project-creation screen, and Supabase recommends turning it
-- off. With it off, a table with perfect RLS policies is still unreachable
-- because the role has no privilege on it at all — so the grants live here,
-- and this schema works either way.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2. The merge. Called over RPC instead of a plain upsert so that two devices
--    pushing at once cannot interleave into a lost update.
--
--    Every field moves forward only:
--      xp / progress[lesson] / last_day  ->  greatest()
--      streak                            ->  follows whichever side has the
--                                            later last_day (a streak is NOT
--                                            monotonic: missing a day resets
--                                            it to 1, and greatest() would
--                                            resurrect a streak you had broken)
--
--    SECURITY INVOKER (the default) on purpose: RLS still applies inside the
--    function, so it cannot be used as a lever to write someone else's row.
-- ---------------------------------------------------------------------------
create or replace function public.merge_progress(
  p_xp       integer,
  p_streak   integer,
  p_last_day date,
  p_progress jsonb
) returns public.profiles
language plpgsql
as $$
declare
  r public.profiles;
begin
  if auth.uid() is null then
    raise exception 'merge_progress requires an authenticated user';
  end if;

  insert into public.profiles as pr (id, xp, streak, last_day, progress, updated_at)
  values (auth.uid(),
          greatest(coalesce(p_xp, 0), 0),
          greatest(coalesce(p_streak, 0), 0),
          p_last_day,
          coalesce(p_progress, '{}'::jsonb),
          now())
  on conflict (id) do update set
    xp = greatest(pr.xp, excluded.xp),

    streak = case
               when excluded.last_day is null then pr.streak
               when pr.last_day is null
                 or excluded.last_day > pr.last_day then excluded.streak
               when excluded.last_day = pr.last_day then greatest(pr.streak, excluded.streak)
               else pr.streak
             end,

    last_day = greatest(pr.last_day, excluded.last_day),

    -- per-lesson crowns: full outer join so neither side's lessons are dropped
    progress = (
      select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
      from (
        select coalesce(a.key, b.key) as k,
               to_jsonb(greatest(coalesce(a.value::int, 0),
                                 coalesce(b.value::int, 0))) as v
        from jsonb_each_text(pr.progress) a
        full outer join jsonb_each_text(excluded.progress) b on a.key = b.key
      ) m
    ),

    updated_at = now()
  returning * into r;

  return r;
end
$$;

revoke all on function public.merge_progress(integer, integer, date, jsonb) from public;
grant execute on function public.merge_progress(integer, integer, date, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Heartbeat table for the keep-alive workflow.
--    Free Supabase projects pause after ~7 days idle; .github/workflows/
--    keepalive.yml runs a real query against this every 3 days. It needs a
--    table the anon key is actually allowed to read, and this one holds
--    nothing but a timestamp.
-- ---------------------------------------------------------------------------
create table if not exists public.heartbeat (
  id      integer primary key default 1,
  pinged  timestamptz not null default now(),
  constraint heartbeat_single_row check (id = 1)
);
insert into public.heartbeat (id) values (1) on conflict (id) do nothing;

alter table public.heartbeat enable row level security;
drop policy if exists "heartbeat readable" on public.heartbeat;
create policy "heartbeat readable" on public.heartbeat for select using (true);

-- the keep-alive cron calls this with the anon key and no user session,
-- so it arrives as `anon`, not `authenticated`
grant select on public.heartbeat to anon, authenticated;

-- A read alone keeps the project awake, but it leaves no trace, so the only
-- record that the cron ran at all is GitHub's run history. This writes the
-- timestamp instead. It is a function rather than an update policy on the
-- table because the anon key ships in the browser: through here the only
-- thing anyone holding it can write is now().
create or replace function public.heartbeat_ping()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update public.heartbeat set pinged = now() where id = 1 returning pinged;
$$;

revoke all on function public.heartbeat_ping() from public;
grant execute on function public.heartbeat_ping() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Flashcards: what a learner knows, word by word, and how well.
--
--    One row per (user, word). This is a table rather than another jsonb blob
--    on profiles because the merge rule is different in kind: crowns and XP
--    only ever go up, so greatest() is right for them, but a review is a
--    measurement taken at a moment — a word you just failed has a LOWER
--    interval than it had yesterday, and greatest() would quietly refuse to
--    record that you had forgotten it. Here the freshest review wins instead.
-- ---------------------------------------------------------------------------
create table if not exists public.card_state (
  user_id       uuid        not null references auth.users(id) on delete cascade,
  word          text        not null,
  reps          integer     not null default 0  check (reps >= 0),
  lapses        integer     not null default 0  check (lapses >= 0),
  ease          real        not null default 2.5 check (ease >= 1.3),
  interval_days integer     not null default 0  check (interval_days >= 0),
  due           date        not null,
  reviewed_at   timestamptz not null,
  primary key (user_id, word)
);

alter table public.card_state enable row level security;

drop policy if exists "own cards select" on public.card_state;
drop policy if exists "own cards insert" on public.card_state;
drop policy if exists "own cards update" on public.card_state;
drop policy if exists "own cards delete" on public.card_state;

create policy "own cards select" on public.card_state
  for select using (auth.uid() = user_id);
create policy "own cards insert" on public.card_state
  for insert with check (auth.uid() = user_id);
create policy "own cards update" on public.card_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Reset clears the cloud copy too; without this it would silently delete none.
create policy "own cards delete" on public.card_state
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.card_state to authenticated;

-- ---------------------------------------------------------------------------
--    The merge. Same reasoning as merge_progress: an RPC rather than a plain
--    upsert, so two devices reviewing the same word cannot interleave into a
--    lost update.
--
--    `where excluded.reviewed_at > cs.reviewed_at` is the whole rule. A push
--    carrying an older review leaves the row alone, which makes the call
--    idempotent and order-independent: two devices may push in either order
--    and both end up holding the later review.
--
--    distinct on (word) guards the other direction — a client that batches up
--    two reviews of the same word would otherwise hit "ON CONFLICT DO UPDATE
--    cannot affect row a second time" and lose the whole push.
-- ---------------------------------------------------------------------------
create or replace function public.merge_cards(p_cards jsonb)
returns setof public.card_state
language plpgsql
as $$
begin
  if auth.uid() is null then
    raise exception 'merge_cards requires an authenticated user';
  end if;

  insert into public.card_state as cs
    (user_id, word, reps, lapses, ease, interval_days, due, reviewed_at)
  select distinct on (c.word)
         auth.uid(), c.word,
         greatest(coalesce(c.reps, 0), 0),
         greatest(coalesce(c.lapses, 0), 0),
         greatest(coalesce(c.ease, 2.5), 1.3),
         greatest(coalesce(c.interval_days, 0), 0),
         c.due, c.reviewed_at
  from jsonb_to_recordset(coalesce(p_cards, '[]'::jsonb))
    as c(word text, reps integer, lapses integer, ease real,
         interval_days integer, due date, reviewed_at timestamptz)
  where c.word is not null and c.due is not null and c.reviewed_at is not null
  order by c.word, c.reviewed_at desc
  on conflict (user_id, word) do update
    set reps          = excluded.reps,
        lapses        = excluded.lapses,
        ease          = excluded.ease,
        interval_days = excluded.interval_days,
        due           = excluded.due,
        reviewed_at   = excluded.reviewed_at
    where excluded.reviewed_at > cs.reviewed_at;

  return query
    select * from public.card_state where user_id = auth.uid() order by word;
end
$$;

revoke all on function public.merge_cards(jsonb) from public;
grant execute on function public.merge_cards(jsonb) to authenticated;
