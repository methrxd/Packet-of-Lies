import { UserRound } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const auth = await getAuthContext();

  if (!auth) {
    return null;
  }

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Account settings"
        description="Update your display name, username, and avatar."
      />

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Profile details</CardTitle>
            <UserRound className="size-5 text-primary" />
          </div>
          <CardDescription>JPG and PNG uploads only, maximum size 2 MB.</CardDescription>
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

