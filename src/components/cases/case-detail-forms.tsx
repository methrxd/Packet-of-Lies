"use client";

import { useActionState } from "react";

import {
  createCaseCommentAction,
  createCaseFindingAction,
  createCaseMitigationAction,
  updateCaseAssigneeAction,
  updateCaseStatusAction,
  type CaseDetailActionState,
} from "@/app/(app)/cases/[caseId]/actions";
import {
  caseStatusOptions,
  mitigationStatusOptions,
  type CaseStatus,
  type MitigationStatus,
} from "@/lib/workflow";

const initialState: CaseDetailActionState = {
  status: "idle",
  message: "",
};

function messageClass(status: CaseDetailActionState["status"]) {
  if (status === "success") {
    return "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary";
  }

  if (status === "error") {
    return "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]";
  }

  return "";
}

type UserOption = {
  id: string;
  label: string;
};

type CaseStatusFormProps = {
  caseId: string;
  currentStatus: CaseStatus;
};

export function CaseStatusForm({ caseId, currentStatus }: CaseStatusFormProps) {
  const [state, action, pending] = useActionState(updateCaseStatusAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <label
        htmlFor="status"
        className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
      >
        Case status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={currentStatus}
        className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      >
        {caseStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {state.status !== "idle" ? (
        <p className={messageClass(state.status)}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Updating..." : "Update status"}
      </button>
    </form>
  );
}

type CaseAssigneeFormProps = {
  caseId: string;
  assigneeId: string | null;
  options: UserOption[];
};

export function CaseAssigneeForm({ caseId, assigneeId, options }: CaseAssigneeFormProps) {
  const [state, action, pending] = useActionState(updateCaseAssigneeAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <label
        htmlFor="assigneeId"
        className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
      >
        Assignee
      </label>
      <select
        id="assigneeId"
        name="assigneeId"
        defaultValue={assigneeId ?? ""}
        className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      >
        <option value="">Unassigned</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {state.status !== "idle" ? (
        <p className={messageClass(state.status)}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Updating..." : "Update assignee"}
      </button>
    </form>
  );
}

type CaseEntityFormProps = {
  caseId: string;
};

export function CaseFindingForm({ caseId }: CaseEntityFormProps) {
  const [state, action, pending] = useActionState(createCaseFindingAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <input
        name="title"
        type="text"
        required
        minLength={6}
        placeholder="Finding title"
        className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      />
      <textarea
        name="detail"
        required
        minLength={10}
        rows={4}
        placeholder="What does this evidence prove?"
        className="w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      />
      {state.status !== "idle" ? (
        <p className={messageClass(state.status)}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add finding"}
      </button>
    </form>
  );
}

export function CaseMitigationForm({ caseId }: CaseEntityFormProps) {
  const [state, action, pending] = useActionState(createCaseMitigationAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <input
        name="title"
        type="text"
        required
        minLength={6}
        placeholder="Mitigation title"
        className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      />
      <textarea
        name="detail"
        required
        minLength={10}
        rows={4}
        placeholder="What action is required and why?"
        className="w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      />
      <select
        name="status"
        defaultValue={"planned" as MitigationStatus}
        className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      >
        {mitigationStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {state.status !== "idle" ? (
        <p className={messageClass(state.status)}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add mitigation"}
      </button>
    </form>
  );
}

export function CaseCommentForm({ caseId }: CaseEntityFormProps) {
  const [state, action, pending] = useActionState(createCaseCommentAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <textarea
        name="body"
        required
        minLength={3}
        rows={4}
        placeholder="Add a timeline note or analyst handoff context."
        className="w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
      />
      {state.status !== "idle" ? (
        <p className={messageClass(state.status)}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add comment"}
      </button>
    </form>
  );
}
