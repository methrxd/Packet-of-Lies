create table if not exists public.case_findings (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  detail text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_mitigations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  detail text not null,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_comments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  body text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.case_activity_log (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists case_findings_case_id_idx
on public.case_findings(case_id, created_at desc);

create index if not exists case_mitigations_case_id_idx
on public.case_mitigations(case_id, created_at desc);

create index if not exists case_comments_case_id_idx
on public.case_comments(case_id, created_at desc);

create index if not exists case_activity_log_case_id_idx
on public.case_activity_log(case_id, created_at desc);

drop trigger if exists set_case_findings_updated_at on public.case_findings;
create trigger set_case_findings_updated_at
before update on public.case_findings
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_case_mitigations_updated_at on public.case_mitigations;
create trigger set_case_mitigations_updated_at
before update on public.case_mitigations
for each row
execute procedure public.set_updated_at();

create or replace function public.validate_case_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  finding_count bigint;
  mitigation_count bigint;
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status = 'archived' then
    raise exception 'Archived cases cannot be modified.';
  end if;

  if new.status = 'triage' and old.status <> 'new' then
    raise exception 'Cases can move to triage only from new.';
  end if;

  if new.status = 'investigating' and old.status not in ('triage', 'contained') then
    raise exception 'Cases can move to investigating only from triage or contained.';
  end if;

  if new.status = 'contained' and old.status <> 'investigating' then
    raise exception 'Cases can move to contained only from investigating.';
  end if;

  if new.status = 'resolved' and old.status not in ('investigating', 'contained') then
    raise exception 'Cases can move to resolved only from investigating or contained.';
  end if;

  if new.status = 'archived' and old.status <> 'resolved' then
    raise exception 'Cases can move to archived only from resolved.';
  end if;

  if new.status = 'resolved' then
    select count(*) into finding_count from public.case_findings where case_id = new.id;
    select count(*) into mitigation_count from public.case_mitigations where case_id = new.id;

    if finding_count = 0 and mitigation_count = 0 then
      raise exception 'Cases require at least one finding or mitigation before resolving.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.log_case_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.case_activity_log (case_id, actor_user_id, action, payload)
    values (
      new.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'from', old.status,
        'to', new.status
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists validate_case_status_transition_on_cases on public.cases;
create trigger validate_case_status_transition_on_cases
before update of status on public.cases
for each row
execute procedure public.validate_case_status_transition();

drop trigger if exists log_case_status_transition_on_cases on public.cases;
create trigger log_case_status_transition_on_cases
after update of status on public.cases
for each row
execute procedure public.log_case_status_transition();

alter table public.case_findings enable row level security;
alter table public.case_mitigations enable row level security;
alter table public.case_comments enable row level security;
alter table public.case_activity_log enable row level security;

drop policy if exists "case_findings_select_authenticated" on public.case_findings;
create policy "case_findings_select_authenticated"
on public.case_findings
for select
to authenticated
using (true);

drop policy if exists "case_findings_insert_own" on public.case_findings;
create policy "case_findings_insert_own"
on public.case_findings
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "case_findings_update_owner_or_admin" on public.case_findings;
create policy "case_findings_update_owner_or_admin"
on public.case_findings
for update
to authenticated
using (created_by = auth.uid() or private.is_admin(auth.uid()))
with check (created_by = auth.uid() or private.is_admin(auth.uid()));

drop policy if exists "case_mitigations_select_authenticated" on public.case_mitigations;
create policy "case_mitigations_select_authenticated"
on public.case_mitigations
for select
to authenticated
using (true);

drop policy if exists "case_mitigations_insert_own" on public.case_mitigations;
create policy "case_mitigations_insert_own"
on public.case_mitigations
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "case_mitigations_update_owner_or_admin" on public.case_mitigations;
create policy "case_mitigations_update_owner_or_admin"
on public.case_mitigations
for update
to authenticated
using (created_by = auth.uid() or private.is_admin(auth.uid()))
with check (created_by = auth.uid() or private.is_admin(auth.uid()));

drop policy if exists "case_comments_select_authenticated" on public.case_comments;
create policy "case_comments_select_authenticated"
on public.case_comments
for select
to authenticated
using (true);

drop policy if exists "case_comments_insert_own" on public.case_comments;
create policy "case_comments_insert_own"
on public.case_comments
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "case_activity_log_select_authenticated" on public.case_activity_log;
create policy "case_activity_log_select_authenticated"
on public.case_activity_log
for select
to authenticated
using (true);

drop policy if exists "case_activity_log_insert_own" on public.case_activity_log;
create policy "case_activity_log_insert_own"
on public.case_activity_log
for insert
to authenticated
with check (auth.uid() = actor_user_id);

grant select, insert, update on public.case_findings to authenticated;
grant select, insert, update on public.case_mitigations to authenticated;
grant select, insert on public.case_comments to authenticated;
grant select, insert on public.case_activity_log to authenticated;
