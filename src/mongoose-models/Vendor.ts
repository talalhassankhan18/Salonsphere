import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVendor extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  country: string;
  shopName: string;
  city: string;
  area: string;
  registrationNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    shopName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", vendorSchema);

export default Vendor;
