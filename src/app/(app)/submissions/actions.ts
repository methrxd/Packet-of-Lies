"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { submissionTypeOptions } from "@/lib/workflow";

const submissionSchema = z.object({
  caseId: z.string().uuid().optional(),
  submissionType: z.enum(submissionTypeOptions),
  title: z.string().min(6, "Submission title must be at least 6 characters."),
  description: z.string().max(1000).optional(),
  rawValue: z.string().min(2, "Add the primary artifact value."),
});

export type SubmissionActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createSubmissionAction(
  _prevState: SubmissionActionState,
  formData: FormData
): Promise<SubmissionActionState> {
  const auth = await getAuthContext();

  if (!auth) {
    return {
      status: "error",
      message: "You must be signed in to create a submission.",
    };
  }

  const parsed = submissionSchema.safeParse({
    caseId: formData.get("caseId") || undefined,
    submissionType: formData.get("submissionType"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    rawValue: formData.get("rawValue"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid submission payload.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").insert({
    case_id: parsed.data.caseId ?? null,
    submission_type: parsed.data.submissionType,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    payload: {
      value: parsed.data.rawValue,
    },
    submitted_by: auth.userId,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/submissions");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Submission captured and added to the evidence queue.",
  };
}
