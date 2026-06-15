import nodemailer from "nodemailer";

function smtpPort(): number {
  const raw = process.env.SMTP_PORT;
  if (!raw) return 587;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 587;
}

function smtpSecure(): boolean {
  return process.env.SMTP_SECURE === "true";
}

export function mailFrom(): string {
  return process.env.MAIL_FROM || process.env.SMTP_USER || "";
}

export function hasSmtpConfig(): boolean {
  return Boolean(process.env.SMTP_HOST && mailFrom());
}

export function createMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort(),
    secure: smtpSecure(),
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

export async function sendMailMessage(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[mail] Skipping send to ${options.to} — subject: ${options.subject}`,
      );
      console.info(options.text);
      return;
    }
    throw new Error("SMTP configuration is missing");
  }

  await createMailTransporter().sendMail({
    from: mailFrom(),
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
