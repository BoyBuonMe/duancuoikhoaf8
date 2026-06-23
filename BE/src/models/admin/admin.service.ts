import { isValidObjectId } from "mongoose";
import User, { type UserRole } from "@/models/users/User.model";
import Product from "@/models/products/Product.model";
import ProductVariant from "@/models/products/ProductVariant.model";
import Category from "@/models/categories/Category.model";
import CurrencyOption from "@/models/currencies/CurrencyOption.model";
import Voucher from "@/models/vouchers/Voucher.model";
import Order from "@/models/orders/Order.model";
import { httpError } from "@/utils/http-error";
import { pathSegmentsToProductTags } from "@/models/products/product-categories";
import type {
  AdminCreateCategoryOptionBody,
  AdminCreateCurrencyOptionBody,
  AdminCreateVoucherBody,
  AdminCreateProductBody,
  AdminCreateVariantBody,
  AdminListOrdersQuery,
  AdminListVouchersQuery,
  AdminListProductsQuery,
  AdminListUsersQuery,
  AdminUpdateCategoryOptionBody,
  AdminUpdateCurrencyOptionBody,
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

async function ensureDefaultCurrencyOption() {
  await CurrencyOption.updateOne(
    { code: "USD" },
    { $setOnInsert: { code: "USD" } },
    { upsert: true },
  );
}

function slugify(value: string, fallback: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function startsWithSegments(segments: string[], prefix: string[]) {
  return prefix.every((segment, index) => segments[index] === segment);
}

function categoryTagsQuery(tags: string[]) {
  if (!tags.length) return null;
  return {
    $and: tags.map((tag) => ({
      categories: new RegExp(`^${escapeRegex(tag)}$`, "i"),
    })),
  };
}

async function generateUniqueCategorySlug(name: string, parentSlug?: string) {
  const baseName = slugify(name, "category");
  const base = parentSlug ? `${parentSlug}-${baseName}` : baseName;
  let candidate = base;
  let suffix = 2;

  while (await Category.exists({ slug: candidate })) {
    candidate = `${base}-${suffix++}`;
  }

  return candidate;
}

async function generateUniqueProductSourceUrl(title: string) {
  const base = slugify(title, "product");
  let candidate = base;
  let suffix = 2;

  while (await Product.exists({ sourceUrl: `/products/${candidate}` })) {
    candidate = `${base}-${suffix++}`;
  }

  return `/products/${candidate}`;
}

async function refreshProductCounts() {
  const categories = await Category.find().lean();

  await Promise.all(
    categories.map(async (category) => {
      const subtreeSlugs = categories
        .filter((candidate) =>
          startsWithSegments(candidate.pathSegments, category.pathSegments),
        )
        .map((candidate) => candidate.slug);
      const tags = pathSegmentsToProductTags(category.pathSegments);
      const queries: Record<string, unknown>[] = [];

      if (subtreeSlugs.length) {
        queries.push({ categorySlugs: { $in: subtreeSlugs } });
      }

      const legacyQuery = categoryTagsQuery(tags);
      if (legacyQuery) queries.push(legacyQuery);

      const query =
        queries.length === 0
          ? {}
          : queries.length === 1
            ? queries[0]
            : { $or: queries };
      const productCount = await Product.countDocuments(query);

      await Category.updateOne(
        { _id: category._id },
        { $set: { productCount } },
      );
    }),
  );
}

async function countCurrencyUsage(code: string) {
  const [products, variants] = await Promise.all([
    Product.countDocuments({ "price.currency": code }),
    ProductVariant.countDocuments({ "price.currency": code }),
  ]);

  return products + variants;
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

  const targetUser = await User.findById(id).select("role").lean();
  if (!targetUser) throw httpError("User not found", 404);

  if (currentUserRole !== "boss") {
    const onlyUpdatesRole =
      Object.keys(body).length === 1 &&
      typeof body.role === "string" &&
      body.role !== "boss";

    if (!onlyUpdatesRole || targetUser.role === "boss") {
      throw httpError("Boss access required", 403);
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

export async function listProductCategoryOptions() {
  const categories = await Category.find()
    .sort({ level: 1, path: 1, name: 1 })
    .lean();

  return { categories, count: categories.length };
}

export async function createProductCategoryOption(
  body: AdminCreateCategoryOptionBody,
) {
  const parentSlug = body.parentSlug ?? null;
  const parent = parentSlug
    ? await Category.findOne({ slug: parentSlug }).lean()
    : null;

  if (parentSlug && !parent) {
    throw httpError("Parent category not found", 404);
  }

  const pathSegments = parent
    ? [...parent.pathSegments, body.name]
    : [body.name];
  const slug = await generateUniqueCategorySlug(body.name, parent?.slug);

  return Category.create({
    name: body.name,
    slug,
    level: parent ? parent.level + 1 : 0,
    parentSlug,
    path: pathSegments.join(" > "),
    pathSegments,
    productCount: 0,
  });
}

export async function updateProductCategoryOption(
  id: string,
  body: AdminUpdateCategoryOptionBody,
) {
  assertObjectId(id);

  const category = await Category.findById(id).lean();
  if (!category) throw httpError("Category not found", 404);

  const oldSegments = category.pathSegments;
  const nextSegments = [...oldSegments.slice(0, -1), body.name];

  await Category.updateOne(
    { _id: category._id },
    {
      $set: {
        name: body.name,
        path: nextSegments.join(" > "),
        pathSegments: nextSegments,
      },
    },
  );

  const descendantQuery = {
    _id: { $ne: category._id },
    level: { $gt: category.level },
    ...Object.fromEntries(
      oldSegments.map((segment, index) => [`pathSegments.${index}`, segment]),
    ),
  };
  const descendants = await Category.find(descendantQuery).lean();

  await Promise.all(
    descendants.map((descendant) => {
      const descendantSegments = [
        ...nextSegments,
        ...descendant.pathSegments.slice(oldSegments.length),
      ];

      return Category.updateOne(
        { _id: descendant._id },
        {
          $set: {
            path: descendantSegments.join(" > "),
            pathSegments: descendantSegments,
          },
        },
      );
    }),
  );

  await refreshProductCounts();

  return Category.findById(id).lean();
}

export async function deleteProductCategoryOption(id: string) {
  assertObjectId(id);

  const category = await Category.findById(id).lean();
  if (!category) throw httpError("Category not found", 404);

  const [childCount, productsUsingCategory] = await Promise.all([
    Category.countDocuments({ parentSlug: category.slug }),
    Product.countDocuments({ categorySlugs: category.slug }),
  ]);

  if (childCount > 0) {
    throw httpError("Cannot delete a category that has child categories", 409);
  }
  if (category.productCount > 0 || productsUsingCategory > 0) {
    throw httpError("Cannot delete a category that is used by products", 409);
  }

  await Category.deleteOne({ _id: category._id });
  await refreshProductCounts();
}

export async function listCurrencyOptions() {
  await ensureDefaultCurrencyOption();
  const currencies = await CurrencyOption.find().sort({ code: 1 }).lean();
  return { currencies, count: currencies.length };
}

export async function createCurrencyOption(body: AdminCreateCurrencyOptionBody) {
  await ensureDefaultCurrencyOption();

  const existing = await CurrencyOption.findOne({ code: body.code }).lean();
  if (existing) throw httpError("Currency code already exists", 409);

  return CurrencyOption.create({ code: body.code });
}

export async function updateCurrencyOption(
  code: string,
  body: AdminUpdateCurrencyOptionBody,
) {
  await ensureDefaultCurrencyOption();

  if (code === "USD") {
    throw httpError("USD cannot be renamed", 400);
  }

  const currency = await CurrencyOption.findOne({ code }).lean();
  if (!currency) throw httpError("Currency option not found", 404);

  if (body.code === code) {
    return currency;
  }

  const usageCount = await countCurrencyUsage(code);
  if (usageCount > 0) {
    throw httpError("Cannot rename a currency that is used by products", 409);
  }

  const existing = await CurrencyOption.findOne({ code: body.code }).lean();
  if (existing) throw httpError("Currency code already exists", 409);

  return CurrencyOption.findOneAndUpdate(
    { code },
    { $set: { code: body.code } },
    { new: true, runValidators: true },
  ).lean();
}

export async function deleteCurrencyOption(code: string) {
  await ensureDefaultCurrencyOption();

  if (code === "USD") {
    throw httpError("USD cannot be deleted", 400);
  }

  const currency = await CurrencyOption.findOne({ code }).lean();
  if (!currency) throw httpError("Currency option not found", 404);

  const usageCount = await countCurrencyUsage(code);
  if (usageCount > 0) {
    throw httpError("Cannot delete a currency that is used by products", 409);
  }

  await CurrencyOption.deleteOne({ code });
}

async function resolveProductCategoryPlacement(
  categorySlugs: string[],
  fallbackCategories: string[] = [],
) {
  const slugs = [...new Set(categorySlugs.map((slug) => slug.trim()))].filter(
    Boolean,
  );
  if (!slugs.length) {
    return { categorySlugs: [], categories: fallbackCategories };
  }

  const categoryDocs = await Category.find({ slug: { $in: slugs } }).lean();
  const bySlug = new Map(categoryDocs.map((category) => [category.slug, category]));
  const missingSlug = slugs.find((slug) => !bySlug.has(slug));
  if (missingSlug) {
    throw httpError(`Category not found: ${missingSlug}`, 400);
  }

  const categories = [
    ...new Set(
      slugs.flatMap((slug) => {
        const category = bySlug.get(slug)!;
        const tags = pathSegmentsToProductTags(category.pathSegments);
        return tags.length ? tags : [category.name];
      }),
    ),
  ];

  return { categorySlugs: slugs, categories };
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
  const placement = await resolveProductCategoryPlacement(
    body.categorySlugs,
    body.categories,
  );

  const product = await Product.create({
    ...body,
    sourceUrl: body.sourceUrl ?? (await generateUniqueProductSourceUrl(body.title)),
    ...placement,
  });

  await refreshProductCounts();

  return product;
}

export async function updateProduct(id: string, body: AdminUpdateProductBody) {
  assertObjectId(id);

  const updateBody = { ...body };
  if (Array.isArray(body.categorySlugs)) {
    const placement = await resolveProductCategoryPlacement(
      body.categorySlugs,
      body.categories,
    );
    updateBody.categorySlugs = placement.categorySlugs;
    updateBody.categories = placement.categories;
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updateBody },
    { new: true, runValidators: true },
  ).lean();
  if (!product) throw httpError("Product not found", 404);

  await refreshProductCounts();

  return product;
}

export async function deleteProduct(id: string) {
  assertObjectId(id);

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw httpError("Product not found", 404);

  await ProductVariant.deleteMany({
    productSourceUrl: product.sourceUrl,
  });
  await refreshProductCounts();
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

export async function updateVoucher(id: string, body: AdminUpdateVoucherBody) {
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

  return voucher;
}

export async function deleteVoucher(id: string) {
  assertObjectId(id);

  const voucher = await Voucher.findByIdAndDelete(id).lean();
  if (!voucher) throw httpError("Voucher not found", 404);
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
