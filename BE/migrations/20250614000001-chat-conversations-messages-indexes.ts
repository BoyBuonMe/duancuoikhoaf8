import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("conversations").createIndexes(
    [
      {
        key: { userId: 1, type: 1, lastMessageAt: -1 },
        name: "conversations_userId_type_lastMessageAt",
      },
      {
        key: { type: 1, status: 1, lastMessageAt: -1 },
        name: "conversations_type_status_lastMessageAt",
      },
      {
        key: { assignedAdminId: 1, status: 1 },
        name: "conversations_assignedAdminId_status",
        sparse: true,
      },
    ],
    { background: true },
  );

  await db.collection("messages").createIndexes(
    [
      {
        key: { conversationId: 1, createdAt: 1 },
        name: "messages_conversationId_createdAt",
      },
    ],
    { background: true },
  );
}

export async function down(db: Db): Promise<void> {
  const conversations = db.collection("conversations");
  await conversations.dropIndex("conversations_userId_type_lastMessageAt");
  await conversations.dropIndex("conversations_type_status_lastMessageAt");
  await conversations.dropIndex("conversations_assignedAdminId_status");

  const messages = db.collection("messages");
  await messages.dropIndex("messages_conversationId_createdAt");
}
