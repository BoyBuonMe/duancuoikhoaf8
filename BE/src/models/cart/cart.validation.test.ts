import { describe, expect, it } from "vitest";

import {
  addItemBodySchema,
  itemParamsSchema,
  updateItemBodySchema,
} from "@/models/cart/cart.validation";

describe("addItemBodySchema", () => {
  it("defaults quantity to 1", () => {
    const parsed = addItemBodySchema.parse({
      sku: "A1-TSHIRT-BLK-M",
      name: "Product A",
      image: "/img.jpg",
    });
    expect(parsed.quantity).toBe(1);
  });

  it("trims SKU", () => {
    const parsed = addItemBodySchema.parse({
      sku: "   A1   ",
      name: "Product A",
      image: "/img.jpg",
    });
    expect(parsed.sku).toBe("A1");
  });

  it("rejects empty SKU", () => {
    expect(() => addItemBodySchema.parse({ sku: "" })).toThrow();
  });

  it("rejects non-integer quantity", () => {
    expect(() =>
      addItemBodySchema.parse({ sku: "A1", quantity: 1.5 }),
    ).toThrow();
  });

  it("rejects quantity below 1", () => {
    expect(() => addItemBodySchema.parse({ sku: "A1", quantity: 0 })).toThrow();
  });
});

describe("updateItemBodySchema", () => {
  it("requires an integer >= 1", () => {
    expect(updateItemBodySchema.parse({ quantity: 5 }).quantity).toBe(5);
    expect(() => updateItemBodySchema.parse({ quantity: 0 })).toThrow();
    expect(() => updateItemBodySchema.parse({})).toThrow();
  });
});

describe("itemParamsSchema", () => {
  it("trims and requires SKU", () => {
    expect(itemParamsSchema.parse({ sku: "  A1  " }).sku).toBe("A1");
    expect(() => itemParamsSchema.parse({ sku: "" })).toThrow();
  });
});
