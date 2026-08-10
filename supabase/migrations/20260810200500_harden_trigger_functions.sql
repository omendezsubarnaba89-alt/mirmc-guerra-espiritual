-- MIRMC Guerra Espiritual · Security hardening
-- Trigger functions remain usable by database triggers but cannot be invoked through the public API.

revoke all on function public.handle_new_user_profile() from public;
revoke execute on function public.handle_new_user_profile() from anon;
revoke execute on function public.handle_new_user_profile() from authenticated;

revoke all on function public.set_updated_at() from public;
revoke execute on function public.set_updated_at() from anon;
revoke execute on function public.set_updated_at() from authenticated;
