import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";

import { AsciiAmbient } from "@/components/app/ascii-ambient";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
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
      <Image
        src="/helix/hero-poster.webp"
        alt="Operations background"
        fill
        priority
        className="object-cover object-center opacity-24"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,8,0.75),rgba(7,14,11,0.94))]" />
      <div className="helix-grid-lines opacity-20" />
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pb-10 pt-8 md:px-8 md:pb-12 md:pt-12">
        <header className="mx-auto w-full max-w-[980px]">
          <div className="helix-shell rounded-full border-white/14 px-4 py-3">
            <div className="helix-grid-lines opacity-10" />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Image src="/helix/helix-logo.svg" alt="Packet of Lies" width={30} height={30} className="size-8" />
                <div>
                  <p className="helix-kicker">Packet of Lies</p>
                  <p className="text-xs text-[var(--text-secondary)]">Secure case workspace</p>
                </div>
              </div>
              <Badge variant="outline" className="helix-chip">
                University project
              </Badge>
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
                Built for academic incident-response simulation: detection, case tracking, analysis, response, and reporting.
              </p>
              <AsciiAmbient title="Signal monitor" />
            </div>
          </section>

          <Card className="panel-shadow">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="helix-chip">
                Secure access
              </Badge>
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Use your assigned account to access the workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
