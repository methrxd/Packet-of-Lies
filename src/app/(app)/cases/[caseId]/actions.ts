"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext, hasPermission } from "@/lib/auth";
import {
  caseDocumentArtifactPath,
  validateCaseDocumentFile,
} from "@/lib/case-document-file";
import {
  computeAnalysisScore,
} from "@/lib/malware-analysis/scoring";
import {
  detectAnalysisInputType,
  normalizeAnalysisInput,
  analysisInputTypeOptions,
  analysisProviderOptions,
  type AnalysisProvider,
  type AnalysisRunStatus,
} from "@/lib/malware-analysis/types";
import {
  resolveAnalysisProvider,
} from "@/lib/malware-analysis/providers";
import {
  caseStatusOptions,
  mitigationStatusOptions,
  type CaseStatus,
} from "@/lib/workflow";
import { createAdminClient } from "@/lib/supabase/admin";
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

const analysisSubmitSchema = z.object({
  caseId: z.string().uuid(),
  provider: z.enum(analysisProviderOptions),
  inputType: z.enum(analysisInputTypeOptions),
  inputValue: z.string().trim().min(6).max(500),
});

const analysisRefreshSchema = z.object({
  caseId: z.string().uuid(),
  runId: z.string().uuid(),
});

export type CaseDetailActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

async function writeCaseActivity(
  caseId: string,
  actorUserId: string,
  action: string,
  payload: Record<string, string | number | boolean | null>
) {
  const supabase = await createClient();
  await supabase.from("case_activity_log").insert({
    case_id: caseId,
    actor_user_id: actorUserId,
    action,
    payload,
  });
}

async function getActiveAnalysisRubric(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("analysis_scoring_rubrics")
    .select("id, version, weights")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

async function applyAnalysisProviderResult(
  supabase: Awaited<ReturnType<typeof createClient>>,
  runId: string,
  provider: AnalysisProvider,
  providerResult: {
    status: AnalysisRunStatus;
    externalJobId: string | null;
    providerReportId: string | null;
    providerReportUrl: string | null;
    verdict: string | null;
    reportMetadata: Record<string, unknown>;
    behaviorSummary: Record<string, unknown>;
    extractedIocs: Array<Record<string, unknown>>;
    signalSnapshot: {
      detections: number;
      engines: number;
      detectionRatio: number;
      behaviorSeverity: number;
      confidence: number;
      suspiciousFamilies: number;
      networkIndicators: number;
    };
    errorMessage: string | null;
  }
) {
  const nowIso = new Date().toISOString();
  const baseUpdate: Record<string, unknown> = {
    status: providerResult.status,
    external_job_id: providerResult.externalJobId,
    provider_report_id: providerResult.providerReportId,
    provider_report_url: providerResult.providerReportUrl,
    verdict: providerResult.verdict,
    report_metadata: providerResult.reportMetadata,
    behavior_summary: providerResult.behaviorSummary,
    extracted_iocs: providerResult.extractedIocs,
    error_message: providerResult.errorMessage,
  };

  if (providerResult.status === "completed") {
    const rubric = await getActiveAnalysisRubric(supabase);
    const scoring = computeAnalysisScore(
      providerResult.signalSnapshot,
      (rubric?.weights as Record<string, unknown> | null | undefined) ?? null,
      rubric?.version ?? "default"
    );

    baseUpdate.score_total = scoring.totalScore;
    baseUpdate.score_breakdown = {
      ...scoring.breakdown,
      signals: providerResult.signalSnapshot,
      provider,
    };
    baseUpdate.rubric_id = rubric?.id ?? null;
    baseUpdate.rubric_snapshot = scoring.rubricSnapshot;
    baseUpdate.completed_at = nowIso;
  }

  if (providerResult.status === "failed") {
    baseUpdate.completed_at = nowIso;
  }

  await supabase.from("case_analysis_runs").update(baseUpdate).eq("id", runId);
}

export async function updateCaseStatusAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to update case status." };
  }

  if (!hasPermission(auth, "manage_cases")) {
    return { status: "error", message: "Your role cannot update case status." };
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

  if (!hasPermission(auth, "manage_cases")) {
    return { status: "error", message: "Your role cannot update assignments." };
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

  if (!hasPermission(auth, "manage_case_documents")) {
    return {
      status: "error",
      message: "Your role cannot add findings or case documents.",
    };
  }

  const parsed = findingSchema.safeParse({
    caseId: formData.get("caseId"),
    title: formData.get("title"),
    detail: formData.get("detail"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid finding payload." };
  }

  const attachmentInput = formData.get("document");
  const documentFile =
    attachmentInput instanceof File && attachmentInput.size > 0
      ? attachmentInput
      : null;

  let attachmentData: {
    path: string;
    fileName: string;
    fileSize: number;
    contentType: string;
  } | null = null;

  if (documentFile) {
    const validation = await validateCaseDocumentFile(documentFile);
    if (!validation.ok) {
      return { status: "error", message: validation.message };
    }

    try {
      const admin = createAdminClient();
      const bytes = Buffer.from(await documentFile.arrayBuffer());
      const path = caseDocumentArtifactPath(auth.userId, parsed.data.caseId, "finding");
      const upload = await admin.storage.from("case-documents").upload(path, bytes, {
        contentType: validation.contentType,
        upsert: false,
      });

      if (upload.error) {
        return { status: "error", message: upload.error.message };
      }

      attachmentData = {
        path,
        fileName: documentFile.name,
        fileSize: documentFile.size,
        contentType: validation.contentType,
      };
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to upload finding document.",
      };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("case_findings").insert({
    case_id: parsed.data.caseId,
    title: parsed.data.title,
    detail: parsed.data.detail,
    created_by: auth.userId,
    document_path: attachmentData?.path ?? null,
    document_name: attachmentData?.fileName ?? null,
    document_size: attachmentData?.fileSize ?? null,
    document_mime: attachmentData?.contentType ?? null,
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

  if (!hasPermission(auth, "manage_case_documents")) {
    return {
      status: "error",
      message: "Your role cannot add mitigations or case documents.",
    };
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

  const attachmentInput = formData.get("document");
  const documentFile =
    attachmentInput instanceof File && attachmentInput.size > 0
      ? attachmentInput
      : null;

  let attachmentData: {
    path: string;
    fileName: string;
    fileSize: number;
    contentType: string;
  } | null = null;

  if (documentFile) {
    const validation = await validateCaseDocumentFile(documentFile);
    if (!validation.ok) {
      return { status: "error", message: validation.message };
    }

    try {
      const admin = createAdminClient();
      const bytes = Buffer.from(await documentFile.arrayBuffer());
      const path = caseDocumentArtifactPath(auth.userId, parsed.data.caseId, "mitigation");
      const upload = await admin.storage.from("case-documents").upload(path, bytes, {
        contentType: validation.contentType,
        upsert: false,
      });

      if (upload.error) {
        return { status: "error", message: upload.error.message };
      }

      attachmentData = {
        path,
        fileName: documentFile.name,
        fileSize: documentFile.size,
        contentType: validation.contentType,
      };
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to upload mitigation document.",
      };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("case_mitigations").insert({
    case_id: parsed.data.caseId,
    title: parsed.data.title,
    detail: parsed.data.detail,
    status: parsed.data.status,
    created_by: auth.userId,
    document_path: attachmentData?.path ?? null,
    document_name: attachmentData?.fileName ?? null,
    document_size: attachmentData?.fileSize ?? null,
    document_mime: attachmentData?.contentType ?? null,
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

  if (!hasPermission(auth, "manage_cases")) {
    return { status: "error", message: "Your role cannot add case comments." };
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

export async function runCaseAnalysisLiveAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to run analysis." };
  }
  if (!hasPermission(auth, "manage_cases")) {
    return { status: "error", message: "Your role cannot run malware analysis jobs." };
  }

  const parsed = analysisSubmitSchema.safeParse({
    caseId: formData.get("caseId"),
    provider: formData.get("provider"),
    inputType: formData.get("inputType"),
    inputValue: formData.get("inputValue"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid analysis request payload." };
  }

  const provider = resolveAnalysisProvider(parsed.data.provider);
  if (!provider.isConfigured()) {
    return {
      status: "error",
      message: `${provider.label} is not configured on this deployment.`,
    };
  }

  const supabase = await createClient();
  const detectedInputType = detectAnalysisInputType(parsed.data.inputValue);
  const effectiveInputType = detectedInputType;
  const trimmedInputValue = parsed.data.inputValue.trim();
  const normalizedInput = normalizeAnalysisInput(
    effectiveInputType,
    trimmedInputValue
  );

  const runInsert = await supabase
    .from("case_analysis_runs")
    .insert({
      case_id: parsed.data.caseId,
      requested_by: auth.userId,
      provider: parsed.data.provider,
      input_type: effectiveInputType,
      input_value: trimmedInputValue,
      input_normalized: normalizedInput,
      status: "queued",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (runInsert.error || !runInsert.data) {
    return {
      status: "error",
      message: runInsert.error?.message ?? "Could not create analysis job.",
    };
  }

  await writeCaseActivity(parsed.data.caseId, auth.userId, "analysis_run_started", {
    provider: parsed.data.provider,
    input_type: effectiveInputType,
  });

  const providerResult = await provider.submit({
    inputType: effectiveInputType,
    inputValue: trimmedInputValue,
    normalizedInput,
  });

  await applyAnalysisProviderResult(
    supabase,
    runInsert.data.id,
    parsed.data.provider,
    providerResult
  );

  if (providerResult.status === "completed") {
    await writeCaseActivity(parsed.data.caseId, auth.userId, "analysis_run_completed", {
      provider: parsed.data.provider,
      status: "completed",
    });
  }

  if (providerResult.status === "failed") {
    await writeCaseActivity(parsed.data.caseId, auth.userId, "analysis_run_failed", {
      provider: parsed.data.provider,
      status: "failed",
    });
  }

  revalidatePath(`/cases/${parsed.data.caseId}`);
  revalidatePath("/cases");

  if (providerResult.status === "running" || providerResult.status === "queued") {
    return {
      status: "success",
      message: "Analysis job submitted. Status is running.",
    };
  }

  if (providerResult.status === "failed") {
    return {
      status: "error",
      message: providerResult.errorMessage ?? "Analysis provider returned an error.",
    };
  }

  return {
    status: "success",
    message: "Analysis run completed and scored.",
  };
}

export async function useCachedAnalysisRunAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to use cached analysis." };
  }
  if (!hasPermission(auth, "manage_cases")) {
    return { status: "error", message: "Your role cannot run malware analysis jobs." };
  }

  const parsed = analysisSubmitSchema.safeParse({
    caseId: formData.get("caseId"),
    provider: formData.get("provider"),
    inputType: formData.get("inputType"),
    inputValue: formData.get("inputValue"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid cached analysis payload." };
  }

  const supabase = await createClient();
  const detectedInputType = detectAnalysisInputType(parsed.data.inputValue);
  const effectiveInputType = detectedInputType;
  const trimmedInputValue = parsed.data.inputValue.trim();
  const normalizedInput = normalizeAnalysisInput(
    effectiveInputType,
    trimmedInputValue
  );

  const { data: cachedRun, error: cachedError } = await supabase
    .from("case_analysis_runs")
    .select(
      "id, provider_report_id, provider_report_url, verdict, report_metadata, behavior_summary, extracted_iocs, score_total, score_breakdown, rubric_id, rubric_snapshot"
    )
    .eq("provider", parsed.data.provider)
    .eq("input_type", effectiveInputType)
    .eq("input_normalized", normalizedInput)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cachedError) {
    return { status: "error", message: cachedError.message };
  }
  if (!cachedRun) {
    return {
      status: "error",
      message: "No cached completed run found for this provider and input.",
    };
  }

  const insert = await supabase.from("case_analysis_runs").insert({
    case_id: parsed.data.caseId,
    requested_by: auth.userId,
    provider: parsed.data.provider,
    input_type: effectiveInputType,
    input_value: trimmedInputValue,
    input_normalized: normalizedInput,
    status: "completed",
    provider_report_id: cachedRun.provider_report_id,
    provider_report_url: cachedRun.provider_report_url,
    verdict: cachedRun.verdict,
    report_metadata: {
      ...(cachedRun.report_metadata as Record<string, unknown>),
      cached_source_run_id: cachedRun.id,
    },
    behavior_summary: cachedRun.behavior_summary,
    extracted_iocs: cachedRun.extracted_iocs,
    score_total: cachedRun.score_total,
    score_breakdown: cachedRun.score_breakdown,
    rubric_id: cachedRun.rubric_id,
    rubric_snapshot: cachedRun.rubric_snapshot,
    is_cached: true,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  });

  if (insert.error) {
    return { status: "error", message: insert.error.message };
  }

  await writeCaseActivity(parsed.data.caseId, auth.userId, "analysis_run_cached", {
    provider: parsed.data.provider,
    source_run: cachedRun.id,
  });

  revalidatePath(`/cases/${parsed.data.caseId}`);
  return {
    status: "success",
    message: "Cached completed run applied successfully.",
  };
}

export async function refreshCaseAnalysisRunAction(
  _prevState: CaseDetailActionState,
  formData: FormData
): Promise<CaseDetailActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You must be signed in to refresh analysis." };
  }
  if (!hasPermission(auth, "manage_cases")) {
    return { status: "error", message: "Your role cannot refresh analysis jobs." };
  }

  const parsed = analysisRefreshSchema.safeParse({
    caseId: formData.get("caseId"),
    runId: formData.get("runId"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid refresh request." };
  }

  const supabase = await createClient();
  const { data: run, error: runError } = await supabase
    .from("case_analysis_runs")
    .select("id, provider, input_type, input_value, input_normalized, external_job_id, status")
    .eq("id", parsed.data.runId)
    .eq("case_id", parsed.data.caseId)
    .maybeSingle();

  if (runError || !run) {
    return { status: "error", message: runError?.message ?? "Analysis run not found." };
  }

  if (run.status === "completed" || run.status === "failed") {
    return { status: "success", message: `Run is already ${run.status}.` };
  }

  const provider = resolveAnalysisProvider(run.provider as AnalysisProvider);
  if (!provider.isConfigured()) {
    return {
      status: "error",
      message: `${provider.label} is not configured on this deployment.`,
    };
  }

  const providerResult = await provider.poll({
    inputType: run.input_type,
    inputValue: run.input_value,
    normalizedInput: run.input_normalized,
    externalJobId: run.external_job_id,
  });

  await applyAnalysisProviderResult(
    supabase,
    run.id,
    run.provider as AnalysisProvider,
    providerResult
  );

  if (providerResult.status === "completed") {
    await writeCaseActivity(parsed.data.caseId, auth.userId, "analysis_run_completed", {
      provider: run.provider,
      status: "completed",
    });
  }

  if (providerResult.status === "failed") {
    await writeCaseActivity(parsed.data.caseId, auth.userId, "analysis_run_failed", {
      provider: run.provider,
      status: "failed",
    });
  }

  revalidatePath(`/cases/${parsed.data.caseId}`);
  return {
    status: "success",
    message:
      providerResult.status === "running"
        ? "Analysis job is still running."
        : providerResult.status === "completed"
          ? "Analysis job completed."
          : providerResult.errorMessage ?? "Analysis refresh failed.",
  };
}
