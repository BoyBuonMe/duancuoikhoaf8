import mongoose, { Document, Schema } from "mongoose";

interface IPrice {
  amount: number;
  currency: string;
}

export interface IProductVariant extends Document {
  sku: string;
  productSourceUrl: string;
  size: string;
  price: IPrice;
  isActive: boolean;
}

const priceSchema = new Schema<IPrice>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
  },
  { _id: false },
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true, trim: true, unique: true },
    productSourceUrl: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    price: { type: priceSchema, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "product_variants" },
);

const ProductVariant = mongoose.model<IProductVariant>(
  "ProductVariant",
  productVariantSchema,
);

export default ProductVariant;
