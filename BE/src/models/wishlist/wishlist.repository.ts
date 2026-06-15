import Wishlist from "@/models/wishlist/Wishlist.model";

export async function findWishlistByEmail(email: string) {
  return Wishlist.findOne({ userEmail: email });
}

export async function findOrInitWishlist(email: string) {
  const existing = await Wishlist.findOne({ userEmail: email });
  if (existing) return existing;
  return new Wishlist({ userEmail: email, items: [] });
}
