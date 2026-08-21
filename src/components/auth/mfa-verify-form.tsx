"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type MfaVerifyFormProps = {
  nextPath: string;
};

export function MfaVerifyForm({ nextPath }: MfaVerifyFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
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
    const factors = await supabase.auth.mfa.listFactors();

    if (factors.error) {
      setErrorMessage(factors.error.message);
      setIsPending(false);
      return;
    }

    const factor = factors.data.totp?.find(
      (totpFactor) => totpFactor.status === "verified"
    );

    if (!factor) {
      setErrorMessage("No verified authenticator factor is available for this account.");
      setIsPending(false);
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challenge.error) {
      setErrorMessage(challenge.error.message);
      setIsPending(false);
      return;
    }

    const verification = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.data.id,
      code: code.trim(),
    });

    if (verification.error) {
      setErrorMessage(verification.error.message);
      setIsPending(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 text-sm leading-6 text-primary">
        Enter the current 6-digit code from your authenticator app to unlock the
        workspace for this session.
      </div>

      <div className="space-y-2">
        <label
          htmlFor="mfa-code"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Authenticator code
        </label>
        <input
          id="mfa-code"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="one-time-code"
          className="h-12 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-center font-mono-ui text-lg tracking-[0.4em] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="000000"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || code.length !== 6}
        className="premium-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {isPending ? "Verifying MFA..." : "Verify and continue"}
      </button>
    </form>
  );
}
