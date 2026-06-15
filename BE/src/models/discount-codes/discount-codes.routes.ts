import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import * as discountCodesController from "@/models/discount-codes/discount-codes.controller";
import { applyDiscountCodeBodySchema } from "@/models/discount-codes/discount-codes.validation";

const router = Router();

router.post(
  "/apply",
  validate(applyDiscountCodeBodySchema),
  discountCodesController.applyDiscountCode,
);

export default router;
