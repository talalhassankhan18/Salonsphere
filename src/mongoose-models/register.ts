import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegister extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  mobileNumber?: string;
  country?: string;
  shopName?: string;
  city?: string;
  area?: string;
  registrationNumber?: string;
}

const registerSchema = new Schema<IRegister>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobileNumber: { type: String },
    country: { type: String },
    shopName: { type: String },
    city: { type: String },
    area: { type: String },
    registrationNumber: { type: String },
  },
  { timestamps: true }
);

const Register: Model<IRegister> =
  mongoose.models.Register || mongoose.model<IRegister>("Register", registerSchema);

export default Register;
