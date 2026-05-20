create or replace function public.resolve_login_email(p_identifier text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when p_identifier is null then null
    when position('@' in trim(p_identifier)) > 0 then lower(trim(p_identifier))
    else (
      select email
      from public.profiles
      where lower(username) = lower(trim(p_identifier))
      limit 1
    )
  end;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated, service_role;
