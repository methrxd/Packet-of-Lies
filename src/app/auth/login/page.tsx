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
    <main className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-muted opacity-25" />
      <Card className="relative z-10 w-full max-w-2xl border-white/8 bg-[var(--bg-card)] panel-shadow">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[10px] tracking-[0.18em] text-primary uppercase"
            >
              Packet of Lies - Login
            </Badge>
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">
            Investigator access
          </CardTitle>
          <CardDescription className="leading-6 text-[var(--text-secondary)]">
            This portal is for analysts and admins working on malware investigation cases.
            Use your assigned account to continue, or reset your password using OTP verification.
          </CardDescription>
          <div className="grid gap-2 rounded-xl border border-white/8 bg-white/2 p-3 text-sm text-[var(--text-secondary)] md:grid-cols-2">
            <p className="flex items-start gap-2">
              <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              University demo environment: role-based access and full audit trail are active.
            </p>
            <p className="flex items-start gap-2">
              <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              Password resets require a one-time OTP sent to the registered email.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
