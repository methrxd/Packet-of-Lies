import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serviceRoleEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const inviteEmailEnvSchema = z.object({
  INVITE_SMTP_USER: z.string().trim().email(),
  INVITE_SMTP_PASS: z.string().trim().min(1),
});

const malwareAnalysisEnvSchema = z.object({
  VIRUSTOTAL_API_KEY: z.string().trim().min(1),
});

const hybridAnalysisEnvSchema = z.object({
  HYBRID_ANALYSIS_API_KEY: z.string().trim().min(1),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function hasSupabaseEnv() {
  return publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }).success;
}

export function getServiceRoleEnv() {
  const parsed = serviceRoleEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "Missing server configuration: SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return parsed.data;
}

export function hasServiceRoleEnv() {
  return serviceRoleEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }).success;
}

export function getInviteEmailEnv() {
  const parsed = inviteEmailEnvSchema.safeParse({
    INVITE_SMTP_USER: process.env.INVITE_SMTP_USER,
    INVITE_SMTP_PASS: process.env.INVITE_SMTP_PASS,
  });

  if (!parsed.success) {
    throw new Error(
      "Missing server configuration: INVITE_SMTP_USER and INVITE_SMTP_PASS"
    );
  }

  return parsed.data;
}

export function hasInviteEmailEnv() {
  return inviteEmailEnvSchema.safeParse({
    INVITE_SMTP_USER: process.env.INVITE_SMTP_USER,
    INVITE_SMTP_PASS: process.env.INVITE_SMTP_PASS,
  }).success;
}

export function getSiteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  const normalized = url.startsWith("http") ? url : `https://${url}`;
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function hasVirusTotalApiKey() {
  return malwareAnalysisEnvSchema.safeParse({
    VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY,
  }).success;
}

export function getVirusTotalApiKey() {
  const parsed = malwareAnalysisEnvSchema.safeParse({
    VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY,
  });
  if (!parsed.success) {
    throw new Error("Missing server configuration: VIRUSTOTAL_API_KEY");
  }
  return parsed.data.VIRUSTOTAL_API_KEY;
}

export function hasHybridAnalysisApiKey() {
  return hybridAnalysisEnvSchema.safeParse({
    HYBRID_ANALYSIS_API_KEY: process.env.HYBRID_ANALYSIS_API_KEY,
  }).success;
}

export function getHybridAnalysisApiKey() {
  const parsed = hybridAnalysisEnvSchema.safeParse({
    HYBRID_ANALYSIS_API_KEY: process.env.HYBRID_ANALYSIS_API_KEY,
  });
  if (!parsed.success) {
    throw new Error("Missing server configuration: HYBRID_ANALYSIS_API_KEY");
  }
  return parsed.data.HYBRID_ANALYSIS_API_KEY;
}
