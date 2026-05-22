import nodemailer from "nodemailer";

import { getInviteEmailEnv } from "@/lib/env";

type PasswordResetEmailInput = {
  to: string;
  otpCode: string;
  expiresInMinutes: number;
};

export async function sendPasswordResetOtpEmail(input: PasswordResetEmailInput) {
  const env = getInviteEmailEnv();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.INVITE_SMTP_USER,
      pass: env.INVITE_SMTP_PASS,
    },
  });

  const subject = "Packet of Lies password reset code";
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#0e1116; color:#eef2f7; padding:24px; border-radius:12px; border:1px solid #1f2937;">
      <p style="margin:0 0 10px; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#93c5fd;">Packet of Lies</p>
      <h1 style="margin:0 0 14px; font-size:22px; color:#ffffff;">Password reset verification code</h1>
      <p style="margin:0 0 14px; line-height:1.6;">
        Use this one-time code to reset your account password:
      </p>
      <div style="display:inline-block; font-size:30px; letter-spacing:0.35em; font-weight:700; padding:10px 16px; border-radius:10px; background:#111827; border:1px solid #334155;">
        ${input.otpCode}
      </div>
      <p style="margin:16px 0 0; line-height:1.6; color:#cbd5e1;">
        This code expires in ${input.expiresInMinutes} minutes. If you did not request this reset, you can ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Packet of Lies" <${env.INVITE_SMTP_USER}>`,
    to: input.to,
    subject,
    html,
  });
}
