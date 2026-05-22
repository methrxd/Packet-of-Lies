import { GenerateReportForm } from "@/components/reports/generate-report-form";
import { redirect } from "next/navigation";

import { getAuthContext, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

type ReportRow = {
  id: string;
  title: string;
  summary: string;
  findings: Array<{
    type: string;
    title: string;
    detail: string;
  }>;
  recommendations: string;
  generated_at: string;
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

export default async function ReportsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/auth/login");
  }
  if (!hasPermission(auth, "view_reports")) {
    redirect("/auth/access-denied");
  }

  const supabase = await createClient();
  const [{ data: caseOptions }, { data: reports }] = await Promise.all([
    supabase
      .from("cases")
      .select("id, case_number, title")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("reports")
      .select(
        "id, title, summary, findings, recommendations, generated_at, cases(case_number, title)"
      )
      .order("generated_at", { ascending: false })
      .limit(20),
  ]);

  const caseSelection =
    caseOptions?.map((item) => ({
      id: item.id,
      caseNumber: item.case_number,
      title: item.title,
    })) ?? [];

  const reportList = (reports ?? []) as ReportRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Report studio"
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.9fr]">
        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Generate
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              New report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GenerateReportForm caseOptions={caseSelection} />
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[var(--bg-card)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Metrics
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Stored reports
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Total reports
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                {reportList.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Cases covered
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                {new Set(reportList.map((report) => report.title.split(" - ")[0])).size}
              </p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Last generated
              </p>
              <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
                {reportList[0]
                  ? new Date(reportList[0].generated_at).toLocaleString()
                  : "n/a"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/6 bg-[var(--bg-card)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            Queue
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Latest reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportList.length === 0 ? (
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm text-[var(--text-secondary)]">
              No reports yet. Generate the first case report from the panel above.
            </div>
          ) : null}

          {reportList.map((report) => {
            const linkedCase = Array.isArray(report.cases)
              ? report.cases[0] ?? null
              : report.cases;

            return (
              <div
                key={report.id}
                className="space-y-3 rounded-2xl border border-white/6 bg-white/2 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {linkedCase ? (
                    <Badge
                      variant="outline"
                      className="border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary"
                    >
                      {linkedCase.case_number}
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="border-white/10 bg-white/4">
                    {new Date(report.generated_at).toLocaleString()}
                  </Badge>
                </div>
                <p className="text-base font-medium text-[var(--text-primary)]">
                  {report.title}
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {report.summary}
                </p>

                {report.findings.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {report.findings.slice(0, 4).map((finding, index) => (
                      <div
                        key={`${report.id}-${index}`}
                        className="rounded-xl border border-white/8 bg-[var(--bg-card)] p-3"
                      >
                        <p className="text-xs font-medium text-[var(--text-primary)]">
                          {finding.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {finding.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {report.recommendations}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
