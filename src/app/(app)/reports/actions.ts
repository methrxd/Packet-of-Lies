"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const generateReportSchema = z.object({
  caseId: z.string().uuid(),
});

export type ReportActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function generateCaseReportAction(
  _prevState: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  const auth = await getAuthContext();

  if (!auth) {
    return {
      status: "error",
      message: "You must be signed in to generate a report.",
    };
  }

  const parsed = generateReportSchema.safeParse({
    caseId: formData.get("caseId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Choose a case before generating a report.",
    };
  }

  const supabase = await createClient();
  const { data: caseRecord, error: caseError } = await supabase
    .from("cases")
    .select("id, case_number, title, summary, status, severity, priority, created_at")
    .eq("id", parsed.data.caseId)
    .maybeSingle();

  if (caseError || !caseRecord) {
    return {
      status: "error",
      message: caseError?.message ?? "Case not found.",
    };
  }

  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("title, submission_type, validation_state, created_at")
    .eq("case_id", parsed.data.caseId)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    return {
      status: "error",
      message: submissionsError.message,
    };
  }

  const { data: indicators, error: indicatorsError } = await supabase
    .from("indicators")
    .select("indicator_type, indicator_value, status, confidence, last_seen_at")
    .eq("source_case_id", parsed.data.caseId)
    .order("last_seen_at", { ascending: false });

  if (indicatorsError) {
    return {
      status: "error",
      message: indicatorsError.message,
    };
  }

  const submissionCount = submissions?.length ?? 0;
  const indicatorCount = indicators?.length ?? 0;
  const validatedIndicators =
    indicators?.filter((indicator) => indicator.status === "validated").length ?? 0;

  const summary = [
    `${caseRecord.case_number} is currently in ${caseRecord.status} with ${caseRecord.severity} severity and ${caseRecord.priority} priority.`,
    submissionCount > 0
      ? `${submissionCount} evidence submission(s) are linked to this case.`
      : "No evidence submissions are linked yet.",
    indicatorCount > 0
      ? `${indicatorCount} indicator(s) have been captured, including ${validatedIndicators} validated indicator(s).`
      : "No indicators have been captured yet.",
  ].join(" ");

  const findings = [
    ...((submissions ?? []).slice(0, 5).map((submission) => ({
      type: "submission",
      title: submission.title,
      detail: `${submission.submission_type} · ${submission.validation_state} · ${new Date(
        submission.created_at
      ).toLocaleString()}`,
    })) ?? []),
    ...((indicators ?? []).slice(0, 5).map((indicator) => ({
      type: "indicator",
      title: `${indicator.indicator_type}: ${indicator.indicator_value}`,
      detail: `${indicator.status} · confidence ${indicator.confidence}% · last seen ${new Date(
        indicator.last_seen_at
      ).toLocaleString()}`,
    })) ?? []),
  ];

  const recommendations = [
    "Validate unresolved indicators against threat intel and internal telemetry.",
    "Advance case status after triage decisions are documented.",
    "Attach follow-up submissions for containment and recovery evidence.",
  ].join(" ");

  const { error: reportError } = await supabase.from("reports").insert({
    case_id: caseRecord.id,
    title: `${caseRecord.case_number} - ${caseRecord.title}`,
    summary,
    findings,
    recommendations,
    generated_by: auth.userId,
  });

  if (reportError) {
    return {
      status: "error",
      message: reportError.message,
    };
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Case report generated and saved.",
  };
}
