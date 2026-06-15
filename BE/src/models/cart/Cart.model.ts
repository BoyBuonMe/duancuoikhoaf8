import mongoose, { Document, Schema } from "mongoose";

interface IUnitPrice {
  amount: number;
  currency: string;
}

interface ICartItem {
  sku: string;
  quantity: number;
  unitPrice: IUnitPrice;
  name: string;
  image: string;
  variantLabel?: string;
  productSlug?: string;
}

interface ICart extends Document {
  userEmail: string;
  items: ICartItem[];
  subtotal: IUnitPrice;
  updatedAt: Date;
}

const unitPriceSchema = new Schema<IUnitPrice>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
  },
  { _id: false },
);

const cartItemSchema = new Schema<ICartItem>(
  {
    sku: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: unitPriceSchema, required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    variantLabel: { type: String, trim: true },
    productSlug: { type: String, trim: true },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    items: { type: [cartItemSchema], default: [] },
    subtotal: {
      type: unitPriceSchema,
      required: true,
      default: { amount: 0, currency: "USD" },
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
    collection: "carts",
  },
);

// Tự tính lại subtotal trước khi lưu
cartSchema.pre("save", async function () {
  const total = this.items.reduce(
    (sum, item) => sum + item.unitPrice.amount * item.quantity,
    0,
  );
  const currency = this.items[0]?.unitPrice.currency ?? "USD";
  this.subtotal = { amount: total, currency };
});

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
