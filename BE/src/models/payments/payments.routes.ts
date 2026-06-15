import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as paymentsController from "@/models/payments/payments.controller";
import {
  createMomoPaymentBodySchema,
  createVnpayPaymentBodySchema,
  vnpTxnRefParamsSchema,
} from "@/models/payments/payments.validation";

const router = Router();

router.post(
  "/momo/create",
  requireAuth,
  validate(createMomoPaymentBodySchema),
  paymentsController.createMomoPayment,
);

router.get("/momo/return", paymentsController.momoReturn);
router.post("/momo/ipn", paymentsController.momoIpn);

router.post(
  "/vnpay/create",
  requireAuth,
  validate(createVnpayPaymentBodySchema),
  paymentsController.createVnpayPayment,
);

router.get(
  "/vnpay/result/:vnpTxnRef",
  requireAuth,
  validate(vnpTxnRefParamsSchema, "params"),
  paymentsController.getVnpayPaymentResult,
);

router.get("/vnpay/return", paymentsController.vnpayReturn);
router.get("/vnpay/ipn", paymentsController.vnpayIpn);

export default router;
