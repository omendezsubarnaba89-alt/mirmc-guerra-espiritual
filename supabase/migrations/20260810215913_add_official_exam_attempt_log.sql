create table if not exists public.exam_attempt_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  level integer not null check (level between 1 and 3),
  score integer not null check (score between 0 and 10),
  pct integer not null check (pct between 0 and 100),
  passed boolean not null,
  submitted_at timestamptz not null default now()
);

alter table public.exam_attempt_log enable row level security;
revoke all on public.exam_attempt_log from anon, authenticated;
grant select on public.exam_attempt_log to authenticated;
create policy "exam_attempt_log_select_own"
on public.exam_attempt_log for select to authenticated
using ((select auth.uid()) = user_id);

create index if not exists exam_attempt_log_rate_idx on public.exam_attempt_log (user_id, level, submitted_at desc);
