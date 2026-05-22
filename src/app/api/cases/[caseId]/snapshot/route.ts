import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { caseId } = await params;
  const mode = new URL(request.url).searchParams.get("mode");
  const includeAssignees = mode !== "live";

  const [
    { data: caseRecord, error: caseError },
    { data: findings },
    { data: mitigations },
    { data: comments },
    { data: indicators },
    assigneesResult,
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
    includeAssignees
      ? supabase
          .from("profiles")
          .select("id, email, display_name, username")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (caseError || !caseRecord) {
    return NextResponse.json({ error: caseError?.message ?? "Case not found" }, { status: 404 });
  }

  return NextResponse.json({
    caseRecord,
    findings: findings ?? [],
    mitigations: mitigations ?? [],
    comments: comments ?? [],
    indicators: indicators ?? [],
    assignees: assigneesResult.data ?? [],
  });
}
