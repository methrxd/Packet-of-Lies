import { Bell, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";

import type { AppRole } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppHeaderProps = {
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: AppRole;
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppHeader({ email, displayName, avatarUrl, role }: AppHeaderProps) {
  const initials = initialsFromName(displayName);

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
          <Badge
            variant="outline"
            className="hidden border-[var(--accent-border)] bg-[var(--accent-soft)] font-mono-ui text-[11px] tracking-[0.18em] text-primary uppercase md:inline-flex"
          >
            <ShieldCheck className="size-3.5" />
            {role} session
          </Badge>
          <Badge
            variant="outline"
            className="hidden border-white/8 bg-white/2 text-xs text-[var(--text-secondary)] lg:inline-flex"
          >
            {email}
          </Badge>
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[var(--bg-card)]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} avatar`}
                width={40}
                height={40}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-mono-ui text-[11px] tracking-[0.08em] text-[var(--text-secondary)]">
                {initials}
              </span>
            )}
          </div>
          <button className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]">
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </button>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
