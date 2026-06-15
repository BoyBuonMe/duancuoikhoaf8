import mongoose from "mongoose";

function mongooseUri(): string {
  const base = (process.env.MONGODB_URL || "mongodb://127.0.0.1:27017").trim();
  const db = process.env.MONGODB_DATABASE || "e-commerce";
  if (base.includes("?")) {
    const [pathPart, query] = base.split("?");
    return `${pathPart.replace(/\/$/, "")}/${db}?${query}`;
  }
  return `${base.replace(/\/$/, "")}/${db}`;
}

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongooseUri());
  return mongoose.connection;
}

export { mongoose };
