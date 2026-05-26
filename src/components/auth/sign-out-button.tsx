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
      className="premium-button inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/12 bg-[color:rgba(255,255,255,0.03)] px-3 text-[var(--text-secondary)] transition-colors hover:bg-[color:rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? <span className="pending-spinner" /> : <LogOut className="size-4" />}
      <span className="hidden text-sm md:inline">
        {isPending ? "Signing out" : "Sign out"}
      </span>
      <span className="sr-only">Sign out</span>
    </button>
  );
}
