import Link from "next/link";
import { Lock } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-muted opacity-25" />
      <Card className="relative z-10 w-full max-w-lg border-white/8 bg-[var(--bg-card)] panel-shadow">
        <CardHeader className="space-y-4">
          <Badge
            variant="outline"
            className="w-fit border-[color:rgba(255,184,0,0.22)] bg-[color:rgba(255,184,0,0.08)] font-mono-ui text-[10px] tracking-[0.18em] text-[var(--state-warning)] uppercase"
          >
            Access denied
          </Badge>
          <CardTitle className="font-heading flex items-center gap-2 text-2xl">
            <Lock className="size-5 text-[var(--state-warning)]" />
            Admin role required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-7 text-[var(--text-secondary)]">
          <p>
            Your account is signed in, but it does not currently have permission
            to open this route.
          </p>
          <p>
            Ask a platform admin to update your role in the `profiles` table if
            you need admin access.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--accent-primary-hover)]"
            >
              Go to dashboard
            </Link>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
