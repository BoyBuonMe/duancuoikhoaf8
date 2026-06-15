import mongoose, { Document, Schema } from "mongoose";

export interface IProductRating extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const productRatingSchema = new Schema<IProductRating>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true, collection: "product_ratings" }
);

productRatingSchema.index({ productId: 1, userId: 1 }, { unique: true });

const ProductRating = mongoose.model<IProductRating>("ProductRating", productRatingSchema);
export default ProductRating;
