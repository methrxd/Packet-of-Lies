"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import type { AppRole } from "@/lib/auth";
import { adminNavigation, primaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ProfileQuickPanel } from "@/components/app/profile-quick-panel";
import { SignOutButton } from "@/components/auth/sign-out-button";

type AppHeaderProps = {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  role: AppRole;
  permissions: string[];
};

function roleLabel(role: AppRole) {
  return role === "admin" ? "Administrator" : "Analyst";
}

export function AppHeader({
  displayName,
  username,
  avatarUrl,
  role,
  permissions,
}: AppHeaderProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  const navItems = useMemo(() => {
    const visiblePrimary = primaryNavigation.filter((item) => {
      if (!item.requiredPermission) {
        return true;
      }
      if (isAdmin) {
        return true;
      }
      return permissions.includes(item.requiredPermission);
    });
    return isAdmin ? [...visiblePrimary, ...adminNavigation] : visiblePrimary;
  }, [isAdmin, permissions]);

  return (
    <header className="pointer-events-none fixed top-6 left-1/2 z-50 w-[min(1240px,calc(100%-2rem))] -translate-x-1/2">
      <div className="pointer-events-auto helix-shell rounded-full border-white/12 px-3 py-2">
        <div className="helix-grid-lines opacity-10" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2 rounded-full px-2 py-1.5">
            <Image src="/pollogo.svg" alt="Packet of Lies" width={28} height={28} className="size-8" />
            <div className="hidden min-w-0 md:block">
              <p className="helix-kicker">Packet of Lies</p>
              <p className="truncate text-xs text-[var(--text-secondary)]">Malware Analysis and Mitigations</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border border-transparent px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors",
                    "hover:border-white/16 hover:text-[var(--text-primary)]",
                    isActive && "border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-white/10 bg-[color:rgba(255,255,255,0.02)] px-3 py-1.5 md:block">
              <p className="text-xs font-medium text-[var(--text-primary)]">{displayName}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{roleLabel(role)}</p>
            </div>
            <ProfileQuickPanel
              displayName={displayName}
              username={username}
              role={role}
              avatarUrl={avatarUrl}
            />
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}

