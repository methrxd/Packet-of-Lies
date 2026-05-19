alter table public.profiles
  add column if not exists username text,
  add column if not exists avatar_path text,
  add column if not exists profile_completed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_username_format'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_username_format
      check (username is null or username ~ '^[A-Za-z0-9_]{3,32}$');
  end if;
end;
$$;

create unique index if not exists profiles_username_unique_idx
on public.profiles (lower(username))
where username is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    username,
    avatar_path,
    role,
    profile_completed_at
  )
  values (
    new.id,
    coalesce(new.email, concat(new.id::text, '@packet-of-lies.local')),
    split_part(coalesce(new.email, 'analyst@packet-of-lies.local'), '@', 1),
    null,
    null,
    'analyst',
    null
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return new;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  2097152,
  array['image/jpeg', 'image/png']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

revoke update on public.profiles from authenticated;
grant update (display_name, username, avatar_path, profile_completed_at, updated_at) on public.profiles to authenticated;
grant select on public.profiles to authenticated;
