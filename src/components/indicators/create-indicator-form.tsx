"use client";

import { useActionState } from "react";

import {
  createIndicatorAction,
  type IndicatorActionState,
} from "@/app/(app)/indicators/actions";
import {
  indicatorStatusOptions,
  indicatorTypeOptions,
  type IndicatorType,
} from "@/lib/workflow";

type CaseOption = {
  id: string;
  caseNumber: string;
  title: string;
};

type CreateIndicatorFormProps = {
  caseOptions: CaseOption[];
};

const initialState: IndicatorActionState = {
  status: "idle",
  message: "",
};

const exampleValueByType: Record<IndicatorType, string> = {
  sha256: "e3b0c44298fc1c149afbf4c8996fb924...",
  domain: "malicious-control.example",
  ipv4: "185.44.12.90",
  url: "https://bad.example/payload",
  email: "spoofed@sender.example",
  filename: "invoice_loader.exe",
};

export function CreateIndicatorForm({ caseOptions }: CreateIndicatorFormProps) {
  const [state, action, isPending] = useActionState(
    createIndicatorAction,
    initialState
  );

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="indicatorType"
            className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Indicator type
          </label>
          <select
            id="indicatorType"
            name="indicatorType"
            defaultValue="domain"
            className="h-10 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            {indicatorTypeOptions.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {typeOption}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="new"
            className="h-10 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            {indicatorStatusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="indicatorValue"
          className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Indicator value
        </label>
        <input
          id="indicatorValue"
          name="indicatorValue"
          required
          minLength={2}
          maxLength={1000}
          placeholder={exampleValueByType.domain}
          className="h-10 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="confidence"
            className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Confidence (%)
          </label>
          <input
            id="confidence"
            name="confidence"
            type="number"
            min={1}
            max={100}
            defaultValue={60}
            className="h-10 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="caseId"
            className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
          >
            Link to case
          </label>
          <select
            id="caseId"
            name="caseId"
            defaultValue=""
            className="h-10 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          >
            <option value="">No linked case</option>
            {caseOptions.map((caseOption) => (
              <option key={caseOption.id} value={caseOption.id}>
                {caseOption.caseNumber} · {caseOption.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
        >
          Analyst notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          placeholder="Where this observable was found and why it matters."
          className="w-full rounded-2xl border border-white/10 bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
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
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Add indicator"}
      </button>
    </form>
  );
}
