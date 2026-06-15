import { Router } from "express";
import * as authController from "@/models/auth/auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import {
  loginLimiter,
  registerLimiter,
} from "@/middlewares/rate-limit.middleware";
import {
  forgotPasswordBodySchema,
  googleAuthBodySchema,
  loginBodySchema,
  registerBodySchema,
  resendVerificationBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from "@/models/auth/auth.validation";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  validate(registerBodySchema),
  authController.register,
);
router.post(
  "/login",
  loginLimiter,
  validate(loginBodySchema),
  authController.login,
);
router.post(
  "/google",
  loginLimiter,
  validate(googleAuthBodySchema),
  authController.google,
);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/verify-email", authController.verifyEmail);
router.post(
  "/verify-email",
  loginLimiter,
  validate(verifyEmailBodySchema),
  authController.verifyEmail,
);
router.post(
  "/resend-verification",
  loginLimiter,
  validate(resendVerificationBodySchema),
  authController.resendVerification,
);
router.post(
  "/forgot-password",
  loginLimiter,
  validate(forgotPasswordBodySchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  loginLimiter,
  validate(resetPasswordBodySchema),
  authController.resetPassword,
);

export default router;
