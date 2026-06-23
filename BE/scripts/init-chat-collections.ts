/**
 * Tạo collections conversations + messages và indexes (chạy một lần).
 * Usage: npm run init:chat-collections
 */
import "dotenv/config";
import { MongoClient } from "mongodb";
import { up } from "../migrations/20250614000001-chat-conversations-messages-indexes";

async function main() {
  const url = process.env.MONGODB_URL ?? "mongodb://127.0.0.1:27017";
  const dbName = process.env.MONGODB_DATABASE ?? "e-commerce";

  const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  console.log(`Connected: ${url} (db: ${dbName})`);

  try {
    const db = client.db(dbName);
    await up(db);

    const collections = await db.listCollections().toArray();
    const chat = collections
      .map((c) => c.name)
      .filter((name) => name === "conversations" || name === "messages");

    console.log("Chat collections in MongoDB:", chat.join(", ") || "(none)");
    console.log("Done — refresh MongoDB Compass to see them.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
