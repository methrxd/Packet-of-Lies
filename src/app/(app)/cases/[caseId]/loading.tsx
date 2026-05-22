import { AsciiAmbient } from "@/components/app/ascii-ambient";

export default function CaseDetailLoading() {
  return (
    <div className="flex min-h-[62svh] items-center justify-center">
      <div className="helix-shell w-full max-w-3xl p-6">
        <div className="helix-grid-lines opacity-20" />
        <div className="relative z-10 space-y-4">
          <p className="helix-kicker">Loading case detail</p>
          <h2 className="helix-headline text-2xl md:text-3xl">Syncing case timeline and evidence</h2>
          <AsciiAmbient title="Case stream" />
        </div>
      </div>
    </div>
  );
}

