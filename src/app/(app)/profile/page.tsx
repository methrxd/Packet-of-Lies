import { UserRound } from "lucide-react";

import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const auth = await getAuthContext();

  if (!auth) {
    return null;
  }

  return (
    <main className="space-y-6">
      <section className="space-y-3">
        <Badge
          variant="outline"
          className="border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[10px] tracking-[0.18em] text-primary uppercase"
        >
          Profile
        </Badge>
        <h1 className="font-heading text-4xl tracking-tight text-[var(--text-primary)]">
          Account settings
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
          Update your display name, username, and profile picture.
        </p>
      </section>

      <Card className="border-white/8 bg-[var(--bg-card)] panel-shadow">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-2xl">
              Profile details
            </CardTitle>
            <UserRound className="size-5 text-primary" />
          </div>
          <CardDescription className="leading-6 text-[var(--text-secondary)]">
            JPG and PNG uploads only, up to 2 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm
            defaultUsername={auth.username ?? auth.displayName}
            defaultDisplayName={auth.displayName}
          />
        </CardContent>
      </Card>
    </main>
  );
}
