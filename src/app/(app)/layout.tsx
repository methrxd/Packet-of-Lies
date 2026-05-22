import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app/app-header";
import { getAuthContext } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/auth/login");
  }

  if (!auth.isProfileComplete) {
    redirect("/auth/complete-profile");
  }

  return (
    <div className="min-h-svh bg-transparent">
      <AppHeader
        role={auth.role}
        permissions={auth.permissions}
        displayName={auth.displayName}
        username={auth.username}
        avatarUrl={auth.avatarUrl}
      />
      <div className="mx-auto w-full max-w-[1540px] px-4 pb-8 pt-28 md:px-7 md:pt-32">
        <div className="helix-shell min-h-[calc(100svh-9rem)] p-4 md:p-6">
          <div className="helix-grid-lines" />
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
