import { redirect } from "next/navigation";
import { UserRoundCheck } from "lucide-react";

import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    <main className="relative min-h-svh px-4 py-10 md:px-8 md:py-12">
      <div className="helix-grid-lines opacity-20" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="helix-shell p-6 md:p-8">
          <div className="helix-grid-lines opacity-20" />
          <div className="relative z-10 space-y-5">
            <p className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
              Profile completion
            </p>
            <h1 className="helix-headline">Finalize your analyst profile</h1>
            <p className="helix-copy">
              Set your username and credentials before entering the investigation workspace.
            </p>
          </div>
        </section>

        <Card className="panel-shadow">
          <CardHeader>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Complete account
              </p>
              <UserRoundCheck className="size-5 text-primary" />
            </div>
            <CardTitle>Set profile details</CardTitle>
            <CardDescription>This step is required before app access.</CardDescription>
          </CardHeader>
          <CardContent>
            <CompleteProfileForm email={email} defaultUsername={profile?.username} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
