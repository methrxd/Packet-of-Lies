import nodemailer from "nodemailer";

import { getInviteEmailEnv } from "@/lib/env";

type InviteEmailInput = {
  to: string;
  role: "admin" | "analyst";
  invitedByEmail: string;
  inviteLink: string;
};

export async function sendInviteEmail(input: InviteEmailInput) {
  const env = getInviteEmailEnv();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.INVITE_SMTP_USER,
      pass: env.INVITE_SMTP_PASS,
    },
  });

  const subject = "Packet of Lies invite";
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; background:#0b0b0d; color:#f5f7fa; padding:24px; border-radius:12px; border:1px solid #202327;">
      <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#9ca3af;">Packet of Lies</p>
      <h1 style="margin:0 0 12px; font-size:22px; color:#02f96d;">You are invited</h1>
      <p style="margin:0 0 10px; line-height:1.6;">You were invited to join Packet of Lies as <strong>${input.role}</strong>.</p>
      <p style="margin:0 0 18px; line-height:1.6;">Invited by: ${input.invitedByEmail}</p>
      <a href="${input.inviteLink}" style="display:inline-block; background:#02f96d; color:#041107; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:700;">Accept invite</a>
      <p style="margin:16px 0 0; color:#9ca3af; font-size:13px;">If the button does not open, copy this link:<br/><span style="word-break:break-all;">${input.inviteLink}</span></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Packet of Lies" <${env.INVITE_SMTP_USER}>`,
    to: input.to,
    subject,
    html,
  });
}
