import { redirect } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SubmissionType } from "@/lib/workflow";

const typeClassMap: Record<SubmissionType, string> = {
  file: "border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary",
  url: "border-[color:rgba(95,156,255,0.2)] bg-[color:rgba(95,156,255,0.1)] text-[var(--state-info)]",
  domain:
    "border-[color:rgba(95,156,255,0.2)] bg-[color:rgba(95,156,255,0.1)] text-[var(--state-info)]",
  ip: "border-[color:rgba(95,156,255,0.2)] bg-[color:rgba(95,156,255,0.1)] text-[var(--state-info)]",
  email_artifact:
    "border-[color:rgba(255,184,0,0.22)] bg-[color:rgba(255,184,0,0.08)] text-[var(--state-warning)]",
  manual_incident: "border-white/10 bg-white/4 text-[var(--text-secondary)]",
};

type SubmissionRow = {
  id: string;
  title: string;
  submission_type: SubmissionType;
  validation_state: string;
  created_at: string;
  payload: unknown;
  case_id: string | null;
  cases:
    | {
        case_number: string;
        title: string;
      }
    | Array<{
        case_number: string;
        title: string;
      }>
    | null;
};

export default async function SubmissionsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/auth/login");
  }
  if (!hasPermission(auth, "view_submissions")) {
    redirect("/auth/access-denied");
  }

  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, title, submission_type, validation_state, created_at, payload, case_id, cases(case_number, title)")
    .order("created_at", { ascending: false })
    .limit(30);

  const list = (submissions ?? []) as SubmissionRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Submissions"
        title="Senior analyst submission queue"
        description="Review incoming submissions and map validated items into active cases."
      />

      <Card>
        <CardHeader>
          <CardDescription className="helix-kicker">Queue</CardDescription>
          <CardTitle>Incoming records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <div className="helix-card text-sm text-[var(--text-secondary)]">
              No submissions queued.
            </div>
          ) : null}

          {list.map((item) => {
            const linkedCase = Array.isArray(item.cases) ? item.cases[0] ?? null : item.cases;
            const payloadValue =
              typeof item.payload === "object" && item.payload !== null && "value" in item.payload
                ? String(item.payload.value)
                : "n/a";
            const artifact =
              typeof item.payload === "object" &&
              item.payload !== null &&
              "artifact" in item.payload &&
              typeof item.payload.artifact === "object" &&
              item.payload.artifact !== null
                ? item.payload.artifact
                : null;
            const artifactName =
              artifact && "fileName" in artifact ? String(artifact.fileName) : null;

            return (
                <div key={item.id} className="helix-card">
                  <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${typeClassMap[item.submission_type]}`}>
                    {item.submission_type}
                  </span>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/4 px-2 py-1 text-xs">
                    {item.validation_state}
                  </span>
                </div>
                <p className="mt-3 text-base font-medium text-[var(--text-primary)]">{item.title}</p>
                <p className="font-mono-ui mt-2 break-all text-[12px] text-[var(--text-secondary)]">
                  {payloadValue}
                </p>
                {artifactName ? (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Attached file: {artifactName}</p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {linkedCase
                    ? `Linked to ${linkedCase.case_number} (${linkedCase.title})`
                    : "No linked case"}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
