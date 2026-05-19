import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { BootstrapForm } from "@/components/auth/bootstrap-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BootstrapPage() {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    return (
      <main className="relative flex min-h-svh items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-white/8 bg-[var(--bg-card)] panel-shadow">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-[var(--state-warning)]">
              Bootstrap unavailable
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              {error.message}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if ((count ?? 0) > 0) {
    redirect("/auth/login");
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-muted opacity-25" />
      <Card className="relative z-10 w-full max-w-xl border-white/8 bg-[var(--bg-card)] panel-shadow">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[10px] tracking-[0.18em] text-primary uppercase"
            >
              First setup
            </Badge>
            <LockKeyhole className="size-5 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">
            Create the first super admin
          </CardTitle>
          <CardDescription className="leading-6 text-[var(--text-secondary)]">
            This one-time route is available only before any user exists. After
            setup, onboarding switches to invite-only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BootstrapForm />
        </CardContent>
      </Card>
    </main>
  );
}
