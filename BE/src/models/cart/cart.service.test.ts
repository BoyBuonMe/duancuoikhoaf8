import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/models/cart/cart.repository");
vi.mock("@/models/products/products.repository");

import * as cartRepo from "@/models/cart/cart.repository";
import * as productsRepo from "@/models/products/products.repository";
import * as cartService from "@/models/cart/cart.service";

type CartItemLike = {
  sku: string;
  quantity: number;
  unitPrice: { amount: number; currency: string };
};

type CartLike = {
  items: CartItemLike[];
  save: ReturnType<typeof vi.fn>;
};

function makeCart(items: CartItemLike[] = []): CartLike {
  const cart: CartLike = {
    items,
    save: vi.fn(),
  };
  cart.save.mockImplementation(async () => cart);
  return cart;
}

const EMAIL = "user@example.com";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("cart.service.getCart", () => {
  it("returns the cart for the user", async () => {
    const cart = makeCart([
      { sku: "A1", quantity: 1, unitPrice: { amount: 22, currency: "USD" } },
    ]);
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(cart as never);

    const result = await cartService.getCart(EMAIL);

    expect(cartRepo.findCartByEmail).toHaveBeenCalledWith(EMAIL);
    expect(result).toBe(cart);
  });

  it("returns null when no cart exists", async () => {
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(null as never);
    const result = await cartService.getCart(EMAIL);
    expect(result).toBeNull();
  });
});

describe("cart.service.addCartItem", () => {
  it("rejects unknown SKUs with 404", async () => {
    vi.mocked(productsRepo.findActiveVariantBySku).mockResolvedValue(null);

    await expect(
      cartService.addCartItem(EMAIL, "ghost", 1, "Ghost", "/img.jpg"),
    ).rejects.toMatchObject({
      status: 404,
    });
    expect(cartRepo.findOrInitCart).not.toHaveBeenCalled();
  });

  it("uses the server-side variant price, never client input", async () => {
    vi.mocked(productsRepo.findActiveVariantBySku).mockResolvedValue({
      sku: "A1",
      price: { amount: 22, currency: "USD" },
    } as never);
    const cart = makeCart();
    vi.mocked(cartRepo.findOrInitCart).mockResolvedValue(cart as never);

    await cartService.addCartItem(EMAIL, "A1", 2, "Product A", "/img.jpg");

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toEqual({
      sku: "A1",
      quantity: 2,
      unitPrice: { amount: 22, currency: "USD" },
      name: "Product A",
      image: "/img.jpg",
      variantLabel: undefined,
    });
    expect(cart.save).toHaveBeenCalledTimes(1);
  });

  it("increments quantity and refreshes price when SKU already exists", async () => {
    vi.mocked(productsRepo.findActiveVariantBySku).mockResolvedValue({
      sku: "A1",
      price: { amount: 25, currency: "USD" },
    } as never);
    const cart = makeCart([
      { sku: "A1", quantity: 1, unitPrice: { amount: 22, currency: "USD" } },
    ]);
    vi.mocked(cartRepo.findOrInitCart).mockResolvedValue(cart as never);

    await cartService.addCartItem(EMAIL, "A1", 3, "Product A", "/img.jpg");

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(4);
    expect(cart.items[0].unitPrice).toEqual({ amount: 25, currency: "USD" });
  });
});

describe("cart.service.updateCartItemQuantity", () => {
  it("404s when the cart does not exist", async () => {
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(null as never);
    await expect(
      cartService.updateCartItemQuantity(EMAIL, "A1", 5),
    ).rejects.toMatchObject({ status: 404, message: "Cart not found" });
  });

  it("404s when the SKU is not in the cart", async () => {
    const cart = makeCart([
      { sku: "A1", quantity: 1, unitPrice: { amount: 22, currency: "USD" } },
    ]);
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(cart as never);

    await expect(
      cartService.updateCartItemQuantity(EMAIL, "missing", 5),
    ).rejects.toMatchObject({ status: 404, message: "Item not found in cart" });
    expect(cart.save).not.toHaveBeenCalled();
  });

  it("updates quantity in place", async () => {
    const cart = makeCart([
      { sku: "A1", quantity: 1, unitPrice: { amount: 22, currency: "USD" } },
    ]);
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(cart as never);

    await cartService.updateCartItemQuantity(EMAIL, "A1", 7);

    expect(cart.items[0].quantity).toBe(7);
    expect(cart.save).toHaveBeenCalledTimes(1);
  });
});

describe("cart.service.removeCartItem", () => {
  it("404s when the cart does not exist", async () => {
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(null as never);
    await expect(cartService.removeCartItem(EMAIL, "A1")).rejects.toMatchObject(
      {
        status: 404,
      },
    );
  });

  it("404s when the SKU is not in the cart", async () => {
    const cart = makeCart([
      { sku: "A1", quantity: 1, unitPrice: { amount: 22, currency: "USD" } },
    ]);
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(cart as never);

    await expect(
      cartService.removeCartItem(EMAIL, "missing"),
    ).rejects.toMatchObject({ status: 404, message: "Item not found in cart" });
    expect(cart.save).not.toHaveBeenCalled();
  });

  it("removes the matching item", async () => {
    const cart = makeCart([
      { sku: "A1", quantity: 1, unitPrice: { amount: 22, currency: "USD" } },
      { sku: "B1", quantity: 2, unitPrice: { amount: 65, currency: "USD" } },
    ]);
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(cart as never);

    await cartService.removeCartItem(EMAIL, "A1");

    expect(cart.items.map((i) => i.sku)).toEqual(["B1"]);
    expect(cart.save).toHaveBeenCalledTimes(1);
  });
});

describe("cart.service.clearCart", () => {
  it("returns null when there is nothing to clear", async () => {
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(null as never);
    const result = await cartService.clearCart(EMAIL);
    expect(result).toBeNull();
  });

  it("empties the items array and saves", async () => {
    const cart = makeCart([
      { sku: "A1", quantity: 2, unitPrice: { amount: 22, currency: "USD" } },
    ]);
    vi.mocked(cartRepo.findCartByEmail).mockResolvedValue(cart as never);

    await cartService.clearCart(EMAIL);

    expect(cart.items).toEqual([]);
    expect(cart.save).toHaveBeenCalledTimes(1);
  });
});
