create table if not exists public.certificate_audit_log (
  id bigint generated always as identity primary key,
  certificate_id uuid references public.certificates(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('issue','revoke','reinstate')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.certificate_audit_log enable row level security;
revoke all on public.certificate_audit_log from anon, authenticated;
create policy "certificate_audit_log_deny_browser"
on public.certificate_audit_log for all to anon, authenticated
using (false) with check (false);

create index if not exists certificate_audit_log_certificate_idx on public.certificate_audit_log (certificate_id, created_at desc);
create index if not exists certificate_audit_log_actor_idx on public.certificate_audit_log (actor_user_id) where actor_user_id is not null;
