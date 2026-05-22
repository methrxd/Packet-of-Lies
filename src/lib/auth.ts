import { cache } from "react";

import { hasServiceRoleEnv, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "analyst";

export type AuthContext = {
  userId: string;
  email: string;
  displayName: string;
  username: string | null;
  role: AppRole;
  roleId: string | null;
  permissions: string[];
  avatarPath: string | null;
  avatarUrl: string | null;
  isProfileComplete: boolean;
};

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name, role, role_id, username, avatar_path, profile_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  const profileRole = profile?.role === "admin" ? "admin" : "analyst";
  const fallbackEmail = user.email ?? "unknown@packet-of-lies.local";
  const fallbackName = fallbackEmail.split("@")[0] ?? "analyst";
  const username = profile?.username ?? null;
  const displayName = profile?.display_name ?? username ?? fallbackName;
  const avatarPath = profile?.avatar_path ?? null;
  const isProfileComplete = Boolean(
    profile?.username && profile?.profile_completed_at
  );

  const avatarUrl =
    avatarPath && hasServiceRoleEnv()
      ? `/api/profile/avatar?path=${encodeURIComponent(avatarPath)}`
      : null;

  const roleId = profile?.role_id ?? null;
  let permissions: string[] = [];
  if (roleId) {
    const { data: permissionRows } = await supabase
      .from("app_role_permissions")
      .select("permission_key")
      .eq("role_id", roleId);
    permissions = (permissionRows ?? []).map((row) => row.permission_key);
  }

  return {
    userId: user.id,
    email: profile?.email ?? fallbackEmail,
    displayName,
    username,
    role: profileRole,
    roleId,
    permissions,
    avatarPath,
    avatarUrl,
    isProfileComplete,
  };
});

export function hasPermission(auth: AuthContext, permissionKey: string) {
  if (auth.role === "admin") {
    return true;
  }

  return auth.permissions.includes(permissionKey);
}
