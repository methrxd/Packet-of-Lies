create or replace function public.bootstrap_required()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select not exists (select 1 from auth.users);
$$;

revoke all on function public.bootstrap_required() from public;
grant execute on function public.bootstrap_required() to anon, authenticated, service_role;
