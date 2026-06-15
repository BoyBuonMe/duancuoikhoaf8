import mongoose, { Document, Schema } from "mongoose";

interface IPrice {
  amount: number;
  currency: string;
}

interface IProduct extends Document {
  sourceUrl: string;
  title: string;
  price: IPrice;
  imageUrls: string[];
  localImagePaths: string[];
  categories: string[];
  scrapedAt: Date;
}

const priceSchema = new Schema<IPrice>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    sourceUrl: { type: String, required: true, trim: true, unique: true },
    title: { type: String, required: true, trim: true },
    price: { type: priceSchema, required: true },
    imageUrls: { type: [String], default: [] },
    localImagePaths: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    scrapedAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "products" },
);

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
