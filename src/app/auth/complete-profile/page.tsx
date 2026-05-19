import { redirect } from "next/navigation";
import { UserRoundCheck } from "lucide-react";

import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, profile_completed_at, email")
    .eq("id", user.id)
    .maybeSingle();

  const isComplete = Boolean(profile?.username && profile?.profile_completed_at);
  if (isComplete) {
    redirect("/dashboard");
  }

  const email = profile?.email ?? user.email ?? "unknown@packet-of-lies.local";

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
              Account setup
            </Badge>
            <UserRoundCheck className="size-5 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">
            Complete your analyst profile
          </CardTitle>
          <CardDescription className="leading-6 text-[var(--text-secondary)]">
            Choose your username, set a strong password, and optionally upload a
            profile image before entering the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompleteProfileForm email={email} defaultUsername={profile?.username} />
        </CardContent>
      </Card>
    </main>
  );
}
