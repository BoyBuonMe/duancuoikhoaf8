/**
 * Generates size-only product_variants + inventory from products.ndjson.
 * Each scraped product (one color per URL) gets its own size SKUs.
 */
import { createHash } from "node:crypto";
import path from "node:path";
import { promises as fs } from "node:fs";

const SEED_DIR = path.join(__dirname, "..", "data", "seed");

const APPAREL_SIZES = ["xs", "s", "m", "l", "xl", "xxl"] as const;
const ONE_SIZE = ["one-size"] as const;

interface SeedProduct {
  sourceUrl: string;
  title: string;
  price: { amount: number; currency: string };
  categories: string[];
}

interface SeedVariant {
  sku: string;
  productSourceUrl: string;
  size: string;
  price: { amount: number; currency: string };
  isActive: boolean;
}

interface SeedInventory {
  sku: string;
  quantity: number;
  reserved: number;
  warehouse: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
  updatedAt: string;
}

function hashSourceUrl(sourceUrl: string): string {
  return createHash("sha256").update(sourceUrl).digest("hex").slice(0, 10).toUpperCase();
}

function isOneSizeProduct(product: SeedProduct): boolean {
  const joined = `${(product.categories ?? []).join(" ")} ${product.title} ${product.sourceUrl}`.toLowerCase();
  return (
    /\bsocks?\b/.test(joined) ||
    /\bbags?\b/.test(joined) ||
    /\bholdall\b/.test(joined) ||
    /\bbottle\b/.test(joined) ||
    /\bshaker\b/.test(joined) ||
    /\bgloves?\b/.test(joined) ||
    /\bcap\b/.test(joined) && /\baccessories\b/.test(joined)
  );
}

function buildSku(sourceUrl: string, size: string): string {
  const hash = hashSourceUrl(sourceUrl);
  const sizePart = size === "one-size" ? "ONE" : size.toUpperCase();
  return `${hash}-${sizePart}`;
}

function inventoryStatus(index: number): SeedInventory["status"] {
  if (index % 11 === 0) return "out_of_stock";
  if (index % 5 === 0) return "low_stock";
  return "in_stock";
}

async function readNdjson<T>(filePath: string): Promise<T[]> {
  const raw = await fs.readFile(filePath, "utf-8");
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
}

async function writeNdjson(filePath: string, rows: unknown[]) {
  const content = rows.map((row) => JSON.stringify(row)).join("\n") + "\n";
  await fs.writeFile(filePath, content, "utf-8");
}

async function main() {
  const productsPath = path.join(SEED_DIR, "products.ndjson");
  const products = await readNdjson<SeedProduct>(productsPath);

  const variants: SeedVariant[] = [];
  const inventory: SeedInventory[] = [];
  const updatedAt = new Date().toISOString();
  let inventoryIndex = 0;

  for (const product of products) {
    const sizes = isOneSizeProduct(product) ? ONE_SIZE : APPAREL_SIZES;

    for (const size of sizes) {
      const sku = buildSku(product.sourceUrl, size);
      variants.push({
        sku,
        productSourceUrl: product.sourceUrl,
        size,
        price: product.price,
        isActive: true,
      });

      const status = inventoryStatus(inventoryIndex++);
      const quantity = status === "out_of_stock" ? 0 : status === "low_stock" ? 6 : 18;

      inventory.push({
        sku,
        quantity,
        reserved: status === "low_stock" ? 2 : 1,
        warehouse: "main",
        status,
        updatedAt,
      });
    }
  }

  await writeNdjson(path.join(SEED_DIR, "product_variants.ndjson"), variants);
  await writeNdjson(path.join(SEED_DIR, "inventory.ndjson"), inventory);

  console.log(`Generated ${variants.length} variants for ${products.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
