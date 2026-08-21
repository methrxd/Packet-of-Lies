import type { Factor } from "@supabase/supabase-js";

import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type MfaStatus = {
  currentLevel: string | null;
  nextLevel: string | null;
  hasVerifiedTotp: boolean;
  isVerified: boolean;
  needsEnrollment: boolean;
  needsChallenge: boolean;
  verifiedTotpFactors: Factor<"totp", "verified">[];
};

export async function getMfaStatus(
  supabase: ServerSupabaseClient
): Promise<MfaStatus> {
  const [aalResult, factorsResult] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (aalResult.error) {
    throw aalResult.error;
  }

  if (factorsResult.error) {
    throw factorsResult.error;
  }

  const verifiedTotpFactors =
    factorsResult.data.totp?.filter(
      (factor): factor is Factor<"totp", "verified"> =>
        factor.status === "verified"
    ) ?? [];

  const currentLevel = aalResult.data.currentLevel;
  const nextLevel = aalResult.data.nextLevel;
  const hasVerifiedTotp = verifiedTotpFactors.length > 0;

  return {
    currentLevel,
    nextLevel,
    hasVerifiedTotp,
    isVerified: hasVerifiedTotp && currentLevel === "aal2",
    needsEnrollment: !hasVerifiedTotp,
    needsChallenge:
      hasVerifiedTotp && nextLevel === "aal2" && currentLevel !== "aal2",
    verifiedTotpFactors,
  };
}
