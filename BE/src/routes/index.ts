import { Router } from "express";
import healthRoutes from "@/models/health/health.routes";
import authRoutes from "@/models/auth/auth.routes";
import userRoutes from "@/models/users/users.routes";
import productsRoutes from "@/models/products/products.routes";
import cartRoutes from "@/models/cart/cart.routes";
import wishlistRoutes from "@/models/wishlist/wishlist.routes";
import categoriesRoutes from "@/models/categories/categories.routes";
import ordersRoutes from "@/models/orders/orders.routes";
import vouchersRoutes from "@/models/vouchers/vouchers.routes";
import discountCodesRoutes from "@/models/discount-codes/discount-codes.routes";
import shippingRoutes from "@/models/shipping/shipping.routes";
import paymentsRoutes from "@/models/payments/payments.routes";
import adminRoutes from "@/models/admin/admin.routes";
import chatRoutes from "@/models/chat/chat.routes";
import broadcastingRoutes from "@/models/chat/broadcasting.routes";

const router = Router();

router.use(healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/categories", categoriesRoutes);
router.use("/orders", ordersRoutes);
router.use("/vouchers", vouchersRoutes);
router.use("/discount-codes", discountCodesRoutes);
router.use("/shipping", shippingRoutes);
router.use("/payments", paymentsRoutes);
router.use("/chat", chatRoutes);
router.use("/broadcasting", broadcastingRoutes);
router.use("/admin", adminRoutes);

export default router;
