import { ArrowUpRight, Binary, DatabaseZap, ShieldCheck } from "lucide-react";

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
    label: "Core stack",
    value: "Next.js 16",
    detail: "App Router, Tailwind v4, shadcn/ui",
    icon: Binary,
  },
  {
    label: "Backend shape",
    value: "Supabase SSR",
    detail: "Browser, server, and proxy clients scaffolded",
    icon: DatabaseZap,
  },
  {
    label: "Delivery state",
    value: "Operational",
    detail: "Auth, intake, and role controls are active",
    icon: ShieldCheck,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command center"
        title="Secure operations dashboard"
        description="Track current platform readiness, investigation workload, and access posture from a single analyst-focused command center."
        actions={
          <Button className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-[var(--accent-primary-hover)]">
            Review active queue
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
                Platform status
              </CardDescription>
              <CardTitle className="font-heading text-xl">
                Core capabilities online
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-[var(--text-secondary)] md:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Authentication and route protection are enforced.
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Invite-only onboarding and profile completion are active.
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Cases and submissions now persist through Supabase-backed workflows.
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
                Admin role management is live with policy-enforced update controls.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/6 bg-[var(--bg-shell)]">
          <CardHeader>
            <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
              Activity focus
            </CardDescription>
            <CardTitle className="font-heading text-xl">
              Immediate priorities
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
                Upcoming work
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                <li>Indicator extraction and de-duplication</li>
                <li>Case detail timeline and findings workspace</li>
                <li>Report generation and export formatting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
