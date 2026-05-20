create table if not exists public.indicators (
  id uuid primary key default gen_random_uuid(),
  indicator_type text not null check (indicator_type in ('sha256', 'domain', 'ipv4', 'url', 'email', 'filename')),
  indicator_value text not null,
  normalized_value text not null,
  confidence integer not null default 60 check (confidence between 1 and 100),
  status text not null default 'new' check (status in ('new', 'validated', 'false_positive')),
  source_submission_id uuid references public.submissions(id) on delete set null,
  source_case_id uuid references public.cases(id) on delete set null,
  notes text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists indicators_unique_normalized_idx
on public.indicators (indicator_type, normalized_value);

create index if not exists indicators_source_case_idx
on public.indicators (source_case_id);

create index if not exists indicators_last_seen_idx
on public.indicators (last_seen_at desc);

drop trigger if exists set_indicators_updated_at on public.indicators;
create trigger set_indicators_updated_at
before update on public.indicators
for each row
execute procedure public.set_updated_at();

alter table public.indicators enable row level security;

drop policy if exists "indicators_select_authenticated" on public.indicators;
create policy "indicators_select_authenticated"
on public.indicators
for select
to authenticated
using (true);

drop policy if exists "indicators_insert_own" on public.indicators;
create policy "indicators_insert_own"
on public.indicators
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "indicators_update_authenticated" on public.indicators;
create policy "indicators_update_authenticated"
on public.indicators
for update
to authenticated
using (true)
with check (true);

grant select, insert, update on public.indicators to authenticated;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  summary text not null,
  findings jsonb not null default '[]'::jsonb,
  recommendations text not null,
  generated_by uuid not null references auth.users(id) on delete restrict,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists reports_case_id_idx
on public.reports(case_id, generated_at desc);

alter table public.reports enable row level security;

drop policy if exists "reports_select_authenticated" on public.reports;
create policy "reports_select_authenticated"
on public.reports
for select
to authenticated
using (true);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
on public.reports
for insert
to authenticated
with check (auth.uid() = generated_by);

grant select, insert on public.reports to authenticated;
