import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  Fingerprint,
  GraduationCap,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Siren,
  Sparkles,
  TerminalSquare,
  Workflow,
} from "lucide-react";

import { RequestAccessForm } from "@/components/public/request-access-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";
import { isBootstrapRequired } from "@/lib/bootstrap-state";

const workflowSteps = [
  {
    title: "Create a case",
    body: "Open an investigation, set severity and priority, and assign ownership.",
    icon: Workflow,
  },
  {
    title: "Submit evidence",
    body: "Capture URLs, hashes, files, domains, IPs, emails, and manual incident context.",
    icon: Fingerprint,
  },
  {
    title: "Run analysis",
    body: "Use configured VirusTotal or Hybrid Analysis checks for provider-backed signals.",
    icon: BrainCircuit,
  },
  {
    title: "Document response",
    body: "Record findings, mitigations, comments, IOCs, and final report recommendations.",
    icon: FileText,
  },
];

const features = [
  {
    title: "Investigation caseboard",
    body: "Lifecycle status, severity, priority, assignment, and case history in one workspace.",
    icon: Radar,
  },
  {
    title: "Analysis hub",
    body: "Provider-backed hash and URL checks with verdicts, risk scoring, and report links.",
    icon: TerminalSquare,
  },
  {
    title: "Evidence and mitigations",
    body: "Analyst findings, PDF evidence attachments, response actions, and live comments.",
    icon: ShieldCheck,
  },
  {
    title: "IOC registry",
    body: "Track observables such as SHA256 hashes, domains, IPs, URLs, emails, and filenames.",
    icon: Database,
  },
  {
    title: "Reports",
    body: "Generate incident summaries with findings and recommendations for review.",
    icon: BookOpenCheck,
  },
  {
    title: "Admin controls",
    body: "Role permissions, access requests, invite flows, and profile-managed accounts.",
    icon: LockKeyhole,
  },
];

const prdCoverage = [
  "Malware detection and triage workflow",
  "Provider-backed static and dynamic intelligence",
  "Incident response and mitigation documentation",
  "Root cause analysis support through case notes and reports",
  "Indicator tracking for threat intelligence handoff",
  "Access control, roles, and audit-friendly activity history",
];

const stack = [
  "Next.js 16 App Router",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "Base UI and shadcn-style primitives",
  "Supabase Auth, Postgres, Storage, SSR, and RLS",
  "VirusTotal API",
  "Hybrid Analysis API",
  "Nodemailer email flows",
  "Sentry",
  "Vercel-ready deployment",
];

const creatorHighlights = [
  "Computer Science - Cybersecurity student at KLH University, Hyderabad",
  "Works with Wazuh, Splunk, Suricata, Wireshark, Nmap, Burp Suite, and FortiGate NGFW",
  "Builds with Linux, Ansible, Docker, Python, Bash, REST APIs, and Git/GitHub",
  "Interested in security operations, self-hosting, infrastructure automation, and incident response tooling",
];

function LandingLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "premium-button inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-5 text-sm font-semibold text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)]"
      : "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/4 px-5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-white/8";

  return (
    <Link href={href} className={className}>
      {children}
      <ArrowRight className="size-4" />
    </Link>
  );
}

export default async function HomePage() {
  let bootstrapRequired = false;
  try {
    bootstrapRequired = await isBootstrapRequired();
  } catch {
    bootstrapRequired = true;
  }

  const auth = bootstrapRequired ? null : await getAuthContext();
  const workspaceHref = auth?.isProfileComplete ? "/dashboard" : "/auth/complete-profile";

  return (
    <main className="relative min-h-svh overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,5,3,0.08),rgba(1,4,3,0.72)_38%,rgba(1,3,2,0.92))]" />
      <div className="helix-grid-lines opacity-20" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-6 md:px-8 md:pb-20">
        <header className="sticky top-4 z-20">
          <div className="helix-shell rounded-full border-white/14 px-4 py-3 backdrop-blur-xl">
            <div className="helix-grid-lines opacity-10" />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <Image
                  src="/pollogo.svg"
                  alt="Packet of Lies"
                  width={38}
                  height={38}
                  className="size-10 shrink-0"
                  priority
                />
                <div className="min-w-0">
                  <p className="font-heading text-sm font-semibold tracking-wide text-[var(--text-primary)]">
                    Packet of Lies
                  </p>
                  <p className="hidden text-xs text-[var(--text-secondary)] sm:block">
                    Malware Analysis and Mitigations
                  </p>
                </div>
              </Link>

              <nav className="hidden items-center gap-5 text-xs font-medium text-[var(--text-secondary)] lg:flex">
                <a href="#workflow" className="transition-colors hover:text-primary">
                  Workflow
                </a>
                <a href="#features" className="transition-colors hover:text-primary">
                  Features
                </a>
                <a href="#stack" className="transition-colors hover:text-primary">
                  Stack
                </a>
                <a href="#creator" className="transition-colors hover:text-primary">
                  About
                </a>
              </nav>

              <div className="flex items-center gap-2">
                {auth ? (
                  <LandingLink href={workspaceHref}>Open dashboard</LandingLink>
                ) : bootstrapRequired ? (
                  <LandingLink href="/auth/bootstrap">Create first admin</LandingLink>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="hidden h-10 items-center justify-center rounded-full border border-white/12 bg-white/4 px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/8 sm:inline-flex"
                    >
                      Sign in
                    </Link>
                    <a
                      href="#request-access"
                      className="premium-button inline-flex h-10 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)]"
                    >
                      Request access
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="grid min-h-[calc(100svh-6rem)] items-center gap-8 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-xs font-medium text-primary">
              <Siren className="size-4" />
              Academic malware response workspace
            </div>
            <div className="space-y-5">
              <h1 className="font-heading text-5xl leading-[0.95] font-semibold tracking-normal text-[var(--text-primary)] md:text-7xl">
                Packet of Lies
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)] md:text-xl">
                A malware analysis and mitigation workspace built for structured incident
                response, evidence tracking, IOC management, and cybersecurity demonstrations.
              </p>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              Move from suspicious artifact to documented response: create a case, submit
              indicators or URLs, run provider-backed analysis, record findings, plan
              mitigations, and generate reports.
            </p>
            <div className="flex flex-wrap gap-3">
              {auth ? (
                <LandingLink href={workspaceHref}>Open dashboard</LandingLink>
              ) : bootstrapRequired ? (
                <LandingLink href="/auth/bootstrap">Create first admin</LandingLink>
              ) : (
                <>
                  <LandingLink href="#request-access">Request access</LandingLink>
                  <LandingLink href="/auth/login" variant="secondary">
                    Sign in
                  </LandingLink>
                </>
              )}
            </div>
          </div>

          <div className="helix-shell p-4 md:p-5">
            <div className="helix-grid-lines opacity-20" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Image src="/pollogo.svg" alt="" width={36} height={36} className="size-9" />
                  <div>
                    <p className="font-heading text-sm font-semibold">Incident CASE-01024</p>
                    <p className="text-xs text-[var(--text-muted)]">Provider-backed analysis active</p>
                  </div>
                </div>
                <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-xs text-primary">
                  investigating
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Risk", "82"],
                  ["IOCs", "14"],
                  ["Actions", "06"],
                ].map(([label, value]) => (
                  <div key={label} className="helix-card p-4">
                    <p className="helix-kicker">{label}</p>
                    <p className="font-mono-ui mt-2 text-4xl font-semibold text-[var(--text-primary)]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="helix-terminal p-4">
                <div className="space-y-3">
                  {[
                    "VirusTotal run completed :: verdict suspicious",
                    "Finding added :: credential theft behavior documented",
                    "Mitigation planned :: isolate affected endpoint",
                    "IOC recorded :: sha256 linked to active case",
                  ].map((line) => (
                    <p key={line} className="border-l border-[var(--accent-border)] pl-3">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5 py-8">
          <div className="max-w-3xl space-y-3">
            <p className="helix-kicker">What it is</p>
            <h2 className="font-heading text-3xl font-semibold tracking-normal md:text-4xl">
              A controlled workspace for malware response, not a malware lab.
            </h2>
            <p className="helix-copy">
              Packet of Lies focuses on the operational side of malware analysis and
              mitigations. It does not create malware or execute unsafe samples. It gives
              analysts a structured place to triage, document, analyze with external
              providers, plan mitigations, and prepare reports.
            </p>
          </div>
        </section>

        <section id="workflow" className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="helix-card min-h-52">
              <div className="flex items-center justify-between">
                <step.icon className="size-5 text-primary" />
                <span className="font-mono-ui text-xs text-[var(--text-muted)]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-8 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{step.body}</p>
            </div>
          ))}
        </section>

        <section id="features" className="space-y-6 py-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl space-y-3">
              <p className="helix-kicker">Product surface</p>
              <h2 className="font-heading text-3xl font-semibold tracking-normal md:text-4xl">
                Everything needed for a clean university demo.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--text-muted)]">
              The app maps the PRD into a practical MVP: case operations, evidence,
              indicators, provider analysis, reporting, and access control.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="min-h-52">
                <CardHeader>
                  <feature.icon className="mb-3 size-5 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="helix-shell p-6 md:p-7">
            <div className="helix-grid-lines opacity-20" />
            <div className="relative z-10 space-y-5">
              <p className="helix-kicker">PRD coverage</p>
              <h2 className="font-heading text-3xl font-semibold tracking-normal">
                Built around malware analysis and mitigations.
              </h2>
              <p className="helix-copy">
                The commercial PRD describes a much larger enterprise system. Packet of
                Lies implements the academic project version: the workflows and evidence
                model are present, while real endpoint, SIEM, firewall, and backup control
                remain outside this MVP.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {prdCoverage.map((item) => (
              <div key={item} className="helix-card flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="stack" className="grid gap-4 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            <p className="helix-kicker">Technical stack</p>
            <h2 className="font-heading text-3xl font-semibold tracking-normal md:text-4xl">
              Modern web app, Supabase-backed security workflow.
            </h2>
            <p className="helix-copy">
              The stack is intentionally practical for a university deadline: fast to demo,
              deployable, and backed by real database, auth, storage, and role policies.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/4 px-3 py-2 text-sm text-[var(--text-secondary)]"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="creator" className="grid gap-4 py-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="helix-shell p-6 md:p-8">
            <div className="helix-grid-lines opacity-20" />
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-primary">
                  <GraduationCap className="size-6" />
                </div>
                <div>
                  <p className="helix-kicker">Creator</p>
                  <h2 className="font-heading text-2xl font-semibold">
                    Venkata Sai Prasanna Reddy Solipeta
                  </h2>
                </div>
              </div>
              <p className="helix-copy">
                Venkata Sai Prasanna Reddy Solipeta is a Computer Science -
                Cybersecurity student at KLH University, Hyderabad. His work and
                interests sit around security operations, network defense, self-hosted
                infrastructure, automation, and practical incident response tooling.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/methrxd"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/4 px-4 text-sm text-[var(--text-primary)] transition-colors hover:bg-white/8"
                >
                  <ExternalLink className="size-4" />
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/vsprs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/4 px-4 text-sm text-[var(--text-primary)] transition-colors hover:bg-white/8"
                >
                  <ExternalLink className="size-4" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {creatorHighlights.map((item) => (
              <div key={item} className="helix-card flex gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="request-access" className="grid gap-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <p className="helix-kicker">Access</p>
            <h2 className="font-heading text-3xl font-semibold tracking-normal md:text-4xl">
              Start with approval, then join the workspace.
            </h2>
            <p className="helix-copy">
              Packet of Lies uses a controlled access flow. Submit a request, wait for
              admin approval, then use the one-time joining code sent by email. Existing
              users can sign in directly.
            </p>
            {!auth && !bootstrapRequired ? (
              <LandingLink href="/auth/login" variant="secondary">
                Already have access
              </LandingLink>
            ) : null}
          </div>

          {bootstrapRequired ? (
            <Card className="panel-shadow">
              <CardHeader>
                <CardTitle>First admin required</CardTitle>
                <CardDescription>
                  Set up the first admin account before access requests can be reviewed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LandingLink href="/auth/bootstrap">Create first admin</LandingLink>
              </CardContent>
            </Card>
          ) : auth ? (
            <Card className="panel-shadow">
              <CardHeader>
                <CardTitle>You are signed in</CardTitle>
                <CardDescription>
                  Continue to the protected investigation workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LandingLink href={workspaceHref}>Open dashboard</LandingLink>
              </CardContent>
            </Card>
          ) : (
            <Card className="panel-shadow">
              <CardHeader>
                <CardTitle>Request access</CardTitle>
                <CardDescription>
                  Submit your details for admin approval. Once approved, you will receive a
                  one-time joining code by email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RequestAccessForm />
                <p className="rounded-xl border border-white/8 bg-white/2 p-3 text-xs text-[var(--text-muted)]">
                  Already invited or already have a joining code?{" "}
                  <Link href="/auth/login" className="text-primary underline underline-offset-4">
                    Open sign in
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
