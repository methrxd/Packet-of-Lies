"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext } from "@/lib/auth";
import {
  caseStatusOptions,
  mitigationStatusOptions,
  type CaseStatus,
} from "@/lib/workflow";
import { createClient } from "@/lib/supabase/server";

const statusTransitionMap: Record<CaseStatus, CaseStatus[]> = {
  new: ["triage"],
  triage: ["investigating", "archived"],
  investigating: ["contained", "resolved"],
  contained: ["investigating", "resolved"],
  resolved: ["archived"],
  archived: [],
};

const statusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum(caseStatusOptions),
});

const assignmentSchema = z.object({
  caseId: z.string().uuid(),
  assigneeId: z.string().uuid().nullable(),
});

const findingSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().trim().min(6).max(140),
  detail: z.string().trim().min(10).max(3000),
});

const mitigationSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().trim().min(6).max(140),
  detail: z.string().trim().min(10).max(3000),
  status: z.enum(mitigationStatusOptions),
});

const commentSchema = z.object({
  caseId: z.string().uuid(),
  body: z.string().trim().min(3).max(3000),
});

export type CaseDetailActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

async function writeCaseActivity(
  caseId: string,
  actorUserId: string,
  action: string,
  payload: Record<string, string | null>
) {
  const supabase = await createClient();
  await supabase.from("case_activity_log").insert({
    case_id: caseId,
    actor_user_id: actorUserId,
    action,
    payload,
  });
}

export async function updateCaseStatusAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to update case status." };
  }

  const parsed = statusSchema.safeParse({
    caseId: formData.get("caseId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid status update request." };
  }

  const supabase = await createClient();
  const { data: caseRecord, error: caseError } = await supabase
    .from("cases")
    .select("id, status")
    .eq("id", parsed.data.caseId)
    .maybeSingle();

  if (caseError || !caseRecord) {
    return { status: "error", message: caseError?.message ?? "Case not found." };
  }

  const currentStatus = caseRecord.status as CaseStatus;
  const nextStatus = parsed.data.status;

  if (currentStatus === nextStatus) {
    return { status: "error", message: "Case is already in the selected status." };
  }

  const allowed = statusTransitionMap[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    return {
      status: "error",
      message: `Cannot move case from ${currentStatus} to ${nextStatus}.`,
    };
  }

  if (nextStatus === "resolved") {
    const [{ count: findingsCount }, { count: mitigationsCount }] = await Promise.all([
      supabase
        .from("case_findings")
        .select("id", { count: "exact", head: true })
        .eq("case_id", parsed.data.caseId),
      supabase
        .from("case_mitigations")
        .select("id", { count: "exact", head: true })
        .eq("case_id", parsed.data.caseId),
    ]);

    if ((findingsCount ?? 0) === 0 && (mitigationsCount ?? 0) === 0) {
      return {
        status: "error",
        message: "Add at least one finding or mitigation before resolving this case.",
      };
    }
  }

  const { error: updateError } = await supabase
    .from("cases")
    .update({ status: nextStatus })
    .eq("id", parsed.data.caseId);

  if (updateError) {
    return { status: "error", message: updateError.message };
  }

  await writeCaseActivity(parsed.data.caseId, auth.userId, "status_updated", {
    from: currentStatus,
    to: nextStatus,
  });

  revalidatePath(`/cases/${parsed.data.caseId}`);
  revalidatePath("/cases");
  revalidatePath("/dashboard");

  return { status: "success", message: "Case status updated." };
}

export async function updateCaseAssigneeAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to update assignment." };
  }

  const assigneeInput = formData.get("assigneeId");
  const parsed = assignmentSchema.safeParse({
    caseId: formData.get("caseId"),
    assigneeId:
      typeof assigneeInput === "string" && assigneeInput.length > 0
        ? assigneeInput
        : null,
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid assignment payload." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cases")
    .update({ assigned_to: parsed.data.assigneeId })
    .eq("id", parsed.data.caseId);

  if (error) {
    return { status: "error", message: error.message };
  }

  await writeCaseActivity(parsed.data.caseId, auth.userId, "assignee_updated", {
    assignee_user_id: parsed.data.assigneeId,
  });

  revalidatePath(`/cases/${parsed.data.caseId}`);
  revalidatePath("/cases");

  return { status: "success", message: "Case assignment updated." };
}

export async function createCaseFindingAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to add findings." };
  }

  const parsed = findingSchema.safeParse({
    caseId: formData.get("caseId"),
    title: formData.get("title"),
    detail: formData.get("detail"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid finding payload." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("case_findings").insert({
    case_id: parsed.data.caseId,
    title: parsed.data.title,
    detail: parsed.data.detail,
    created_by: auth.userId,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  await writeCaseActivity(parsed.data.caseId, auth.userId, "finding_added", {
    finding_title: parsed.data.title,
  });

  revalidatePath(`/cases/${parsed.data.caseId}`);
  revalidatePath("/reports");

  return { status: "success", message: "Finding added to the investigation record." };
}

export async function createCaseMitigationAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to add mitigations." };
  }

  const parsed = mitigationSchema.safeParse({
    caseId: formData.get("caseId"),
    title: formData.get("title"),
    detail: formData.get("detail"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid mitigation payload." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("case_mitigations").insert({
    case_id: parsed.data.caseId,
    title: parsed.data.title,
    detail: parsed.data.detail,
    status: parsed.data.status,
    created_by: auth.userId,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  await writeCaseActivity(parsed.data.caseId, auth.userId, "mitigation_added", {
    mitigation_title: parsed.data.title,
    mitigation_status: parsed.data.status,
  });

  revalidatePath(`/cases/${parsed.data.caseId}`);
  revalidatePath("/reports");

  return { status: "success", message: "Mitigation step recorded." };
}

export async function createCaseCommentAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to add comments." };
  }

  const parsed = commentSchema.safeParse({
    caseId: formData.get("caseId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid comment payload." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("case_comments").insert({
    case_id: parsed.data.caseId,
    body: parsed.data.body,
    created_by: auth.userId,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  await writeCaseActivity(parsed.data.caseId, auth.userId, "comment_added", {
    preview: parsed.data.body.slice(0, 120),
  });

  revalidatePath(`/cases/${parsed.data.caseId}`);

  return { status: "success", message: "Comment added to the case thread." };
}
