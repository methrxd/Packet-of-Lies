import Link from "next/link";
import { Lock } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <div className="helix-grid-lines opacity-20" />
      <Card className="relative z-10 w-full max-w-4xl">
        <CardContent className="p-5 lg:p-7">
          <div className="space-y-4">
            <p className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--state-warning)] uppercase">
              Access denied
            </p>
            <CardHeader className="px-0">
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Lock className="size-5 text-[var(--state-warning)]" />
                Permission required
              </CardTitle>
            </CardHeader>
            <p className="helix-copy">
              Your account is signed in but does not have permission for this route.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--accent-primary-hover)]"
              >
                Back to dashboard
              </Link>
              <SignOutButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
