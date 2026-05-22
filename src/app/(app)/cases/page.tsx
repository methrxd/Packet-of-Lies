import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateCaseForm } from "@/components/cases/create-case-form";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CasePriority, CaseSeverity, CaseStatus } from "@/lib/workflow";

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
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/auth/login");
  }
  if (!hasPermission(auth, "manage_cases")) {
    redirect("/auth/access-denied");
  }

  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("cases")
    .select("id, case_number, title, status, severity, priority, created_at")
    .order("created_at", { ascending: false })
    .limit(32);

  const list = cases ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cases"
        title="Investigation caseboard"
        description="Open a case, assign severity and priority, and move through lifecycle states."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardDescription className="helix-kicker">New case intake</CardDescription>
            <CardTitle>Create investigation</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCaseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="helix-kicker">Queue</CardDescription>
            <CardTitle>Latest cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {list.length === 0 ? (
              <div className="helix-card text-sm text-[var(--text-secondary)]">
                No cases yet. Create the first case from the form.
              </div>
            ) : null}

            {list.map((item) => (
              <div
                key={item.id}
                className="helix-card flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="helix-kicker">{item.case_number}</p>
                  <p className="mt-1 text-base font-medium text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Opened {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/4 px-2 py-1 text-xs">
                    {formatStatus(item.status as CaseStatus)}
                  </span>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${severityClassMap[item.severity as CaseSeverity]}`}>
                    {item.severity}
                  </span>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${priorityClassMap[item.priority as CasePriority]}`}>
                    {item.priority}
                  </span>
                  <Link
                    href={`/cases/${item.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-white/12 bg-[color:rgba(255,255,255,0.03)] px-4 text-xs text-[var(--text-primary)] transition-colors hover:bg-[color:rgba(255,255,255,0.08)]"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
