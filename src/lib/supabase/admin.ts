import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getServiceRoleEnv } from "@/lib/env";

export function createAdminClient() {
  const env = getPublicEnv();
  const serviceRoleEnv = getServiceRoleEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
