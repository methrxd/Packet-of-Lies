"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { avatarPathForUser, validateAvatarFile } from "@/lib/avatar";
import { getAuthContext } from "@/lib/auth";
import { isBootstrapRequired } from "@/lib/bootstrap-state";
import { hasServiceRoleEnv } from "@/lib/env";
import { validateStrongPassword, validateUsername } from "@/lib/security";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const bootstrapSchema = z.object({
  username: z.string().trim().min(3).max(32),
  email: z.string().trim().email(),
  password: z.string().min(12),
  confirmPassword: z.string().min(12),
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

async function hasAnyAdmin() {
  const bootstrapRequired = await isBootstrapRequired();
  return !bootstrapRequired;
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

  try {
    const firstAdminExists = await hasAnyAdmin();
    if (firstAdminExists) {
      return {
        status: "error",
        message: "First admin is already configured. Use normal sign in.",
      };
    }

    const avatarInput = formData.get("avatar");
    const avatarFile =
      avatarInput instanceof File && avatarInput.size > 0 ? avatarInput : null;

    if (hasServiceRoleEnv()) {
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
          message:
            createdUser.error?.message ?? "Failed to create bootstrap admin.",
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
        avatarPath = avatarPathForUser(
          createdUser.data.user.id,
          avatarValidation.extension
        );

        const upload = await admin.storage
          .from("profile-avatars")
          .upload(avatarPath, bytes, {
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
          role_id: (
            await admin.from("app_roles").select("id").eq("name", "admin").maybeSingle()
          ).data?.id ?? null,
          profile_completed_at: new Date().toISOString(),
        })
        .eq("id", createdUser.data.user.id);

      if (profileUpdate.error) {
        await admin.auth.admin.deleteUser(createdUser.data.user.id);
        return { status: "error", message: profileUpdate.error.message };
      }
    } else {
      if (avatarFile) {
        return {
          status: "error",
          message:
            "Profile picture upload during first-admin bootstrap requires SUPABASE_SERVICE_ROLE_KEY. Remove avatar for bootstrap, then add it from profile setup.",
        };
      }

      const supabase = await createClient();
      const { data, error } = await supabase.rpc("bootstrap_create_first_admin", {
        p_email: parsed.data.email.toLowerCase(),
        p_password: parsed.data.password,
        p_username: parsed.data.username,
      });

      if (error) {
        const message =
          error.message === "admin_exists"
            ? "First admin is already configured. Use normal sign in."
            : error.message === "email_exists"
              ? "Email is already registered."
              : error.message === "invalid_username"
                ? "Username must be 3-32 characters and use only letters, numbers, or underscores."
                : error.message === "weak_password"
                  ? "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol."
                  : error.message;

        return { status: "error", message };
      }

      const createdUserId = typeof data === "string" ? data : null;
      if (!createdUserId) {
        return {
          status: "error",
          message: "Bootstrap user creation returned an invalid response.",
        };
      }
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Bootstrap failed.",
    };
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
    try {
      const admin = createAdminClient();
      const bytes = Buffer.from(await avatarFile.arrayBuffer());
      avatarPath = avatarPathForUser(auth.userId, avatarValidation.extension);

      if (auth.avatarPath) {
        await admin.storage.from("profile-avatars").remove([auth.avatarPath]);
      }

      const upload = await admin.storage
        .from("profile-avatars")
        .upload(avatarPath, bytes, {
          contentType: avatarValidation.contentType,
          upsert: true,
        });

      if (upload.error) {
        return { status: "error", message: upload.error.message };
      }
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error &&
          error.message.includes("SUPABASE_SERVICE_ROLE_KEY")
            ? "Server setup missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel project environment variables, then redeploy."
            : error instanceof Error
              ? error.message
              : "Avatar upload failed due to server configuration.",
      };
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
