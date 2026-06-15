import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as wishlistController from "@/models/wishlist/wishlist.controller";
import {
  productIdBodySchema,
  productIdParamsSchema,
} from "@/models/wishlist/wishlist.validation";

const router = Router();

router.use(requireAuth);

router.get("/", wishlistController.getWishlist);
router.post(
  "/items",
  validate(productIdBodySchema),
  wishlistController.toggleItem,
);
router.delete(
  "/items/:productId",
  validate(productIdParamsSchema, "params"),
  wishlistController.removeItem,
);
router.delete("/", wishlistController.clearWishlist);

export default router;
