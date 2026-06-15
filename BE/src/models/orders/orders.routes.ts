import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as ordersController from "@/models/orders/orders.controller";
import {
  createOrderBodySchema,
  orderCodeParamsSchema,
} from "@/models/orders/orders.validation";

const router = Router();

router.use(requireAuth);

router.get("/", ordersController.listOrders);
router.post("/", validate(createOrderBodySchema), ordersController.createOrder);
router.get(
  "/:orderCode",
  validate(orderCodeParamsSchema, "params"),
  ordersController.getOrder,
);

export default router;
