"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Command, Sparkles } from "lucide-react";

import type { AppRole } from "@/lib/auth";
import { adminNavigation, primaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  username: string | null;
  avatarUrl: string | null;
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppSidebar({
  role,
  permissions,
  displayName,
  username,
  avatarUrl,
}: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";
  const initials = initialsFromName(displayName);

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
    <Sidebar
      collapsible="icon"
      className="border-sidebar-border/70 bg-sidebar"
    >
      <SidebarHeader className="gap-4 px-3 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-2.5 py-2.5 transition-colors hover:bg-white/4"
        >
          <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary">
            <Command className="size-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-heading text-sm font-semibold tracking-[0.12em] text-sidebar-foreground uppercase">
              Packet of Lies
            </p>
            <p className="font-mono-ui mt-1 text-[11px] tracking-[0.18em] text-sidebar-foreground/55 uppercase">
              {isAdmin ? "Admin workspace" : "Analyst workspace"}
            </p>
          </div>
        </Link>

        <Button
          variant="outline"
          className="h-11 justify-start gap-2 border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[11px] tracking-[0.16em] text-primary uppercase hover:bg-[color:rgba(2,249,109,0.12)] hover:text-primary"
        >
          <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border border-[var(--accent-border)] bg-[var(--bg-card)]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} avatar`}
                width={24}
                height={24}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-[9px] text-[var(--text-secondary)]">{initials}</span>
            )}
          </div>
          <Sparkles className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            {username ?? displayName}
          </span>
        </Button>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono-ui text-[10px] tracking-[0.2em] uppercase">
            Core surfaces
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visiblePrimaryNavigation.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-11 rounded-xl px-3 font-medium text-sidebar-foreground/76",
                        isActive &&
                          "bg-[color:rgba(2,249,109,0.08)] text-sidebar-foreground shadow-[inset_0_0_0_1px_rgba(2,249,109,0.16)]"
                      )}
                    >
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
            <SidebarGroupLabel className="font-mono-ui text-[10px] tracking-[0.2em] uppercase">
              Controls
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "h-10 rounded-xl px-3 text-sidebar-foreground/70",
                          isActive &&
                            "bg-[color:rgba(95,156,255,0.10)] text-sidebar-foreground shadow-[inset_0_0_0_1px_rgba(95,156,255,0.22)]"
                        )}
                      >
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
