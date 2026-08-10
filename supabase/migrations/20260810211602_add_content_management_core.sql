create table if not exists public.content_items (
  content_type text not null check (content_type in ('lesson','resource')),
  content_key text not null,
  draft_payload jsonb,
  published_payload jsonb,
  position integer not null default 0,
  archived boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  primary key (content_type, content_key)
);

alter table public.content_items enable row level security;
revoke all on public.content_items from anon, authenticated;
grant select (content_type, content_key, published_payload, position, published_at) on public.content_items to anon, authenticated;

create policy "content_items_public_read_published"
on public.content_items
for select
to anon, authenticated
using (published_payload is not null and archived = false);

create or replace function public.touch_content_items_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.touch_content_items_updated_at() from public, anon, authenticated;

drop trigger if exists trg_content_items_updated_at on public.content_items;
create trigger trg_content_items_updated_at
before update on public.content_items
for each row execute function public.touch_content_items_updated_at();

create index if not exists content_items_publish_idx
  on public.content_items (content_type, position, content_key)
  where published_payload is not null and archived = false;

create table if not exists public.content_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  content_type text not null,
  content_key text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.content_audit_log enable row level security;
revoke all on public.content_audit_log from anon, authenticated;
create policy "content_audit_log_deny_browser"
on public.content_audit_log
for all
to anon, authenticated
using (false)
with check (false);

create index if not exists content_audit_log_created_at_idx on public.content_audit_log (created_at desc);
create index if not exists content_audit_log_item_idx on public.content_audit_log (content_type, content_key, created_at desc);
