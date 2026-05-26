"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function RouteTransitionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="route-transition min-h-svh">
      {children}
    </div>
  );
}
