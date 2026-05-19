"use client";

import { useActionState } from "react";

import {
  type RoleActionState,
  updateUserRoleAction,
} from "@/app/(app)/admin/actions";
import type { AppRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

type RoleUser = {
  id: string;
  email: string;
  displayName: string;
  username: string | null;
  role: AppRole;
  profileCompletedAt: string | null;
  createdAt: string;
};

type RoleManagementPanelProps = {
  users: RoleUser[];
};

const initialState: RoleActionState = {
  status: "idle",
  message: "",
};

export function RoleManagementPanel({ users }: RoleManagementPanelProps) {
  const [state, action, isPending] = useActionState(
    updateUserRoleAction,
    initialState
  );

  return (
    <div className="space-y-4">
      {state.status !== "idle" ? (
        <p
          className={
            state.status === "success"
              ? "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary"
              : "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-3">
        {users.map((user) => (
          <form
            key={user.id}
            action={action}
            className="grid gap-3 rounded-2xl border border-white/6 bg-white/2 p-4 md:grid-cols-[1fr_130px_130px]"
          >
            <input type="hidden" name="userId" value={user.id} />

            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {user.displayName}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {user.email}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                @{user.username ?? "pending-profile"}
              </p>
              <p className="font-mono-ui mt-2 text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2 md:justify-center">
              <Badge
                variant="outline"
                className={
                  user.role === "admin"
                    ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary"
                    : "border-white/10 bg-white/4 text-[var(--text-secondary)]"
                }
              >
                {user.role}
              </Badge>
              <select
                name="role"
                defaultValue={user.role}
                className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
              >
                <option value="analyst">analyst</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--text-muted)]">
                {user.profileCompletedAt ? "Profile completed" : "Profile pending"}
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Update role"}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
