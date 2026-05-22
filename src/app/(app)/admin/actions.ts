"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendAccessApprovedEmail } from "@/lib/access-request-email";
import { getAuthContext, type AuthContext } from "@/lib/auth";
import { getSiteUrl, hasInviteEmailEnv } from "@/lib/env";
import { sendInviteEmail } from "@/lib/invite-email";
import { createAdminClient } from "@/lib/supabase/admin";

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

const createRoleSchema = z.object({
  name: z.string().trim().min(3).max(32),
  description: z.string().trim().max(140).optional(),
});

const rolePermissionsSchema = z.object({
  roleId: z.string().uuid(),
});

const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

const inviteSchema = z.object({
  email: z.string().trim().email(),
  roleId: z.string().uuid(),
});

const reviewAccessRequestSchema = z.object({
  requestId: z.string().uuid(),
  roleId: z.string().uuid(),
  reviewNotes: z.string().trim().max(500).optional(),
});

const rejectAccessRequestSchema = z.object({
  requestId: z.string().uuid(),
  reviewNotes: z.string().trim().max(500).optional(),
});

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type RoleActionState = ActionState;
export type InviteActionState = ActionState;
export type AccessRequestActionState = ActionState;

const ROLE_NAME_REGEX = /^[a-z][a-z0-9_-]{2,31}$/;
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_TTL_HOURS = 48;

function joinCodeSecret() {
  return (
    process.env.ACCESS_REQUEST_JOIN_CODE_SECRET ??
    process.env.PASSWORD_RESET_OTP_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "packet-of-lies-join-code-secret"
  );
}

function hashJoinCode(code: string) {
  return createHash("sha256").update(`${code}:${joinCodeSecret()}`).digest("hex");
}

function createJoinCode(length = 10) {
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = bytes[i] % JOIN_CODE_ALPHABET.length;
    result += JOIN_CODE_ALPHABET[index];
  }
  return `${result.slice(0, 5)}-${result.slice(5)}`;
}

async function ensureAdminAccess(): Promise<{ auth: AuthContext } | { error: string }> {
  const auth = await getAuthContext();
  if (!auth || auth.role !== "admin") {
    return { error: "Only admins can perform this action." };
  }

  return { auth };
}

async function getRoleById(admin: ReturnType<typeof createAdminClient>, roleId: string) {
  const roleResult = await admin
    .from("app_roles")
    .select("id, name")
    .eq("id", roleId)
    .maybeSingle();

  return roleResult;
}

function accessRoleFromRoleName(roleName: string): "admin" | "analyst" {
  return roleName === "admin" ? "admin" : "analyst";
}

export async function updateUserRoleAction(
  _prevState: RoleActionState,
  formData: FormData
): Promise<RoleActionState> {
  const access = await ensureAdminAccess();
  if ("error" in access) {
    return { status: "error", message: access.error };
  }

  const parsed = assignRoleSchema.safeParse({
    userId: formData.get("userId"),
    roleId: formData.get("roleId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid role update request.",
    };
  }

  try {
    const admin = createAdminClient();
    const targetRole = await getRoleById(admin, parsed.data.roleId);
    if (targetRole.error || !targetRole.data) {
      return { status: "error", message: "Selected role does not exist." };
    }

    const targetProfile = await admin
      .from("profiles")
      .select("role")
      .eq("id", parsed.data.userId)
      .maybeSingle();

    if (targetProfile.error || !targetProfile.data) {
      return { status: "error", message: "Target user was not found." };
    }

    const accessRole = accessRoleFromRoleName(targetRole.data.name);

    if (parsed.data.userId === access.auth.userId && accessRole !== "admin") {
      return {
        status: "error",
        message: "You cannot remove your own admin access.",
      };
    }

    if (targetProfile.data.role === "admin" && accessRole !== "admin") {
      const adminCount = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((adminCount.count ?? 0) <= 1) {
        return {
          status: "error",
          message: "At least one admin account must remain active.",
        };
      }
    }

    const update = await admin
      .from("profiles")
      .update({
        role_id: targetRole.data.id,
        role: accessRole,
      })
      .eq("id", parsed.data.userId);

    if (update.error) {
      return { status: "error", message: update.error.message };
    }
  } catch (caught) {
    return {
      status: "error",
      message:
        caught instanceof Error &&
        caught.message.includes("SUPABASE_SERVICE_ROLE_KEY")
          ? "Server setup missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel project environment variables, then redeploy."
          : caught instanceof Error
            ? caught.message
            : "Role update failed due to server configuration.",
    };
  }

  revalidatePath("/admin");

  return {
    status: "success",
    message: "Role updated successfully.",
  };
}

export async function createRoleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const access = await ensureAdminAccess();
  if ("error" in access) {
    return { status: "error", message: access.error };
  }

  const parsed = createRoleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid role values." };
  }

  if (!ROLE_NAME_REGEX.test(parsed.data.name)) {
    return {
      status: "error",
      message:
        "Role name must be 3-32 characters and use lowercase letters, numbers, underscores, or hyphens.",
    };
  }

  try {
    const admin = createAdminClient();
    const insert = await admin.from("app_roles").insert({
      name: parsed.data.name,
      description: parsed.data.description || null,
      is_system: false,
    });

    if (insert.error) {
      if (insert.error.message.toLowerCase().includes("duplicate")) {
        return { status: "error", message: "A role with that name already exists." };
      }
      return { status: "error", message: insert.error.message };
    }
  } catch (caught) {
    return {
      status: "error",
      message: caught instanceof Error ? caught.message : "Failed to create role.",
    };
  }

  revalidatePath("/admin");
  return { status: "success", message: "Role created." };
}

export async function updateRolePermissionsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const access = await ensureAdminAccess();
  if ("error" in access) {
    return { status: "error", message: access.error };
  }

  const parsed = rolePermissionsSchema.safeParse({
    roleId: formData.get("roleId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid role permission payload." };
  }

  const selectedPermissionKeys = formData
    .getAll("permissionKeys")
    .filter((value): value is string => typeof value === "string");

  try {
    const admin = createAdminClient();

    const roleResult = await getRoleById(admin, parsed.data.roleId);
    if (roleResult.error || !roleResult.data) {
      return { status: "error", message: "Role not found." };
    }

    const availablePermissions = await admin
      .from("app_permissions")
      .select("key");

    if (availablePermissions.error) {
      return { status: "error", message: availablePermissions.error.message };
    }

    const validPermissionSet = new Set(
      (availablePermissions.data ?? []).map((permission) => permission.key)
    );
    const invalidKey = selectedPermissionKeys.find(
      (permissionKey) => !validPermissionSet.has(permissionKey)
    );

    if (invalidKey) {
      return {
        status: "error",
        message: `Unknown permission: ${invalidKey}`,
      };
    }

    const wipeExisting = await admin
      .from("app_role_permissions")
      .delete()
      .eq("role_id", parsed.data.roleId);
    if (wipeExisting.error) {
      return { status: "error", message: wipeExisting.error.message };
    }

    if (selectedPermissionKeys.length > 0) {
      const insert = await admin.from("app_role_permissions").insert(
        selectedPermissionKeys.map((permissionKey) => ({
          role_id: parsed.data.roleId,
          permission_key: permissionKey,
        }))
      );
      if (insert.error) {
        return { status: "error", message: insert.error.message };
      }
    }
  } catch (caught) {
    return {
      status: "error",
      message:
        caught instanceof Error
          ? caught.message
          : "Failed to update role permissions.",
    };
  }

  revalidatePath("/admin");
  return { status: "success", message: "Role permissions updated." };
}

export async function deleteUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const access = await ensureAdminAccess();
  if ("error" in access) {
    return { status: "error", message: access.error };
  }

  const parsed = deleteUserSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid delete user request." };
  }

  if (parsed.data.userId === access.auth.userId) {
    return {
      status: "error",
      message: "You cannot delete your own account from this panel.",
    };
  }

  try {
    const admin = createAdminClient();

    const targetProfile = await admin
      .from("profiles")
      .select("id, email, role, avatar_path")
      .eq("id", parsed.data.userId)
      .maybeSingle();

    if (targetProfile.error || !targetProfile.data) {
      return { status: "error", message: "User not found." };
    }

    if (targetProfile.data.role === "admin") {
      const adminCount = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((adminCount.count ?? 0) <= 1) {
        return {
          status: "error",
          message: "At least one admin account must remain active.",
        };
      }
    }

    await admin
      .from("cases")
      .update({ created_by: access.auth.userId })
      .eq("created_by", parsed.data.userId);

    await admin
      .from("submissions")
      .update({ submitted_by: access.auth.userId })
      .eq("submitted_by", parsed.data.userId);

    await admin
      .from("case_findings")
      .update({ created_by: access.auth.userId })
      .eq("created_by", parsed.data.userId);

    await admin
      .from("case_mitigations")
      .update({ created_by: access.auth.userId })
      .eq("created_by", parsed.data.userId);

    await admin
      .from("case_comments")
      .update({ created_by: access.auth.userId })
      .eq("created_by", parsed.data.userId);

    await admin
      .from("case_activity_log")
      .update({ actor_user_id: access.auth.userId })
      .eq("actor_user_id", parsed.data.userId);

    await admin
      .from("cases")
      .update({ assigned_to: null })
      .eq("assigned_to", parsed.data.userId);

    if (targetProfile.data.avatar_path) {
      await admin.storage
        .from("profile-avatars")
        .remove([targetProfile.data.avatar_path]);
    }

    const deleted = await admin.auth.admin.deleteUser(parsed.data.userId, false);

    if (deleted.error) {
      const message = deleted.error.message.toLowerCase();
      if (message.includes("owner of any objects in supabase storage")) {
        return {
          status: "error",
          message:
            "This user still owns files in Supabase Storage. Remove those files, then retry deletion.",
        };
      }
      return { status: "error", message: deleted.error.message };
    }
  } catch (caught) {
    return {
      status: "error",
      message: caught instanceof Error ? caught.message : "Failed to delete user.",
    };
  }

  revalidatePath("/admin");
  return { status: "success", message: "User removed completely." };
}

export async function inviteUserAction(
  _prevState: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const access = await ensureAdminAccess();
  if ("error" in access) {
    return { status: "error", message: access.error };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    roleId: formData.get("roleId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid invite payload.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const siteUrl = getSiteUrl();
  let inviteError: string | null = null;
  let roleUpdateError: string | null = null;
  try {
    const admin = createAdminClient();
    const role = await getRoleById(admin, parsed.data.roleId);
    if (role.error || !role.data) {
      return { status: "error", message: "Selected role does not exist." };
    }
    const accessRole = accessRoleFromRoleName(role.data.name);

    const generatedLink = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: `${siteUrl}/auth/complete-profile`,
        data: {
          invited_by: access.auth.userId,
        },
      },
    });

    if (generatedLink.error) {
      inviteError = generatedLink.error.message;
    } else {
      const inviteLink = generatedLink.data.properties.action_link;
      const tokenHash = generatedLink.data.properties.hashed_token;

      if (!inviteLink || !tokenHash) {
        return {
          status: "error",
          message: "Invite link generation failed.",
        };
      }

      const appInviteLink = `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(
        tokenHash
      )}&type=invite&next=${encodeURIComponent("/auth/complete-profile")}`;

      if (!hasInviteEmailEnv()) {
        return {
          status: "error",
          message:
            "Invite email sender is not configured. Add INVITE_SMTP_USER and INVITE_SMTP_PASS in Vercel and redeploy.",
        };
      }

      await sendInviteEmail({
        to: email,
        role: accessRole,
        invitedByEmail: access.auth.email,
        inviteLink: appInviteLink,
      });

      const roleUpdate = await admin
        .from("profiles")
        .update({
          role: accessRole,
          role_id: role.data.id,
          profile_completed_at: null,
          username: null,
        })
        .eq("email", email);
      roleUpdateError = roleUpdate.error?.message ?? null;
    }
  } catch (caught) {
    return {
      status: "error",
      message:
        caught instanceof Error &&
        caught.message.includes("SUPABASE_SERVICE_ROLE_KEY")
          ? "Server setup missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel project environment variables, then redeploy."
          : caught instanceof Error
            ? caught.message
            : "Invite failed due to server configuration.",
    };
  }

  if (inviteError) {
    return {
      status: "error",
      message: inviteError,
    };
  }

  if (roleUpdateError) {
    return {
      status: "error",
      message: roleUpdateError,
    };
  }

  revalidatePath("/admin");

  return {
    status: "success",
    message: "Invite sent successfully.",
  };
}

export async function approveAccessRequestAction(
  _prevState: AccessRequestActionState,
  formData: FormData
): Promise<AccessRequestActionState> {
  const access = await ensureAdminAccess();
  if ("error" in access) {
    return { status: "error", message: access.error };
  }

  const parsed = reviewAccessRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    roleId: formData.get("roleId"),
    reviewNotes: formData.get("reviewNotes") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid approval payload." };
  }

  if (!hasInviteEmailEnv()) {
    return {
      status: "error",
      message:
        "Email sender is not configured. Add INVITE_SMTP_USER and INVITE_SMTP_PASS before approving access requests.",
    };
  }

  const admin = createAdminClient();
  const roleResult = await getRoleById(admin, parsed.data.roleId);
  if (roleResult.error || !roleResult.data) {
    return { status: "error", message: "Selected role does not exist." };
  }

  const requestResult = await admin
    .from("access_requests")
    .select("id, email, full_name, status")
    .eq("id", parsed.data.requestId)
    .maybeSingle();

  if (requestResult.error || !requestResult.data) {
    return { status: "error", message: "Access request not found." };
  }

  if (requestResult.data.status !== "pending") {
    return {
      status: "error",
      message: "This request is already processed.",
    };
  }

  const code = createJoinCode();
  const codeHash = hashJoinCode(code);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + JOIN_CODE_TTL_HOURS * 60 * 60 * 1000);

  const update = await admin
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_by: access.auth.userId,
      reviewed_at: now.toISOString(),
      review_notes: parsed.data.reviewNotes || null,
      approved_role_id: roleResult.data.id,
      join_code_hash: codeHash,
      join_code_expires_at: expiresAt.toISOString(),
      join_code_sent_at: now.toISOString(),
      join_code_consumed_at: null,
      joined_user_id: null,
    })
    .eq("id", requestResult.data.id);

  if (update.error) {
    return { status: "error", message: update.error.message };
  }

  try {
    const siteUrl = getSiteUrl();
    await sendAccessApprovedEmail({
      to: requestResult.data.email,
      fullName: requestResult.data.full_name,
      joinCode: code,
      roleName: roleResult.data.name,
      expiresAtLabel: expiresAt.toLocaleString(),
      loginUrl: `${siteUrl}/auth/login`,
    });
  } catch (error) {
    await admin
      .from("access_requests")
      .update({
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        review_notes: null,
        approved_role_id: null,
        join_code_hash: null,
        join_code_expires_at: null,
        join_code_sent_at: null,
        join_code_consumed_at: null,
        joined_user_id: null,
      })
      .eq("id", requestResult.data.id);

    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to send approval email.",
    };
  }

  revalidatePath("/admin");
  return {
    status: "success",
    message: `Approved and emailed one-time join code to ${requestResult.data.email}.`,
  };
}

export async function rejectAccessRequestAction(
  _prevState: AccessRequestActionState,
  formData: FormData
): Promise<AccessRequestActionState> {
  const access = await ensureAdminAccess();
  if ("error" in access) {
    return { status: "error", message: access.error };
  }

  const parsed = rejectAccessRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    reviewNotes: formData.get("reviewNotes") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid rejection payload." };
  }

  const admin = createAdminClient();
  const update = await admin
    .from("access_requests")
    .update({
      status: "rejected",
      reviewed_by: access.auth.userId,
      reviewed_at: new Date().toISOString(),
      review_notes: parsed.data.reviewNotes || null,
      approved_role_id: null,
      join_code_hash: null,
      join_code_expires_at: null,
      join_code_sent_at: null,
      join_code_consumed_at: null,
      joined_user_id: null,
    })
    .eq("id", parsed.data.requestId)
    .eq("status", "pending");

  if (update.error) {
    return { status: "error", message: update.error.message };
  }

  revalidatePath("/admin");
  return {
    status: "success",
    message: "Access request rejected.",
  };
}
