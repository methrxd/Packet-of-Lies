"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

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
import { createClient } from "@/lib/supabase/client";
import type { CaseStatus, MitigationStatus } from "@/lib/workflow";

const SNAPSHOT_REFRESH_MS = 5000;
const ACTIVITY_FALLBACK_REFRESH_MS = 5000;
const MAX_ACTIVITY_ROWS = 150;
const MAX_BACKOFF_MS = 20000;

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
  payload: Record<string, string | number | boolean | null>;
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
  indicators: CaseIndicator[];
  assignees: Assignee[];
};

type ActivityPayload = {
  activityLog: CaseActivity[];
};

type CaseDetailLiveProps = {
  initialSnapshot: SnapshotPayload;
  initialActivity: ActivityPayload;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
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
  if (entry.action === "status_changed" || entry.action === "status_updated") {
    return `Status moved from ${entry.payload.from ?? "unknown"} to ${entry.payload.to ?? "unknown"}.`;
  }
  if (entry.action === "assignee_updated") {
    return "Case ownership was updated.";
  }
  if (entry.action === "finding_added") {
    return `${entry.payload.finding_title ?? "New finding"} was recorded.`;
  }
  if (entry.action === "mitigation_added") {
    const title = entry.payload.mitigation_title ?? "Mitigation";
    const status = entry.payload.mitigation_status ? ` (${entry.payload.mitigation_status})` : "";
    return `${title}${status} was added.`;
  }
  if (entry.action === "comment_added") {
    return `${entry.payload.preview ?? "A new analyst note was added."}`;
  }

  return "Case timeline event.";
}

function mergeActivity(existing: CaseActivity[], incoming: CaseActivity[]) {
  const merged = new Map<string, CaseActivity>();
  for (const row of existing) {
    merged.set(row.id, row);
  }
  for (const row of incoming) {
    merged.set(row.id, row);
  }

  return [...merged.values()]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, MAX_ACTIVITY_ROWS);
}

function getBackoffDelayMs(failures: number) {
  const base = Math.min(1000 * 2 ** Math.max(0, failures - 1), MAX_BACKOFF_MS);
  const jitter = Math.floor(Math.random() * 350);
  return base + jitter;
}

export function CaseDetailLive({ initialSnapshot, initialActivity }: CaseDetailLiveProps) {
  const caseId = initialSnapshot.caseRecord.id;
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activity, setActivity] = useState(initialActivity);
  const [snapshotError, setSnapshotError] = useState<string>("");
  const [activityError, setActivityError] = useState<string>("");
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const snapshotInFlightRef = useRef(false);
  const activityInFlightRef = useRef(false);
  const snapshotAbortRef = useRef<AbortController | null>(null);
  const activityAbortRef = useRef<AbortController | null>(null);
  const snapshotRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotFailureCountRef = useRef(0);
  const activityFailureCountRef = useRef(0);
  const refreshSnapshotRef = useRef<() => Promise<void>>(async () => {});
  const refreshActivityRef = useRef<() => Promise<void>>(async () => {});

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

  const assigneeOptions = snapshot.assignees.map((profile) => ({
    id: profile.id,
    label: profile.display_name ?? profile.username ?? profile.email,
  }));

  const refreshSnapshot = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }
    if (snapshotInFlightRef.current) {
      return;
    }

    snapshotInFlightRef.current = true;
    snapshotAbortRef.current?.abort();
    const controller = new AbortController();
    snapshotAbortRef.current = controller;

    try {
      const response = await fetch(`/api/cases/${caseId}/snapshot`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Snapshot refresh failed (${response.status})`);
      }

      const data = (await response.json()) as SnapshotPayload;
      setSnapshot(data);
      setSnapshotError("");
      snapshotFailureCountRef.current = 0;
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      snapshotFailureCountRef.current += 1;
      setSnapshotError(error instanceof Error ? error.message : "Snapshot refresh failed.");
      if (!snapshotRetryTimerRef.current) {
        const delay = getBackoffDelayMs(snapshotFailureCountRef.current);
        snapshotRetryTimerRef.current = setTimeout(() => {
          snapshotRetryTimerRef.current = null;
          void refreshSnapshotRef.current();
        }, delay);
      }
    } finally {
      if (snapshotAbortRef.current === controller) {
        snapshotAbortRef.current = null;
      }
      snapshotInFlightRef.current = false;
    }
  }, [caseId]);

  const refreshActivity = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }
    if (activityInFlightRef.current) {
      return;
    }

    activityInFlightRef.current = true;
    activityAbortRef.current?.abort();
    const controller = new AbortController();
    activityAbortRef.current = controller;

    try {
      const response = await fetch(`/api/cases/${caseId}/activity`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Activity refresh failed (${response.status})`);
      }

      const data = (await response.json()) as ActivityPayload;
      setActivity((current) => ({
        activityLog: mergeActivity(current.activityLog, data.activityLog),
      }));
      setActivityError("");
      activityFailureCountRef.current = 0;
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      activityFailureCountRef.current += 1;
      setActivityError(error instanceof Error ? error.message : "Activity refresh failed.");
      if (!activityRetryTimerRef.current) {
        const delay = getBackoffDelayMs(activityFailureCountRef.current);
        activityRetryTimerRef.current = setTimeout(() => {
          activityRetryTimerRef.current = null;
          void refreshActivityRef.current();
        }, delay);
      }
    } finally {
      if (activityAbortRef.current === controller) {
        activityAbortRef.current = null;
      }
      activityInFlightRef.current = false;
    }
  }, [caseId]);

  useEffect(() => {
    refreshSnapshotRef.current = refreshSnapshot;
  }, [refreshSnapshot]);

  useEffect(() => {
    refreshActivityRef.current = refreshActivity;
  }, [refreshActivity]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshSnapshot();
    }, SNAPSHOT_REFRESH_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [refreshSnapshot]);

  useEffect(() => {
    if (isRealtimeConnected) {
      return;
    }
    const id = window.setInterval(() => {
      void refreshActivity();
    }, ACTIVITY_FALLBACK_REFRESH_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [isRealtimeConnected, refreshActivity]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) {
        void refreshSnapshot();
        void refreshActivity();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refreshActivity, refreshSnapshot]);

  useEffect(() => {
    const client = createClient();
    let channel: RealtimeChannel | null = null;

    channel = client
      .channel(`case-activity:${caseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "case_activity_log",
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          const newRow = payload.new as CaseActivity;
          setActivity((current) => ({
            activityLog: mergeActivity([newRow], current.activityLog),
          }));
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      if (channel) {
        void client.removeChannel(channel);
      }
    };
  }, [caseId]);

  useEffect(() => {
    return () => {
      snapshotAbortRef.current?.abort();
      activityAbortRef.current?.abort();
      if (snapshotRetryTimerRef.current) {
        clearTimeout(snapshotRetryTimerRef.current);
      }
      if (activityRetryTimerRef.current) {
        clearTimeout(activityRetryTimerRef.current);
      }
    };
  }, []);

  const createdByLabel = userMap.get(snapshot.caseRecord.created_by) ?? "Unknown user";
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
            {snapshotError ? (
              <p className="text-xs text-[var(--state-warning)]">{snapshotError}</p>
            ) : null}
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
                      Attached PDF: {finding.document_name} |{" "}
                      {Math.ceil((finding.document_size ?? 0) / 1024)} KB
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userMap.get(finding.created_by) ?? "Unknown user"} |{" "}
                    {formatDateTime(finding.created_at)}
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
                      Attached PDF: {mitigation.document_name} |{" "}
                      {Math.ceil((mitigation.document_size ?? 0) / 1024)} KB
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {userMap.get(mitigation.created_by) ?? "Unknown user"} |{" "}
                    {formatDateTime(mitigation.created_at)}
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
                    {userMap.get(comment.created_by) ?? "Unknown user"} |{" "}
                    {formatDateTime(comment.created_at)}
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
            {activityError ? (
              <p className="text-xs text-[var(--state-warning)]">{activityError}</p>
            ) : null}
            <div className="h-[560px] overflow-y-auto rounded-2xl border border-white/6 bg-[color:rgba(0,0,0,0.42)] p-3">
              {activity.activityLog.length === 0 ? (
                <p className="rounded-xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
                  No activity logged yet.
                </p>
              ) : null}
              <div className="space-y-2">
                {activity.activityLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-white/6 bg-[color:rgba(7,12,11,0.75)] px-3 py-2"
                  >
                    <p className="font-mono-ui text-[11px] tracking-[0.08em] text-[var(--text-muted)] uppercase">
                      {formatDateTime(entry.created_at)}
                    </p>
                    <p className="mt-1 font-mono-ui text-[13px] text-[var(--text-primary)]">
                      {formatActionLabel(entry.action)}: {payloadSummary(entry)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      By {userMap.get(entry.actor_user_id) ?? "Unknown user"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
  );
}
