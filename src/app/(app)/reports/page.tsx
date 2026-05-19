import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Reporting surface shell"
        description="This route is reserved for case summaries, export-ready incident narratives, and audit-facing outputs. The shell is in place so later phases can add reporting logic without redesigning the workspace."
      />

      <Card className="border-white/6 bg-[var(--bg-card)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            Planned outputs
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Report modules staged for implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm leading-6 text-[var(--text-secondary)]">
            Executive incident summaries
          </div>
          <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm leading-6 text-[var(--text-secondary)]">
            Analyst timeline and evidence exports
          </div>
          <div className="rounded-2xl border border-white/6 bg-white/2 p-4 text-sm leading-6 text-[var(--text-secondary)]">
            Mitigation and follow-up records
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
