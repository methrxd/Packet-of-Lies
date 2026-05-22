import Link from "next/link";
import { Lock } from "lucide-react";

import { AsciiAmbient } from "@/components/app/ascii-ambient";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <div className="helix-grid-lines opacity-20" />
      <Card className="relative z-10 w-full max-w-4xl">
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr] lg:p-7">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="w-fit border-[color:rgba(255,184,0,0.32)] bg-[color:rgba(255,184,0,0.1)] font-mono-ui text-[10px] tracking-[0.18em] text-[var(--state-warning)] uppercase"
            >
              Access denied
            </Badge>
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
          <AsciiAmbient title="Access policy check" />
        </CardContent>
      </Card>
    </main>
  );
}

