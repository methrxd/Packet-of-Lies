import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { getAuthContext } from "@/lib/auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/auth/login");
  }

  if (!auth.isProfileComplete) {
    redirect("/auth/complete-profile");
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        role={auth.role}
        permissions={auth.permissions}
        displayName={auth.displayName}
        avatarUrl={auth.avatarUrl}
      />
      <SidebarInset className="min-h-svh bg-transparent">
        <AppHeader
          role={auth.role}
          displayName={auth.displayName}
          username={auth.username}
          avatarUrl={auth.avatarUrl}
        />
        <div className="mx-auto flex w-full max-w-[1540px] flex-1 flex-col px-4 py-5 md:px-7 md:py-7">
          <div className="helix-shell min-h-[calc(100svh-7.5rem)] p-4 md:p-6">
            <div className="helix-grid-lines" />
            <div className="relative z-10">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
