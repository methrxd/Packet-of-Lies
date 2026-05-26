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
  LockKeyhole,
  Radar,
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from "lucide-react";

import { RequestAccessForm } from "@/components/public/request-access-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";
import { isBootstrapRequired } from "@/lib/bootstrap-state";

export const dynamic = "force-dynamic";

const productFlow = [
  {
    title: "Intake",
    text: "Create a numbered case for the hash, URL, file note, domain, IP, or manual incident report.",
    icon: Workflow,
  },
  {
    title: "Enrich",
    text: "Send hashes and URLs to VirusTotal or Hybrid Analysis, then keep the result beside the case.",
    icon: BrainCircuit,
  },
  {
    title: "Respond",
    text: "Write the finding, attach evidence, assign ownership, and record the mitigation that follows.",
    icon: ShieldCheck,
  },
  {
    title: "Handoff",
    text: "Close the loop with IOCs, timeline activity, recommendations, and a report a reviewer can audit.",
    icon: BookOpenCheck,
  },
];

const featureRows = [
  {
    title: "Caseboard",
    text: "Numbered cases with severity, priority, status, assignment, and a live activity stream.",
    icon: Radar,
  },
  {
    title: "Analysis hub",
    text: "VirusTotal and Hybrid Analysis verdicts, cached runs, risk scores, and external report links.",
    icon: TerminalSquare,
  },
  {
    title: "Evidence trail",
    text: "Findings, mitigations, analyst comments, PDF evidence, and every case mutation in one thread.",
    icon: Fingerprint,
  },
  {
    title: "IOC registry",
    text: "SHA256 hashes, domains, IPv4s, URLs, email artifacts, and filenames linked back to source cases.",
    icon: Database,
  },
  {
    title: "Report studio",
    text: "Case-linked summaries, findings, and recommendations shaped for university review and demo day.",
    icon: FileText,
  },
  {
    title: "Controlled access",
    text: "Approval requests, one-time join codes, analyst/admin roles, completed profiles, and route guards.",
    icon: LockKeyhole,
  },
];

const techLogos = [
  { name: "Next.js", src: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
  { name: "React", src: "https://cdn.simpleicons.org/react/61DAFB" },
  { name: "TypeScript", src: "https://cdn.simpleicons.org/typescript/3178C6" },
  { name: "Tailwind CSS", src: "https://cdn.simpleicons.org/tailwindcss/38BDF8" },
  { name: "Supabase", src: "https://cdn.simpleicons.org/supabase/3FCF8E" },
  { name: "PostgreSQL", src: "https://cdn.simpleicons.org/postgresql/60A5FA" },
  { name: "Vercel", src: "https://cdn.simpleicons.org/vercel/ffffff" },
  { name: "Sentry", src: "https://cdn.simpleicons.org/sentry/ffffff" },
  { name: "Node.js", src: "https://cdn.simpleicons.org/nodedotjs/5FA04E" },
  { name: "GitHub", src: "https://cdn.simpleicons.org/github/ffffff" },
  { name: "VirusTotal", src: "https://cdn.simpleicons.org/virustotal/394EFF" },
  { name: "Nodemailer", src: "https://cdn.simpleicons.org/maildotru/22C55E" },
];

const creatorLogos = [
  {
    name: "Wazuh",
    src: "https://wazuh.com/brand-assets/Wazuh-Logo.svg",
    tone: "light",
  },
  { name: "Splunk", src: "https://cdn.simpleicons.org/splunk/ffffff" },
  {
    name: "Suricata",
    src: "https://suricata.io/wp-content/uploads/2023/09/Logo-Suricata-vert-R.png",
  },
  { name: "Wireshark", src: "https://cdn.simpleicons.org/wireshark/1679A7" },
  {
    name: "Nmap",
    src: "https://nmap.org/images/nmap-logo-256x256.png",
    tone: "light",
  },
  { name: "Docker", src: "https://cdn.simpleicons.org/docker/2496ED" },
  { name: "Python", src: "https://cdn.simpleicons.org/python/FFD43B" },
  { name: "Linux", src: "https://cdn.simpleicons.org/linux/FCC624" },
  { name: "Ansible", src: "https://cdn.simpleicons.org/ansible/EE0000" },
  { name: "Git", src: "https://cdn.simpleicons.org/git/F05032" },
] as const;

const scanTickerItems = [
  "hash: 3f2a...9c1e",
  "url: credential-gate flagged",
  "ioc: domain linked",
  "verdict: suspicious",
  "mitigation: block and monitor",
  "report: evidence attached",
  "case: CASE-01024 updated",
  "analyst: finding recorded",
];

const caseTelemetry = [
  ["Submitted", "URL artifact"],
  ["Provider", "VirusTotal"],
  ["Verdict", "Suspicious"],
  ["Linked", "4 IOCs"],
  ["Action", "Block URL"],
  ["Report", "Draft ready"],
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

function LogoTile({
  name,
  src,
  tone = "dark",
}: {
  name: string;
  src: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={tone === "light" ? "logo-tile logo-tile--light" : "logo-tile"}>
      <div className="logo-tile__mark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="max-h-10 max-w-24 object-contain" loading="lazy" />
      </div>
      <span>{name}</span>
    </div>
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,5,3,0.05),rgba(1,4,3,0.66)_40%,rgba(1,3,2,0.94))]" />
      <div className="helix-grid-lines opacity-20" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-6 md:px-8 md:pb-24">
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
                <a href="#flow" className="transition-colors hover:text-primary">
                  Flow
                </a>
                <a href="#features" className="transition-colors hover:text-primary">
                  Workspace
                </a>
                <a href="#stack" className="transition-colors hover:text-primary">
                  Stack
                </a>
                <a href="#creator" className="transition-colors hover:text-primary">
                  Creator
                </a>
              </nav>

              <div className="flex items-center gap-2">
                {auth ? (
                  <LandingLink href={workspaceHref}>Go to dashboard</LandingLink>
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

        <section className="landing-reveal grid min-h-[calc(100svh-6rem)] items-center gap-10 py-12 md:py-16 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-7">
            <div className="space-y-5">
              <h1 className="font-heading text-5xl leading-[0.92] font-semibold tracking-normal text-[var(--text-primary)] md:text-7xl">
                Turn malware clues into a defensible case file.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)] md:text-xl">
                Packet of Lies gives every suspicious hash, URL, file note, IOC, finding,
                and mitigation a place in the investigation timeline.
              </p>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--text-muted)]">
              Built as a cybersecurity university project, it keeps live malware execution
              out of the browser and focuses on the analyst workflow that can be safely
              demonstrated: case intake, provider lookups, evidence, mitigations, IOCs,
              access control, and reports.
            </p>
            <div className="flex flex-wrap gap-3">
              {auth ? (
                <LandingLink href={workspaceHref}>Go to dashboard</LandingLink>
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

          <div className="landing-console landing-float">
            <div className="landing-console__glow" />
            <div className="relative z-10 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-4">
                <div className="ops-node ops-node--primary">
                  <Image src="/pollogo.svg" alt="" width={44} height={44} className="size-11" />
                  <div>
                    <p className="font-heading text-lg font-semibold">Packet of Lies</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      investigation workspace
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Risk", "82"],
                    ["IOCs", "14"],
                    ["Tasks", "06"],
                  ].map(([label, value]) => (
                    <div key={label} className="metric-tile">
                      <p>{label}</p>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                <div className="helix-terminal p-4">
                  <p>CASE-01024 :: suspicious URL submitted</p>
                  <p>VirusTotal :: 18 engines marked suspicious</p>
                  <p>Finding saved :: credential theft pattern</p>
                  <p>Mitigation queued :: block URL and monitor user</p>
                </div>
              </div>

              <div className="attack-map" aria-label="Case workflow diagram">
                <div className="packet-trace packet-trace--one" />
                <div className="packet-trace packet-trace--two" />
                <div className="packet-trace packet-trace--three" />
                <div className="attack-map__line" />
                {productFlow.map((step, index) => (
                  <div key={step.title} className={`attack-map__node attack-map__node--${index + 1}`}>
                    <step.icon className="size-5 text-primary" />
                    <span>{step.title}</span>
                  </div>
                ))}
                <div className="attack-map__center">
                  <Radar className="size-8 text-primary" />
                  <span>case stream</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-reveal py-8">
          <div className="scan-ribbon">
            <div className="scan-ribbon__track">
              {[...scanTickerItems, ...scanTickerItems].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="flow" className="landing-reveal py-14">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="space-y-4">
              <h2 className="font-heading text-4xl font-semibold tracking-normal md:text-5xl">
                One flow for the whole investigation.
              </h2>
              <p className="helix-copy">
                A useful malware report needs more than a verdict. It needs the intake
                record, the enrichment source, the analyst conclusion, and the response
                action to line up in the same case.
              </p>
            </div>

            <div className="flow-rail">
              {productFlow.map((step, index) => (
                <div key={step.title} className="flow-step">
                  <div className="flow-step__index">0{index + 1}</div>
                  <div className="flow-step__icon">
                    <step.icon className="size-5" />
                  </div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="landing-reveal py-14">
          <div className="mb-8 grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <h2 className="font-heading text-4xl font-semibold tracking-normal md:text-5xl">
              The case room: evidence, IOCs, decisions, and handoff.
            </h2>
            <p className="text-base leading-8 text-[var(--text-secondary)]">
              The dashboard does not pretend to be an antivirus engine. It acts like the
              operating table around one malware incident, with every note and observable
              tied back to the case that produced it.
            </p>
          </div>

          <div className="feature-board">
            <div className="feature-board__diagram">
              <div className="feature-core">
                <Image src="/pollogo.svg" alt="" width={58} height={58} className="size-14" />
                <span>Packet of Lies</span>
              </div>
              {featureRows.map((feature, index) => (
                <div key={feature.title} className={`feature-orbit feature-orbit--${index + 1}`}>
                  <feature.icon className="size-5 text-primary" />
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {featureRows.map((feature) => (
                <div key={feature.title} className="feature-strip">
                  <feature.icon className="size-5 text-primary" />
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-reveal grid gap-5 py-14 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="statement-panel">
            <h2 className="font-heading text-4xl font-semibold tracking-normal">
              Safe by design, scoped for a university build.
            </h2>
            <p>
              This version organizes case activity, evidence, VirusTotal and Hybrid
              Analysis results, IOCs, mitigations, and reports. It does not run malware
              samples, quarantine real machines, push firewall rules, restore backups, or
              replace an enterprise security stack.
            </p>
          </div>

          <div className="signal-grid">
            {[
              "No malware execution in-browser",
              "VirusTotal and Hybrid Analysis lookups",
              "Case-linked evidence notes",
              "Mitigation records per incident",
              "Observable registry for IOCs",
              "Reports built from case data",
            ].map((item) => (
              <div key={item} className="signal-row">
                <CheckCircle2 className="size-5 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-reveal py-14">
          <div className="telemetry-wall">
            <div className="telemetry-wall__copy">
              <h2 className="font-heading text-4xl font-semibold tracking-normal md:text-5xl">
                The case changes shape as evidence arrives.
              </h2>
              <p>
                Provider results, analyst findings, linked observables, and mitigation
                records are treated as one moving stream instead of separate screenshots.
              </p>
            </div>
            <div className="telemetry-grid">
              {caseTelemetry.map(([label, value], index) => (
                <div key={label} className="telemetry-cell" style={{ "--delay": `${index * 120}ms` } as React.CSSProperties}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="stack" className="landing-reveal py-14">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="font-heading text-4xl font-semibold tracking-normal md:text-5xl">
                A stack chosen for a real demo, not a fake mockup.
              </h2>
              <p className="helix-copy">
                Next.js renders the interface, Supabase stores cases and protects routes,
                provider APIs enrich malware clues, and Vercel keeps the project easy to
                deploy before evaluation day.
              </p>
            </div>
            <div className="logo-cloud">
              {techLogos.map((logo) => (
                <LogoTile key={logo.name} {...logo} />
              ))}
            </div>
          </div>
        </section>

        <section id="creator" className="landing-reveal grid gap-8 py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="creator-frame">
            <div className="creator-frame__ring" />
            <Image
              src="/creator-venkat.jpg"
              alt="Venkata Sai Prasanna Reddy Solipeta"
              width={360}
              height={360}
              className="relative z-10 aspect-square rounded-full object-cover"
              priority
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-heading text-4xl font-semibold tracking-normal md:text-5xl">
                I built this because malware analysis demos deserve more than screenshots.
              </h2>
              <p className="text-base leading-8 text-[var(--text-secondary)]">
                I&apos;m Venkata Sai Prasanna Reddy Solipeta, a Computer Science -
                Cybersecurity student at KLH University, Hyderabad. Packet of Lies brings
                my interests together: security operations, network defense, self-hosted
                infrastructure, automation, and incident response tooling that can be
                explained clearly under review.
              </p>
            </div>

            <div className="logo-cloud logo-cloud--compact">
              {creatorLogos.map((logo) => (
                <LogoTile key={logo.name} {...logo} />
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/methrxd"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/4 px-4 text-sm text-[var(--text-primary)] transition-colors hover:bg-white/8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://cdn.simpleicons.org/github/ffffff"
                  alt=""
                  className="size-4"
                  loading="lazy"
                />
                GitHub
                <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
              </a>
              <a
                href="https://linkedin.com/in/vsprs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/4 px-4 text-sm text-[var(--text-primary)] transition-colors hover:bg-white/8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://cdn.simpleicons.org/linkedin/0A66C2"
                  alt=""
                  className="size-4"
                  loading="lazy"
                />
                LinkedIn
                <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
              </a>
            </div>
          </div>
        </section>

        <section id="request-access" className="landing-reveal grid gap-5 py-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl font-semibold tracking-normal md:text-5xl">
              Request access, then work inside the investigation room.
            </h2>
            <p className="helix-copy">
              New users submit a request. An admin approves it, sends a one-time joining
              code, and the account enters the protected case workspace with the right role.
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
                <CardTitle>Set up the first admin</CardTitle>
                <CardDescription>
                  The first admin account must exist before access requests can be reviewed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LandingLink href="/auth/bootstrap">Create first admin</LandingLink>
              </CardContent>
            </Card>
          ) : auth ? (
            <Card className="panel-shadow">
              <CardHeader>
                <CardTitle>You are already signed in</CardTitle>
                <CardDescription>
                  Continue to the protected investigation environment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LandingLink href={workspaceHref}>Go to dashboard</LandingLink>
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
