"use server";

import { z } from "zod";

import { hasServiceRoleEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const requestAccessSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  organization: z.string().trim().max(120).optional(),
  message: z.string().trim().max(600).optional(),
});

export type RequestAccessActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitAccessRequestAction(
  _prevState: RequestAccessActionState,
  formData: FormData
): Promise<RequestAccessActionState> {
  const parsed = requestAccessSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    organization: formData.get("organization") || undefined,
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid request values.",
    };
  }

  if (!hasServiceRoleEnv()) {
    return {
      status: "error",
      message: "Request access is unavailable right now. Please contact the administrator.",
    };
  }

  try {
    const admin = createAdminClient();
    const normalizedEmail = parsed.data.email.toLowerCase();

    const existingPending = await admin
      .from("access_requests")
      .select("id")
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingPending.data?.id) {
      return {
        status: "success",
        message: "Your request is already pending review. We will email you once approved.",
      };
    }

    const insert = await admin.from("access_requests").insert({
      email: normalizedEmail,
      full_name: parsed.data.fullName,
      organization: parsed.data.organization || null,
      message: parsed.data.message || null,
      status: "pending",
    });

    if (insert.error) {
      return {
        status: "error",
        message: insert.error.message,
      };
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not submit request right now.",
    };
  }

  return {
    status: "success",
    message: "Request submitted. You will receive an email when access is approved.",
  };
}

