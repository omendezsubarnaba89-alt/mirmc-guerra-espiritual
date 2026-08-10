create table if not exists public.academic_answer_keys (
  assessment_type text not null check (assessment_type in ('exam')),
  assessment_key text not null,
  version integer not null check (version > 0),
  answer_key smallint[] not null,
  updated_at timestamptz not null default now(),
  primary key (assessment_type, assessment_key)
);

alter table public.academic_answer_keys enable row level security;
revoke all on public.academic_answer_keys from anon, authenticated;

create policy "academic_answer_keys_deny_browser"
on public.academic_answer_keys for all to anon, authenticated
using (false) with check (false);

-- IMPORTANT: answer-key DATA is intentionally not versioned in this public repository.
-- Production values are seeded directly in Supabase and are available only to server-side service-role code.
