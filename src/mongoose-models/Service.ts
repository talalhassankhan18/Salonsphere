import mongoose, { Schema, Document, Model } from "mongoose";

export interface IService extends Document {
  _id: mongoose.Types.ObjectId; // Explicitly type _id
  salon: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number; // Price in PKR
  duration: number;
  category: string;
  image?: string;
  gender: "Unisex" | "Female" | "Male";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 15 },
    category: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    gender: {
      type: String,
      enum: ["Unisex", "Female", "Male"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for performance
serviceSchema.index({ salon: 1, name: 1 });

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);

export default Service;
