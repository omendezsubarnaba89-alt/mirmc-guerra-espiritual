drop policy if exists "content_items_public_read_published" on public.content_items;
create policy "content_items_public_read_published"
on public.content_items
for select
to anon, authenticated
using (published_payload is not null and archived = false);
