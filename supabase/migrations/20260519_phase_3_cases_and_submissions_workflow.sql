create schema if not exists private;

grant usage on schema private to authenticated;

create or replace function private.is_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id and role = 'admin'
  );
$$;

revoke all on function private.is_admin(uuid) from public;
grant execute on function private.is_admin(uuid) to authenticated;

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all"
on public.profiles
for select
to authenticated
using (private.is_admin(auth.uid()));

drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all"
on public.profiles
for update
to authenticated
using (private.is_admin(auth.uid()))
with check (private.is_admin(auth.uid()));

create sequence if not exists public.case_number_seq start with 1000 increment by 1;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text not null unique default ('CASE-' || lpad(nextval('public.case_number_seq')::text, 5, '0')),
  title text not null,
  summary text,
  status text not null default 'new' check (status in ('new', 'triage', 'investigating', 'contained', 'resolved', 'archived')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  priority text not null default 'p2' check (priority in ('p0', 'p1', 'p2', 'p3')),
  created_by uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  submission_type text not null check (submission_type in ('file', 'url', 'domain', 'ip', 'email_artifact', 'manual_incident')),
  title text not null,
  description text,
  payload jsonb not null default '{}'::jsonb,
  validation_state text not null default 'pending' check (validation_state in ('pending', 'reviewed', 'linked', 'rejected')),
  submitted_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_status_idx on public.cases(status);
create index if not exists cases_severity_idx on public.cases(severity);
create index if not exists cases_priority_idx on public.cases(priority);
create index if not exists cases_created_at_idx on public.cases(created_at desc);
create index if not exists submissions_created_at_idx on public.submissions(created_at desc);
create index if not exists submissions_case_id_idx on public.submissions(case_id);

alter table public.cases enable row level security;
alter table public.submissions enable row level security;

drop trigger if exists set_cases_updated_at on public.cases;
create trigger set_cases_updated_at
before update on public.cases
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_submissions_updated_at on public.submissions;
create trigger set_submissions_updated_at
before update on public.submissions
for each row
execute procedure public.set_updated_at();

drop policy if exists "cases_select_authenticated" on public.cases;
create policy "cases_select_authenticated"
on public.cases
for select
to authenticated
using (true);

drop policy if exists "cases_insert_own" on public.cases;
create policy "cases_insert_own"
on public.cases
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "cases_update_authenticated" on public.cases;
create policy "cases_update_authenticated"
on public.cases
for update
to authenticated
using (true)
with check (true);

drop policy if exists "submissions_select_authenticated" on public.submissions;
create policy "submissions_select_authenticated"
on public.submissions
for select
to authenticated
using (true);

drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own"
on public.submissions
for insert
to authenticated
with check (auth.uid() = submitted_by);

drop policy if exists "submissions_update_authenticated" on public.submissions;
create policy "submissions_update_authenticated"
on public.submissions
for update
to authenticated
using (true)
with check (true);

grant select, insert, update on table public.cases to authenticated;
grant select, insert, update on table public.submissions to authenticated;
grant usage, select on sequence public.case_number_seq to authenticated;
grant select, update on table public.profiles to authenticated;
