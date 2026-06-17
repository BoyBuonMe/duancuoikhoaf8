import type { CookieOptions, NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import type { Types } from "mongoose";
import { createHash, randomBytes } from "node:crypto";
import User from "@/models/users/User.model";
import RefreshToken from "@/models/auth/Auth.model";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/models/auth/email.service";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type JwtPayload,
} from "@/utils/jwt";
import { httpError } from "@/utils/http-error";
import type {
  ForgotPasswordBody,
  GoogleAuthBody,
  LoginBody,
  RegisterBody,
  ResendVerificationBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from "@/models/auth/auth.validation";

const REFRESH_COOKIE = "refreshToken";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_EXPIRES_MS = 60 * 60 * 1000;
const PASSWORD_RESET_MESSAGE =
  "If an account exists for this email, password reset instructions have been sent.";
const VERIFICATION_SENT_MESSAGE =
  "If an account exists and needs verification, a verification email has been sent.";
const googleClient = new OAuth2Client();

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: SEVEN_DAYS_MS,
  };
}

async function issueTokens(
  res: Response,
  payload: JwtPayload,
): Promise<string> {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

  await RefreshToken.create({
    tokenHash: hashResetToken(refreshToken),
    userId: payload.sub,
    userEmail: payload.email,
    expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
  });

  return accessToken;
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function buildResetUrl(token: string): string | undefined {
  const origin =
    process.env.APP_ORIGIN ||
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  if (!origin || origin === "*") return undefined;
  return `${origin.replace(/\/$/, "")}/account/reset-password?token=${encodeURIComponent(
    token,
  )}`;
}

function appOrigin(): string | undefined {
  const origin =
    process.env.APP_ORIGIN ||
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  if (!origin || origin === "*") return undefined;
  return origin.replace(/\/$/, "");
}

function buildVerificationUrl(token: string): string | undefined {
  const origin = appOrigin();
  if (!origin) return undefined;
  return `${origin}/account/verify-email?token=${encodeURIComponent(token)}`;
}

async function issueEmailVerification(user: {
  _id: Types.ObjectId;
  email: string;
  name?: string;
}): Promise<{ verificationToken?: string; verificationUrl?: string }> {
  const verificationToken = randomBytes(
    EMAIL_VERIFICATION_TOKEN_BYTES,
  ).toString("hex");
  const verificationUrl = buildVerificationUrl(verificationToken);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerificationTokenHash: hashResetToken(verificationToken),
        emailVerificationExpiresAt: new Date(
          Date.now() + EMAIL_VERIFICATION_EXPIRES_MS,
        ),
      },
    },
  );

  if (verificationUrl) {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("APP_ORIGIN is required for email verification");
  } else if (process.env.NODE_ENV !== "production") {
    console.info(
      `[auth] Email verification token for ${user.email}: ${verificationToken}`,
    );
  }

  if (process.env.NODE_ENV === "production") return {};
  return { verificationToken, verificationUrl };
}

function authUser(user: {
  id: string;
  email: string;
  name?: string;
  role?: "user" | "admin" | "boss";
  status?: "active" | "blocked";
  emailVerified?: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  };
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password, name } = req.body as RegisterBody;

    const exists = await User.findOne({ email });
    if (exists) {
      throw httpError("Email already registered", 409);
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name,
      authProvider: "local",
      emailVerified: false,
    });

    const devVerification = await issueEmailVerification(user);
    res.status(201).json({
      message: "Account created. Please verify your email before logging in.",
      ...devVerification,
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as LoginBody;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      throw httpError("Invalid credentials", 401);
    }

    if (!user.passwordHash) {
      throw httpError("Please continue with Google sign in", 401);
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      throw httpError("Invalid credentials", 401);
    }

    if (user.status === "blocked") {
      throw httpError("Account is blocked", 403);
    }

    if (!user.emailVerified) {
      throw httpError(
        "Please verify your email before logging in",
        403,
        "EMAIL_NOT_VERIFIED",
      );
    }

    const token = await issueTokens(res, {
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    res.json({
      token,
      user: authUser(user),
    });
  } catch (e) {
    next(e);
  }
}

export async function google(req: Request, res: Response, next: NextFunction) {
  try {
    const { credential } = req.body as GoogleAuthBody;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw httpError("Google OAuth is not configured", 500);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    const email = payload?.email?.trim().toLowerCase();
    const googleId = payload?.sub;

    if (!email || !googleId || payload.email_verified !== true) {
      throw httpError("Invalid Google account", 401);
    }

    const name = payload.name?.trim() ?? "";
    const existingByGoogle = await User.findOne({ googleId });
    const existingByEmail = existingByGoogle
      ? null
      : await User.findOne({ email }).select("+googleId");

    const user =
      existingByGoogle ??
      (existingByEmail
        ? await User.findByIdAndUpdate(
            existingByEmail._id,
            {
              $set: {
                googleId,
                authProvider: "google",
                emailVerified: true,
                ...(name && !existingByEmail.name ? { name } : {}),
              },
              $unset: {
                emailVerificationTokenHash: "",
                emailVerificationExpiresAt: "",
              },
            },
            { new: true },
          )
        : await User.create({
            email,
            googleId,
            name,
            authProvider: "google",
            emailVerified: true,
          }));

    if (!user) throw httpError("Unable to sign in with Google", 500);

    if (user.status === "blocked") {
      throw httpError("Account is blocked", 403);
    }

    const token = await issueTokens(res, {
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    res.json({ token, user: authUser(user) });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/auth/refresh
 * Reads the refresh token from the httpOnly cookie, verifies it, and
 * issues a fresh access token (plus a rotated refresh cookie). The
 * client never sees the refresh value.
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    const token = cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw httpError("Refresh token missing", 401);
    }

    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw httpError("Invalid or expired refresh token", 401);
    }

    // Kiểm tra token có tồn tại trong DB không (revocation check)
    const stored = await RefreshToken.findOneAndDelete({
      tokenHash: hashResetToken(token),
    });
    if (!stored) {
      // Token đã bị revoke hoặc không hợp lệ — xoá cookie
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
      throw httpError("Refresh token revoked", 401);
    }

    // Rotation: issue hoàn toàn token mới
    const user = await User.findById(payload.sub).select("email role status");
    if (!user || user.status === "blocked") {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
      throw httpError("Unauthorized", 401);
    }

    const accessToken = await issueTokens(res, {
      sub: payload.sub,
      email: user.email,
      role: user.role,
    });
    res.json({ token: accessToken });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/auth/logout
 * Clears the refresh cookie. The client is also expected to drop its
 * in-memory access token.
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    const token = cookies?.[REFRESH_COOKIE];

    if (token) {
      await RefreshToken.deleteOne({ tokenHash: hashResetToken(token) });
    }

    res.clearCookie(REFRESH_COOKIE, {
      ...refreshCookieOptions(),
      maxAge: undefined,
    });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = req.body as ForgotPasswordBody;
    const user = await User.findOne({ email }).select("_id email name");
    const response = { message: PASSWORD_RESET_MESSAGE };

    if (user) {
      const resetToken = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString(
        "hex",
      );
      const resetUrl = buildResetUrl(resetToken);

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetTokenHash: hashResetToken(resetToken),
            passwordResetExpiresAt: new Date(
              Date.now() + PASSWORD_RESET_EXPIRES_MS,
            ),
          },
        },
      );

      if (resetUrl) {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      } else if (process.env.NODE_ENV === "production") {
        throw new Error("APP_ORIGIN is required for password reset");
      } else {
        console.info(
          `[auth] Password reset token for ${user.email}: ${resetToken}`,
        );
      }
    }

    res.json(response);
  } catch (e) {
    next(e);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = (
      (req.body as Partial<VerifyEmailBody> | undefined)?.token ||
      (typeof req.query.token === "string" ? req.query.token : "")
    )?.trim();

    if (!token) {
      throw httpError("Verification token is required", 400);
    }

    const user = await User.findOne({
      emailVerificationTokenHash: hashResetToken(token),
      emailVerificationExpiresAt: { $gt: new Date() },
    }).select("_id");

    if (!user) {
      throw httpError("Invalid or expired verification token", 400);
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: {
          emailVerificationTokenHash: "",
          emailVerificationExpiresAt: "",
        },
      },
    );

    res.json({ message: "Email has been verified." });
  } catch (e) {
    next(e);
  }
}

export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = req.body as ResendVerificationBody;
    const user = await User.findOne({
      email,
      emailVerified: false,
    }).select("_id email name");
    const response: {
      message: string;
      verificationToken?: string;
      verificationUrl?: string;
    } = { message: VERIFICATION_SENT_MESSAGE };

    if (user) {
      Object.assign(response, await issueEmailVerification(user));
    }

    res.json(response);
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token, password } = req.body as ResetPasswordBody;
    const user = await User.findOne({
      passwordResetTokenHash: hashResetToken(token),
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("_id");

    if (!user) {
      throw httpError("Invalid or expired password reset token", 400);
    }

    const passwordHash = await User.hashPassword(password);
    await User.updateOne(
      { _id: user._id },
      {
        $set: { passwordHash },
        $unset: {
          passwordResetTokenHash: "",
          passwordResetExpiresAt: "",
        },
      },
    );

    res.json({ message: "Password has been reset." });
  } catch (e) {
    next(e);
  }
}
