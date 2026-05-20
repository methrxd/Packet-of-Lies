"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { avatarPathForUser, validateAvatarFile } from "@/lib/avatar";
import { getAuthContext } from "@/lib/auth";
import { validateUsername } from "@/lib/security";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const updateProfileSchema = z.object({
  username: z.string().trim().min(3).max(32),
  displayName: z.string().trim().min(1).max(60),
});

type ActionStatus = "idle" | "success" | "error";

export type UpdateProfileActionState = {
  status: ActionStatus;
  message: string;
};

export async function updateProfileAction(
  _prevState: UpdateProfileActionState,
  formData: FormData
): Promise<UpdateProfileActionState> {
  const auth = await getAuthContext();

  if (!auth) {
    return { status: "error", message: "You need to sign in first." };
  }

  const parsed = updateProfileSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid profile values." };
  }

  if (!validateUsername(parsed.data.username)) {
    return {
      status: "error",
      message:
        "Username must be 3-32 characters and use only letters, numbers, or underscores.",
    };
  }

  const avatarInput = formData.get("avatar");
  const avatarFile =
    avatarInput instanceof File && avatarInput.size > 0 ? avatarInput : null;

  let avatarPath: string | null = auth.avatarPath ?? null;
  if (avatarFile) {
    const avatarValidation = await validateAvatarFile(avatarFile);
    if (!avatarValidation.ok) {
      return { status: "error", message: avatarValidation.message };
    }

    try {
      const admin = createAdminClient();
      const bytes = Buffer.from(await avatarFile.arrayBuffer());
      const nextPath = avatarPathForUser(auth.userId, avatarValidation.extension);

      const upload = await admin.storage.from("profile-avatars").upload(nextPath, bytes, {
        contentType: avatarValidation.contentType,
        upsert: true,
      });

      if (upload.error) {
        return { status: "error", message: upload.error.message };
      }

      if (auth.avatarPath) {
        await admin.storage.from("profile-avatars").remove([auth.avatarPath]);
      }

      avatarPath = nextPath;
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Profile image upload failed.",
      };
    }
  }

  const supabase = await createClient();
  const profileUpdate = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.displayName,
      avatar_path: avatarPath,
      profile_completed_at: new Date().toISOString(),
    })
    .eq("id", auth.userId);

  if (profileUpdate.error) {
    const normalizedMessage = profileUpdate.error.message.toLowerCase();
    if (
      normalizedMessage.includes("profiles_username_unique_idx") ||
      normalizedMessage.includes("duplicate key")
    ) {
      return {
        status: "error",
        message: "That username is already in use. Pick a different one.",
      };
    }

    return { status: "error", message: profileUpdate.error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Profile updated successfully.",
  };
}
