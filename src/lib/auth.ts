import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "analyst";

export type AuthContext = {
  userId: string;
  email: string;
  displayName: string;
  username: string | null;
  role: AppRole;
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
    .select("email, display_name, role, username, avatar_path, profile_completed_at")
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

  let avatarUrl: string | null = null;
  if (avatarPath) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.storage
        .from("profile-avatars")
        .createSignedUrl(avatarPath, 60 * 60);
      avatarUrl = data?.signedUrl ?? null;
    } catch {
      avatarUrl = null;
    }
  }

  return {
    userId: user.id,
    email: profile?.email ?? fallbackEmail,
    displayName,
    username,
    role: profileRole,
    avatarPath,
    avatarUrl,
    isProfileComplete,
  };
});
