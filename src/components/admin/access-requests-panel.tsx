"use client";

import { useActionState } from "react";

import {
  approveAccessRequestAction,
  rejectAccessRequestAction,
  type AccessRequestActionState,
} from "@/app/(app)/admin/actions";

type RoleDefinition = {
  id: string;
  name: string;
  description: string | null;
};

type AccessRequestRecord = {
  id: string;
  email: string;
  fullName: string;
  organization: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
};

type AccessRequestsPanelProps = {
  requests: AccessRequestRecord[];
  roles: RoleDefinition[];
};

const initialState: AccessRequestActionState = {
  status: "idle",
  message: "",
};

function statusClass(status: AccessRequestActionState["status"]) {
  if (status === "success") {
    return "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary";
  }
  return "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]";
}

export function AccessRequestsPanel({
  requests,
  roles,
}: AccessRequestsPanelProps) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveAccessRequestAction,
    initialState
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectAccessRequestAction,
    initialState
  );

  const defaultRoleId = roles.find((role) => role.name === "analyst")?.id ?? roles[0]?.id ?? "";

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="helix-card text-sm text-[var(--text-secondary)]">
          No pending access requests.
        </div>
      ) : null}

      {requests.map((request) => (
        <div key={request.id} className="rounded-2xl border border-white/8 bg-[var(--bg-card)] p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{request.fullName}</p>
            <p className="text-sm text-[var(--text-secondary)]">{request.email}</p>
            <p className="text-xs text-[var(--text-muted)]">
              Requested {new Date(request.requestedAt).toLocaleString()}
            </p>
            {request.organization ? (
              <p className="text-xs text-[var(--text-muted)]">Organization: {request.organization}</p>
            ) : null}
          </div>

          {request.message ? (
            <p className="mt-3 rounded-xl border border-white/8 bg-white/2 px-3 py-2 text-sm text-[var(--text-secondary)]">
              {request.message}
            </p>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <form action={approveAction} className="grid gap-3 rounded-xl border border-white/8 bg-white/2 p-3">
              <input type="hidden" name="requestId" value={request.id} />
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <select
                  name="roleId"
                  defaultValue={defaultRoleId}
                  className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <input
                  name="reviewNotes"
                  maxLength={500}
                  placeholder="Optional approval note"
                  className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={approvePending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {approvePending ? "Approving..." : "Approve and email join code"}
              </button>
            </form>

            <form action={rejectAction} className="flex items-center gap-2">
              <input type="hidden" name="requestId" value={request.id} />
              <input
                name="reviewNotes"
                maxLength={500}
                placeholder="Rejection note (optional)"
                className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none"
              />
              <button
                type="submit"
                disabled={rejectPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[color:rgba(255,57,57,0.5)] bg-[color:rgba(255,57,57,0.16)] px-3 text-sm font-medium text-[var(--state-critical)] transition-colors hover:bg-[color:rgba(255,57,57,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejectPending ? "Rejecting..." : "Reject"}
              </button>
            </form>
          </div>
        </div>
      ))}

      {approveState.status !== "idle" ? (
        <p className={statusClass(approveState.status)}>{approveState.message}</p>
      ) : null}
      {rejectState.status !== "idle" ? (
        <p className={statusClass(rejectState.status)}>{rejectState.message}</p>
      ) : null}
    </div>
  );
}

