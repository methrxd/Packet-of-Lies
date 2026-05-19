import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { getAuthContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const admin = createAdminClient();
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) === 0) {
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
      <Card className="relative z-10 w-full max-w-md border-white/8 bg-[var(--bg-card)] panel-shadow">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[10px] tracking-[0.18em] text-primary uppercase"
            >
              Packet of Lies
            </Badge>
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">
            Secure workspace sign in
          </CardTitle>
          <CardDescription className="leading-6 text-[var(--text-secondary)]">
            Sign in with your invited account. If this is your first access,
            you&apos;ll be guided through profile setup before entering the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
