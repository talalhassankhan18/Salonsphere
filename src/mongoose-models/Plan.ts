import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  features: string[];
  isActive: boolean;
}

const PlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  monthlyPrice: { type: Number, required: true },
  yearlyPrice: { type: Number, required: true },
  productLimit: { type: Number, required: true },
  features: { type: [String], required: true },
  isActive: { type: Boolean, default: true }
});

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);