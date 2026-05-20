"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="analyst@company.com or analyst_name"
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
          placeholder="Your password"
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
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShieldCheck className="size-4" />
        {isPending ? "Signing in..." : "Sign in to Packet of Lies"}
      </button>
    </form>
  );
}
