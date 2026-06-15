import mongoose, { Document, Schema } from "mongoose";

interface ICategory extends Document {
  name: string;
  slug: string;
  level: number;
  parentSlug: string | null;
  path: string;
  pathSegments: string[];
  productCount: number;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    level: { type: Number, required: true, min: 0 },
    parentSlug: { type: String, default: null },
    path: { type: String, required: true },
    pathSegments: { type: [String], default: [] },
    productCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: false, collection: "categories" },
);

categorySchema.index({ level: 1 });
categorySchema.index({ parentSlug: 1 });

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
