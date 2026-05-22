import { redirect } from "next/navigation";
import { ClipboardCheck, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { getAuthContext } from "@/lib/auth";
import { isBootstrapRequired } from "@/lib/bootstrap-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <main className="relative min-h-svh px-4 py-10 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 bg-grid-muted opacity-20" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/8 bg-[color:rgba(10,12,12,0.9)]">
          <CardHeader className="space-y-5">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[10px] tracking-[0.18em] text-primary uppercase"
              >
                Packet of Lies
              </Badge>
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <CardTitle className="font-heading max-w-2xl text-3xl leading-tight md:text-4xl">
              Security operations
              <br />
              workspace
            </CardTitle>
            <CardDescription className="max-w-xl text-sm leading-7 text-[var(--text-secondary)] normal-case tracking-normal">
              Case triage, analysis, mitigation, and reporting.
            </CardDescription>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-[color:rgba(255,255,255,0.02)] p-4">
                <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  01 Workflow
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Structured lifecycle: intake, triage, investigation, containment, resolution.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[color:rgba(255,255,255,0.02)] p-4">
                <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  02 Evidence
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Findings, response actions, and timeline logs.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[color:rgba(255,255,255,0.02)] p-4">
                <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  03 Intelligence
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  IOC registry and report generation.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[color:rgba(255,255,255,0.02)] p-4">
                <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  04 Recovery
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  OTP-based password recovery.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/8 bg-[color:rgba(10,12,12,0.94)] panel-shadow">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[10px] tracking-[0.18em] text-primary uppercase"
              >
                Access Portal
              </Badge>
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl">Sign in</CardTitle>
            <CardDescription className="leading-7 text-[var(--text-secondary)] normal-case tracking-normal">
              Sign in or recover account access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 rounded-xl border border-white/8 bg-[color:rgba(255,255,255,0.02)] p-3 text-xs leading-5 text-[var(--text-muted)]">
              <p className="flex items-start gap-2">
                <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                OTP code must match before password update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
