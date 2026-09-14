import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPortfolio extends Document {
  salon: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  image: string;
  createdAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for performance
portfolioSchema.index({ salon: 1, createdAt: -1 });

const Portfolio: Model<IPortfolio> =
  mongoose.models.Portfolio ||
  mongoose.model<IPortfolio>("Portfolio", portfolioSchema);

export default Portfolio;
