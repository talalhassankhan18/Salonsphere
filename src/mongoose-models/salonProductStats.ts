import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISalonProductStats extends Document {
  salonId: mongoose.Types.ObjectId;
  salonName: string;
  productId: mongoose.Types.ObjectId;
  productName: string;
  stock: number;
  desiredStock: number;
  sold: number;
  commissionRate: number;
  uniqueProductCode: string;
  lastUpdated: Date;
}

const SalonProductStatsSchema: Schema<ISalonProductStats> = new Schema(
  {
    salonId: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    salonName: {
      type: String,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
    },
    desiredStock: {
      type: Number,
      required: true,
      min: [0, "Desired stock cannot be negative"],
    },
    sold: {
      type: Number,
      required: true,
      min: [0, "Sold cannot be negative"],
    },
    commissionRate: {
      type: Number,
      required: true,
      min: [0, "Commission rate cannot be negative"],
      max: [1, "Commission rate cannot exceed 100%"],
    },
    uniqueProductCode: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

SalonProductStatsSchema.index({ salonId: 1, productId: 1 }, { unique: true });

export default (mongoose.models
  .SalonProductStats as Model<ISalonProductStats>) ||
  mongoose.model<ISalonProductStats>(
    "SalonProductStats",
    SalonProductStatsSchema
  );
