import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBanner extends Document {
  title: string;
  type: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: string;
  priority: number;
  imageUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema<IBanner> = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Hero Slider", "Category Banner", "Side Banner", "Popup"],
      required: true,
    },
    location: {
      type: String,
      enum: ["Homepage", "Category Page", "Sidebar", "All Pages"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Scheduled", "Expired"],
      default: "Scheduled",
    },
    priority: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: "" },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for faster queries

// Update status based on dates before saving
BannerSchema.pre("save", function (next) {
  const now = new Date();
  if (this.endDate < now) {
    this.status = "Expired";
  } else if (this.startDate > now) {
    this.status = "Scheduled";
  } else {
    this.status = "Active";
  }
  next();
});

const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export default Banner;
