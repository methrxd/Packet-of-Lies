import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { AsciiAmbient } from "@/components/app/ascii-ambient";
import { BootstrapForm } from "@/components/auth/bootstrap-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isBootstrapRequired } from "@/lib/bootstrap-state";

export const dynamic = "force-dynamic";

export default async function BootstrapPage() {
  let bootstrapRequired = true;
  try {
    bootstrapRequired = await isBootstrapRequired();
  } catch {
    bootstrapRequired = true;
  }

  if (!bootstrapRequired) {
    redirect("/auth/login");
  }

  return (
    <main className="relative min-h-svh px-4 py-10 md:px-8 md:py-12">
      <div className="helix-grid-lines opacity-20" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="helix-shell p-6 md:p-8">
          <div className="helix-grid-lines opacity-20" />
          <div className="relative z-10 space-y-5">
            <Badge variant="outline" className="helix-chip">
              Bootstrap
            </Badge>
            <h1 className="helix-headline">Initialize the first administrator</h1>
            <p className="helix-copy">
              One-time setup to create the initial admin identity and unlock workspace access.
            </p>
            <AsciiAmbient title="Bootstrap stream" />
          </div>
        </section>

        <Card className="panel-shadow">
          <CardHeader>
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="outline" className="helix-chip">
                Account setup
              </Badge>
              <LockKeyhole className="size-5 text-primary" />
            </div>
            <CardTitle>Create administrator account</CardTitle>
            <CardDescription>Credentials and identity for the first admin user.</CardDescription>
          </CardHeader>
          <CardContent>
            <BootstrapForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

