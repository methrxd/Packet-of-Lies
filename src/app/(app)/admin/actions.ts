"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext } from "@/lib/auth";
import { getSiteUrl } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "analyst"]),
});

const inviteSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "analyst"]).default("analyst"),
});

export type RoleActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type InviteActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateUserRoleAction(
  _prevState: RoleActionState,
  formData: FormData
): Promise<RoleActionState> {
  const auth = await getAuthContext();

  if (!auth || auth.role !== "admin") {
    return {
      status: "error",
      message: "Only admins can update access roles.",
    };
  }

  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid role update request.",
    };
  }

  if (parsed.data.userId === auth.userId && parsed.data.role !== "admin") {
    return {
      status: "error",
      message: "You cannot remove your own admin role.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/admin");

  return {
    status: "success",
    message: "Role updated successfully.",
  };
}

export async function inviteUserAction(
  _prevState: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const auth = await getAuthContext();

  if (!auth || auth.role !== "admin") {
    return {
      status: "error",
      message: "Only admins can invite users.",
    };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "analyst",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid invite payload.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const siteUrl = getSiteUrl();
  const admin = createAdminClient();

  const invite = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/complete-profile`,
    data: {
      invited_by: auth.userId,
    },
  });

  if (invite.error) {
    return {
      status: "error",
      message: invite.error.message,
    };
  }

  const roleUpdate = await admin
    .from("profiles")
    .update({
      role: parsed.data.role,
      profile_completed_at: null,
      username: null,
    })
    .eq("email", email);

  if (roleUpdate.error) {
    return {
      status: "error",
      message: roleUpdate.error.message,
    };
  }

  revalidatePath("/admin");

  return {
    status: "success",
    message: "Invite sent successfully.",
  };
}
