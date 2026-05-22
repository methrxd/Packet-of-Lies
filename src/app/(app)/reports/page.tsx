import { redirect } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { GenerateReportForm } from "@/components/reports/generate-report-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
      .limit(24),
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
        title="Incident report studio"
        description="Generate case reports with findings and recommendations for documentation and review."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardDescription className="helix-kicker">Generate</CardDescription>
            <CardTitle>New report</CardTitle>
          </CardHeader>
          <CardContent>
            <GenerateReportForm caseOptions={caseSelection} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="helix-kicker">Archive</CardDescription>
            <CardTitle>Recent reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportList.length === 0 ? (
              <div className="helix-card text-sm text-[var(--text-secondary)]">
                No reports generated yet.
              </div>
            ) : null}

            {reportList.map((report) => {
              const linkedCase = Array.isArray(report.cases) ? report.cases[0] ?? null : report.cases;
              return (
                <div key={report.id} className="helix-card space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {linkedCase ? (
                      <span className="inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-1 text-xs text-primary">
                        {linkedCase.case_number}
                      </span>
                    ) : null}
                    <span className="inline-flex rounded-full border border-white/10 bg-white/4 px-2 py-1 text-xs">
                      {new Date(report.generated_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-base font-medium text-[var(--text-primary)]">{report.title}</p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">{report.summary}</p>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">{report.recommendations}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
