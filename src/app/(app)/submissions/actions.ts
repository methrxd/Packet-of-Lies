"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext, hasPermission } from "@/lib/auth";
import { inferIndicatorFromSubmission } from "@/lib/indicators";
import {
  submissionArtifactPath,
  validateSubmissionFile,
} from "@/lib/submission-file";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { submissionTypeOptions } from "@/lib/workflow";

const submissionSchema = z.object({
  caseId: z.string().uuid().optional(),
  submissionType: z.enum(submissionTypeOptions),
  title: z.string().min(6, "Submission title must be at least 6 characters."),
  description: z.string().max(1000).optional(),
  rawValue: z.string().trim().optional(),
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
    rawValue: formData.get("rawValue") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid submission payload.",
    };
  }

  if (!hasPermission(auth, "manage_submissions")) {
    return {
      status: "error",
      message: "Your role does not have permission to create submissions.",
    };
  }

  const fileInput = formData.get("evidenceFile");
  const evidenceFile =
    fileInput instanceof File && fileInput.size > 0 ? fileInput : null;

  if (!evidenceFile) {
    return {
      status: "error",
      message: "Evidence upload is required. Allowed formats: PDF, JPG, JPEG, PNG (max 5 MB).",
    };
  }

  const fileValidation = await validateSubmissionFile(evidenceFile);
  if (!fileValidation.ok) {
    return { status: "error", message: fileValidation.message };
  }

  const rawValue =
    parsed.data.rawValue && parsed.data.rawValue.length >= 2
      ? parsed.data.rawValue
      : evidenceFile.name;

  const supabase = await createClient();
  const submissionInsert = await supabase
    .from("submissions")
    .insert({
      case_id: parsed.data.caseId ?? null,
      submission_type: parsed.data.submissionType,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      payload: {
        value: rawValue,
      },
      submitted_by: auth.userId,
    })
    .select("id, case_id, submission_type")
    .single();

  const error = submissionInsert.error;

  if (!error) {
    try {
      const admin = createAdminClient();
      const bytes = Buffer.from(await evidenceFile.arrayBuffer());
      const artifactPath = submissionArtifactPath(
        auth.userId,
        submissionInsert.data.id,
        fileValidation.extension
      );

      const upload = await admin.storage
        .from("submission-artifacts")
        .upload(artifactPath, bytes, {
          contentType: fileValidation.contentType,
          upsert: false,
        });

      if (upload.error) {
        await supabase.from("submissions").delete().eq("id", submissionInsert.data.id);
        return {
          status: "error",
          message: upload.error.message,
        };
      }

      await supabase
        .from("submissions")
        .update({
          payload: {
            value: rawValue,
            artifact: {
              path: artifactPath,
              fileName: evidenceFile.name,
              fileSize: evidenceFile.size,
              contentType: fileValidation.contentType,
            },
          },
        })
        .eq("id", submissionInsert.data.id);
    } catch (caught) {
      await supabase.from("submissions").delete().eq("id", submissionInsert.data.id);
      return {
        status: "error",
        message:
          caught instanceof Error
            ? caught.message
            : "Failed to upload evidence file.",
      };
    }

    const inferred = inferIndicatorFromSubmission(
      parsed.data.submissionType,
      rawValue
    );

    if (inferred) {
      await supabase.from("indicators").upsert(
        {
          indicator_type: inferred.type,
          indicator_value: inferred.value,
          normalized_value: inferred.normalized,
          source_submission_id: submissionInsert.data.id,
          source_case_id: submissionInsert.data.case_id,
          created_by: auth.userId,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: "indicator_type,normalized_value",
        }
      );
    }
  }

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
