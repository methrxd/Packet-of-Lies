"use server";

import { createHash, randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { avatarPathForUser, validateAvatarFile } from "@/lib/avatar";
import { getAuthContext } from "@/lib/auth";
import { isBootstrapRequired } from "@/lib/bootstrap-state";
import { hasServiceRoleEnv } from "@/lib/env";
import { sendPasswordResetOtpEmail } from "@/lib/password-reset-email";
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

const requestResetOtpSchema = z.object({
  identifier: z.string().trim().min(3).max(160),
});

const resetWithOtpSchema = z.object({
  identifier: z.string().trim().min(3).max(160),
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Use the 6-digit code from your email."),
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

export type PasswordResetActionState = {
  status: ActionStatus;
  message: string;
};

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function resolveOtpSecret() {
  return (
    process.env.PASSWORD_RESET_OTP_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "packet-of-lies-fallback-secret"
  );
}

function hashOtpCode(code: string) {
  return createHash("sha256").update(`${code}:${resolveOtpSecret()}`).digest("hex");
}

function createOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function resolveIdentifierProfile(identifier: string) {
  const admin = createAdminClient();
  const normalized = identifier.trim();
  const looksLikeEmail = normalized.includes("@");

  if (looksLikeEmail) {
    const { data } = await admin
      .from("profiles")
      .select("id, email")
      .ilike("email", normalized.toLowerCase())
      .maybeSingle();
    return data ?? null;
  }

  const { data } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("username", normalized)
    .maybeSingle();

  return data ?? null;
}

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

export async function requestPasswordResetOtpAction(
  _prevState: PasswordResetActionState,
  formData: FormData
): Promise<PasswordResetActionState> {
  const parsed = requestResetOtpSchema.safeParse({
    identifier: formData.get("identifier"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter your email or username to receive the reset code.",
    };
  }

  if (!hasServiceRoleEnv()) {
    return {
      status: "error",
      message: "Password reset is not configured yet. Contact your administrator.",
    };
  }

  try {
    const profile = await resolveIdentifierProfile(parsed.data.identifier);
    if (!profile?.id || !profile.email) {
      return {
        status: "success",
        message:
          "If this account exists, a 6-digit reset code has been sent to the registered email.",
      };
    }

    const admin = createAdminClient();
    const threshold = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: recentCount } = await admin
      .from("password_reset_otps")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", threshold);

    if ((recentCount ?? 0) >= 2) {
      return {
        status: "success",
        message:
          "If this account exists, a 6-digit reset code has been sent to the registered email.",
      };
    }

    const code = createOtpCode();
    const hashedOtp = hashOtpCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    await admin
      .from("password_reset_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("user_id", profile.id)
      .is("consumed_at", null);

    const { error: otpInsertError } = await admin.from("password_reset_otps").insert({
      user_id: profile.id,
      email: profile.email.toLowerCase(),
      otp_hash: hashedOtp,
      expires_at: expiresAt,
    });

    if (otpInsertError) {
      return {
        status: "error",
        message: "Could not start password reset right now. Please try again.",
      };
    }

    await sendPasswordResetOtpEmail({
      to: profile.email.toLowerCase(),
      otpCode: code,
      expiresInMinutes: OTP_TTL_MINUTES,
    });

    return {
      status: "success",
      message:
        "If this account exists, a 6-digit reset code has been sent to the registered email.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Password reset request failed. Please try again.",
    };
  }
}

export async function resetPasswordWithOtpAction(
  _prevState: PasswordResetActionState,
  formData: FormData
): Promise<PasswordResetActionState> {
  const parsed = resetWithOtpSchema.safeParse({
    identifier: formData.get("identifier"),
    otpCode: formData.get("otpCode"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid password reset payload.",
    };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  if (!validateStrongPassword(parsed.data.password)) {
    return {
      status: "error",
      message:
        "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.",
    };
  }

  if (!hasServiceRoleEnv()) {
    return {
      status: "error",
      message: "Password reset is not configured yet. Contact your administrator.",
    };
  }

  try {
    const profile = await resolveIdentifierProfile(parsed.data.identifier);
    if (!profile?.id) {
      return { status: "error", message: "Invalid reset code or account." };
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();
    const { data: latestOtp } = await admin
      .from("password_reset_otps")
      .select("id, otp_hash, attempts, expires_at, consumed_at")
      .eq("user_id", profile.id)
      .is("consumed_at", null)
      .gte("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestOtp) {
      return {
        status: "error",
        message: "The reset code is invalid or has expired. Request a new OTP.",
      };
    }

    if ((latestOtp.attempts ?? 0) >= OTP_MAX_ATTEMPTS) {
      return {
        status: "error",
        message: "Too many attempts for this code. Request a new OTP.",
      };
    }

    const expectedHash = hashOtpCode(parsed.data.otpCode);
    if (latestOtp.otp_hash !== expectedHash) {
      await admin
        .from("password_reset_otps")
        .update({
          attempts: (latestOtp.attempts ?? 0) + 1,
          last_attempt_at: nowIso,
        })
        .eq("id", latestOtp.id);

      return { status: "error", message: "Invalid OTP code." };
    }

    const passwordUpdate = await admin.auth.admin.updateUserById(profile.id, {
      password: parsed.data.password,
    });

    if (passwordUpdate.error) {
      return { status: "error", message: passwordUpdate.error.message };
    }

    await admin
      .from("password_reset_otps")
      .update({
        consumed_at: nowIso,
        last_attempt_at: nowIso,
      })
      .eq("user_id", profile.id)
      .is("consumed_at", null);

    revalidatePath("/auth/login");

    return {
      status: "success",
      message: "Password has been reset. You can now sign in with the new password.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not reset password right now. Please try again.",
    };
  }
}
