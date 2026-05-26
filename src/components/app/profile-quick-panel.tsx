"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Settings, X } from "lucide-react";

import { ProfileAvatar } from "@/components/app/profile-avatar";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import type { AppRole } from "@/lib/auth";

type ProfileQuickPanelProps = {
  displayName: string;
  username: string | null;
  role: AppRole;
  avatarUrl: string | null;
};

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
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const width = Math.min(400, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.right - width),
      window.innerWidth - width - 12
    );
    const top = Math.min(rect.bottom + 12, window.innerHeight - 12);

    setPanelStyle({
      left,
      top,
      width,
      maxHeight: `calc(100dvh - ${top + 12}px)`,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!open) {
        return;
      }
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-[var(--bg-card)] px-2.5 text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        aria-label="Open profile panel"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} className="size-7 rounded-lg" />
        <Settings className="size-4" />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Profile settings"
              style={panelStyle}
              className="fixed z-[100] overflow-y-auto rounded-2xl border border-[var(--accent-border)] bg-[color:rgba(5,13,8,0.98)] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.65),0_0_0_1px_rgba(2,249,109,0.08)] backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
            >
              <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/2 px-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} className="size-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{displayName}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{roleLabel(role)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/3 text-[var(--text-secondary)] transition-colors hover:bg-white/8 hover:text-[var(--text-primary)]"
                  aria-label="Close profile panel"
                >
                  <X className="size-4" />
                </button>
              </div>
              <ProfileSettingsForm
                defaultDisplayName={displayName}
                defaultUsername={username ?? displayName}
                compact
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
