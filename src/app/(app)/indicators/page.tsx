import { CreateIndicatorForm } from "@/components/indicators/create-indicator-form";
import { createClient } from "@/lib/supabase/server";
import type { IndicatorStatus, IndicatorType } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

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
  validated:
    "border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary",
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
      .limit(100),
  ]);

  const list = (indicators ?? []) as IndicatorRow[];
  const linkedCount = list.filter((indicator) => indicator.source_case_id).length;
  const validatedCount = list.filter(
    (indicator) => indicator.status === "validated"
  ).length;

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
        description="Capture, validate, and correlate indicators across submissions and investigations with deduplicated observable tracking."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.8fr]">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              New indicator
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Register observable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateIndicatorForm caseOptions={caseSelection} />
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Registry telemetry
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Current intelligence state
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Total indicators
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                {list.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Validated
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                {validatedCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Linked to cases
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                {linkedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/6 bg-[var(--bg-card)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            Observable queue
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Latest indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
              No indicators yet. Create the first observable from the form above.
            </div>
          ) : null}

          {list.map((item) => {
            const linkedCase = Array.isArray(item.cases)
              ? item.cases[0] ?? null
              : item.cases;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/6 bg-white/2 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={typeBadgeClassMap[item.indicator_type]}
                  >
                    {item.indicator_type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={statusBadgeClassMap[item.status]}
                  >
                    {item.status}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/4">
                    {item.confidence}% confidence
                  </Badge>
                </div>
                <p className="font-mono-ui mt-3 break-all text-sm text-[var(--text-primary)]">
                  {item.indicator_value}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {linkedCase
                    ? `Linked to ${linkedCase.case_number} (${linkedCase.title})`
                    : "No case linked"}
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Last seen {new Date(item.last_seen_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
