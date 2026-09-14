import mongoose, { Schema, Document } from "mongoose";

interface ISettings extends Document {
  firstName: string;
  lastName: string;
  platformName: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultCurrency: string;
  platformTagline: string;
  platformDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    platformName: { type: String, required: true, trim: true },
    supportEmail: { type: String, required: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    defaultTimezone: { type: String, required: true, default: "utc" },
    defaultCurrency: { type: String, required: true, default: "pkr" },
    platformTagline: { type: String, required: true, trim: true },
    platformDescription: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);