"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { avatarPathForUser, validateAvatarFile } from "@/lib/avatar";
import { getAuthContext } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";
import { validateStrongPassword, validateUsername } from "@/lib/security";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const bootstrapSchema = z.object({
  username: z.string().trim().min(3).max(32),
  email: z.string().trim().email(),
  password: z.string().min(12),
  confirmPassword: z.string().min(12),
  bootstrapCode: z.string().min(1),
});

const completeProfileSchema = z.object({
  username: z.string().trim().min(3).max(32),
  password: z.string().min(12),
  confirmPassword: z.string().min(12),
});

type ActionStatus = "idle" | "success" | "error";

export type BootstrapActionState = {
  status: ActionStatus;
  message: string;
};

export type CompleteProfileActionState = {
  status: ActionStatus;
  message: string;
};

async function hasAnyUser() {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

export async function bootstrapFirstAdminAction(
  _prevState: BootstrapActionState,
  formData: FormData
): Promise<BootstrapActionState> {
  const parsed = bootstrapSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    bootstrapCode: formData.get("bootstrapCode"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid bootstrap form values." };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  if (!validateUsername(parsed.data.username)) {
    return {
      status: "error",
      message:
        "Username must be 3-32 characters and use only letters, numbers, or underscores.",
    };
  }

  if (!validateStrongPassword(parsed.data.password)) {
    return {
      status: "error",
      message:
        "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.",
    };
  }

  const serverEnv = getServerEnv();
  if (parsed.data.bootstrapCode !== serverEnv.SUPER_ADMIN_BOOTSTRAP_CODE) {
    return { status: "error", message: "Invalid bootstrap setup code." };
  }

  const firstUserExists = await hasAnyUser();
  if (firstUserExists) {
    return {
      status: "error",
      message: "First admin is already configured. Use normal sign in.",
    };
  }

  const avatarInput = formData.get("avatar");
  const avatarFile =
    avatarInput instanceof File && avatarInput.size > 0 ? avatarInput : null;

  const admin = createAdminClient();
  const createdUser = await admin.auth.admin.createUser({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      display_name: parsed.data.username,
    },
  });

  if (createdUser.error || !createdUser.data.user) {
    return {
      status: "error",
      message: createdUser.error?.message ?? "Failed to create bootstrap admin.",
    };
  }

  let avatarPath: string | null = null;
  if (avatarFile) {
    const avatarValidation = await validateAvatarFile(avatarFile);
    if (!avatarValidation.ok) {
      await admin.auth.admin.deleteUser(createdUser.data.user.id);
      return { status: "error", message: avatarValidation.message };
    }

    const bytes = Buffer.from(await avatarFile.arrayBuffer());
    avatarPath = avatarPathForUser(createdUser.data.user.id, avatarValidation.extension);

    const upload = await admin.storage.from("profile-avatars").upload(avatarPath, bytes, {
      contentType: avatarValidation.contentType,
      upsert: true,
    });

    if (upload.error) {
      await admin.auth.admin.deleteUser(createdUser.data.user.id);
      return { status: "error", message: upload.error.message };
    }
  }

  const profileUpdate = await admin
    .from("profiles")
    .update({
      email: parsed.data.email.toLowerCase(),
      display_name: parsed.data.username,
      username: parsed.data.username,
      avatar_path: avatarPath,
      role: "admin",
      profile_completed_at: new Date().toISOString(),
    })
    .eq("id", createdUser.data.user.id);

  if (profileUpdate.error) {
    await admin.auth.admin.deleteUser(createdUser.data.user.id);
    return { status: "error", message: profileUpdate.error.message };
  }

  revalidatePath("/auth/bootstrap");
  revalidatePath("/auth/login");

  return {
    status: "success",
    message: "Super admin created. Sign in to continue.",
  };
}

export async function completeProfileAction(
  _prevState: CompleteProfileActionState,
  formData: FormData
): Promise<CompleteProfileActionState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { status: "error", message: "You need to sign in first." };
  }

  const parsed = completeProfileSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid profile values." };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  if (!validateUsername(parsed.data.username)) {
    return {
      status: "error",
      message:
        "Username must be 3-32 characters and use only letters, numbers, or underscores.",
    };
  }

  if (!validateStrongPassword(parsed.data.password)) {
    return {
      status: "error",
      message:
        "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.",
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

    const admin = createAdminClient();
    const bytes = Buffer.from(await avatarFile.arrayBuffer());
    avatarPath = avatarPathForUser(auth.userId, avatarValidation.extension);

    if (auth.avatarPath) {
      await admin.storage.from("profile-avatars").remove([auth.avatarPath]);
    }

    const upload = await admin.storage.from("profile-avatars").upload(avatarPath, bytes, {
      contentType: avatarValidation.contentType,
      upsert: true,
    });

    if (upload.error) {
      return { status: "error", message: upload.error.message };
    }
  }

  const supabase = await createClient();
  const passwordUpdate = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (passwordUpdate.error) {
    return { status: "error", message: passwordUpdate.error.message };
  }

  const profileUpdate = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.username,
      avatar_path: avatarPath,
      profile_completed_at: new Date().toISOString(),
    })
    .eq("id", auth.userId);

  if (profileUpdate.error) {
    return { status: "error", message: profileUpdate.error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/auth/complete-profile");

  return { status: "success", message: "Profile completed. Redirecting..." };
}
