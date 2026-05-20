import { createClient } from "@/lib/supabase/server";

export async function isBootstrapRequired() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("bootstrap_required");

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
