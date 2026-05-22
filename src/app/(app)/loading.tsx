import { AsciiAmbient } from "@/components/app/ascii-ambient";

export default function AppLoading() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center">
      <div className="helix-shell w-full max-w-3xl p-6 md:p-8">
        <div className="helix-grid-lines opacity-20" />
        <div className="relative z-10 space-y-5">
          <p className="helix-kicker">Loading workspace</p>
          <h2 className="helix-headline text-2xl md:text-3xl">Preparing live investigation data</h2>
          <AsciiAmbient title="Startup stream" />
        </div>
      </div>
    </div>
  );
}

