"use client";

import { ShieldCheck } from "lucide-react";
import { useActionState } from "react";

import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/app/(app)/profile/actions";

const initialState: UpdateProfileActionState = {
  status: "idle",
  message: "",
};

type ProfileSettingsFormProps = {
  email: string;
  defaultUsername: string;
  defaultDisplayName: string;
};

export function ProfileSettingsForm({
  email,
  defaultUsername,
  defaultDisplayName,
}: ProfileSettingsFormProps) {
  const [state, action, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="rounded-xl border border-white/8 bg-white/2 px-3 py-2 text-sm text-[var(--text-secondary)]">
        Signed in as <span className="text-[var(--text-primary)]">{email}</span>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="displayName"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          minLength={1}
          maxLength={60}
          defaultValue={defaultDisplayName}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={32}
          defaultValue={defaultUsername}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="analyst_name"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="avatar"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Profile picture (JPG/PNG, max 2MB)
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent-soft)] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-primary"
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
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShieldCheck className="size-4" />
        {isPending ? "Saving profile..." : "Save profile"}
      </button>
    </form>
  );
}
