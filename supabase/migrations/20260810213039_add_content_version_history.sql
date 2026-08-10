alter table public.content_items add column if not exists current_version integer not null default 0;

create table if not exists public.content_versions (
  id bigint generated always as identity primary key,
  content_type text not null check (content_type in ('lesson','resource')),
  content_key text not null,
  version integer not null,
  payload jsonb not null,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  unique (content_type, content_key, version)
);

alter table public.content_versions enable row level security;
revoke all on public.content_versions from anon, authenticated;
create policy "content_versions_deny_browser"
on public.content_versions
for all
to anon, authenticated
using (false)
with check (false);

create index if not exists content_versions_item_idx on public.content_versions (content_type, content_key, version desc);
create index if not exists content_versions_published_by_idx on public.content_versions (published_by) where published_by is not null;
