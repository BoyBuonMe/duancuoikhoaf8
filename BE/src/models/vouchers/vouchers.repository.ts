import Product from "@/models/products/Product.model";
import Voucher, { type IVoucher } from "@/models/vouchers/Voucher.model";
import VoucherNotificationLog from "@/models/vouchers/VoucherNotificationLog.model";
import Wishlist from "@/models/wishlist/Wishlist.model";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findActiveVouchers(now = new Date()) {
  return Voucher.find({
    isActive: true,
    $expr: { $gt: [{ $toDate: "$expiresAt" }, now] },
  })
    .sort({ discountValue: -1 })
    .lean();
}

export async function findVoucherByCode(code: string) {
  return Voucher.findOne({ code: code.toUpperCase(), isActive: true }).lean();
}

export async function findProductsForVoucher(voucher: Pick<
  IVoucher,
  "productSourceUrls" | "conditions"
>) {
  const seen = new Set<string>();
  const products: Array<{
    _id: unknown;
    sourceUrl: string;
    title: string;
    price: { amount: number; currency: string };
    categories: string[];
  }> = [];

  const pushUnique = (
    docs: Array<{
      _id: unknown;
      sourceUrl: string;
      title: string;
      price: { amount: number; currency: string };
      categories: string[];
    }>,
  ) => {
    for (const doc of docs) {
      const id = String(doc._id);
      if (seen.has(id)) continue;
      seen.add(id);
      products.push(doc);
    }
  };

  if (voucher.productSourceUrls.length > 0) {
    const byUrl = await Product.find({
      sourceUrl: { $in: voucher.productSourceUrls },
    })
      .select("sourceUrl title price categories")
      .lean();
    pushUnique(byUrl);
  }

  const { categoryKeywords = [], titleKeywords = [] } = voucher.conditions;
  const andFilters: Record<string, unknown>[] = [];

  if (categoryKeywords.length > 0) {
    andFilters.push({
      $or: categoryKeywords.map((keyword) => ({
        categories: new RegExp(escapeRegex(keyword), "i"),
      })),
    });
  }

  for (const keyword of titleKeywords) {
    andFilters.push({
      title: new RegExp(escapeRegex(keyword), "i"),
    });
  }

  if (andFilters.length > 0) {
    const byConditions = await Product.find({ $and: andFilters })
      .select("sourceUrl title price categories")
      .lean();
    pushUnique(byConditions);
  }

  return products;
}

export async function findWishlistsWithProductIds(productIds: string[]) {
  if (!productIds.length) return [];

  return Wishlist.find({
    $or: [
      { "items.productId": { $in: productIds } },
    ],
  }).lean();
}

export async function wasNotificationSent(
  userEmail: string,
  productId: string,
  voucherCode: string,
) {
  const existing = await VoucherNotificationLog.findOne({
    userEmail: userEmail.toLowerCase(),
    productId,
    voucherCode: voucherCode.toUpperCase(),
  }).lean();
  return Boolean(existing);
}

export async function recordNotificationSent(
  userEmail: string,
  productId: string,
  voucherCode: string,
) {
  await VoucherNotificationLog.updateOne(
    {
      userEmail: userEmail.toLowerCase(),
      productId,
      voucherCode: voucherCode.toUpperCase(),
    },
    { $set: { sentAt: new Date() } },
    { upsert: true },
  );
}
