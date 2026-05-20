"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthContext } from "@/lib/auth";
import { getSiteUrl, hasInviteEmailEnv } from "@/lib/env";
import { sendInviteEmail } from "@/lib/invite-email";
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

  let error: { message: string } | null = null;
  try {
    const admin = createAdminClient();
    const result = await admin
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.userId);
    error = result.error;
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
  let inviteError: string | null = null;
  let roleUpdateError: string | null = null;
  try {
    const admin = createAdminClient();

    const generatedLink = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: `${siteUrl}/auth/complete-profile`,
        data: {
          invited_by: auth.userId,
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
        role: parsed.data.role,
        invitedByEmail: auth.email,
        inviteLink: appInviteLink,
      });

      const roleUpdate = await admin
        .from("profiles")
        .update({
          role: parsed.data.role,
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
