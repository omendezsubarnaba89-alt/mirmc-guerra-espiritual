create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_code text not null unique check (certificate_code ~ '^MIRMC-GE-[A-F0-9]{16}$'),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  participant_name text not null check (char_length(participant_name) between 2 and 80),
  average integer not null check (average between 0 and 100),
  lessons_completed integer not null default 15 check (lessons_completed = 15),
  exams_passed integer not null default 3 check (exams_passed = 3),
  completion_date date not null,
  status text not null default 'active' check (status in ('active','revoked')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  academic_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.certificates enable row level security;
revoke all on public.certificates from anon, authenticated;
grant select (certificate_code,participant_name,average,lessons_completed,exams_passed,completion_date,status,issued_at,revoked_at,revocation_reason) on public.certificates to anon, authenticated;

create policy "certificate_verify_by_transaction_code"
on public.certificates for select to anon, authenticated
using (certificate_code = (select nullif(current_setting('app.mirmc_certificate_code', true), '')));

create or replace function public.verify_certificate(p_code text)
returns table (
  certificate_code text,
  participant_name text,
  average integer,
  lessons_completed integer,
  exams_passed integer,
  completion_date date,
  status text,
  issued_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text
)
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare normalized text := upper(trim(coalesce(p_code,'')));
begin
  if normalized !~ '^MIRMC-GE-[A-F0-9]{16}$' then return; end if;
  perform set_config('app.mirmc_certificate_code', normalized, true);
  return query
  select c.certificate_code,c.participant_name,c.average,c.lessons_completed,c.exams_passed,c.completion_date,c.status,c.issued_at,c.revoked_at,c.revocation_reason
  from public.certificates c where c.certificate_code = normalized limit 1;
end;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

create index if not exists certificates_status_idx on public.certificates (status, issued_at desc);
create index if not exists certificates_revoked_by_idx on public.certificates (revoked_by) where revoked_by is not null;
