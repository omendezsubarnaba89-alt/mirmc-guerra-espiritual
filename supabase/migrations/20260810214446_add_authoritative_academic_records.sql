create table if not exists public.lesson_validations (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_key text not null check (lesson_key ~ '^\\d{2}$'),
  attempts integer not null default 0 check (attempts >= 0),
  best_score integer not null default 0 check (best_score between 0 and 3),
  total integer not null default 3 check (total = 3),
  passed boolean not null default false,
  passed_at timestamptz,
  last_attempt_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);

alter table public.lesson_validations enable row level security;
revoke all on public.lesson_validations from anon, authenticated;
grant select on public.lesson_validations to authenticated;
create policy "lesson_validations_select_own"
on public.lesson_validations for select to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.exam_validations (
  user_id uuid not null references auth.users(id) on delete cascade,
  level integer not null check (level between 1 and 3),
  attempts integer not null default 0 check (attempts >= 0),
  best_score integer not null default 0 check (best_score between 0 and 10),
  best_pct integer not null default 0 check (best_pct between 0 and 100),
  passed boolean not null default false,
  passed_at timestamptz,
  last_attempt_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, level)
);

alter table public.exam_validations enable row level security;
revoke all on public.exam_validations from anon, authenticated;
grant select on public.exam_validations to authenticated;
create policy "exam_validations_select_own"
on public.exam_validations for select to authenticated
using ((select auth.uid()) = user_id);

create index if not exists lesson_validations_passed_idx on public.lesson_validations (user_id, passed, lesson_key);
create index if not exists exam_validations_passed_idx on public.exam_validations (user_id, passed, level);
