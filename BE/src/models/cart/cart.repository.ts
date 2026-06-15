import Cart from "@/models/cart/Cart.model";

export async function findCartByEmail(email: string) {
  return Cart.findOne({ userEmail: email });
}

/**
 * Returns the persisted cart for `email` if one exists, otherwise a
 * fresh unsaved instance. Callers are responsible for `.save()`.
 */
export async function findOrInitCart(email: string) {
  const existing = await Cart.findOne({ userEmail: email });
  if (existing) return existing;
  return new Cart({ userEmail: email, items: [] });
}
