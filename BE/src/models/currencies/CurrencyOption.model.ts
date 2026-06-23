import mongoose, { Document, Schema } from "mongoose";

export interface ICurrencyOption extends Document {
  code: string;
}

const currencyOptionSchema = new Schema<ICurrencyOption>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: 8,
    },
  },
  { timestamps: true, collection: "currency_options" },
);

const CurrencyOption = mongoose.model<ICurrencyOption>(
  "CurrencyOption",
  currencyOptionSchema,
);

export default CurrencyOption;
