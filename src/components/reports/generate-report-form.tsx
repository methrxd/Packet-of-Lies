"use client";

import { useActionState } from "react";

import {
  generateCaseReportAction,
  type ReportActionState,
} from "@/app/(app)/reports/actions";

type CaseOption = {
  id: string;
  caseNumber: string;
  title: string;
};

type GenerateReportFormProps = {
  caseOptions: CaseOption[];
};

const initialState: ReportActionState = {
  status: "idle",
  message: "",
};

export function GenerateReportForm({ caseOptions }: GenerateReportFormProps) {
  const [state, action, isPending] = useActionState(
    generateCaseReportAction,
    initialState
  );

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2">
        <label
          htmlFor="caseId"
          className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Investigation case
        </label>
        <select
          id="caseId"
          name="caseId"
          required
          defaultValue=""
          className="h-10 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
        >
          <option value="" disabled>
            Select a case
          </option>
          {caseOptions.map((caseOption) => (
            <option key={caseOption.id} value={caseOption.id}>
              {caseOption.caseNumber} | {caseOption.title}
            </option>
          ))}
        </select>
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
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Generating..." : "Generate report"}
      </button>
    </form>
  );
}
