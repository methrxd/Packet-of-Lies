import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

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
    <main className="relative min-h-svh px-4 py-10 md:px-8 md:py-12">
      <div className="helix-grid-lines opacity-20" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="helix-shell p-6 md:p-8">
          <div className="helix-grid-lines opacity-20" />
          <div className="relative z-10 space-y-5">
            <Badge variant="outline" className="helix-chip">
              Packet of Lies
            </Badge>
            <h1 className="helix-headline">
              Malware Analysis
              <br />
              and Mitigations
            </h1>
            <p className="helix-copy max-w-2xl">
              Evidence-led incident workflow for detection, triage, response, and reporting.
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
    </main>
  );
}

