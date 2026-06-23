import { describe, expect, it } from "vitest";

import {
  adminCreateCategoryOptionBodySchema,
  adminCreateCurrencyOptionBodySchema,
  adminCreateProductBodySchema,
  adminCurrencyCodeParamsSchema,
} from "@/models/admin/admin.validation";

describe("adminCreateProductBodySchema", () => {
  it("accepts an admin-created product without a sourceUrl", () => {
    const parsed = adminCreateProductBodySchema.parse({
      title: "Arrival T-Shirt",
      price: { amount: 32, currency: "usd" },
      imageUrls: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      categorySlugs: ["men-products-ss-tops"],
    });

    expect(parsed.sourceUrl).toBeUndefined();
    expect(parsed.price.currency).toBe("USD");
    expect(parsed.categorySlugs).toEqual(["men-products-ss-tops"]);
  });

  it("accepts an internal product sourceUrl", () => {
    const parsed = adminCreateProductBodySchema.parse({
      sourceUrl: "/products/arrival-t-shirt",
      title: "Arrival T-Shirt",
      price: { amount: 32, currency: "USD" },
    });

    expect(parsed.sourceUrl).toBe("/products/arrival-t-shirt");
  });
});

describe("admin category option schemas", () => {
  it("accepts a category option with an optional parent slug", () => {
    const parsed = adminCreateCategoryOptionBodySchema.parse({
      name: "Joggers",
      parentSlug: "men-products",
    });

    expect(parsed).toEqual({
      name: "Joggers",
      parentSlug: "men-products",
    });
  });
});

describe("admin currency option schemas", () => {
  it("normalizes currency codes to uppercase", () => {
    const body = adminCreateCurrencyOptionBodySchema.parse({ code: "vnd" });
    const params = adminCurrencyCodeParamsSchema.parse({ code: "usd" });

    expect(body.code).toBe("VND");
    expect(params.code).toBe("USD");
  });

  it("rejects non-alphanumeric currency codes", () => {
    expect(() =>
      adminCreateCurrencyOptionBodySchema.parse({ code: "US-D" }),
    ).toThrow(/letters and numbers/i);
  });
});
