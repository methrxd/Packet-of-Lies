import { notFound, redirect } from "next/navigation";

import { CaseDetailLive } from "@/components/cases/case-detail-live";
import { getAuthContext, hasPermission } from "@/lib/auth";
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
  ]);

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
        assignees: assignees ?? [],
      }}
      initialActivity={{
        activityLog: activityLog ?? [],
      }}
    />
  );
}
