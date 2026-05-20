alter table public.app_roles enable row level security;
alter table public.app_permissions enable row level security;
alter table public.app_role_permissions enable row level security;

drop policy if exists "app_roles_select_authenticated" on public.app_roles;
create policy "app_roles_select_authenticated"
on public.app_roles
for select
to authenticated
using (true);

drop policy if exists "app_permissions_select_authenticated" on public.app_permissions;
create policy "app_permissions_select_authenticated"
on public.app_permissions
for select
to authenticated
using (true);

drop policy if exists "app_role_permissions_select_authenticated" on public.app_role_permissions;
create policy "app_role_permissions_select_authenticated"
on public.app_role_permissions
for select
to authenticated
using (true);
