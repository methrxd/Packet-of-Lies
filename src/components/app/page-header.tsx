import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="helix-section">
      <div className="helix-grid-lines" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="helix-kicker">{eyebrow}</p>
          <h1 className="helix-headline max-w-4xl">{title}</h1>
          {description ? <p className="helix-copy max-w-3xl">{description}</p> : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[color:rgba(255,255,255,0.02)] px-2 py-2">
            {actions}
          </div>
        ) : (
          <span className="helix-chip">Live workspace</span>
        )}
      </div>
      <div className="relative z-10 mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        <span className="font-mono-ui tracking-[0.14em] uppercase">Operational interface</span>
        <span>Built for evidence-first investigations</span>
      </div>
      {actions ? null : (
        <div className="relative z-10 mt-5">
          <span className="helix-kicker">No pending header actions</span>
        </div>
      )}
      <div className="pointer-events-none absolute -top-8 right-8 h-28 w-28 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] blur-xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full border border-white/8 bg-white/3 blur-xl" />
    </section>
  );
}
