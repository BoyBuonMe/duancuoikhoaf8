import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("users").createIndexes(
    [
      { key: { email: 1 }, unique: true, name: "users_email_unique" },
      { key: { createdAt: -1 }, name: "users_createdAt_desc" },
    ],
    { background: true },
  );
}

export async function down(db: Db): Promise<void> {
  const collection = db.collection("users");
  await collection.dropIndex("users_email_unique");
  await collection.dropIndex("users_createdAt_desc");
}
