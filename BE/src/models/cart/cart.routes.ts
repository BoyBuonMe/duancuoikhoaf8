import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as cartController from "@/models/cart/cart.controller";
import {
  addItemBodySchema,
  itemParamsSchema,
  updateItemBodySchema,
} from "@/models/cart/cart.validation";

const router = Router();

// All cart routes require authentication.
router.use(requireAuth);

router.get("/", cartController.getCart);
router.post("/items", validate(addItemBodySchema), cartController.addItem);
router.patch(
  "/items/:sku",
  validate(itemParamsSchema, "params"),
  validate(updateItemBodySchema),
  cartController.updateItem,
);
router.delete(
  "/items/:sku",
  validate(itemParamsSchema, "params"),
  cartController.removeItem,
);
router.delete("/", cartController.clearCart);

export default router;
