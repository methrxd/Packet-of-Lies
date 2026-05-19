import { CreateCaseForm } from "@/components/cases/create-case-form";
import { createClient } from "@/lib/supabase/server";
import type { CasePriority, CaseSeverity, CaseStatus } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

const severityClassMap: Record<CaseSeverity, string> = {
  low: "border-white/10 bg-white/4 text-[var(--text-secondary)]",
  medium: "border-[color:rgba(95,156,255,0.2)] bg-[color:rgba(95,156,255,0.1)] text-[var(--state-info)]",
  high: "border-[color:rgba(255,184,0,0.22)] bg-[color:rgba(255,184,0,0.08)] text-[var(--state-warning)]",
  critical:
    "border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] text-[var(--state-critical)]",
};

const priorityClassMap: Record<CasePriority, string> = {
  p0: "border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] text-[var(--state-critical)]",
  p1: "border-[color:rgba(255,184,0,0.22)] bg-[color:rgba(255,184,0,0.08)] text-[var(--state-warning)]",
  p2: "border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary",
  p3: "border-white/10 bg-white/4 text-[var(--text-secondary)]",
};

function formatStatus(status: CaseStatus) {
  return status.replace("_", " ");
}

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("cases")
    .select("id, case_number, title, status, severity, priority, created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  const list = cases ?? [];
  const statusCounts = list.reduce<Record<CaseStatus, number>>(
    (acc, item) => {
      const status = item.status as CaseStatus;
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {
      new: 0,
      triage: 0,
      investigating: 0,
      contained: 0,
      resolved: 0,
      archived: 0,
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cases"
        title="Live investigation queue"
        description="Create and track investigation records with lifecycle status, severity, and priority metadata."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.8fr]">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Create case
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Open a new investigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCaseForm />
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Lifecycle telemetry
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Queue status snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              Object.entries(statusCounts) as Array<[CaseStatus, number]>
            ).map(([status, count]) => (
              <div
                key={status}
                className="rounded-2xl border border-white/6 bg-white/2 p-4"
              >
                <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  {formatStatus(status)}
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                  {count}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/6 bg-[var(--bg-card)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            Active cases
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Latest investigation records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
              No cases yet. Create the first case from the form above.
            </div>
          ) : null}

          {list.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/6 bg-white/2 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  {item.case_number}
                </p>
                <p className="mt-2 text-base font-medium text-[var(--text-primary)]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Opened {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-white/10 bg-white/4">
                  {formatStatus(item.status as CaseStatus)}
                </Badge>
                <Badge
                  variant="outline"
                  className={severityClassMap[item.severity as CaseSeverity]}
                >
                  {item.severity}
                </Badge>
                <Badge
                  variant="outline"
                  className={priorityClassMap[item.priority as CasePriority]}
                >
                  {item.priority}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
