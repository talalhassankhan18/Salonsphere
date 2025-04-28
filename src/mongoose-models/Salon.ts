import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interfaces for type safety
interface IPlan {
  name: string;
  price: string;
  productLimit: number;
  billingCycle: "monthly" | "yearly";
}

export interface ISalon extends Document {
  userId: string;
  email: string;
  username: string;
  password?: string;
  name: string;
  phone: string;
  salonName: string;
  address: string;
  salonType: "female" | "male" | "unisex";
  authMethod: "email";
  verificationCode?: string;
  verificationCodeExpires?: Date;
  isVerified: boolean;
  plan?: IPlan;
  paymentStatus: "pending" | "completed" | "failed";
  isActive: boolean;
  avatar?: string;
  role: "admin" | "salon_admin" | "customer" | "super_admin";
  createdAt: Date;
  lastStep: string;
}

// Plan sub-schema
const planSchema = new Schema<IPlan>({
  name: { type: String, required: true },
  price: { type: String, required: true },
  productLimit: { type: Number, required: true },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
});

// Salon schema
const salonSchema = new Schema<ISalon>(
  {
    userId: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    salonName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    salonType: {
      type: String,
      enum: ["female", "male", "unisex"],
      required: true,
    },
    authMethod: {
      type: String,
      enum: ["email"],
      default: "email",
      required: true,
    },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    plan: { type: planSchema, required: false },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    isActive: { type: Boolean, default: false },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["admin", "salon_admin", "customer", "super_admin"],
      default: "salon_admin",
    },
    createdAt: { type: Date, default: Date.now },
    lastStep: {
      type: String,
      default: "/salon/register/basic-info",
      enum: [
        "/salon/register/basic-info",
        "/salon/register/verification",
        "/salon/register/plan-selection",
        "/salon/register/payment",
        "/salon/dashboard",
      ],
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for verificationCode (not unique, so explicitly defined)
salonSchema.index({ verificationCode: 1 });

// Prevent duplicate model compilation
const Salon: Model<ISalon> =
  mongoose.models.Salon || mongoose.model<ISalon>("Salon", salonSchema);

export default Salon;