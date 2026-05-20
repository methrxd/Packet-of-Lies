"use client";

import { useActionState } from "react";

import {
  createSubmissionAction,
  type SubmissionActionState,
} from "@/app/(app)/submissions/actions";
import type { SubmissionType } from "@/lib/workflow";

type CaseOption = {
  id: string;
  caseNumber: string;
  title: string;
};

type CreateSubmissionFormProps = {
  caseOptions: CaseOption[];
};

const initialState: SubmissionActionState = {
  status: "idle",
  message: "",
};

const submissionTypes: SubmissionType[] = [
  "file",
  "url",
  "domain",
  "ip",
  "email_artifact",
  "manual_incident",
];

export function CreateSubmissionForm({ caseOptions }: CreateSubmissionFormProps) {
  const [state, action, isPending] = useActionState(
    createSubmissionAction,
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="submissionType"
            className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Submission type
          </label>
          <select
            id="submissionType"
            name="submissionType"
            defaultValue="file"
            className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            {submissionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="caseId"
            className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Link to case
          </label>
          <select
            id="caseId"
            name="caseId"
            defaultValue=""
            className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            <option value="">No case linked yet</option>
            {caseOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.caseNumber} - {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="title"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Submission title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={6}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="Suspicious attachment from payroll mailbox"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="evidenceFile"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Evidence file (PDF/JPG/PNG, max 5MB)
        </label>
        <input
          id="evidenceFile"
          name="evidenceFile"
          type="file"
          required
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent-soft)] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-primary"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="rawValue"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Primary artifact value (optional)
        </label>
        <input
          id="rawValue"
          name="rawValue"
          type="text"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="sha256, URL, domain, sender, or leave empty to use file name"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="font-mono-ui text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Analyst context
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-white/2 px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="How this evidence was received and why it is suspicious."
        />
      </div>

      {state.status !== "idle" ? (
        <p
          className={
            state.status === "success"
              ? "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary"
              : "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]"
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Create submission"}
      </button>
    </form>
  );
}
