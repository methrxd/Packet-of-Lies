"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 15000;

export function IdleSessionGuard() {
  const router = useRouter();
  const lastActivityAtRef = useRef(0);
  const hasSignedOutRef = useRef(false);

  useEffect(() => {
    lastActivityAtRef.current = Date.now();
    const markActivity = () => {
      lastActivityAtRef.current = Date.now();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "pointerdown",
    ];

    for (const eventName of events) {
      window.addEventListener(eventName, markActivity, { passive: true });
    }

    const intervalId = window.setInterval(async () => {
      if (hasSignedOutRef.current) {
        return;
      }
      const inactiveFor = Date.now() - lastActivityAtRef.current;
      if (inactiveFor < IDLE_TIMEOUT_MS) {
        return;
      }

      hasSignedOutRef.current = true;
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/auth/login?reason=idle");
      router.refresh();
    }, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      for (const eventName of events) {
        window.removeEventListener(eventName, markActivity);
      }
    };
  }, [router]);

  return null;
}
