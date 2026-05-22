import { ArrowUpRight, Binary, DatabaseZap, Radar, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

const foundationMetrics = [
  {
    label: "Stack health",
    value: "Next.js + Supabase",
    detail: "SSR auth, secured APIs, and live investigation streams",
    icon: Binary,
  },
  {
    label: "Detection flow",
    value: "Case-first workflow",
    detail: "Findings, mitigations, comments, and activity timeline are connected",
    icon: DatabaseZap,
  },
  {
    label: "Access posture",
    value: "Role-gated",
    detail: "Invite onboarding with role-based permissions and audit coverage",
    icon: ShieldCheck,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations Board"
        title="Malware analysis command view"
        description="A single operational board for your university project demonstration: monitor readiness, current investigation capacity, and security posture in real time."
        actions={
          <Button className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-[var(--accent-primary-hover)]">
            Open active cases
            <ArrowUpRight className="size-4" />
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {foundationMetrics.map((metric) => (
              <Card
                key={metric.label}
                className="border-white/6 bg-[var(--bg-card)] panel-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                      {metric.label}
                    </CardDescription>
                    <metric.icon className="size-4 text-primary" />
                  </div>
                  <CardTitle className="font-heading text-2xl text-[var(--text-primary)]">
                    {metric.value}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-[var(--text-secondary)]">
                  {metric.detail}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-white/6 bg-[var(--bg-card)]">
            <CardHeader>
              <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
                Coverage map
              </CardDescription>
              <CardTitle className="font-heading text-xl">
                PRD objective coverage snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-[var(--text-secondary)] md:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Detection pipeline: cases, indicators, and report generation are live.
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Analysis trail: findings, comments, and timeline logging are connected.
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Response model: mitigation tracking supports lifecycle decisions.
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Governance: role permissions and admin controls are actively enforced.
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Recovery readiness: OTP account reset and secure onboarding are enabled.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/6 bg-[var(--bg-shell)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Execution focus
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Live priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/6 bg-[var(--bg-card)] p-4">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Access model
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                Invite only
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                All operational routes require authentication and profile
                completion before access is granted.
              </p>
            </div>

            <div className="rounded-3xl border border-white/6 bg-grid-muted bg-[var(--bg-card)] p-5">
              <p className="font-mono-ui text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                Next review checkpoints
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <Radar className="size-4 text-primary" />
                  Validate malware analysis workflow against live demo scenario.
                </li>
                <li className="flex items-center gap-2">
                  <Radar className="size-4 text-primary" />
                  Finalize report pack for academic submission review.
                </li>
                <li className="flex items-center gap-2">
                  <Radar className="size-4 text-primary" />
                  Complete UX consistency pass across all operational pages.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
