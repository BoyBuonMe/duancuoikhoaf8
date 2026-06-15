import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("products").createIndexes(
    [
      { key: { sourceUrl: 1 }, unique: true, name: "products_sourceUrl_unique" },
      {
        key: { categories: 1, createdAt: -1 },
        name: "products_categories_createdAt",
      },
    ],
    { background: true },
  );
}

export async function down(db: Db): Promise<void> {
  const collection = db.collection("products");
  await collection.dropIndex("products_sourceUrl_unique");
  await collection.dropIndex("products_categories_createdAt");
}
