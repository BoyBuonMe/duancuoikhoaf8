import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("orders").createIndexes(
    [
      {
        key: { userId: 1, createdAt: -1 },
        name: "orders_userId_createdAt",
      },
      { key: { status: 1 }, name: "orders_status" },
    ],
    { background: true },
  );
}

export async function down(db: Db): Promise<void> {
  const collection = db.collection("orders");
  await collection.dropIndex("orders_userId_createdAt");
  await collection.dropIndex("orders_status");
}
