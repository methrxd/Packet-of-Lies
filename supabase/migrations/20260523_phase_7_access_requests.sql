create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  organization text,
  message text,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_notes text,
  approved_role_id uuid references public.app_roles(id) on delete set null,
  join_code_hash text,
  join_code_expires_at timestamptz,
  join_code_sent_at timestamptz,
  join_code_consumed_at timestamptz,
  joined_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_requests_status_check check (
    status in ('pending', 'approved', 'rejected')
  )
);

drop trigger if exists set_access_requests_updated_at on public.access_requests;
create trigger set_access_requests_updated_at
before update on public.access_requests
for each row
execute procedure public.set_updated_at();

create unique index if not exists access_requests_email_pending_idx
  on public.access_requests ((lower(email)))
  where status = 'pending';

create index if not exists access_requests_status_requested_idx
  on public.access_requests (status, requested_at desc);

create index if not exists access_requests_reviewed_by_idx
  on public.access_requests (reviewed_by);

alter table public.access_requests enable row level security;

insert into public.app_permissions (key, label, description)
values
  (
    'view_access_requests',
    'View access requests',
    'Review and process inbound access requests.'
  )
on conflict (key) do update
set label = excluded.label,
    description = excluded.description;

with admin_role as (
  select id from public.app_roles where name = 'admin' limit 1
),
permission_row as (
  select key from public.app_permissions where key = 'view_access_requests' limit 1
)
insert into public.app_role_permissions (role_id, permission_key)
select ar.id, pr.key
from admin_role ar
cross join permission_row pr
on conflict do nothing;
