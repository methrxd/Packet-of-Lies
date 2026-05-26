import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { MatrixBackdrop } from "@/components/app/matrix-backdrop";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";
import { isBootstrapRequired } from "@/lib/bootstrap-state";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
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
    if (auth.isProfileComplete) {
      redirect("/dashboard");
    }
    redirect("/auth/complete-profile");
  }

  return (
    <main className="relative min-h-svh overflow-hidden">
      <MatrixBackdrop intensity="full" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,5,3,0.22),rgba(1,4,3,0.8))]" />
      <div className="helix-grid-lines opacity-20" />
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pb-10 pt-8 md:px-8 md:pb-12 md:pt-12">
        <header className="mx-auto w-full max-w-[980px]">
          <div className="helix-shell rounded-full border-white/14 px-4 py-3">
            <div className="helix-grid-lines opacity-10" />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Image src="/pollogo.svg" alt="Packet of Lies" width={30} height={30} className="size-8" />
                <div>
                  <p className="helix-kicker">Packet of Lies</p>
                  <p className="text-xs text-[var(--text-secondary)]">Secure case workspace</p>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex h-9 items-center justify-center rounded-full border border-white/12 bg-white/4 px-3 text-xs text-[var(--text-secondary)] transition-colors hover:bg-white/8 hover:text-[var(--text-primary)]"
              >
                Back to home
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-8 grid flex-1 items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="helix-shell p-6 md:p-8">
            <div className="helix-grid-lines opacity-20" />
            <div className="relative z-10 space-y-5">
              <h1 className="helix-headline">
                Malware analysis
                <br />
                and mitigations
              </h1>
              <p className="helix-copy max-w-2xl">
                Sign in to continue to the investigation workspace, or request access from the landing page.
              </p>
            </div>
          </section>

          <Card className="panel-shadow">
          <CardHeader className="space-y-4">
            <p className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
              Workspace access
            </p>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Use your assigned account. Invited users can use the invite email, and approved requests can use a one-time joining code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Need access?{" "}
              <Link href="/" className="text-primary underline underline-offset-4">
                Submit a request
              </Link>
            </p>
          </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
