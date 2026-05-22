"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";

import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import type { AppRole } from "@/lib/auth";

type ProfileQuickPanelProps = {
  displayName: string;
  username: string | null;
  role: AppRole;
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

function roleLabel(role: AppRole) {
  return role === "admin" ? "Admin" : "Analyst";
}

export function ProfileQuickPanel({
  displayName,
  username,
  role,
  avatarUrl,
}: ProfileQuickPanelProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!open) {
        return;
      }
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-[var(--bg-card)] px-2.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        aria-label="Open profile panel"
      >
        <div className="flex size-7 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[var(--bg-card)]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${displayName} avatar`}
              width={28}
              height={28}
              className="size-full object-cover"
            />
          ) : (
            <span className="font-mono-ui text-[10px] tracking-[0.08em] text-[var(--text-secondary)]">
              {initials}
            </span>
          )}
        </div>
        <Settings className="size-4" />
      </button>

      {open ? (
        <div className="absolute top-12 right-0 z-50 w-[min(92vw,400px)] rounded-2xl border border-white/10 bg-[var(--bg-shell)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-4 rounded-xl border border-white/8 bg-white/2 px-3 py-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">{displayName}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{roleLabel(role)}</p>
          </div>
          <ProfileSettingsForm
            defaultDisplayName={displayName}
            defaultUsername={username ?? displayName}
            compact
          />
        </div>
      ) : null}
    </div>
  );
}
