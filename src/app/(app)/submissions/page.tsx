import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthContext, hasPermission } from "@/lib/auth";
import type { SubmissionType } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

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
    .select(
      "id, title, submission_type, validation_state, created_at, payload, case_id, cases(case_number, title)"
    )
    .order("created_at", { ascending: false })
    .limit(25);

  const list = (submissions ?? []) as SubmissionRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Submissions"
        title="Senior evidence review"
        description="Review cross-case evidence submissions and validation states. Case-level document uploads now happen directly from the case workspace."
      />

      <div className="grid gap-4">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Validation queue
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Latest submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {list.length === 0 ? (
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                No submissions are queued right now.
              </div>
            ) : null}

            {list.map((item) => {
              const linkedCase = Array.isArray(item.cases)
                ? item.cases[0] ?? null
                : item.cases;
              const payloadValue =
                typeof item.payload === "object" &&
                item.payload !== null &&
                "value" in item.payload
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
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/6 bg-white/2 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={typeClassMap[item.submission_type as SubmissionType]}
                    >
                      {item.submission_type}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 bg-white/4">
                      {item.validation_state}
                    </Badge>
                  </div>
                  <p className="mt-3 text-base font-medium text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <p className="font-mono-ui mt-2 break-all text-[12px] text-[var(--text-secondary)]">
                    {payloadValue}
                  </p>
                  {artifactName ? (
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Attached file: {artifactName}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {linkedCase
                      ? `Linked to ${linkedCase.case_number} (${linkedCase.title})`
                      : "No linked case yet"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/6 bg-[var(--bg-shell)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            Pipeline notes
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Workflow behavior
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Submissions are private and only visible to roles with `view_submissions`.
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Case investigation documents are now uploaded directly in Findings and Response Actions.
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm leading-6 text-[var(--text-secondary)]">
              This screen is intended for senior review and governance across submissions.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
