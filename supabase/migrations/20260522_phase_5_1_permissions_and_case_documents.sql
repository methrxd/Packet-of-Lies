alter table public.case_findings
  add column if not exists document_path text,
  add column if not exists document_name text,
  add column if not exists document_size bigint,
  add column if not exists document_mime text;

alter table public.case_mitigations
  add column if not exists document_path text,
  add column if not exists document_name text,
  add column if not exists document_size bigint,
  add column if not exists document_mime text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-documents',
  'case-documents',
  false,
  5242880,
  array['application/pdf']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.app_permissions (key, label, description)
values
  ('view_submissions', 'View submissions', 'View senior evidence submission queue.'),
  ('manage_case_documents', 'Manage case documents', 'Upload and manage case-linked PDF evidence for findings and mitigations.')
on conflict (key) do update
set label = excluded.label,
    description = excluded.description;

update public.app_permissions
set label = 'Manage submissions intake',
    description = 'Create and update global evidence submissions.'
where key = 'manage_submissions';

with admin_role as (
  select id from public.app_roles where name = 'admin' limit 1
),
all_permissions as (
  select key from public.app_permissions
)
insert into public.app_role_permissions (role_id, permission_key)
select ar.id, ap.key
from admin_role ar
cross join all_permissions ap
on conflict do nothing;

with analyst_role as (
  select id from public.app_roles where name = 'analyst' limit 1
),
allowed as (
  select key
  from public.app_permissions
  where key in ('manage_cases', 'manage_case_documents', 'view_reports', 'view_indicators')
)
insert into public.app_role_permissions (role_id, permission_key)
select ar.id, a.key
from analyst_role ar
cross join allowed a
on conflict do nothing;
