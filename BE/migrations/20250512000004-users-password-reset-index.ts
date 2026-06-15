import type { Db } from "mongodb";

const INDEX_NAME = "users_passwordResetTokenHash_sparse";

export async function up(db: Db): Promise<void> {
  await db.collection("users").createIndex(
    { passwordResetTokenHash: 1 },
    {
      name: INDEX_NAME,
      sparse: true,
      background: true,
    },
  );
}

export async function down(db: Db): Promise<void> {
  await db.collection("users").dropIndex(INDEX_NAME);
}
