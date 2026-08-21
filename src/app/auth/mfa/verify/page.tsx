import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { MatrixBackdrop } from "@/components/app/matrix-backdrop";
import { MfaVerifyForm } from "@/components/auth/mfa-verify-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMfaStatus } from "@/lib/mfa";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MfaVerifyPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function MfaVerifyPage({ searchParams }: MfaVerifyPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, profile_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.username || !profile.profile_completed_at) {
    redirect("/auth/complete-profile");
  }

  const mfa = await getMfaStatus(supabase);

  if (mfa.needsEnrollment) {
    redirect("/auth/mfa/setup");
  }

  if (mfa.isVerified) {
    redirect(nextPath);
  }

  return (
    <main className="relative min-h-svh overflow-hidden px-4 py-10 md:px-8 md:py-12">
      <MatrixBackdrop intensity="subtle" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,5,3,0.2),rgba(1,4,3,0.84))]" />
      <div className="helix-grid-lines opacity-20" />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="helix-shell p-6 md:p-8">
          <div className="helix-grid-lines opacity-20" />
          <div className="relative z-10 space-y-5">
            <p className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
              Session verification
            </p>
            <h1 className="helix-headline">Verify the second factor.</h1>
            <p className="helix-copy">
              Your password has been accepted. The workspace stays locked until
              the authenticator code confirms it is really you.
            </p>
          </div>
        </section>

        <Card className="panel-shadow">
          <CardHeader>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                MFA challenge
              </p>
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <CardTitle>Enter authenticator code</CardTitle>
            <CardDescription>
              Use the 6-digit code currently shown in your TOTP authenticator app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MfaVerifyForm nextPath={nextPath} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
