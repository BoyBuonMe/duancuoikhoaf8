import mongoose, { Document, Schema } from "mongoose";

interface IWishlistItem {
  /** Primary identifier for wishlist entries created via the FE heart toggle. */
  productId?: string;
  /** Legacy seed/backup entries keyed by variant SKU. */
  sku?: string;
  addedAt: Date;
}

interface IWishlist extends Document {
  userEmail: string;
  items: IWishlistItem[];
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: { type: String, trim: true },
    sku: { type: String, trim: true },
    addedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false },
);

const wishlistSchema = new Schema<IWishlist>(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    items: { type: [wishlistItemSchema], default: [] },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
    collection: "wishlists",
  },
);

const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
export default Wishlist;
