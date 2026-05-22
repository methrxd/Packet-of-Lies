"use client";

import { useActionState } from "react";

import {
  submitAccessRequestAction,
  type RequestAccessActionState,
} from "@/app/public-actions";

const initialState: RequestAccessActionState = {
  status: "idle",
  message: "",
};

export function RequestAccessForm() {
  const [state, action, isPending] = useActionState(
    submitAccessRequestAction,
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            maxLength={80}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={160}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            placeholder="name@organization.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="organization"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Organization (optional)
        </label>
        <input
          id="organization"
          name="organization"
          maxLength={120}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="University / Department"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Why do you need access? (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={600}
          className="w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="Brief context for the review team."
        />
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
        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Submitting request..." : "Request access"}
      </button>
    </form>
  );
}

