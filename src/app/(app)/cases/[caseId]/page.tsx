import { notFound, redirect } from "next/navigation";

import { CaseDetailLive } from "@/components/cases/case-detail-live";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { listConfiguredProviders } from "@/lib/malware-analysis/providers";
import { createClient } from "@/lib/supabase/server";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/auth/login");
  }
  if (!hasPermission(auth, "manage_cases")) {
    redirect("/auth/access-denied");
  }

  const { caseId } = await params;
  const supabase = await createClient();

  const [
    { data: caseRecord, error: caseError },
    { data: findings },
    { data: mitigations },
    { data: comments },
    { data: indicators },
    { data: assignees },
    { data: activityLog },
    { data: analysisRuns },
  ] = await Promise.all([
    supabase
      .from("cases")
      .select(
        "id, case_number, title, summary, status, severity, priority, created_by, assigned_to, created_at, updated_at"
      )
      .eq("id", caseId)
      .maybeSingle(),
    supabase
      .from("case_findings")
      .select(
        "id, title, detail, created_by, created_at, document_path, document_name, document_size"
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("case_mitigations")
      .select(
        "id, title, detail, status, created_by, created_at, document_path, document_name, document_size"
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("case_comments")
      .select("id, body, created_by, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("indicators")
      .select("id, indicator_type, indicator_value, status, confidence, last_seen_at")
      .eq("source_case_id", caseId)
      .order("last_seen_at", { ascending: false })
      .limit(20),
    supabase
      .from("profiles")
      .select("id, email, display_name, username")
      .order("created_at", { ascending: false }),
    supabase
      .from("case_activity_log")
      .select("id, actor_user_id, action, payload, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("case_analysis_runs")
      .select(
        "id, provider, input_type, input_value, status, verdict, provider_report_url, error_message, score_total, score_breakdown, is_cached, created_at, completed_at"
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const providerOptions = [
    {
      key: "virustotal" as const,
      label: "VirusTotal",
      configured: false,
    },
    {
      key: "hybrid_analysis" as const,
      label: "Hybrid Analysis",
      configured: false,
    },
  ];
  for (const configuredProvider of listConfiguredProviders()) {
    const match = providerOptions.find((provider) => provider.key === configuredProvider.key);
    if (match) {
      match.configured = true;
    }
  }

  if (caseError || !caseRecord) {
    notFound();
  }

  return (
    <CaseDetailLive
      initialSnapshot={{
        caseRecord,
        findings: findings ?? [],
        mitigations: mitigations ?? [],
        comments: comments ?? [],
        indicators: indicators ?? [],
        analysisRuns: analysisRuns ?? [],
        analysisProviders: providerOptions,
        assignees: assignees ?? [],
      }}
      initialActivity={{
        activityLog: activityLog ?? [],
      }}
    />
  );
}
