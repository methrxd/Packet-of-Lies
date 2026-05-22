import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRoleEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const AVATAR_URL_TTL_SECONDS = 60 * 10;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasServiceRoleEnv()) {
    return NextResponse.json({ error: "Avatar service unavailable" }, { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const path = requestUrl.searchParams.get("path");

  if (!path || path.length > 512) {
    return NextResponse.json({ error: "Invalid avatar path." }, { status: 400 });
  }

  if (!path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from("profile-avatars")
      .createSignedUrl(path, AVATAR_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message ?? "Avatar not found" }, { status: 404 });
    }

    const response = NextResponse.redirect(data.signedUrl, { status: 307 });
    response.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=60");
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Avatar lookup failed." },
      { status: 500 }
    );
  }
}
