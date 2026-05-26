import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import { MatrixBackdrop } from "@/components/app/matrix-backdrop";
import { RequestAccessForm } from "@/components/public/request-access-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";
import { isBootstrapRequired } from "@/lib/bootstrap-state";

export default async function HomePage() {
  let bootstrapRequired = true;
  try {
    bootstrapRequired = await isBootstrapRequired();
  } catch {
    bootstrapRequired = true;
  }

  if (bootstrapRequired) {
    redirect("/auth/bootstrap");
  }

  const auth = await getAuthContext();
  if (auth) {
    redirect(auth.isProfileComplete ? "/dashboard" : "/auth/complete-profile");
  }

  return (
    <main className="relative min-h-svh overflow-hidden">
      <MatrixBackdrop intensity="full" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,5,3,0.24),rgba(1,4,3,0.78))]" />
      <div className="helix-grid-lines opacity-20" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pb-12 pt-10 md:px-8">
        <header className="helix-shell rounded-full border-white/14 px-4 py-3">
          <div className="helix-grid-lines opacity-10" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image src="/pollogo.svg" alt="Packet of Lies" width={30} height={30} className="size-8" />
              <div>
                <p className="helix-kicker">Packet of Lies</p>
                <p className="text-xs text-[var(--text-secondary)]">Malware Analysis and Mitigations</p>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)]"
            >
              Sign in
            </Link>
          </div>
        </header>

        <div className="mt-8 grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="helix-shell p-6 md:p-8">
            <div className="helix-grid-lines opacity-20" />
            <div className="relative z-10 space-y-5">
              <h1 className="helix-headline">Evidence-first incident response platform</h1>
              <p className="helix-copy max-w-2xl">
                Detect, triage, analyze, contain, and document malware incidents with a structured case workflow.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
                <span className="rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  Case lifecycle controls
                </span>
                <span className="rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  Evidence and mitigations
                </span>
                <span className="rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  Live timeline activity
                </span>
              </div>
            </div>
          </section>

          <Card className="panel-shadow">
            <CardHeader>
              <CardTitle>Request access</CardTitle>
              <CardDescription>
                Submit your details for admin approval. Once approved, you will receive a one-time joining code by email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RequestAccessForm />
              <div className="rounded-xl border border-white/8 bg-white/2 p-3 text-xs text-[var(--text-muted)]">
                Already invited or already have a joining code?{" "}
                <Link href="/auth/login" className="text-primary underline underline-offset-4">
                  Open sign in
                </Link>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

