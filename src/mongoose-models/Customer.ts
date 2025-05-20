import mongoose, { Schema, Document } from "mongoose";

export interface INotification {
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface ICustomer extends Document {
  email: string;
  name?: string;
  password?: string;
  authMethod: "email" | "google";
  isVerified: boolean;
  verificationToken?: string;
  role: "customer";
  createdAt: Date;
  updatedAt: Date;
  orders: mongoose.Types.ObjectId[];
  notifications: INotification[];
}

const CustomerSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    authMethod: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
        default: [],
      },
    ],
    notifications: [
      {
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
