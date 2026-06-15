import { Router } from "express";
import { optionalAuth } from "@/middlewares/optional-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as vouchersController from "@/models/vouchers/vouchers.controller";
import { applicableVouchersQuerySchema } from "@/models/vouchers/vouchers.validation";

const router = Router();

router.get(
  "/applicable",
  optionalAuth,
  validate(applicableVouchersQuerySchema, "query"),
  vouchersController.getApplicableVouchers,
);

export default router;
