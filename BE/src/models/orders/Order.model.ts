import mongoose, { Document, Schema } from "mongoose";

export const ORDER_STATUSES = [
  "pending",
  "awaiting_pickup",
  "shipping",
  "delivered",
  "cancelled",
  "payment_failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

interface IUnitPrice {
  amount: number;
  currency: string;
}

interface IOrderItem {
  productId?: string;
  productSlug?: string;
  sku: string;
  name: string;
  image: string;
  variantLabel?: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: IUnitPrice;
}

interface IShippingAddress {
  provinceCode?: string;
  wardCode?: string;
  streetAddress?: string;
}

interface IOrder extends Document {
  orderCode: string;
  userEmail: string;
  status: OrderStatus;
  isPay: boolean;
  momoOrderId?: string;
  vnpTxnRef?: string;
  items: IOrderItem[];
  subtotal: IUnitPrice;
  shippingFee: number;
  voucherCode?: string;
  voucherDiscount: number;
  promoCode?: string;
  promoDiscount: number;
  total: IUnitPrice;
  deliveryMethod?: string;
  paymentMethod?: string;
  shippingAddress?: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const unitPriceSchema = new Schema<IUnitPrice>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, uppercase: true },
  },
  { _id: false },
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, trim: true },
    productSlug: { type: String, trim: true },
    sku: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    variantLabel: { type: String, trim: true },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: unitPriceSchema, required: true },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    provinceCode: { type: String, trim: true },
    wardCode: { type: String, trim: true },
    streetAddress: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    isPay: { type: Boolean, default: false },
    momoOrderId: { type: String, trim: true },
    vnpTxnRef: { type: String, trim: true, uppercase: true },
    items: { type: [orderItemSchema], required: true, minlength: 1 },
    subtotal: { type: unitPriceSchema, required: true },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    voucherCode: { type: String, trim: true, uppercase: true },
    voucherDiscount: { type: Number, required: true, min: 0, default: 0 },
    promoCode: { type: String, trim: true, lowercase: true },
    promoDiscount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: unitPriceSchema, required: true },
    deliveryMethod: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    shippingAddress: { type: shippingAddressSchema },
  },
  { timestamps: true, collection: "orders" },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
