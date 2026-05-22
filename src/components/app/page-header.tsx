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
    <section className="rounded-3xl border border-white/8 bg-[color:rgba(14,15,17,0.78)] px-5 py-6 backdrop-blur-sm md:px-7 md:py-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono-ui text-[10px] tracking-[0.28em] text-[var(--text-muted)] uppercase">
            {eyebrow}
          </p>
          <h1 className="font-heading mt-3 max-w-4xl text-3xl leading-tight font-semibold tracking-[-0.015em] text-[var(--text-primary)] md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)] md:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
