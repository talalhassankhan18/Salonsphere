import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: string;
  type: 'Percentage' | 'Fixed Amount' | 'Shipping';
  minPurchase: number;
  limit: number;
  used: number;
  status: 'Active' | 'Expired';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema<ICoupon> = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    discount: { type: String, required: true },
    type: {
      type: String,
      enum: ['Percentage', 'Fixed Amount', 'Shipping'],
      required: true,
    },
    minPurchase: { type: Number, required: true, min: 0 },
    limit: { type: Number, default: 0, min: 0 },
    used: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);


const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;