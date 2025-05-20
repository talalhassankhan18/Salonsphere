import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  subcategories: string[];
  featured: boolean;
}

const CategorySchema: Schema<ICategory> = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  productCount: { type: Number, default: 0 },
  subcategories: { type: [String], default: [] },
  featured: { type: Boolean, default: false },
});

// Ensuring model is not overwritten upon hot reloads in development
const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
