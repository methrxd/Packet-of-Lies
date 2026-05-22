import Link from "next/link";
import { ArrowUpRight, Radar, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { CaseStatus } from "@/lib/workflow";

type CaseLite = {
  id: string;
  case_number: string;
  title: string;
  status: CaseStatus;
  updated_at: string;
};

const statusClass: Record<CaseStatus, string> = {
  new: "border-white/10 bg-white/5 text-[var(--text-secondary)]",
  triage: "border-[color:rgba(95,156,255,0.25)] bg-[color:rgba(95,156,255,0.12)] text-[var(--state-info)]",
  investigating:
    "border-[color:rgba(2,249,109,0.25)] bg-[color:rgba(2,249,109,0.12)] text-primary",
  contained:
    "border-[color:rgba(255,184,0,0.25)] bg-[color:rgba(255,184,0,0.12)] text-[var(--state-warning)]",
  resolved: "border-white/10 bg-white/5 text-[var(--text-secondary)]",
  archived: "border-white/10 bg-white/5 text-[var(--text-muted)]",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: caseCount },
    { count: openCaseCount },
    { count: indicatorCount },
    { count: reportCount },
    { data: latestCases },
    { data: latestActivity },
  ] = await Promise.all([
    supabase.from("cases").select("id", { count: "exact", head: true }),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "triage", "investigating", "contained"]),
    supabase.from("indicators").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }),
    supabase
      .from("cases")
      .select("id, case_number, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("case_activity_log")
      .select("id, action, created_at")
      .order("created_at", { ascending: false })
      .limit(9),
  ]);

  const metrics = [
    { label: "Cases", value: caseCount ?? 0, icon: Workflow },
    { label: "Open", value: openCaseCount ?? 0, icon: Radar },
    { label: "Indicators", value: indicatorCount ?? 0, icon: Sparkles },
    { label: "Reports", value: reportCount ?? 0, icon: ShieldCheck },
  ];

  const caseRows = (latestCases ?? []) as CaseLite[];
  const activityRows = latestActivity ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command Center"
        title="Malware analysis and mitigation workspace"
        description="Live case operations, evidence logging, and response tracking."
        actions={
          <Button className="h-10 rounded-full bg-primary px-4 text-primary-foreground hover:bg-[var(--accent-primary-hover)]">
            <Link href="/cases" className="inline-flex items-center gap-2">
              Open caseboard
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={metric.label} className="overflow-hidden">
            <div className="helix-grid-lines opacity-10" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between">
              <p className="helix-kicker">{`0${index + 1}`} {metric.label}</p>
              <metric.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="font-mono-ui text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Active case stream</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {caseRows.length === 0 ? (
              <p className="helix-card text-sm text-[var(--text-secondary)]">No cases yet.</p>
            ) : null}
            {caseRows.map((item) => (
              <Link
                key={item.id}
                href={`/cases/${item.id}`}
                className="helix-card flex items-center justify-between transition-colors hover:bg-[color:rgba(255,255,255,0.06)]"
              >
                <div>
                  <p className="helix-kicker">{item.case_number}</p>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Updated {new Date(item.updated_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className={statusClass[item.status]}>
                  {item.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activityRows.length === 0 ? (
                <p className="helix-card text-sm text-[var(--text-secondary)]">No events yet.</p>
              ) : null}
              {activityRows.map((row) => (
                <div key={row.id} className="helix-card">
                  <p className="font-mono-ui text-[11px] uppercase text-[var(--text-primary)]">
                    {row.action.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
