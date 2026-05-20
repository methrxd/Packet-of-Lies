import type { IndicatorType, SubmissionType } from "@/lib/workflow";

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const SHA256_REGEX = /^[A-Fa-f0-9]{64}$/;
const DOMAIN_REGEX =
  /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NormalizedIndicator = {
  type: IndicatorType;
  value: string;
  normalized: string;
};

export function normalizeIndicatorValue(type: IndicatorType, value: string) {
  const trimmed = value.trim();

  if (type === "sha256") {
    return trimmed.toLowerCase();
  }

  if (type === "domain" || type === "email" || type === "url") {
    return trimmed.toLowerCase();
  }

  return trimmed;
}

export function inferIndicatorFromSubmission(
  submissionType: SubmissionType,
  rawValue: string
): NormalizedIndicator | null {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  if (submissionType === "domain") {
    const normalized = value.toLowerCase();
    if (!DOMAIN_REGEX.test(normalized)) {
      return null;
    }
    return { type: "domain", value, normalized };
  }

  if (submissionType === "ip") {
    if (!IPV4_REGEX.test(value)) {
      return null;
    }
    return { type: "ipv4", value, normalized: value };
  }

  if (submissionType === "url") {
    try {
      const url = new URL(value);
      return { type: "url", value, normalized: url.toString().toLowerCase() };
    } catch {
      return null;
    }
  }

  if (submissionType === "email_artifact") {
    const normalized = value.toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      return null;
    }
    return { type: "email", value, normalized };
  }

  if (submissionType === "file") {
    if (SHA256_REGEX.test(value)) {
      return { type: "sha256", value, normalized: value.toLowerCase() };
    }
    return { type: "filename", value, normalized: value };
  }

  return null;
}
