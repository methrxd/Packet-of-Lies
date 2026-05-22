export default function CasesLoading() {
  return (
    <div className="flex min-h-[62svh] items-center justify-center">
      <div className="helix-shell w-full max-w-3xl p-6">
        <div className="helix-grid-lines opacity-20" />
        <div className="relative z-10 space-y-4">
          <p className="helix-kicker">Loading caseboard</p>
          <h2 className="helix-headline text-2xl md:text-3xl">Fetching investigation queue</h2>
          <p className="helix-copy">Syncing case records…</p>
        </div>
      </div>
    </div>
  );
}
