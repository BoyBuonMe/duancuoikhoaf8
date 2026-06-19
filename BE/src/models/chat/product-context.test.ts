import { describe, expect, it } from "vitest";
import {
  extractKeywords,
  formatProductContext,
  type ProductSnapshot,
} from "@/models/chat/product-context.service";

describe("extractKeywords", () => {
  it("drops stopwords and single-char tokens, keeps product tokens", () => {
    expect(extractKeywords("còn hàng Element không?")).toEqual(["element"]);
  });

  it("strips Vietnamese diacritics and english filler", () => {
    const kw = extractKeywords("cho mình hỏi giá áo Element Baselayer");
    expect(kw).toContain("element");
    expect(kw).toContain("baselayer");
    expect(kw).not.toContain("gia");
  });

  it("de-duplicates tokens", () => {
    expect(extractKeywords("shorts shorts SHORTS")).toEqual(["shorts"]);
  });
});

describe("formatProductContext", () => {
  it("renders price, in-stock sizes only, and link", () => {
    const snapshots: ProductSnapshot[] = [
      {
        title: "Element Baselayer T-Shirt – White",
        price: "28 USD",
        categories: ["Mens", "Apparel", "SS Tops"],
        sizes: [
          { size: "XS", sku: "A-XS", inStock: false, available: 0 },
          { size: "S", sku: "A-S", inStock: true, available: 17 },
        ],
        anyInStock: true,
        link: "http://localhost:3000/products/element-baselayer",
      },
    ];

    const out = formatProductContext(snapshots);
    expect(out).toContain("LIVE STORE DATA");
    expect(out).toContain("Element Baselayer");
    expect(out).toContain("28 USD");
    // Out-of-stock sizes are hidden; only in-stock ones are shown.
    expect(out).not.toContain("XS");
    expect(out).toContain("S (in stock: 17)");
    expect(out).toContain("Link: http://localhost:3000/products/element-baselayer");
  });

  it("marks a fully sold-out product as out of stock", () => {
    const out = formatProductContext([
      {
        title: "Sold Out Hoodie",
        price: "60 USD",
        categories: ["Mens"],
        sizes: [{ size: "M", sku: "B-M", inStock: false, available: 0 }],
        anyInStock: false,
        link: "http://localhost:3000/products/sold-out-hoodie",
      },
    ]);
    expect(out).toContain("all sizes out of stock");
  });

  it("returns empty string with no products", () => {
    expect(formatProductContext([])).toBe("");
  });
});
