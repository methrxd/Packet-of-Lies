"use client";

import { Bell, Search } from "lucide-react";

import type { AppRole } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileQuickPanel } from "@/components/app/profile-quick-panel";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppHeaderProps = {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  role: AppRole;
};

function roleLabel(role: AppRole) {
  return role === "admin" ? "Admin" : "Analyst";
}

export function AppHeader({
  displayName,
  username,
  avatarUrl,
  role,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/6 bg-[color:rgba(8,8,8,0.86)]/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <SidebarTrigger className="border border-white/6 bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" />

        <div className="relative hidden max-w-xl flex-1 md:flex">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            readOnly
            value=""
            placeholder="Search telemetry, cases, or indicators..."
            className="h-11 rounded-xl border-white/8 bg-white/3 pl-9 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-xl border border-white/8 bg-white/2 px-3 py-1.5 md:block">
            <p className="text-sm font-medium text-[var(--text-primary)]">{displayName}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{roleLabel(role)}</p>
          </div>
          <button className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]">
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </button>
          <ProfileQuickPanel
            displayName={displayName}
            username={username}
            role={role}
            avatarUrl={avatarUrl}
          />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
