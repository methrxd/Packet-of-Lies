"use client";

import { useActionState, useEffect, useState } from "react";

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

type FormCallbackProps = {
  onSuccess?: () => void;
};

async function validatePdfRealtime(file: File | null) {
  if (!file) {
    return { ok: true, message: "" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: "Only PDF files up to 5 MB are allowed." };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, message: "Only .pdf files are allowed." };
  }

  if (
    file.type !== "application/pdf" &&
    file.type !== "application/octet-stream" &&
    file.type !== ""
  ) {
    return { ok: false, message: "Invalid file type. Please upload a PDF." };
  }

  const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const magic = [0x25, 0x50, 0x44, 0x46, 0x2d];
  const isPdf = magic.every((value, index) => bytes[index] === value);
  if (!isPdf) {
    return { ok: false, message: "Invalid PDF signature." };
  }

  return { ok: true, message: "" };
}

type CaseStatusFormProps = {
  caseId: string;
  currentStatus: CaseStatus;
} & FormCallbackProps;

export function CaseStatusForm({
  caseId,
  currentStatus,
  onSuccess,
}: CaseStatusFormProps) {
  const [state, action, pending] = useActionState(updateCaseStatusAction, initialState);
  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

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
} & FormCallbackProps;

export function CaseAssigneeForm({
  caseId,
  assigneeId,
  options,
  onSuccess,
}: CaseAssigneeFormProps) {
  const [state, action, pending] = useActionState(updateCaseAssigneeAction, initialState);
  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

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
} & FormCallbackProps;

export function CaseFindingForm({ caseId, onSuccess }: CaseEntityFormProps) {
  const [state, action, pending] = useActionState(createCaseFindingAction, initialState);
  const [docError, setDocError] = useState("");
  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

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
      <div className="space-y-2">
        <label
          htmlFor="finding-document"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Attach relevant document (PDF only, max 5MB)
        </label>
        <input
          id="finding-document"
          name="document"
          type="file"
          accept=".pdf,application/pdf"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0] ?? null;
            const result = await validatePdfRealtime(file);
            setDocError(result.ok ? "" : result.message);
            if (!result.ok) {
              event.currentTarget.value = "";
            }
          }}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent-soft)] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-primary"
        />
      </div>
      {docError ? <p className={messageClass("error")}>{docError}</p> : null}
      {state.status !== "idle" ? (
        <p className={messageClass(state.status)}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || Boolean(docError)}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add finding"}
      </button>
    </form>
  );
}

export function CaseMitigationForm({ caseId, onSuccess }: CaseEntityFormProps) {
  const [state, action, pending] = useActionState(createCaseMitigationAction, initialState);
  const [docError, setDocError] = useState("");
  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

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
      <div className="space-y-2">
        <label
          htmlFor="mitigation-document"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Attach relevant document (PDF only, max 5MB)
        </label>
        <input
          id="mitigation-document"
          name="document"
          type="file"
          accept=".pdf,application/pdf"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0] ?? null;
            const result = await validatePdfRealtime(file);
            setDocError(result.ok ? "" : result.message);
            if (!result.ok) {
              event.currentTarget.value = "";
            }
          }}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent-soft)] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-primary"
        />
      </div>
      {docError ? <p className={messageClass("error")}>{docError}</p> : null}
      {state.status !== "idle" ? (
        <p className={messageClass(state.status)}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || Boolean(docError)}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add mitigation"}
      </button>
    </form>
  );
}

export function CaseCommentForm({ caseId, onSuccess }: CaseEntityFormProps) {
  const [state, action, pending] = useActionState(createCaseCommentAction, initialState);
  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

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
