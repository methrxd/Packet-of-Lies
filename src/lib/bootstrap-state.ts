import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  getPublicEnv,
  getServiceRoleEnv,
  hasServiceRoleEnv,
  hasSupabaseEnv,
} from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function isBootstrapRequired() {
  if (!hasSupabaseEnv()) {
    return false;
  }

  const supabase = await createClient();
  const rpcResult = await supabase.rpc("bootstrap_required");
  if (!rpcResult.error && typeof rpcResult.data === "boolean") {
    return rpcResult.data;
  }

  const adminCount = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (!adminCount.error && adminCount.count !== null) {
    return adminCount.count === 0;
  }

  if (hasServiceRoleEnv()) {
    const env = getPublicEnv();
    const service = getServiceRoleEnv();
    const admin = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      service.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const adminRoleCount = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (!adminRoleCount.error && adminRoleCount.count !== null) {
      return adminRoleCount.count === 0;
    }
  }

  if (rpcResult.error) {
    throw new Error(rpcResult.error.message);
  }

  throw new Error("Failed to resolve bootstrap state.");
}
