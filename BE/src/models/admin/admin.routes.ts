import { Router } from "express";
import {
  requireAdmin,
  requireAuth,
  requireBoss,
} from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as adminController from "@/models/admin/admin.controller";
import {
  adminCreateProductBodySchema,
  adminCreateVariantBodySchema,
  adminCreateVoucherBodySchema,
  adminIdParamsSchema,
  adminListOrdersQuerySchema,
  adminListProductsQuerySchema,
  adminListUsersQuerySchema,
  adminListVouchersQuerySchema,
  adminOrderCodeParamsSchema,
  adminUpdateOrderStatusBodySchema,
  adminUpdateProductBodySchema,
  adminUpdateUserBodySchema,
  adminUpdateVariantBodySchema,
  adminUpdateVoucherBodySchema,
} from "@/models/admin/admin.validation";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get(
  "/users",
  validate(adminListUsersQuerySchema, "query"),
  adminController.listUsers,
);
router.get(
  "/users/:id",
  validate(adminIdParamsSchema, "params"),
  adminController.getUser,
);
router.patch(
  "/users/:id",
  validate(adminIdParamsSchema, "params"),
  validate(adminUpdateUserBodySchema),
  adminController.updateUser,
);
router.delete(
  "/users/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  adminController.deleteUser,
);

router.get(
  "/orders",
  validate(adminListOrdersQuerySchema, "query"),
  adminController.listOrders,
);
router.patch(
  "/orders/:orderCode/status",
  validate(adminOrderCodeParamsSchema, "params"),
  validate(adminUpdateOrderStatusBodySchema),
  adminController.updateOrderStatus,
);
router.get(
  "/orders/:orderCode",
  validate(adminOrderCodeParamsSchema, "params"),
  adminController.getOrder,
);

router.get(
  "/products",
  requireBoss,
  validate(adminListProductsQuerySchema, "query"),
  adminController.listProducts,
);
router.post(
  "/products",
  requireBoss,
  validate(adminCreateProductBodySchema),
  adminController.createProduct,
);
router.get(
  "/products/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  adminController.getProduct,
);
router.patch(
  "/products/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  validate(adminUpdateProductBodySchema),
  adminController.updateProduct,
);
router.delete(
  "/products/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  adminController.deleteProduct,
);
router.post(
  "/products/:id/variants",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  validate(adminCreateVariantBodySchema),
  adminController.createProductVariant,
);
router.patch(
  "/product-variants/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  validate(adminUpdateVariantBodySchema),
  adminController.updateProductVariant,
);
router.delete(
  "/product-variants/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  adminController.deleteProductVariant,
);

router.get(
  "/vouchers",
  validate(adminListVouchersQuerySchema, "query"),
  adminController.listVouchers,
);
router.post(
  "/vouchers",
  requireBoss,
  validate(adminCreateVoucherBodySchema),
  adminController.createVoucher,
);
router.get(
  "/vouchers/:id",
  validate(adminIdParamsSchema, "params"),
  adminController.getVoucher,
);
router.patch(
  "/vouchers/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  validate(adminUpdateVoucherBodySchema),
  adminController.updateVoucher,
);
router.delete(
  "/vouchers/:id",
  requireBoss,
  validate(adminIdParamsSchema, "params"),
  adminController.deleteVoucher,
);

export default router;
