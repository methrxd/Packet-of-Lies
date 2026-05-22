import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import {
  CaseAssigneeForm,
  CaseCommentForm,
  CaseFindingForm,
  CaseMitigationForm,
  CaseStatusForm,
} from "@/components/cases/case-detail-forms";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { CaseStatus, MitigationStatus, SubmissionType } from "@/lib/workflow";

type CaseFinding = {
  id: string;
  title: string;
  detail: string;
  created_by: string;
  created_at: string;
};

type CaseMitigation = {
  id: string;
  title: string;
  detail: string;
  status: MitigationStatus;
  created_by: string;
  created_at: string;
};

type CaseComment = {
  id: string;
  body: string;
  created_by: string;
  created_at: string;
};

type CaseActivity = {
  id: string;
  actor_user_id: string;
  action: string;
  payload: Record<string, string | null>;
  created_at: string;
};

type CaseSubmission = {
  id: string;
  title: string;
  submission_type: SubmissionType;
  validation_state: string;
  created_at: string;
};

type CaseIndicator = {
  id: string;
  indicator_type: string;
  indicator_value: string;
  status: string;
  confidence: number;
  last_seen_at: string;
};

function userLabelFromMap(
  userId: string,
  userMap: Map<string, { display_name: string | null; username: string | null; email: string }>
) {
  const match = userMap.get(userId);
  if (!match) {
    return "Unknown user";
  }

  return match.display_name ?? match.username ?? match.email;
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const supabase = await createClient();

  const [
    { data: caseRecord, error: caseError },
    { data: findings },
    { data: mitigations },
    { data: comments },
    { data: activityLog },
    { data: submissions },
    { data: indicators },
    { data: assignees },
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
      .select("id, title, detail, created_by, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("case_mitigations")
      .select("id, title, detail, status, created_by, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("case_comments")
      .select("id, body, created_by, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("case_activity_log")
      .select("id, actor_user_id, action, payload, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("submissions")
      .select("id, title, submission_type, validation_state, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(20),
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
  ]);

  if (caseError || !caseRecord) {
    notFound();
  }

  const findingList = (findings ?? []) as CaseFinding[];
  const mitigationList = (mitigations ?? []) as CaseMitigation[];
  const commentList = (comments ?? []) as CaseComment[];
  const activityList = (activityLog ?? []) as CaseActivity[];
  const submissionList = (submissions ?? []) as CaseSubmission[];
  const indicatorList = (indicators ?? []) as CaseIndicator[];

  const userMap = new Map(
    (assignees ?? []).map((profile) => [
      profile.id,
      {
        display_name: profile.display_name,
        username: profile.username,
        email: profile.email,
      },
    ])
  );

  const assigneeOptions = (assignees ?? []).map((profile) => ({
    id: profile.id,
    label: profile.display_name ?? profile.username ?? profile.email,
  }));

  const createdByLabel = userLabelFromMap(caseRecord.created_by, userMap);
  const assignedToLabel = caseRecord.assigned_to
    ? userLabelFromMap(caseRecord.assigned_to, userMap)
    : "Unassigned";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={caseRecord.case_number}
        title={caseRecord.title}
        description={
          caseRecord.summary ||
          "No summary yet. Add findings, mitigations, and comments to build the case narrative."
        }
        actions={
          <Link
            href="/cases"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/2 px-4 text-sm text-[var(--text-primary)] hover:bg-white/4"
          >
            Back to cases
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Lifecycle
            </CardDescription>
            <CardTitle className="font-heading text-xl">Status control</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseStatusForm caseId={caseRecord.id} currentStatus={caseRecord.status as CaseStatus} />
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Ownership
            </CardDescription>
            <CardTitle className="font-heading text-xl">Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseAssigneeForm
              caseId={caseRecord.id}
              assigneeId={caseRecord.assigned_to}
              options={assigneeOptions}
            />
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Snapshot
            </CardDescription>
            <CardTitle className="font-heading text-xl">Case metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p>
              <span className="text-[var(--text-muted)]">Opened by:</span> {createdByLabel}
            </p>
            <p>
              <span className="text-[var(--text-muted)]">Assigned to:</span> {assignedToLabel}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-white/10 bg-white/4">
                {caseRecord.status}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/4">
                {caseRecord.severity}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/4">
                {caseRecord.priority}
              </Badge>
            </div>
            <p>
              <span className="text-[var(--text-muted)]">Last updated:</span>{" "}
              {new Date(caseRecord.updated_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Findings
            </CardDescription>
            <CardTitle className="font-heading text-xl">Evidence-backed conclusions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CaseFindingForm caseId={caseRecord.id} />
            <div className="space-y-3">
              {findingList.length === 0 ? (
                <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No findings recorded yet.
                </p>
              ) : null}
              {findingList.map((finding) => (
                <div key={finding.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{finding.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {finding.detail}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userLabelFromMap(finding.created_by, userMap)} ·{" "}
                    {new Date(finding.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Mitigations
            </CardDescription>
            <CardTitle className="font-heading text-xl">Response actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CaseMitigationForm caseId={caseRecord.id} />
            <div className="space-y-3">
              {mitigationList.length === 0 ? (
                <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No mitigation steps recorded yet.
                </p>
              ) : null}
              {mitigationList.map((mitigation) => (
                <div
                  key={mitigation.id}
                  className="rounded-2xl border border-white/6 bg-white/2 p-4"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{mitigation.title}</p>
                    <Badge variant="outline" className="border-white/10 bg-white/4">
                      {mitigation.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {mitigation.detail}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userLabelFromMap(mitigation.created_by, userMap)} ·{" "}
                    {new Date(mitigation.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Case comments
            </CardDescription>
            <CardTitle className="font-heading text-xl">Analyst thread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CaseCommentForm caseId={caseRecord.id} />
            <div className="space-y-3">
              {commentList.length === 0 ? (
                <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No comments yet.
                </p>
              ) : null}
              {commentList.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">{comment.body}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userLabelFromMap(comment.created_by, userMap)} ·{" "}
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Timeline
            </CardDescription>
            <CardTitle className="font-heading text-xl">Activity log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityList.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                No activity logged yet.
              </p>
            ) : null}
            {activityList.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                <p className="text-sm font-medium text-[var(--text-primary)]">{entry.action}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {userLabelFromMap(entry.actor_user_id, userMap)} ·{" "}
                  {new Date(entry.created_at).toLocaleString()}
                </p>
                {entry.payload && Object.keys(entry.payload).length > 0 ? (
                  <pre className="mt-2 overflow-x-auto rounded-xl border border-white/6 bg-[var(--bg-shell)] p-3 text-xs text-[var(--text-secondary)]">
                    {JSON.stringify(entry.payload, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Linked submissions
            </CardDescription>
            <CardTitle className="font-heading text-xl">Evidence intake tied to case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissionList.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                No submissions linked yet.
              </p>
            ) : null}
            {submissionList.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-white/10 bg-white/4">
                    {item.submission_type}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/4">
                    {item.validation_state}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Linked indicators
            </CardDescription>
            <CardTitle className="font-heading text-xl">IOCs observed in this case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {indicatorList.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                No indicators linked yet.
              </p>
            ) : null}
            {indicatorList.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-white/10 bg-white/4">
                    {item.indicator_type}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/4">
                    {item.status}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/4">
                    {item.confidence}% confidence
                  </Badge>
                </div>
                <p className="font-mono-ui mt-2 break-all text-xs text-[var(--text-secondary)]">
                  {item.indicator_value}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Last seen {new Date(item.last_seen_at).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
