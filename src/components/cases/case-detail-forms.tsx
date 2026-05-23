"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  createCaseCommentAction,
  createCaseFindingAction,
  createCaseMitigationAction,
  refreshCaseAnalysisRunAction,
  runCaseAnalysisLiveAction,
  updateCaseAssigneeAction,
  updateCaseStatusAction,
  useCachedAnalysisRunAction,
  type CaseDetailActionState,
} from "@/app/(app)/cases/[caseId]/actions";
import {
  detectAnalysisInputType,
  type AnalysisProvider,
} from "@/lib/malware-analysis/types";
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

function useTriggerOnSuccess(
  status: CaseDetailActionState["status"],
  onSuccess?: () => void
) {
  const onSuccessRef = useRef(onSuccess);
  const previousStatusRef = useRef<CaseDetailActionState["status"]>("idle");

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (status === "success" && previousStatusRef.current !== "success") {
      onSuccessRef.current?.();
    }
    previousStatusRef.current = status;
  }, [status]);
}

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
  useTriggerOnSuccess(state.status, onSuccess);

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
  useTriggerOnSuccess(state.status, onSuccess);

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
  useTriggerOnSuccess(state.status, onSuccess);

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
  useTriggerOnSuccess(state.status, onSuccess);

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
  useTriggerOnSuccess(state.status, onSuccess);

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

type AnalysisProviderOption = {
  key: AnalysisProvider;
  label: string;
  configured: boolean;
};

type CaseAnalysisHubFormProps = {
  caseId: string;
  providers: AnalysisProviderOption[];
  latestRunningRunId: string | null;
} & FormCallbackProps;

export function CaseAnalysisHubForm({
  caseId,
  providers,
  latestRunningRunId,
  onSuccess,
}: CaseAnalysisHubFormProps) {
  const [liveState, liveAction, livePending] = useActionState(
    runCaseAnalysisLiveAction,
    initialState
  );
  const [cacheState, cacheAction, cachePending] = useActionState(
    useCachedAnalysisRunAction,
    initialState
  );
  const [refreshState, refreshAction, refreshPending] = useActionState(
    refreshCaseAnalysisRunAction,
    initialState
  );

  useTriggerOnSuccess(liveState.status, onSuccess);
  useTriggerOnSuccess(cacheState.status, onSuccess);
  useTriggerOnSuccess(refreshState.status, onSuccess);

  const defaultProvider = providers.find((provider) => provider.configured)?.key ?? "virustotal";
  const [inputValue, setInputValue] = useState("");
  const detectedInputType = detectAnalysisInputType(inputValue);
  const detectedInputTypeLabel =
    detectedInputType === "url"
      ? "URL"
      : detectedInputType === "hash"
        ? "Hash"
        : "Sample reference";

  return (
    <div className="space-y-3">
      <form action={liveAction} className="space-y-3">
        <input type="hidden" name="caseId" value={caseId} />
        <input type="hidden" name="inputType" value={detectedInputType} />
        <div className="grid gap-3 md:grid-cols-2">
          <select
            name="provider"
            defaultValue={defaultProvider}
            className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            {providers.map((provider) => (
              <option key={provider.key} value={provider.key}>
                {provider.label} {provider.configured ? "" : "(not configured)"}
              </option>
            ))}
          </select>
          <div className="flex h-11 items-center justify-between rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm">
            <span className="text-[var(--text-muted)]">Detected input</span>
            <span className="font-medium text-[var(--text-primary)]">{detectedInputTypeLabel}</span>
          </div>
        </div>
        <input
          name="inputValue"
          type="text"
          required
          minLength={6}
          placeholder="Enter hash, URL, or sample reference"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
        />

        {liveState.status !== "idle" ? (
          <p className={messageClass(liveState.status)}>{liveState.message}</p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="submit"
            disabled={livePending}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {livePending ? "Submitting..." : "Run live analysis"}
          </button>

          <button
            formAction={cacheAction}
            disabled={cachePending}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/12 bg-white/4 px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cachePending ? "Applying..." : "Use cached completed run"}
          </button>
        </div>
      </form>

      {cacheState.status !== "idle" ? (
        <p className={messageClass(cacheState.status)}>{cacheState.message}</p>
      ) : null}

      {latestRunningRunId ? (
        <form action={refreshAction} className="space-y-2">
          <input type="hidden" name="caseId" value={caseId} />
          <input type="hidden" name="runId" value={latestRunningRunId} />
          {refreshState.status !== "idle" ? (
            <p className={messageClass(refreshState.status)}>{refreshState.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={refreshPending}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-white/12 bg-white/4 px-4 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshPending ? "Refreshing..." : "Refresh latest running job"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
