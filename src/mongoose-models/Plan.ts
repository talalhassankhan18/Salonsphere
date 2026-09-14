// src/mongoose-models/Plan.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  features: string[];
  isActive: boolean;
}

const PlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    monthlyPrice: { type: Number, required: true, min: 0 },
    yearlyPrice: { type: Number, required: true, min: 0 },
    productLimit: { type: Number, required: true, min: 1 },
    features: { type: [String], required: true, default: ["Basic Features"] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups by name

export default mongoose.models.Plan ||
  mongoose.model<IPlan>("Plan", PlanSchema);
