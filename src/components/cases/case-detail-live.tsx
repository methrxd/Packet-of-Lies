"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/app/page-header";
import {
  CaseAssigneeForm,
  CaseCommentForm,
  CaseFindingForm,
  CaseMitigationForm,
  CaseStatusForm,
} from "@/components/cases/case-detail-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CaseStatus, MitigationStatus, SubmissionType } from "@/lib/workflow";

type Assignee = {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
};

type CaseRecord = {
  id: string;
  case_number: string;
  title: string;
  summary: string | null;
  status: CaseStatus;
  severity: string;
  priority: string;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

type Finding = {
  id: string;
  title: string;
  detail: string;
  created_by: string;
  created_at: string;
  document_name: string | null;
  document_size: number | null;
};

type Mitigation = {
  id: string;
  title: string;
  detail: string;
  status: MitigationStatus;
  created_by: string;
  created_at: string;
  document_name: string | null;
  document_size: number | null;
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

type SnapshotPayload = {
  caseRecord: CaseRecord;
  findings: Finding[];
  mitigations: Mitigation[];
  comments: CaseComment[];
  submissions: CaseSubmission[];
  indicators: CaseIndicator[];
  assignees: Assignee[];
};

type ActivityPayload = {
  activityLog: CaseActivity[];
  assignees: Assignee[];
};

type CaseDetailLiveProps = {
  initialSnapshot: SnapshotPayload;
  initialActivity: ActivityPayload;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatActionLabel(action: string) {
  const mapping: Record<string, string> = {
    status_changed: "Status changed",
    status_updated: "Status updated",
    assignee_updated: "Assignee updated",
    finding_added: "Finding added",
    mitigation_added: "Mitigation added",
    comment_added: "Comment added",
  };

  return mapping[action] ?? action.replaceAll("_", " ");
}

function payloadSummary(entry: CaseActivity) {
  if (entry.action === "status_changed") {
    return `${entry.payload.from ?? "unknown"} -> ${entry.payload.to ?? "unknown"}`;
  }
  if (entry.action === "assignee_updated") {
    return "Case ownership updated";
  }
  if (entry.action === "finding_added") {
    return entry.payload.finding_title ?? "New finding recorded";
  }
  if (entry.action === "mitigation_added") {
    const title = entry.payload.mitigation_title ?? "Mitigation recorded";
    const status = entry.payload.mitigation_status ? ` (${entry.payload.mitigation_status})` : "";
    return `${title}${status}`;
  }
  if (entry.action === "comment_added") {
    return entry.payload.preview ?? "New comment";
  }

  return "Case timeline event";
}

export function CaseDetailLive({ initialSnapshot, initialActivity }: CaseDetailLiveProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activity, setActivity] = useState(initialActivity);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const userMap = useMemo(
    () =>
      new Map(
        snapshot.assignees.map((profile) => [
          profile.id,
          profile.display_name ?? profile.username ?? profile.email,
        ])
      ),
    [snapshot.assignees]
  );

  const activityUserMap = useMemo(
    () =>
      new Map(
        activity.assignees.map((profile) => [
          profile.id,
          profile.display_name ?? profile.username ?? profile.email,
        ])
      ),
    [activity.assignees]
  );

  const assigneeOptions = snapshot.assignees.map((profile) => ({
    id: profile.id,
    label: profile.display_name ?? profile.username ?? profile.email,
  }));

  const refreshSnapshot = useCallback(async () => {
    setLoadingSnapshot(true);
    try {
      const response = await fetch(`/api/cases/${snapshot.caseRecord.id}/snapshot`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as SnapshotPayload;
      setSnapshot(data);
    } finally {
      setLoadingSnapshot(false);
    }
  }, [snapshot.caseRecord.id]);

  const refreshActivity = useCallback(async () => {
    setLoadingActivity(true);
    try {
      const response = await fetch(`/api/cases/${snapshot.caseRecord.id}/activity`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as ActivityPayload;
      setActivity(data);
    } finally {
      setLoadingActivity(false);
    }
  }, [snapshot.caseRecord.id]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshSnapshot();
    }, 5000);
    return () => window.clearInterval(id);
  }, [refreshSnapshot]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshActivity();
    }, 1000);
    return () => window.clearInterval(id);
  }, [refreshActivity]);

  const createdByLabel =
    userMap.get(snapshot.caseRecord.created_by) ?? "Unknown user";
  const assignedToLabel = snapshot.caseRecord.assigned_to
    ? (userMap.get(snapshot.caseRecord.assigned_to) ?? "Unknown user")
    : "Unassigned";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={snapshot.caseRecord.case_number}
        title={snapshot.caseRecord.title}
        description={
          snapshot.caseRecord.summary ||
          "No summary yet. Add findings, response actions, and comments to build the incident narrative."
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
            <CaseStatusForm
              caseId={snapshot.caseRecord.id}
              currentStatus={snapshot.caseRecord.status}
              onSuccess={() => {
                void refreshSnapshot();
                void refreshActivity();
              }}
            />
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
              caseId={snapshot.caseRecord.id}
              assigneeId={snapshot.caseRecord.assigned_to}
              options={assigneeOptions}
              onSuccess={() => {
                void refreshSnapshot();
                void refreshActivity();
              }}
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
                {snapshot.caseRecord.status}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/4">
                {snapshot.caseRecord.severity}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/4">
                {snapshot.caseRecord.priority}
              </Badge>
            </div>
            <p>
              <span className="text-[var(--text-muted)]">Last updated:</span>{" "}
              {formatDateTime(snapshot.caseRecord.updated_at)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {loadingSnapshot ? "Refreshing every 5s..." : "Live refresh: every 5 seconds"}
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
            <CaseFindingForm
              caseId={snapshot.caseRecord.id}
              onSuccess={() => {
                void refreshSnapshot();
                void refreshActivity();
              }}
            />
            <div className="space-y-3">
              {snapshot.findings.length === 0 ? (
                <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No findings recorded yet.
                </p>
              ) : null}
              {snapshot.findings.map((finding) => (
                <div key={finding.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{finding.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{finding.detail}</p>
                  {finding.document_name ? (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Attached PDF: {finding.document_name} · {Math.ceil((finding.document_size ?? 0) / 1024)} KB
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userMap.get(finding.created_by) ?? "Unknown user"} · {formatDateTime(finding.created_at)}
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
            <CaseMitigationForm
              caseId={snapshot.caseRecord.id}
              onSuccess={() => {
                void refreshSnapshot();
                void refreshActivity();
              }}
            />
            <div className="space-y-3">
              {snapshot.mitigations.length === 0 ? (
                <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No mitigation steps recorded yet.
                </p>
              ) : null}
              {snapshot.mitigations.map((mitigation) => (
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
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{mitigation.detail}</p>
                  {mitigation.document_name ? (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Attached PDF: {mitigation.document_name} · {Math.ceil((mitigation.document_size ?? 0) / 1024)} KB
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userMap.get(mitigation.created_by) ?? "Unknown user"} · {formatDateTime(mitigation.created_at)}
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
            <CaseCommentForm
              caseId={snapshot.caseRecord.id}
              onSuccess={() => {
                void refreshSnapshot();
                void refreshActivity();
              }}
            />
            <div className="space-y-3">
              {snapshot.comments.length === 0 ? (
                <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No comments yet.
                </p>
              ) : null}
              {snapshot.comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">{comment.body}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userMap.get(comment.created_by) ?? "Unknown user"} · {formatDateTime(comment.created_at)}
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
            <CardTitle className="font-heading text-xl">Live activity log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              {loadingActivity ? "Refreshing..." : "Live refresh: near-instant (1 second)"}
            </p>
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {activity.activityLog.length === 0 ? (
                <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No activity logged yet.
                </p>
              ) : null}
              {activity.activityLog.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/6 bg-white/2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatActionLabel(entry.action)}
                    </p>
                    <Badge variant="outline" className="border-white/10 bg-white/4 text-[var(--text-muted)]">
                      {formatDateTime(entry.created_at)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {payloadSummary(entry)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    By {activityUserMap.get(entry.actor_user_id) ?? "Unknown user"}
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
              Linked submissions
            </CardDescription>
            <CardTitle className="font-heading text-xl">Existing global submission links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.submissions.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                No submissions linked yet.
              </p>
            ) : null}
            {snapshot.submissions.map((item) => (
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
                <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(item.created_at)}</p>
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
            {snapshot.indicators.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                No indicators linked yet.
              </p>
            ) : null}
            {snapshot.indicators.map((item) => (
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
                  Last seen {formatDateTime(item.last_seen_at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
