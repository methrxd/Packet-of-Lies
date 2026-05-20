create or replace function public.bootstrap_create_first_admin(
  p_email text,
  p_password text,
  p_username text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
begin
  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'admin_exists';
  end if;

  if p_username is null or p_username !~ '^[A-Za-z0-9_]{3,32}$' then
    raise exception 'invalid_username';
  end if;

  if p_password is null
     or length(p_password) < 12
     or p_password !~ '[A-Z]'
     or p_password !~ '[a-z]'
     or p_password !~ '[0-9]'
     or p_password !~ '[^A-Za-z0-9]' then
    raise exception 'weak_password';
  end if;

  if exists (select 1 from auth.users where email = v_email and deleted_at is null) then
    raise exception 'email_exists';
  end if;

  insert into auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_sso_user,
    is_anonymous
  )
  values (
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('display_name', p_username),
    now(),
    now(),
    false,
    false
  );

  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    email
  )
  values (
    gen_random_uuid(),
    v_email,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now(),
    v_email
  );

  update public.profiles
  set
    email = v_email,
    display_name = p_username,
    username = p_username,
    role = 'admin',
    profile_completed_at = now(),
    updated_at = now()
  where id = v_user_id;

  return v_user_id;
end;
$$;

revoke all on function public.bootstrap_create_first_admin(text, text, text) from public;
grant execute on function public.bootstrap_create_first_admin(text, text, text) to anon, authenticated, service_role;
