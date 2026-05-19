import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/auth/login");
  }

  if (auth.role !== "admin") {
    redirect("/auth/access-denied");
  }

  return children;
}
