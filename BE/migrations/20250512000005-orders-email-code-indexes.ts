import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("orders").createIndexes(
    [
      {
        key: { userEmail: 1, createdAt: -1 },
        name: "orders_userEmail_createdAt",
      },
      {
        key: { orderCode: 1 },
        name: "orders_orderCode",
        unique: true,
      },
      { key: { status: 1 }, name: "orders_status" },
    ],
    { background: true },
  );
}

export async function down(db: Db): Promise<void> {
  const collection = db.collection("orders");
  await collection.dropIndex("orders_userEmail_createdAt");
  await collection.dropIndex("orders_orderCode");
  await collection.dropIndex("orders_status");
}
