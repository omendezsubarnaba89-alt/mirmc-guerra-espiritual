create policy admin_audit_log_deny_clients
on public.admin_audit_log
for all
to anon, authenticated
using (false)
with check (false);
