import Product from "@/models/products/Product.model";
import ProductVariant from "@/models/products/ProductVariant.model";
import { sendVoucherWishlistEmail } from "@/models/auth/email.service";
import * as vouchersService from "@/models/vouchers/vouchers.service";
import * as vouchersRepo from "@/models/vouchers/vouchers.repository";

async function resolveWishlistProductIds(
  items: Array<{ productId?: string; sku?: string }>,
): Promise<string[]> {
  const ids = new Set<string>();

  for (const item of items) {
    if (item.productId) {
      ids.add(item.productId);
      continue;
    }

    if (!item.sku) continue;

    const variant = await ProductVariant.findOne({ sku: item.sku })
      .select("productSourceUrl")
      .lean();
    if (!variant?.productSourceUrl) continue;

    const product = await Product.findOne({ sourceUrl: variant.productSourceUrl })
      .select("_id")
      .lean();
    if (product?._id) ids.add(String(product._id));
  }

  return [...ids];
}

export async function runVoucherWishlistNotifications(): Promise<void> {
  const vouchers = await vouchersService.listActiveVouchersWithProducts();
  if (!vouchers.length) return;

  const productVoucherMap = new Map<
    string,
    { productTitle: string; voucherLabel: string; voucherCode: string }
  >();

  for (const voucher of vouchers) {
    for (const product of voucher.productList) {
      if (!productVoucherMap.has(product.productId)) {
        productVoucherMap.set(product.productId, {
          productTitle: product.title,
          voucherLabel: voucher.label,
          voucherCode: voucher.code,
        });
      }
    }
  }

  const productIds = [...productVoucherMap.keys()];
  if (!productIds.length) return;

  const wishlists = await vouchersRepo.findWishlistsWithProductIds(productIds);

  for (const wishlist of wishlists) {
    const wishlistProductIds = await resolveWishlistProductIds(wishlist.items);

    for (const productId of wishlistProductIds) {
      const promo = productVoucherMap.get(productId);
      if (!promo) continue;

      const alreadySent = await vouchersRepo.wasNotificationSent(
        wishlist.userEmail,
        productId,
        promo.voucherCode,
      );
      if (alreadySent) continue;

      try {
        await sendVoucherWishlistEmail({
          to: wishlist.userEmail,
          productName: promo.productTitle,
          voucherLabel: promo.voucherLabel,
        });
        await vouchersRepo.recordNotificationSent(
          wishlist.userEmail,
          productId,
          promo.voucherCode,
        );
      } catch (error) {
        console.error(
          `[voucher-notifier] Failed to notify ${wishlist.userEmail} for ${productId}:`,
          error,
        );
      }
    }
  }
}
