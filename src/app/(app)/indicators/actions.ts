"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext, hasPermission } from "@/lib/auth";
import { normalizeIndicatorValue } from "@/lib/indicators";
import { createClient } from "@/lib/supabase/server";
import { indicatorStatusOptions, indicatorTypeOptions } from "@/lib/workflow";

const createIndicatorSchema = z.object({
  indicatorType: z.enum(indicatorTypeOptions),
  indicatorValue: z.string().trim().min(2).max(1000),
  confidence: z.coerce.number().int().min(1).max(100),
  status: z.enum(indicatorStatusOptions).default("new"),
  caseId: z.string().uuid().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type IndicatorActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createIndicatorAction(
  _prevState: IndicatorActionState,
  formData: FormData
): Promise<IndicatorActionState> {
  const auth = await getAuthContext();

  if (!auth) {
    return {
      status: "error",
      message: "You must be signed in to create an indicator.",
    };
  }

  if (!hasPermission(auth, "view_indicators")) {
    return {
      status: "error",
      message: "Your role does not have permission to create indicators.",
    };
  }

  const parsed = createIndicatorSchema.safeParse({
    indicatorType: formData.get("indicatorType"),
    indicatorValue: formData.get("indicatorValue"),
    confidence: formData.get("confidence"),
    status: formData.get("status") ?? "new",
    caseId: formData.get("caseId") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Invalid indicator form payload.",
    };
  }

  const normalizedValue = normalizeIndicatorValue(
    parsed.data.indicatorType,
    parsed.data.indicatorValue
  );

  const supabase = await createClient();
  const { error } = await supabase.from("indicators").upsert(
    {
      indicator_type: parsed.data.indicatorType,
      indicator_value: parsed.data.indicatorValue,
      normalized_value: normalizedValue,
      confidence: parsed.data.confidence,
      status: parsed.data.status,
      source_case_id: parsed.data.caseId ?? null,
      notes: parsed.data.notes ?? null,
      created_by: auth.userId,
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: "indicator_type,normalized_value",
    }
  );

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/indicators");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Indicator stored in the observables registry.",
  };
}
