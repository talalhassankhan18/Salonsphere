import mongoose, { Schema, Document } from "mongoose";

interface IPayout extends Document {
  orderId: string;
  salonId: string | null;
  amount: number;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true, // Index for faster lookups
    },
    salonId: {
      type: String,
      required: false,
      default: null,
      index: true, // Index for faster filtering by salon
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "credit_card",
        "debit_card",
        "paypal",
        "jazzcash",
        "easypaisa",
        "bank_transfer",
        "cash",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique payouts per orderId
PayoutSchema.index({ orderId: 1 }, { unique: true });

const Payout =
  mongoose.models.Payout || mongoose.model<IPayout>("Payout", PayoutSchema);

export default Payout;
