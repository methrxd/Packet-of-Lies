import { redirect } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { CreateIndicatorForm } from "@/components/indicators/create-indicator-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { IndicatorStatus, IndicatorType } from "@/lib/workflow";

const typeBadgeClassMap: Record<IndicatorType, string> = {
  sha256:
    "border-[color:rgba(255,184,0,0.22)] bg-[color:rgba(255,184,0,0.08)] text-[var(--state-warning)]",
  domain:
    "border-[color:rgba(95,156,255,0.2)] bg-[color:rgba(95,156,255,0.1)] text-[var(--state-info)]",
  ipv4: "border-[color:rgba(95,156,255,0.2)] bg-[color:rgba(95,156,255,0.1)] text-[var(--state-info)]",
  url: "border-[color:rgba(95,156,255,0.2)] bg-[color:rgba(95,156,255,0.1)] text-[var(--state-info)]",
  email:
    "border-[color:rgba(255,184,0,0.22)] bg-[color:rgba(255,184,0,0.08)] text-[var(--state-warning)]",
  filename: "border-white/10 bg-white/4 text-[var(--text-secondary)]",
};

const statusBadgeClassMap: Record<IndicatorStatus, string> = {
  new: "border-white/10 bg-white/4 text-[var(--text-secondary)]",
  validated: "border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary",
  false_positive:
    "border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] text-[var(--state-critical)]",
};

type IndicatorRow = {
  id: string;
  indicator_type: IndicatorType;
  indicator_value: string;
  confidence: number;
  status: IndicatorStatus;
  source_case_id: string | null;
  last_seen_at: string;
  cases:
    | {
        case_number: string;
        title: string;
      }
    | Array<{
        case_number: string;
        title: string;
      }>
    | null;
};

export default async function IndicatorsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/auth/login");
  }
  if (!hasPermission(auth, "view_indicators")) {
    redirect("/auth/access-denied");
  }

  const supabase = await createClient();
  const [{ data: indicators }, { data: caseOptions }] = await Promise.all([
    supabase
      .from("indicators")
      .select(
        "id, indicator_type, indicator_value, confidence, status, source_case_id, last_seen_at, cases(case_number, title)"
      )
      .order("last_seen_at", { ascending: false })
      .limit(40),
    supabase
      .from("cases")
      .select("id, case_number, title")
      .order("created_at", { ascending: false })
      .limit(120),
  ]);

  const list = (indicators ?? []) as IndicatorRow[];
  const caseSelection =
    caseOptions?.map((item) => ({
      id: item.id,
      caseNumber: item.case_number,
      title: item.title,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Indicators"
        title="Observable intelligence registry"
        description="Track IOCs, link them to investigations, and keep confidence and status up to date."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardDescription className="helix-kicker">New IOC</CardDescription>
            <CardTitle>Add indicator</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateIndicatorForm caseOptions={caseSelection} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="helix-kicker">Latest</CardDescription>
            <CardTitle>Indicator queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {list.length === 0 ? (
              <div className="helix-card text-sm text-[var(--text-secondary)]">
                No indicators recorded yet.
              </div>
            ) : null}
            {list.map((item) => {
              const linkedCase = Array.isArray(item.cases) ? item.cases[0] ?? null : item.cases;
              return (
                <div key={item.id} className="helix-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={typeBadgeClassMap[item.indicator_type]}>
                      {item.indicator_type}
                    </Badge>
                    <Badge variant="outline" className={statusBadgeClassMap[item.status]}>
                      {item.status}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 bg-white/4">
                      {item.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="font-mono-ui mt-3 break-all text-sm text-[var(--text-primary)]">
                    {item.indicator_value}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {linkedCase
                      ? `Linked to ${linkedCase.case_number} (${linkedCase.title})`
                      : "No case linked"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Last seen {new Date(item.last_seen_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

