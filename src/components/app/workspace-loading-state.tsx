import Image from "next/image";

type WorkspaceLoadingStateProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function WorkspaceLoadingState({
  eyebrow,
  title,
  description,
}: WorkspaceLoadingStateProps) {
  return (
    <div className="flex min-h-[66svh] items-center justify-center px-4">
      <div className="loading-panel helix-shell w-full max-w-3xl p-6 md:p-8">
        <div className="helix-grid-lines opacity-25" />
        <div className="relative z-10 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] shadow-[0_0_40px_rgba(2,249,109,0.16)]">
            <span className="loading-ring" />
            <Image src="/pollogo.svg" alt="" width={42} height={42} className="relative z-10 size-11" />
          </div>

          <div className="space-y-4">
            <p className="helix-kicker">{eyebrow}</p>
            <div className="space-y-2">
              <h2 className="helix-headline text-2xl md:text-3xl">{title}</h2>
              <p className="helix-copy">{description}</p>
            </div>
            <div className="space-y-2">
              <div className="skeleton-bar h-2 w-4/5" />
              <div className="skeleton-bar h-2 w-3/5" />
              <div className="skeleton-bar h-2 w-2/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
