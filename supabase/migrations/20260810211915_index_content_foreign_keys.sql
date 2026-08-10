create index if not exists content_items_created_by_idx on public.content_items (created_by) where created_by is not null;
create index if not exists content_items_updated_by_idx on public.content_items (updated_by) where updated_by is not null;
create index if not exists content_audit_log_actor_user_id_idx on public.content_audit_log (actor_user_id) where actor_user_id is not null;
