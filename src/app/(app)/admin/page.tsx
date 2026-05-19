import { InviteUserForm } from "@/components/admin/invite-user-form";
import { RoleManagementPanel } from "@/components/admin/role-management-panel";
import type { AppRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, username, role, profile_completed_at, created_at")
    .order("created_at", { ascending: false });

  const users =
    profiles?.map((profile) => ({
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name ?? profile.email.split("@")[0] ?? "analyst",
      username: profile.username,
      role: (profile.role === "admin" ? "admin" : "analyst") as AppRole,
      profileCompletedAt: profile.profile_completed_at,
      createdAt: profile.created_at,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Access and identity control plane"
        description="Invite users, assign roles, and track onboarding completion from one secure admin workspace."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Team state
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              {users.length} active user{users.length === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
            <p>
              User onboarding is invite-only by default.
            </p>
            <p>
              New users complete username, password, and optional profile image
              before entering protected routes.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Role distribution
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Access segmentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary"
            >
              {
                users.filter((user) => user.role === "admin").length
              }{" "}
              admin
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/4">
              {users.filter((user) => user.role === "analyst").length} analyst
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/4">
              {
                users.filter((user) => user.profileCompletedAt).length
              }{" "}
              completed
            </Badge>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              Keep at least one admin account active at all times. Admin-only
              routes are gated at the middleware, layout, and RLS layers.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/6 bg-[var(--bg-card)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            User invites
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Invite a new user
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InviteUserForm />
        </CardContent>
      </Card>

      <Card className="border-white/6 bg-[var(--bg-card)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            Role operations
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Live profile role management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoleManagementPanel users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
