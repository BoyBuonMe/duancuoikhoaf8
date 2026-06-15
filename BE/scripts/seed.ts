import path from "node:path";
import { promises as fs } from "node:fs";
import dotenv from "dotenv";
import { MongoClient, type Document } from "mongodb";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const SEED_DIR = path.join(__dirname, "..", "data", "seed");

// File name (without .ndjson) -> target Mongo collection.
const SEED_MAP: Record<string, string> = {
  categories: "categories",
  colors: "colors",
  sizes: "sizes",
  products: "products",
  product_variants: "product_variants",
  inventory: "inventory",
  discount_codes: "discount_codes",
  carts: "carts",
  wishlists: "wishlists",
  loyalty_tiers: "loyalty_tiers",
  orders: "orders",
  vouchers: "vouchers",
};

interface CliOptions {
  reset: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  return {
    reset: argv.includes("--reset"),
  };
}

async function readNdjson(filePath: string): Promise<Document[]> {
  const raw = await fs.readFile(filePath, "utf-8");
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, idx) => {
      try {
        return JSON.parse(line) as Document;
      } catch (err) {
        throw new Error(
          `Invalid JSON on line ${idx + 1} of ${filePath}: ${(err as Error).message}`,
        );
      }
    });
}

async function main() {
  const { reset } = parseArgs(process.argv.slice(2));

  const url = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017";
  const database = process.env.MONGODB_DATABASE || "e-commerce";

  const client = new MongoClient(url);
  await client.connect();
  console.log(`Connected to ${url} (db: ${database})`);

  try {
    const db = client.db(database);

    for (const [file, collection] of Object.entries(SEED_MAP)) {
      const seedPath = path.join(SEED_DIR, `${file}.ndjson`);
      let docs: Document[];
      try {
        docs = await readNdjson(seedPath);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          console.warn(`! Skip ${collection}: ${seedPath} not found`);
          continue;
        }
        throw err;
      }
      if (docs.length === 0) {
        console.warn(`! Skip ${collection}: file is empty`);
        continue;
      }

      if (collection === "vouchers" || collection === "discount_codes") {
        for (const doc of docs) {
          if (typeof doc.expiresAt === "string") {
            doc.expiresAt = new Date(doc.expiresAt);
          }
        }
      }

      const col = db.collection(collection);
      if (reset) {
        const { deletedCount } = await col.deleteMany({});
        console.log(`- Cleared ${collection} (${deletedCount} docs)`);
      }
      const result = await col.insertMany(docs, { ordered: false });
      console.log(
        `+ Inserted ${result.insertedCount} doc(s) into ${collection}`,
      );
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
