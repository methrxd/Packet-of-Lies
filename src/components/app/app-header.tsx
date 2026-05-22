"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";

import type { AppRole } from "@/lib/auth";
import { ProfileQuickPanel } from "@/components/app/profile-quick-panel";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppHeaderProps = {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  role: AppRole;
};

function roleLabel(role: AppRole) {
  return role === "admin" ? "Administrator" : "Analyst";
}

export function AppHeader({
  displayName,
  username,
  avatarUrl,
  role,
}: AppHeaderProps) {
  const [clock, setClock] = useState<string>("");

  useEffect(() => {
    const update = () => {
      setClock(
        new Intl.DateTimeFormat(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[color:rgba(8,9,11,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1540px] items-center gap-3 px-4 md:px-7">
        <SidebarTrigger className="border border-white/12 bg-[color:rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:bg-[color:rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]" />

        <div className="hidden items-center gap-3 lg:flex">
          <span className="helix-chip">Investigation suite</span>
          <span className="helix-rail-label">{clock || "syncing time..."}</span>
        </div>

        <div className="relative ml-1 hidden max-w-xl flex-1 md:flex">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            readOnly
            value=""
            placeholder="Search cases, indicators, reports"
            className="h-10 rounded-full border-white/10 bg-[color:rgba(255,255,255,0.02)] pl-9 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-2xl border border-white/10 bg-[color:rgba(255,255,255,0.02)] px-3 py-1.5 md:block">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{roleLabel(role)}</p>
          </div>
          <button className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[color:rgba(255,255,255,0.03)] text-[var(--text-secondary)] transition-colors hover:bg-[color:rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]">
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

