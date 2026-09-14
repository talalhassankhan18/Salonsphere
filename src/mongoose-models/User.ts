import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  role: "admin" | "salon_admin" | "customer" | "super_admin";
  image?: string;
  gender?: "Male" | "Female" | "Unisex";
  age?: number;
  location?: { city?: string; area?: string };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["admin", "salon_admin", "customer", "super_admin"],
      default: "customer",
    },
    image: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Unisex"] },
    age: { type: Number, min: 0 },
    location: {
      city: { type: String, trim: true },
      area: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
