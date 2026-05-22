create table if not exists public.password_reset_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  otp_hash text not null,
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 10),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  last_attempt_at timestamptz
);

create index if not exists password_reset_otps_user_created_idx
on public.password_reset_otps(user_id, created_at desc);

create index if not exists password_reset_otps_email_created_idx
on public.password_reset_otps(email, created_at desc);

create index if not exists password_reset_otps_active_idx
on public.password_reset_otps(user_id, expires_at desc)
where consumed_at is null;

alter table public.password_reset_otps enable row level security;

revoke all on table public.password_reset_otps from anon;
revoke all on table public.password_reset_otps from authenticated;
