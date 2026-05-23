create table if not exists public.analysis_scoring_rubrics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  version text not null,
  description text,
  weights jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_analysis_scoring_rubrics_updated_at on public.analysis_scoring_rubrics;
create trigger set_analysis_scoring_rubrics_updated_at
before update on public.analysis_scoring_rubrics
for each row
execute procedure public.set_updated_at();

create table if not exists public.case_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete restrict,
  provider text not null check (provider in ('virustotal', 'hybrid_analysis')),
  input_type text not null check (input_type in ('hash', 'url', 'sample_ref')),
  input_value text not null,
  input_normalized text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  external_job_id text,
  provider_report_id text,
  provider_report_url text,
  verdict text,
  report_metadata jsonb not null default '{}'::jsonb,
  behavior_summary jsonb not null default '{}'::jsonb,
  extracted_iocs jsonb not null default '[]'::jsonb,
  error_message text,
  score_total numeric(5,2),
  score_breakdown jsonb,
  rubric_id uuid references public.analysis_scoring_rubrics(id) on delete set null,
  rubric_snapshot jsonb,
  is_cached boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_case_analysis_runs_updated_at on public.case_analysis_runs;
create trigger set_case_analysis_runs_updated_at
before update on public.case_analysis_runs
for each row
execute procedure public.set_updated_at();

create index if not exists case_analysis_runs_case_created_idx
on public.case_analysis_runs(case_id, created_at desc);

create index if not exists case_analysis_runs_status_idx
on public.case_analysis_runs(status, updated_at desc);

create index if not exists case_analysis_runs_input_lookup_idx
on public.case_analysis_runs(provider, input_type, input_normalized, status, created_at desc);

alter table public.analysis_scoring_rubrics enable row level security;
alter table public.case_analysis_runs enable row level security;

drop policy if exists "analysis_scoring_rubrics_select_authenticated" on public.analysis_scoring_rubrics;
create policy "analysis_scoring_rubrics_select_authenticated"
on public.analysis_scoring_rubrics
for select
to authenticated
using (true);

drop policy if exists "case_analysis_runs_select_authenticated" on public.case_analysis_runs;
create policy "case_analysis_runs_select_authenticated"
on public.case_analysis_runs
for select
to authenticated
using (true);

drop policy if exists "case_analysis_runs_insert_own" on public.case_analysis_runs;
create policy "case_analysis_runs_insert_own"
on public.case_analysis_runs
for insert
to authenticated
with check (auth.uid() = requested_by);

drop policy if exists "case_analysis_runs_update_owner_or_admin" on public.case_analysis_runs;
create policy "case_analysis_runs_update_owner_or_admin"
on public.case_analysis_runs
for update
to authenticated
using (requested_by = auth.uid() or private.is_admin(auth.uid()))
with check (requested_by = auth.uid() or private.is_admin(auth.uid()));

grant select on public.analysis_scoring_rubrics to authenticated;
grant select, insert, update on public.case_analysis_runs to authenticated;

insert into public.analysis_scoring_rubrics (name, version, description, weights, is_active)
values (
  'default_malware_risk_v1',
  '1.0.0',
  'Deterministic weighted malware risk rubric for provider-backed runs.',
  '{
    "detection_ratio_weight": 35,
    "behavior_severity_weight": 20,
    "confidence_weight": 20,
    "suspicious_families_weight": 15,
    "network_indicators_weight": 10,
    "family_multiplier": 20,
    "network_multiplier": 10
  }'::jsonb,
  true
)
on conflict (name) do update
set version = excluded.version,
    description = excluded.description,
    weights = excluded.weights,
    is_active = excluded.is_active;

