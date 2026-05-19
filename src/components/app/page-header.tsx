import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono-ui text-[11px] tracking-[0.22em] text-[var(--text-muted)] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
