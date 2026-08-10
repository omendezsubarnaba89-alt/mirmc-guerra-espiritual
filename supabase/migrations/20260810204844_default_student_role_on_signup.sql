create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles(user_id, role, active)
  values (new.id, 'student', true)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user_role() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_role on auth.users;
create trigger on_auth_user_created_role
after insert on auth.users
for each row execute function public.handle_new_user_role();
