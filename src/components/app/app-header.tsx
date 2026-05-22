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
    <header className="sticky top-0 z-20 border-b border-white/6 bg-[color:rgba(7,8,10,0.86)] backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <SidebarTrigger className="border border-white/10 bg-[color:rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" />

        <div className="hidden items-center gap-3 md:flex">
          <p className="font-mono-ui text-[10px] tracking-[0.24em] text-[var(--text-muted)] uppercase">
            Operations
          </p>
          <span className="h-4 w-px bg-white/12" />
          <p className="text-sm text-[var(--text-secondary)]">
            Case Workspace
          </p>
        </div>

        <div className="relative hidden max-w-lg flex-1 md:flex">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            readOnly
            value=""
            placeholder="Search cases, indicators, or reports..."
            className="h-10 rounded-xl border-white/10 bg-[color:rgba(255,255,255,0.02)] pl-9 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-xl border border-white/10 bg-[color:rgba(255,255,255,0.02)] px-3 py-1.5 md:block">
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
