import { Router } from "express";
import * as productsController from "@/models/products/products.controller";
import { requireAuth } from "@/middlewares/auth.middleware";

const router = Router();

router.get("/", productsController.getProducts);
router.get("/slug/:slug", productsController.getProductBySlug);
router.get("/:id", productsController.getProductById);
router.post("/:id/rate", requireAuth, productsController.rateProduct);

export default router;
