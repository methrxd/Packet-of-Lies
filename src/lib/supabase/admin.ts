import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getServerEnv } from "@/lib/env";

export function createAdminClient() {
  const env = getPublicEnv();
  const serverEnv = getServerEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
