"use client";

import { useActionState } from "react";

import { createCaseAction, type CaseActionState } from "@/app/(app)/cases/actions";

const initialState: CaseActionState = {
  status: "idle",
  message: "",
};

export function CreateCaseForm() {
  const [state, action, isPending] = useActionState(
    createCaseAction,
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Case title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={8}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="Suspicious binary observed on endpoint..."
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="summary"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Initial summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="What was detected, where, and why it matters."
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="severity"
            className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            defaultValue="medium"
            className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priority"
            className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="p2"
            className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            <option value="p0">p0</option>
            <option value="p1">p1</option>
            <option value="p2">p2</option>
            <option value="p3">p3</option>
          </select>
        </div>
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

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating case..." : "Create case"}
      </button>
    </form>
  );
}
