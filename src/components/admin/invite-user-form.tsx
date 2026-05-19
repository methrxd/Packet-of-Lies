"use client";

import { useActionState } from "react";

import { inviteUserAction, type InviteActionState } from "@/app/(app)/admin/actions";

const initialState: InviteActionState = {
  status: "idle",
  message: "",
};

export function InviteUserForm() {
  const [state, action, isPending] = useActionState(inviteUserAction, initialState);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-white/6 bg-white/2 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_140px_140px]">
        <input
          name="email"
          type="email"
          required
          placeholder="invitee@company.com"
          className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
        />

        <select
          name="role"
          defaultValue="analyst"
          className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
        >
          <option value="analyst">analyst</option>
          <option value="admin">admin</option>
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send invite"}
        </button>
      </div>

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
    </form>
  );
}
