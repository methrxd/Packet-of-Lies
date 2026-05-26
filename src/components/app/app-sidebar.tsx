"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProfileAvatar } from "@/components/app/profile-avatar";
import type { AppRole } from "@/lib/auth";
import { adminNavigation, primaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  role: AppRole;
  permissions: string[];
  displayName: string;
  avatarUrl: string | null;
};

export function AppSidebar({
  role,
  permissions,
  displayName,
  avatarUrl,
}: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  const visiblePrimaryNavigation = primaryNavigation.filter((item) => {
    if (!item.requiredPermission) {
      return true;
    }
    if (isAdmin) {
      return true;
    }
    return permissions.includes(item.requiredPermission);
  });

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border/70 bg-sidebar">
      <SidebarHeader className="gap-4 px-3 py-4">
        <Link
          href="/dashboard"
          className="helix-shell rounded-2xl border-white/12 px-3 py-3 transition-colors hover:border-[var(--accent-border)]"
        >
          <div className="helix-grid-lines opacity-20" />
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div>
              <p className="helix-kicker">Packet of Lies</p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                Malware Investigation Lab
              </p>
            </div>
            <Image src="/pollogo.svg" alt="" width={28} height={28} className="size-7" />
          </div>
        </Link>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[color:rgba(255,255,255,0.02)] px-2.5 py-2">
          <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} className="size-9" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{displayName}</p>
            <p className="helix-rail-label mt-1">{isAdmin ? "Administrator" : "Analyst"}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="helix-kicker">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visiblePrimaryNavigation.map((item, index) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-11 rounded-xl px-3 text-sidebar-foreground/78 transition-colors",
                        "hover:bg-[color:rgba(255,255,255,0.06)] hover:text-sidebar-foreground",
                        isActive &&
                          "bg-[color:rgba(2,249,109,0.1)] text-sidebar-foreground shadow-[inset_0_0_0_1px_rgba(2,249,109,0.22)]"
                      )}
                    >
                      <span className="font-mono-ui w-5 text-[10px] text-[var(--text-muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel className="helix-kicker">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "h-10 rounded-xl px-3 text-sidebar-foreground/72 transition-colors",
                          "hover:bg-[color:rgba(255,255,255,0.06)] hover:text-sidebar-foreground",
                          isActive &&
                            "bg-[color:rgba(95,156,255,0.1)] text-sidebar-foreground shadow-[inset_0_0_0_1px_rgba(95,156,255,0.24)]"
                        )}
                      >
                        <span className="font-mono-ui w-5 text-[10px] text-[var(--text-muted)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

