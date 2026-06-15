import {
  createMailTransporter,
  hasSmtpConfig,
  mailFrom,
} from "@/utils/mail";

type VerificationEmailParams = {
  to: string;
  name?: string;
  verificationUrl: string;
};

type PasswordResetEmailParams = {
  to: string;
  name?: string;
  resetUrl: string;
};

type VoucherWishlistEmailParams = {
  to: string;
  productName: string;
  voucherLabel: string;
};

function transporter() {
  return createMailTransporter();
}

export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: VerificationEmailParams): Promise<void> {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[auth] Email verification link for ${to}: ${verificationUrl}`,
      );
      return;
    }
    throw new Error("SMTP configuration is missing");
  }

  const displayName = name?.trim() || "there";
  await transporter().sendMail({
    from: mailFrom(),
    to,
    subject: "Verify your email address",
    text: [
      `Hi ${displayName},`,
      "",
      "Please verify your email address to finish creating your account.",
      verificationUrl,
      "",
      "This link expires in 24 hours.",
    ].join("\n"),
    html: `
      <p>Hi ${displayName},</p>
      <p>Please verify your email address to finish creating your account.</p>
      <p><a href="${verificationUrl}">Verify email address</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: PasswordResetEmailParams): Promise<void> {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth] Password reset link for ${to}: ${resetUrl}`);
      return;
    }
    throw new Error("SMTP configuration is missing");
  }

  const displayName = name?.trim() || "there";
  await transporter().sendMail({
    from: mailFrom(),
    to,
    subject: "Reset your password",
    text: [
      `Hi ${displayName},`,
      "",
      "We received a request to reset your password.",
      resetUrl,
      "",
      "This link expires in 1 hour. If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Hi ${displayName},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request a password reset, you can ignore this email.</p>
    `,
  });
}

export async function sendVoucherWishlistEmail({
  to,
  productName,
  voucherLabel,
}: VoucherWishlistEmailParams): Promise<void> {
  const subject = `${productName} is on sale — ${voucherLabel}`;
  const text = [
    "Hi there,",
    "",
    `Good news! ${productName} is currently eligible for ${voucherLabel}.`,
    "Grab it from your wishlist before the offer ends.",
    "",
    "Shop now and place your order today.",
  ].join("\n");

  const html = `
    <p>Hi there,</p>
    <p>Good news! <strong>${productName}</strong> is currently eligible for <strong>${voucherLabel}</strong>.</p>
    <p>Grab it from your wishlist before the offer ends.</p>
    <p>Shop now and place your order today.</p>
  `;

  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[voucher] Wishlist promo email for ${to}: ${subject}`);
      return;
    }
    throw new Error("SMTP configuration is missing");
  }

  await transporter().sendMail({
    from: mailFrom(),
    to,
    subject,
    text,
    html,
  });
}
