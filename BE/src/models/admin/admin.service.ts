import { isValidObjectId } from "mongoose";
import User, { type UserRole } from "@/models/users/User.model";
import Product from "@/models/products/Product.model";
import ProductVariant from "@/models/products/ProductVariant.model";
import Voucher from "@/models/vouchers/Voucher.model";
import Order from "@/models/orders/Order.model";
import { createDashboardNotification } from "@/models/notifications/notifications.service";
import { httpError } from "@/utils/http-error";
import type {
  AdminCreateVoucherBody,
  AdminCreateProductBody,
  AdminCreateVariantBody,
  AdminListOrdersQuery,
  AdminListVouchersQuery,
  AdminListProductsQuery,
  AdminListUsersQuery,
  AdminUpdateVoucherBody,
  AdminUpdateProductBody,
  AdminUpdateOrderStatusBody,
  AdminUpdateUserBody,
  AdminUpdateVariantBody,
} from "@/models/admin/admin.validation";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertObjectId(id: string) {
  if (!isValidObjectId(id)) {
    throw httpError("Invalid id", 400);
  }
}

export async function listUsers(queryParams: AdminListUsersQuery) {
  const { search, role, status, emailVerified, limit, skip } = queryParams;
  const query: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [{ email: regex }, { name: regex }, { phone: regex }];
  }
  if (role) query.role = role;
  if (status) query.status = status;
  if (typeof emailVerified === "boolean") query.emailVerified = emailVerified;

  const [users, total] = await Promise.all([
    User.find(query)
      .select(
        "email name phone role status emailVerified authProvider createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return { users, total, limit, skip };
}

export async function getUser(id: string) {
  assertObjectId(id);

  const user = await User.findById(id)
    .select(
      "email name phone role status emailVerified authProvider createdAt updatedAt",
    )
    .lean();
  if (!user) throw httpError("User not found", 404);

  return user;
}

export async function updateUser(
  id: string,
  body: AdminUpdateUserBody,
  currentUserId?: string,
  currentUserRole?: UserRole,
) {
  assertObjectId(id);

  const targetUser = await User.findById(id)
    .select("email name phone role status emailVerified")
    .lean();
  if (!targetUser) throw httpError("User not found", 404);

  if (currentUserRole !== "boss") {
    if (targetUser.role === "boss") {
      throw httpError("Boss access required", 403);
    }

    const onlyUpdatesRole =
      Object.keys(body).length === 1 &&
      (body.role === "user" || body.role === "admin");

    if (!onlyUpdatesRole) {
      throw httpError("Admin can only change role to user or admin", 403);
    }
  }

  if (id === currentUserId && body.role && body.role !== currentUserRole) {
    throw httpError("You cannot change your own role", 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true },
  )
    .select(
      "email name phone role status emailVerified authProvider createdAt updatedAt",
    )
    .lean();
  if (!user) throw httpError("User not found", 404);

  const changedFields = Object.entries(body)
    .filter(([key, value]) => {
      const previous = targetUser[key as keyof typeof targetUser];
      return String(previous ?? "") !== String(value ?? "");
    })
    .map(([key]) => key);

  if (changedFields.length > 0) {
    void createDashboardNotification({
      type: "user_updated",
      title: "Người dùng đã được chỉnh sửa",
      message: `${user.email} vừa được cập nhật bởi ${currentUserRole ?? "admin"}`,
      metadata: {
        actorId: currentUserId,
        actorRole: currentUserRole,
        targetUserId: String(user._id),
        targetEmail: user.email,
        changedFields,
      },
    }).catch((err) => {
      console.error(
        `[notifications] Failed to create user update notification for ${user.email}:`,
        err,
      );
    });
  }

  return user;
}

export async function deleteUser(id: string, currentUserId?: string) {
  assertObjectId(id);

  if (id === currentUserId) {
    throw httpError("You cannot delete your own account", 400);
  }

  const user = await User.findByIdAndDelete(id).lean();
  if (!user) throw httpError("User not found", 404);
}

export async function listProducts(queryParams: AdminListProductsQuery) {
  const { search, category, limit, skip } = queryParams;
  const query: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [{ title: regex }, { sourceUrl: regex }];
  }
  if (category) {
    query.categories = new RegExp(`^${escapeRegex(category)}$`, "i");
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  return { products, total, limit, skip };
}

export async function getProduct(id: string) {
  assertObjectId(id);

  const product = await Product.findById(id).lean();
  if (!product) throw httpError("Product not found", 404);

  const variants = await ProductVariant.find({
    productSourceUrl: product.sourceUrl,
  }).lean();

  return { ...product, variants };
}

export async function createProduct(body: AdminCreateProductBody) {
  return Product.create(body);
}

export async function updateProduct(
  id: string,
  body: AdminUpdateProductBody,
  actorId?: string,
  actorRole?: UserRole,
) {
  assertObjectId(id);

  const before = await Product.findById(id).select("title sourceUrl").lean();
  if (!before) throw httpError("Product not found", 404);

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true },
  ).lean();
  if (!product) throw httpError("Product not found", 404);

  void createDashboardNotification({
    type: "product_updated",
    title: "Sản phẩm đã được chỉnh sửa",
    message: `${product.title || before.title || "Sản phẩm"} vừa được cập nhật`,
    metadata: {
      actorId,
      actorRole,
      productId: String(product._id),
      productTitle: product.title,
      sourceUrl: product.sourceUrl,
      changedFields: Object.keys(body),
    },
  }).catch((err) => {
    console.error(
      `[notifications] Failed to create product update notification for ${product._id}:`,
      err,
    );
  });

  return product;
}

export async function deleteProduct(
  id: string,
  actorId?: string,
  actorRole?: UserRole,
) {
  assertObjectId(id);

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw httpError("Product not found", 404);

  await ProductVariant.deleteMany({
    productSourceUrl: product.sourceUrl,
  });

  void createDashboardNotification({
    type: "product_deleted",
    title: "Sản phẩm đã bị xóa",
    message: `${product.title || "Sản phẩm"} vừa bị xóa khỏi hệ thống`,
    metadata: {
      actorId,
      actorRole,
      productId: String(product._id),
      productTitle: product.title,
      sourceUrl: product.sourceUrl,
    },
  }).catch((err) => {
    console.error(
      `[notifications] Failed to create product delete notification for ${product._id}:`,
      err,
    );
  });
}

export async function createProductVariant(
  productId: string,
  body: AdminCreateVariantBody,
) {
  assertObjectId(productId);

  const product = await Product.findById(productId).select("sourceUrl").lean();
  if (!product) throw httpError("Product not found", 404);

  return ProductVariant.create({
    ...body,
    productSourceUrl: body.productSourceUrl ?? product.sourceUrl,
  });
}

export async function updateProductVariant(
  id: string,
  body: AdminUpdateVariantBody,
) {
  assertObjectId(id);

  const variant = await ProductVariant.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true },
  ).lean();
  if (!variant) throw httpError("Variant not found", 404);

  return variant;
}

export async function deleteProductVariant(id: string) {
  assertObjectId(id);

  const variant = await ProductVariant.findByIdAndDelete(id).lean();
  if (!variant) throw httpError("Variant not found", 404);
}

export async function listVouchers(queryParams: AdminListVouchersQuery) {
  const { search, isActive, limit, skip } = queryParams;
  const query: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [{ code: regex }, { label: regex }];
  }
  if (typeof isActive === "boolean") query.isActive = isActive;

  const [vouchers, total] = await Promise.all([
    Voucher.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Voucher.countDocuments(query),
  ]);

  return { vouchers, total, limit, skip };
}

export async function getVoucher(id: string) {
  assertObjectId(id);

  const voucher = await Voucher.findById(id).lean();
  if (!voucher) throw httpError("Voucher not found", 404);

  return voucher;
}

export async function createVoucher(body: AdminCreateVoucherBody) {
  const existing = await Voucher.findOne({ code: body.code }).select("_id").lean();
  if (existing) {
    throw httpError("Voucher code already exists", 409);
  }

  return Voucher.create(body);
}

export async function updateVoucher(
  id: string,
  body: AdminUpdateVoucherBody,
  actorId?: string,
  actorRole?: UserRole,
) {
  assertObjectId(id);

  if (body.code) {
    const existing = await Voucher.findOne({
      _id: { $ne: id },
      code: body.code,
    })
      .select("_id")
      .lean();
    if (existing) {
      throw httpError("Voucher code already exists", 409);
    }
  }

  const voucher = await Voucher.findByIdAndUpdate(
    id,
    { $set: body },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!voucher) throw httpError("Voucher not found", 404);

  void createDashboardNotification({
    type: "voucher_updated",
    title: "Voucher đã được chỉnh sửa",
    message: `Voucher ${voucher.code} vừa được cập nhật`,
    metadata: {
      actorId,
      actorRole,
      voucherId: String(voucher._id),
      voucherCode: voucher.code,
      changedFields: Object.keys(body),
    },
  }).catch((err) => {
    console.error(
      `[notifications] Failed to create voucher update notification for ${voucher._id}:`,
      err,
    );
  });

  return voucher;
}

export async function deleteVoucher(
  id: string,
  actorId?: string,
  actorRole?: UserRole,
) {
  assertObjectId(id);

  const voucher = await Voucher.findByIdAndDelete(id).lean();
  if (!voucher) throw httpError("Voucher not found", 404);

  void createDashboardNotification({
    type: "voucher_deleted",
    title: "Voucher đã bị xóa",
    message: `Voucher ${voucher.code} vừa bị xóa khỏi hệ thống`,
    metadata: {
      actorId,
      actorRole,
      voucherId: String(voucher._id),
      voucherCode: voucher.code,
    },
  }).catch((err) => {
    console.error(
      `[notifications] Failed to create voucher delete notification for ${voucher._id}:`,
      err,
    );
  });
}

export async function listOrders(queryParams: AdminListOrdersQuery) {
  const { search, status, limit, skip } = queryParams;
  const query: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [{ orderCode: regex }, { userEmail: regex }];
  }
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return { orders, total, limit, skip };
}

export async function getOrder(orderCode: string) {
  const order = await Order.findOne(orderIdentifierQuery(orderCode)).lean();
  if (!order) throw httpError("Order not found", 404);

  return order;
}

function orderIdentifierQuery(identifier: string) {
  const trimmed = identifier.trim();
  const query: Record<string, unknown>[] = [{ orderCode: trimmed.toUpperCase() }];

  if (isValidObjectId(trimmed)) {
    query.push({ _id: trimmed });
  }

  return { $or: query };
}

export async function updateOrderStatus(
  orderCode: string,
  body: AdminUpdateOrderStatusBody,
) {
  const order = await Order.findOneAndUpdate(
    orderIdentifierQuery(orderCode),
    { $set: { status: body.status } },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!order) throw httpError("Order not found", 404);

  return order;
}
