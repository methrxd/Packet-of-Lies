import nodemailer from "nodemailer";

import { getInviteEmailEnv } from "@/lib/env";

type AccessApprovedEmailInput = {
  to: string;
  fullName: string;
  joinCode: string;
  roleName: string;
  expiresAtLabel: string;
  loginUrl: string;
};

export async function sendAccessApprovedEmail(input: AccessApprovedEmailInput) {
  const env = getInviteEmailEnv();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.INVITE_SMTP_USER,
      pass: env.INVITE_SMTP_PASS,
    },
  });

  const subject = "Your Packet of Lies access request was approved";
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0e1116;color:#eef2f7;padding:24px;border-radius:12px;border:1px solid #1f2937;">
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#93c5fd;">Packet of Lies</p>
      <h1 style="margin:0 0 14px;font-size:22px;color:#ffffff;">Access approved</h1>
      <p style="margin:0 0 14px;line-height:1.6;">Hi ${input.fullName}, your access request was approved with role <strong>${input.roleName}</strong>.</p>
      <p style="margin:0 0 8px;line-height:1.6;">Use this one-time joining code:</p>
      <div style="display:inline-block;font-size:28px;letter-spacing:0.28em;font-weight:700;padding:10px 16px;border-radius:10px;background:#111827;border:1px solid #334155;">
        ${input.joinCode}
      </div>
      <p style="margin:16px 0 0;line-height:1.6;color:#cbd5e1;">This code expires on ${input.expiresAtLabel}. Open the login page and choose <strong>Join with code</strong>.</p>
      <p style="margin:14px 0 0;line-height:1.6;"><a href="${input.loginUrl}" style="display:inline-block;background:#02f96d;color:#041107;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700;">Open login</a></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Packet of Lies" <${env.INVITE_SMTP_USER}>`,
    to: input.to,
    subject,
    html,
  });
}

