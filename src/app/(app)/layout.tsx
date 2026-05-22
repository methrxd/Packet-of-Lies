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
        <div className="flex flex-1 flex-col px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
