create table if not exists public.app_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_roles_name_format check (name ~ '^[a-z][a-z0-9_-]{2,31}$')
);

drop trigger if exists set_app_roles_updated_at on public.app_roles;
create trigger set_app_roles_updated_at
before update on public.app_roles
for each row
execute procedure public.set_updated_at();

create table if not exists public.app_permissions (
  key text primary key,
  label text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_role_permissions (
  role_id uuid not null references public.app_roles(id) on delete cascade,
  permission_key text not null references public.app_permissions(key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_key)
);

alter table public.profiles
  add column if not exists role_id uuid references public.app_roles(id) on delete set null;

insert into public.app_roles (name, description, is_system)
values
  ('admin', 'Full administrative control over platform access and identity.', true),
  ('analyst', 'Default analyst workspace role.', true)
on conflict (name) do update
set description = excluded.description,
    is_system = excluded.is_system;

insert into public.app_permissions (key, label, description)
values
  ('manage_users', 'Manage users', 'Invite users, update role assignments, and remove accounts.'),
  ('manage_roles', 'Manage roles', 'Create custom roles and configure permission sets.'),
  ('manage_cases', 'Manage cases', 'Create and update case records.'),
  ('manage_submissions', 'Manage submissions', 'Create and update evidence submissions.'),
  ('view_reports', 'View reports', 'Access report generation and report views.'),
  ('view_indicators', 'View indicators', 'Access indicator and telemetry views.')
on conflict (key) do update
set label = excluded.label,
    description = excluded.description;

with role_map as (
  select id, name
  from public.app_roles
  where name in ('admin', 'analyst')
)
update public.profiles p
set role_id = rm.id
from role_map rm
where p.role_id is null
  and p.role = rm.name;

with admin_role as (
  select id from public.app_roles where name = 'admin' limit 1
),
analyst_role as (
  select id from public.app_roles where name = 'analyst' limit 1
),
permission_set as (
  select key from public.app_permissions
)
insert into public.app_role_permissions (role_id, permission_key)
select ar.id, ps.key
from admin_role ar
cross join permission_set ps
on conflict do nothing;

with analyst_role as (
  select id from public.app_roles where name = 'analyst' limit 1
)
insert into public.app_role_permissions (role_id, permission_key)
select an.id, ps.key
from analyst_role an
join public.app_permissions ps
  on ps.key in ('manage_cases', 'manage_submissions', 'view_reports', 'view_indicators')
on conflict do nothing;

grant select on public.app_roles to authenticated;
grant select on public.app_permissions to authenticated;
grant select on public.app_role_permissions to authenticated;
