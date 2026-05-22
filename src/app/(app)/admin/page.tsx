import { InviteUserForm } from "@/components/admin/invite-user-form";
import { RoleManagementPanel } from "@/components/admin/role-management-panel";
import { AccessRequestsPanel } from "@/components/admin/access-requests-panel";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const [{ data: profiles }, { data: roles }, { data: permissions }, { data: rolePermissionRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, display_name, username, role, role_id, profile_completed_at, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("app_roles").select("id, name, description, is_system").order("name", { ascending: true }),
      supabase.from("app_permissions").select("key, label, description").order("key", { ascending: true }),
      supabase.from("app_role_permissions").select("role_id, permission_key"),
    ]);

  const { data: accessRequests } = await adminSupabase
    .from("access_requests")
    .select("id, email, full_name, organization, message, status, requested_at")
    .eq("status", "pending")
    .order("requested_at", { ascending: true })
    .limit(50);

  const roleMap = new Map((roles ?? []).map((role) => [role.id, role]));
  const permissionsByRole = new Map<string, string[]>();
  for (const row of rolePermissionRows ?? []) {
    const current = permissionsByRole.get(row.role_id) ?? [];
    current.push(row.permission_key);
    permissionsByRole.set(row.role_id, current);
  }

  const roleDefinitions =
    roles?.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.is_system,
      permissions: permissionsByRole.get(role.id) ?? [],
    })) ?? [];

  const pendingRequests =
    accessRequests?.map((request) => ({
      id: request.id,
      email: request.email,
      fullName: request.full_name,
      organization: request.organization,
      message: request.message,
      status: request.status as "pending" | "approved" | "rejected",
      requestedAt: request.requested_at,
    })) ?? [];

  const users =
    profiles?.map((profile) => ({
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name ?? profile.email.split("@")[0] ?? "analyst",
      username: profile.username,
      roleName:
        (profile.role_id ? roleMap.get(profile.role_id)?.name : null) ??
        (profile.role === "admin" ? "admin" : "analyst"),
      roleId:
        profile.role_id ??
        roles?.find((role) => role.name === (profile.role === "admin" ? "admin" : "analyst"))?.id ??
        null,
      profileCompletedAt: profile.profile_completed_at,
      createdAt: profile.created_at,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Roles and permissions"
        description="Manage user access, assign roles, and control capability permissions."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription className="helix-kicker">Users</CardDescription>
            <CardTitle>{users.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[var(--text-muted)]">Registered workspace users</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="helix-kicker">Roles</CardDescription>
            <CardTitle>{roleDefinitions.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[var(--text-muted)]">Permission groups available</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="helix-kicker">Admins</CardDescription>
            <CardTitle>{users.filter((user) => user.roleName === "admin").length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[var(--text-muted)]">Keep at least one active admin</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardDescription className="helix-kicker">Request access</CardDescription>
          <CardTitle>Pending approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <AccessRequestsPanel requests={pendingRequests} roles={roleDefinitions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="helix-kicker">Invitation</CardDescription>
          <CardTitle>Invite user</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteUserForm roles={roleDefinitions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="helix-kicker">Access management</CardDescription>
          <CardTitle>Role and user controls</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleManagementPanel users={users} roles={roleDefinitions} permissions={permissions ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
