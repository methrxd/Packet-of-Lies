"use client";

import { KeyRound, LifeBuoy, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useActionState, useState } from "react";

import {
  completeAccessRequestJoinAction,
  requestPasswordResetOtpAction,
  resetPasswordWithOtpAction,
  type PasswordResetActionState,
} from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

const initialResetState: PasswordResetActionState = {
  status: "idle",
  message: "",
};

type AuthMode = "signin" | "join" | "reset";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [requestState, requestAction, requestPending] = useActionState(
    requestPasswordResetOtpAction,
    initialResetState
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetPasswordWithOtpAction,
    initialResetState
  );
  const [joinState, joinAction, joinPending] = useActionState(
    completeAccessRequestJoinAction,
    initialResetState
  );
  const [resetIdentifier, setResetIdentifier] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    const supabase = createClient();
    const normalizedIdentifier = identifier.trim();
    const looksLikeEmail = normalizedIdentifier.includes("@");

    let emailToUse = normalizedIdentifier.toLowerCase();

    if (!looksLikeEmail) {
      const { data: resolvedEmail, error: resolveError } = await supabase.rpc(
        "resolve_login_email",
        {
          p_identifier: normalizedIdentifier,
        }
      );

      if (resolveError) {
        setErrorMessage(
          "Username sign-in is unavailable right now. Please sign in with your email."
        );
        setIsPending(false);
        return;
      }

      if (!resolvedEmail) {
        setErrorMessage("Invalid credentials");
        setIsPending(false);
        return;
      }

      emailToUse = String(resolvedEmail).toLowerCase();
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsPending(false);
      return;
    }

    const nextPath = searchParams.get("next");
    const destination =
      nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/8 bg-white/2 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`h-9 rounded-lg text-sm font-medium transition-colors ${
            mode === "signin"
              ? "bg-[var(--accent-soft)] text-primary"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`h-9 rounded-lg text-sm font-medium transition-colors ${
            mode === "join"
              ? "bg-[var(--accent-soft)] text-primary"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Join with code
        </button>
        <button
          type="button"
          onClick={() => setMode("reset")}
          className={`h-9 rounded-lg text-sm font-medium transition-colors ${
            mode === "reset"
              ? "bg-[var(--accent-soft)] text-primary"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Reset password
        </button>
      </div>

      {mode === "signin" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isPending ? (
            <div className="pending-state">
              <span className="pending-spinner" />
              <span>Signing in, please wait while your workspace opens.</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="identifier"
              className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
            >
              Email or username
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="name@company.com or username"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="premium-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <span className="pending-spinner" /> : <ShieldCheck className="size-4" />}
            {isPending ? "Signing in..." : "Sign in to case workspace"}
          </button>
        </form>
      ) : mode === "join" ? (
        <form action={joinAction} className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            For approved access requests. Use the email and one-time joining code sent by admin.
          </p>
          <div className="space-y-2">
            <label
              htmlFor="joinEmail"
              className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
            >
              Approved email
            </label>
            <input
              id="joinEmail"
              name="email"
              type="email"
              required
              defaultValue={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="name@organization.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="joinCode"
              className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
            >
              One-time joining code
            </label>
            <input
              id="joinCode"
              name="joinCode"
              required
              className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm tracking-[0.16em] text-[var(--text-primary)] uppercase outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="ABCDE-12345"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="joinUsername"
              className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
            >
              Username
            </label>
            <input
              id="joinUsername"
              name="username"
              required
              minLength={3}
              maxLength={32}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              placeholder="Choose a username"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="joinPassword"
                className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
              >
                Password
              </label>
              <input
                id="joinPassword"
                name="password"
                type="password"
                required
                minLength={12}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Minimum 12 characters"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="joinConfirmPassword"
                className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
              >
                Confirm password
              </label>
              <input
                id="joinConfirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={12}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {joinState.status !== "idle" ? (
            <p
              className={
                joinState.status === "success"
                  ? "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary"
                  : "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]"
              }
            >
              {joinState.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={joinPending}
            className="premium-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joinPending ? <span className="pending-spinner" /> : null}
            {joinPending ? "Creating account..." : "Create account with join code"}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <form
            action={requestAction}
            onSubmit={() => setResetIdentifier(identifier.trim())}
            className="space-y-4"
          >
            <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <LifeBuoy className="size-4 text-primary" />
              Step 1: Request OTP
            </h3>
            <div className="space-y-2">
              <label
                htmlFor="reset-identifier-request"
                className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
              >
                Email or username
              </label>
              <input
                id="reset-identifier-request"
                name="identifier"
                required
                defaultValue={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setResetIdentifier(event.target.value);
                }}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Account email or username"
              />
            </div>
            {requestState.status !== "idle" ? (
              <p
                className={
                  requestState.status === "success"
                    ? "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary"
                    : "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]"
                }
              >
                {requestState.message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={requestPending}
              className="premium-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/3 font-medium text-[var(--text-primary)] transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {requestPending ? <span className="pending-spinner" /> : null}
              {requestPending ? "Sending code..." : "Send OTP to registered email"}
            </button>
          </form>

          <form action={resetAction} className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <KeyRound className="size-4 text-primary" />
              Step 2: Verify OTP and set new password
            </h3>
            <input type="hidden" name="identifier" value={resetIdentifier} />
            <div className="space-y-2">
              <label
                htmlFor="reset-identifier"
                className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
              >
                Confirm email or username
              </label>
              <input
                id="reset-identifier"
                name="identifier-visible"
                required
                value={resetIdentifier}
                onChange={(event) => setResetIdentifier(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Same account used in step 1"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="otpCode"
                className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
              >
                6-digit OTP code
              </label>
              <input
                id="otpCode"
                name="otpCode"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm tracking-[0.26em] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="123456"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
                >
                  New password
                </label>
                <input
                  id="newPassword"
                  name="password"
                  type="password"
                  required
                  minLength={12}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  placeholder="Minimum 12 characters"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmNewPassword"
                  className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
                >
                  Confirm password
                </label>
                <input
                  id="confirmNewPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={12}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            {resetState.status !== "idle" ? (
              <p
                className={
                  resetState.status === "success"
                    ? "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary"
                    : "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]"
                }
              >
                {resetState.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={resetPending}
              className="premium-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetPending ? <span className="pending-spinner" /> : null}
              {resetPending ? "Resetting password..." : "Verify OTP and reset password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
