import mongoose, { Schema, Document, Model } from "mongoose";

export interface IServiceSelection extends Document {
  userId: string;
  services: string[];
  registrationDate: Date;
  businessStatus: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const serviceSelectionSchema = new Schema<IServiceSelection>(
  {
    userId: { type: String, required: true },
    services: { type: [String], default: [] },
    registrationDate: { type: Date, default: Date.now },
    businessStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

const ServiceSelection: Model<IServiceSelection> =
  mongoose.models.ServiceSelection ||
  mongoose.model<IServiceSelection>("ServiceSelection", serviceSelectionSchema);

export default ServiceSelection;
