import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import * as shippingController from "@/models/shipping/shipping.controller";
import { shippingQuoteBodySchema } from "@/models/shipping/shipping.validation";

const router = Router();

router.post(
  "/quote",
  validate(shippingQuoteBodySchema),
  shippingController.getShippingQuote,
);

export default router;
