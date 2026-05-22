import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAuthContext, hasPermission } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(auth, "manage_cases")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { caseId } = await params;
  const supabase = await createClient();

  const [{ data: activityLog, error }, { data: assignees }] = await Promise.all([
    supabase
      .from("case_activity_log")
      .select("id, actor_user_id, action, payload, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("profiles")
      .select("id, email, display_name, username")
      .order("created_at", { ascending: false }),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    activityLog: activityLog ?? [],
    assignees: assignees ?? [],
  });
}
