"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { casePriorityOptions, caseSeverityOptions } from "@/lib/workflow";

const caseSchema = z.object({
  title: z.string().min(8, "Case title must be at least 8 characters."),
  summary: z.string().max(1000).optional(),
  severity: z.enum(caseSeverityOptions),
  priority: z.enum(casePriorityOptions),
});

export type CaseActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createCaseAction(
  _prevState: CaseActionState,
  formData: FormData
): Promise<CaseActionState> {
  const auth = await getAuthContext();

  if (!auth) {
    return {
      status: "error",
      message: "You must be signed in to create a case.",
    };
  }

  if (!hasPermission(auth, "manage_cases")) {
    return {
      status: "error",
      message: "Your role does not have permission to create cases.",
    };
  }

  const parsed = caseSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    severity: formData.get("severity"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid case payload.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cases").insert({
    title: parsed.data.title,
    summary: parsed.data.summary ?? null,
    severity: parsed.data.severity,
    priority: parsed.data.priority,
    created_by: auth.userId,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/cases");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Case created and added to the investigation queue.",
  };
}
