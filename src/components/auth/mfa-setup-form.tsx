"use client";

import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type SetupState = "loading" | "ready" | "verified";

function toQrDataUrl(svg: string) {
  if (svg.startsWith("data:")) {
    return svg;
  }

  return `data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`;
}

export function MfaSetupForm() {
  const router = useRouter();
  const [state, setState] = useState<SetupState>("loading");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function startEnrollment() {
      const supabase = createClient();

      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) {
        throw factors.error;
      }

      const unverifiedTotpFactors =
        factors.data.all?.filter(
          (factor) =>
            factor.factor_type === "totp" && factor.status === "unverified"
        ) ?? [];

      await Promise.all(
        unverifiedTotpFactors.map((factor) =>
          supabase.auth.mfa.unenroll({ factorId: factor.id })
        )
      );

      const enrollment = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Packet of Lies authenticator",
      });

      if (enrollment.error) {
        throw enrollment.error;
      }

      if (!isMounted) {
        return;
      }

      setFactorId(enrollment.data.id);
      setQrCode(toQrDataUrl(enrollment.data.totp.qr_code));
      setSecret(enrollment.data.totp.secret);
      setState("ready");
    }

    startEnrollment().catch((error: unknown) => {
      if (!isMounted) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not start authenticator setup."
      );
      setState("ready");
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!factorId || isVerifying) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    const supabase = createClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });

    if (challenge.error) {
      setErrorMessage(challenge.error.message);
      setIsVerifying(false);
      return;
    }

    const verification = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    });

    if (verification.error) {
      setErrorMessage(verification.error.message);
      setIsVerifying(false);
      return;
    }

    setState("verified");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 text-sm leading-6 text-primary">
        Authenticator MFA is required before entering the case workspace. Scan the QR
        code in Google Authenticator, Microsoft Authenticator, 1Password, or any TOTP app.
      </div>

      {state === "loading" ? (
        <div className="pending-state">
          <span className="pending-spinner" />
          <span>Preparing your secure MFA enrollment...</span>
        </div>
      ) : null}

      {qrCode ? (
        <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
          <div className="rounded-3xl border border-white/10 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="Authenticator QR code" className="size-48" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <KeyRound className="size-4 text-primary" />
              Manual setup key
            </div>
            <input
              value={secret}
              readOnly
              aria-label="Manual authenticator setup key"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 font-mono-ui text-sm tracking-[0.12em] text-[var(--text-primary)] outline-none"
            />
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Use this key only if your authenticator app cannot scan the QR code.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="totp-code"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          6-digit authenticator code
        </label>
        <input
          id="totp-code"
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
        disabled={state !== "ready" || isVerifying || code.length !== 6}
        className="premium-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isVerifying ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {state === "verified"
          ? "MFA verified"
          : isVerifying
            ? "Verifying code..."
            : "Enable MFA and open dashboard"}
      </button>
    </form>
  );
}
