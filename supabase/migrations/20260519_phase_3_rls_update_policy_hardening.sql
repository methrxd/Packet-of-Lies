drop policy if exists "cases_update_authenticated" on public.cases;
create policy "cases_update_owner_assignee_or_admin"
on public.cases
for update
to authenticated
using (
  created_by = auth.uid()
  or assigned_to = auth.uid()
  or private.is_admin(auth.uid())
)
with check (
  created_by = auth.uid()
  or assigned_to = auth.uid()
  or private.is_admin(auth.uid())
);

drop policy if exists "submissions_update_authenticated" on public.submissions;
create policy "submissions_update_owner_or_admin"
on public.submissions
for update
to authenticated
using (
  submitted_by = auth.uid()
  or private.is_admin(auth.uid())
)
with check (
  submitted_by = auth.uid()
  or private.is_admin(auth.uid())
);
