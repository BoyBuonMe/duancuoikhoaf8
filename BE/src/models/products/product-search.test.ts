import { describe, expect, it } from "vitest";
import {
  buildTitleSubstringRegex,
  buildTitleWordSearchFilter,
  parseSearchTerms,
} from "@/models/products/product-search";

describe("product search substring match", () => {
  it("parses trimmed terms", () => {
    expect(parseSearchTerms("  ad   fleck  ")).toEqual(["ad", "fleck"]);
  });

  it("matches substrings case-insensitively", () => {
    const regex = buildTitleSubstringRegex("ad");

    expect(regex.test("Adapt Fleck x")).toBe(true);
    expect(regex.test("ADAPT FLECK X")).toBe(true);
    expect(regex.test("Flex Tee")).toBe(false);
  });

  it("requires every term as a substring", () => {
    const filter = buildTitleWordSearchFilter("adapt fleck");
    expect(filter).toEqual({
      $and: [
        { title: buildTitleSubstringRegex("adapt") },
        { title: buildTitleSubstringRegex("fleck") },
      ],
    });
  });
});
