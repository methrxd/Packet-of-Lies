"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.replace("/auth/login");
    router.refresh();
    setIsPending(false);
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 bg-[var(--bg-card)] px-3 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut className="size-4" />
      <span className="hidden text-sm md:inline">
        {isPending ? "Signing out..." : "Sign out"}
      </span>
      <span className="sr-only">Sign out</span>
    </button>
  );
}
