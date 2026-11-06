-- Tests for schema.sql. Run against a throwaway Postgres:
--   docker run -d --name duo-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=duo \
--     -p 55433:5432 postgres:17-alpine
--   psql "postgres://postgres:test@localhost:55433/duo" -v ON_ERROR_STOP=1 -f schema.test.sql
-- Any failure raises and exits non-zero.

set client_min_messages = notice;

-- ---------------------------------------------------------------------------
-- Stand-ins for what Supabase provides: auth.uid(), auth.users, and the
-- `authenticated` role. RLS only bites under a non-superuser role, so the
-- tests run as `authenticated`, exactly as the browser client does.
-- ---------------------------------------------------------------------------
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('test.uid', true), '')::uuid
$$;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end $$;

\i schema.sql

-- Deliberately NOT granting anything on public here: schema.sql must stand on
-- its own, exactly as it will on a project created with "Automatically expose
-- new tables" switched off. Only the auth stand-ins get grants.
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;

insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- From here on, run as `authenticated` rather than the superuser. This is the
-- whole point: a superuser bypasses RLS, so tests that look like they pass
-- under `postgres` prove nothing about isolation.
set role authenticated;

-- ===========================================================================
do $$
declare
  a uuid := '11111111-1111-1111-1111-111111111111';
  b uuid := '22222222-2222-2222-2222-222222222222';
  r public.profiles;
  r2 public.profiles;
  n int;
  failed int := 0;

  procedure_note text;

  -- run merge_progress as a given user
  function_result public.profiles;
begin
  -- ----------------------------------------------------------------- 1
  perform set_config('test.uid', a::text, false);
  select * into r from public.merge_progress(15, 1, date '2026-10-26', '{"u1l1":1}'::jsonb);
  if r.xp <> 15 or r.streak <> 1 or r.progress -> 'u1l1' <> to_jsonb(1) then
    raise exception 'T1 fresh insert wrong: %', row_to_json(r);
  end if;
  raise notice 'T1  fresh insert                       ok';

  -- ----------------------------------------------------------------- 2
  select * into r2 from public.merge_progress(15, 1, date '2026-10-26', '{"u1l1":1}'::jsonb);
  if r2.xp <> r.xp or r2.streak <> r.streak or r2.progress <> r.progress then
    raise exception 'T2 not idempotent: % vs %', row_to_json(r), row_to_json(r2);
  end if;
  raise notice 'T2  idempotent re-push                  ok';

  -- ----------------------------------------------------------------- 3
  -- a lower push must never pull anything backwards
  select * into r from public.merge_progress(5, 0, date '2026-10-01', '{"u1l1":0}'::jsonb);
  if r.xp <> 15 or r.progress -> 'u1l1' <> to_jsonb(1) or r.last_day <> date '2026-10-26' then
    raise exception 'T3 went backwards: %', row_to_json(r);
  end if;
  raise notice 'T3  stale push cannot lose progress     ok';

  -- ----------------------------------------------------------------- 4
  -- lessons from both sides survive
  select * into r from public.merge_progress(20, 2, date '2026-10-27', '{"u2l1":3}'::jsonb);
  if r.progress -> 'u1l1' <> to_jsonb(1) or r.progress -> 'u2l1' <> to_jsonb(3) then
    raise exception 'T4 progress union lost a lesson: %', r.progress;
  end if;
  raise notice 'T4  per-lesson union                    ok';

  -- ----------------------------------------------------------------- 5
  -- THE trap: a stale but longer streak must lose to a fresher short one.
  delete from public.profiles where id = a;
  perform public.merge_progress(100, 9, date '2026-10-01', '{}'::jsonb);   -- long, old
  select * into r from public.merge_progress(100, 1, date '2026-10-26', '{}'::jsonb); -- short, new
  if r.streak <> 1 then
    raise exception 'T5 resurrected a broken streak: streak=% (expected 1)', r.streak;
  end if;
  if r.last_day <> date '2026-10-26' then
    raise exception 'T5 last_day wrong: %', r.last_day;
  end if;
  raise notice 'T5  broken streak is not resurrected    ok';

  -- ----------------------------------------------------------------- 6
  -- and the reverse order: a stale push must not clobber a fresh streak
  delete from public.profiles where id = a;
  perform public.merge_progress(100, 1, date '2026-10-26', '{}'::jsonb);   -- short, new
  select * into r from public.merge_progress(100, 9, date '2026-10-01', '{}'::jsonb); -- long, old
  if r.streak <> 1 then
    raise exception 'T6 stale streak clobbered fresh: streak=%', r.streak;
  end if;
  raise notice 'T6  stale streak does not clobber       ok';

  -- ----------------------------------------------------------------- 7
  -- same day -> the longer streak wins
  delete from public.profiles where id = a;
  perform public.merge_progress(0, 3, date '2026-10-26', '{}'::jsonb);
  select * into r from public.merge_progress(0, 7, date '2026-10-26', '{}'::jsonb);
  if r.streak <> 7 then
    raise exception 'T7 same-day tie should take max: %', r.streak;
  end if;
  raise notice 'T7  same-day tie takes the longer       ok';

  -- ----------------------------------------------------------------- 8
  -- users are isolated: A cannot see or change B's row
  perform set_config('test.uid', b::text, false);
  perform public.merge_progress(999, 5, date '2026-10-26', '{"u9l3":3}'::jsonb);
  perform set_config('test.uid', a::text, false);
  select count(*) into n from public.profiles where id = b;
  if n <> 0 then
    raise exception 'T8 RLS leak: user A can read user B (% rows)', n;
  end if;
  update public.profiles set xp = 0 where id = b;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'T8 RLS leak: user A updated % of user B rows', n;
  end if;
  delete from public.profiles where id = b;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'T8 RLS leak: user A deleted % of user B rows', n;
  end if;
  -- …but a user must be able to delete their OWN row (Reset clears the cloud)
  perform set_config('test.uid', b::text, false);
  delete from public.profiles where id = b;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'T8 own-row delete affected % rows (expected 1) — Reset would not clear the cloud', n;
  end if;
  perform set_config('test.uid', a::text, false);
  raise notice 'T8  RLS isolates users, own delete works ok';

  -- ----------------------------------------------------------------- 9
  -- merge_progress refuses to run unauthenticated
  perform set_config('test.uid', '', false);
  begin
    perform public.merge_progress(1, 1, date '2026-10-26', '{}'::jsonb);
    raise exception 'T9 unauthenticated merge was allowed';
  exception when others then
    if sqlerrm like '%requires an authenticated user%' then
      raise notice 'T9  unauthenticated merge refused       ok';
    else
      raise exception 'T9 wrong error: %', sqlerrm;
    end if;
  end;

  -- ---------------------------------------------------------------- 10
  -- null / empty payloads must not blow up or wipe anything
  perform set_config('test.uid', a::text, false);
  delete from public.profiles where id = a;
  perform public.merge_progress(10, 1, date '2026-10-26', '{"u1l1":2}'::jsonb);
  select * into r from public.merge_progress(null, null, null, null);
  if r.xp <> 10 or r.progress -> 'u1l1' <> to_jsonb(2) or r.last_day <> date '2026-10-26' then
    raise exception 'T10 null payload damaged the row: %', row_to_json(r);
  end if;
  raise notice 'T10 null payload is harmless            ok';
end $$;

-- ===========================================================================
-- 11. Fuzz: random push sequences must never lose progress, and the final
--     state must not depend on the order the pushes arrived in.
-- ===========================================================================
do $$
declare
  a uuid := '11111111-1111-1111-1111-111111111111';
  pushes jsonb[] ;
  p jsonb;
  r public.profiles;
  fwd public.profiles;
  rev public.profiles;
  prev_xp int;
  prev_crowns int;
  i int; j int; k int;
  lesson text;
begin
  perform set_config('test.uid', a::text, false);

  for i in 1..300 loop
    -- build a random batch of 2..5 pushes
    pushes := '{}';
    for j in 1..(2 + floor(random() * 4)::int) loop
      lesson := 'u' || (1 + floor(random() * 9)::int) || 'l' || (1 + floor(random() * 5)::int);
      pushes := pushes || jsonb_build_object(
        'xp',       floor(random() * 500)::int,
        'streak',   floor(random() * 10)::int,
        'last_day', (date '2026-10-01' + floor(random() * 30)::int)::text,
        'progress', jsonb_build_object(lesson, floor(random() * 4)::int)
      );
    end loop;

    -- apply in order, checking nothing ever moves backwards
    delete from public.profiles where id = a;
    prev_xp := 0;
    foreach p in array pushes loop
      select * into r from public.merge_progress(
        (p->>'xp')::int, (p->>'streak')::int, (p->>'last_day')::date, p->'progress');
      if r.xp < prev_xp then
        raise exception 'FUZZ xp went backwards (% -> %) on batch %', prev_xp, r.xp, pushes;
      end if;
      prev_xp := r.xp;
    end loop;
    fwd := r;

    -- apply the same batch in reverse; the result must match
    delete from public.profiles where id = a;
    for k in reverse array_length(pushes, 1)..1 loop
      p := pushes[k];
      select * into r from public.merge_progress(
        (p->>'xp')::int, (p->>'streak')::int, (p->>'last_day')::date, p->'progress');
    end loop;
    rev := r;

    if fwd.xp <> rev.xp or fwd.progress <> rev.progress
       or fwd.last_day is distinct from rev.last_day or fwd.streak <> rev.streak then
      raise exception 'FUZZ order-dependent result on batch %: fwd=% rev=%',
        pushes, row_to_json(fwd), row_to_json(rev);
    end if;
  end loop;

  raise notice 'T11 fuzz: 300 batches, order-independent & monotonic  ok';
end $$;

-- ===========================================================================
-- 12. The anon role: can read the heartbeat (the keep-alive cron uses it) but
--     must not be able to touch profiles.
-- ===========================================================================
reset role;
set role anon;
do $$
declare n int;
begin
  select count(*) into n from public.heartbeat;
  if n <> 1 then
    raise exception 'T12 anon cannot read heartbeat (% rows) — keep-alive would fail', n;
  end if;
  -- profiles is granted to `authenticated` only, so anon must be refused
  -- outright. Asserting the refusal happens, rather than tolerating either
  -- outcome, is the difference between a test and a formality.
  begin
    perform 1 from public.profiles limit 1;
    raise exception 'T12 anon was allowed to query profiles';
  exception
    when insufficient_privilege then null;  -- expected
    when others then
      if sqlerrm like 'T12 %' then raise; end if;
  end;
  raise notice 'T12 anon reads heartbeat, not profiles  ok';
end $$;

-- ===========================================================================
-- 13. The keep-alive writes through heartbeat_ping() and only through it:
--     anon may call the function, but must not be able to update the table.
-- ===========================================================================
reset role;
update public.heartbeat set pinged = now() - interval '9 days' where id = 1;
set role anon;
do $$
declare before timestamptz; after timestamptz;
begin
  select pinged into before from public.heartbeat where id = 1;
  select public.heartbeat_ping() into after;
  if after <= before then
    raise exception 'T13 heartbeat_ping did not move pinged forward (% -> %)', before, after;
  end if;
  select pinged into before from public.heartbeat where id = 1;
  if before <> after then
    raise exception 'T13 heartbeat_ping returned % but the row says %', after, before;
  end if;

  -- the anon key is public, so a direct write must stay refused: the function
  -- is the only door, and all it can write is now()
  begin
    update public.heartbeat set pinged = 'epoch' where id = 1;
    raise exception 'T13 anon was allowed to update the heartbeat directly';
  exception
    when insufficient_privilege then null;  -- expected
    when others then
      if sqlerrm like 'T13 %' then raise; end if;
  end;
  raise notice 'T13 anon pings through the function, cannot write the table  ok';
end $$;


-- ===========================================================================
-- 14-18. Flashcards. The merge rule here is the opposite of the one above:
--        the freshest review wins rather than the largest value, because a
--        review is a measurement and forgetting a word is a real result.
-- ===========================================================================
reset role;
set role authenticated;
do $$
declare
  a uuid := '11111111-1111-1111-1111-111111111111';
  b uuid := '22222222-2222-2222-2222-222222222222';
  c public.card_state;
  n int;
begin
  perform set_config('test.uid', a::text, false);

  -- ----------------------------------------------------------------- 14
  perform public.merge_cards('[
    {"word":"你","reps":1,"lapses":0,"ease":2.5,"interval_days":1,
     "due":"2026-11-07","reviewed_at":"2026-11-06T09:00:00Z"},
    {"word":"好","reps":2,"lapses":0,"ease":2.6,"interval_days":3,
     "due":"2026-11-09","reviewed_at":"2026-11-06T09:01:00Z"}
  ]'::jsonb);
  select count(*) into n from public.card_state where user_id = a;
  if n <> 2 then raise exception 'T14 expected 2 cards, got %', n; end if;
  raise notice 'T14 fresh cards inserted                ok';

  -- ----------------------------------------------------------------- 15
  -- a stale push (an older review) must change nothing
  perform public.merge_cards('[
    {"word":"你","reps":99,"lapses":0,"ease":3.0,"interval_days":999,
     "due":"2029-01-01","reviewed_at":"2026-11-05T09:00:00Z"}
  ]'::jsonb);
  select * into c from public.card_state where user_id = a and word = '你';
  if c.interval_days <> 1 or c.reps <> 1 then
    raise exception 'T15 a stale push overwrote a newer review: %', row_to_json(c);
  end if;
  raise notice 'T15 stale push ignored                  ok';

  -- ----------------------------------------------------------------- 16
  -- forgetting: a NEWER review with a SHORTER interval must be recorded.
  -- greatest() semantics would refuse this, which is why cards are not kept
  -- in profiles.progress.
  perform public.merge_cards('[
    {"word":"好","reps":0,"lapses":1,"ease":2.4,"interval_days":0,
     "due":"2026-11-10","reviewed_at":"2026-11-10T08:00:00Z"}
  ]'::jsonb);
  select * into c from public.card_state where user_id = a and word = '好';
  if c.interval_days <> 0 or c.lapses <> 1 then
    raise exception 'T16 a lapse was not recorded: %', row_to_json(c);
  end if;
  raise notice 'T16 a forgotten word moves backwards    ok';

  -- ----------------------------------------------------------------- 17
  -- the same word twice in one batch: the later review wins, and the push
  -- must not fail outright
  perform public.merge_cards('[
    {"word":"是","reps":1,"lapses":0,"ease":2.5,"interval_days":1,
     "due":"2026-11-11","reviewed_at":"2026-11-10T10:00:00Z"},
    {"word":"是","reps":2,"lapses":0,"ease":2.5,"interval_days":6,
     "due":"2026-11-16","reviewed_at":"2026-11-10T11:00:00Z"}
  ]'::jsonb);
  select * into c from public.card_state where user_id = a and word = '是';
  if c.interval_days <> 6 or c.reps <> 2 then
    raise exception 'T17 duplicate in one batch resolved wrongly: %', row_to_json(c);
  end if;
  raise notice 'T17 duplicate word in one batch         ok';

  -- ----------------------------------------------------------------- 18
  -- isolation: b must neither see nor touch a's cards
  perform set_config('test.uid', b::text, false);
  select count(*) into n from public.card_state;
  if n <> 0 then
    raise exception 'T18 user b can see % of user a''s cards', n;
  end if;
  perform public.merge_cards('[
    {"word":"你","reps":7,"lapses":7,"ease":1.5,"interval_days":77,
     "due":"2027-01-01","reviewed_at":"2027-01-01T00:00:00Z"}
  ]'::jsonb);
  perform set_config('test.uid', a::text, false);
  select * into c from public.card_state where user_id = a and word = '你';
  if c.reps <> 1 then
    raise exception 'T18 user b wrote into user a''s card: %', row_to_json(c);
  end if;
  raise notice 'T18 cards are isolated between users    ok';
end $$;

-- ===========================================================================
-- 19. anon must not reach card_state at all.
-- ===========================================================================
reset role;
set role anon;
do $$
begin
  begin
    perform 1 from public.card_state limit 1;
    raise exception 'T19 anon was allowed to query card_state';
  exception
    when insufficient_privilege then null;  -- expected
    when others then
      if sqlerrm like 'T19 %' then raise; end if;
  end;
  raise notice 'T19 anon cannot read card_state         ok';
end $$;

reset role;
select 'ALL TESTS PASSED' as result;
