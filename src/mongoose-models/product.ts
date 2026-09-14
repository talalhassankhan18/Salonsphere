import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  price: number;
  discount?: number;
  stock: number;
  attributes: { attributeId: mongoose.Types.ObjectId; value: string }[];
  imageUrls: string[];
  description: string;
  howToUse: string;
  maxAllowedInCart: number;
  status: string;
  sold: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true }, // Removed index: true if it existed
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100 },
    stock: { type: Number, required: true, min: 0 },
    attributes: [
      {
        attributeId: {
          type: Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        value: { type: String, required: true },
      },
    ],
    imageUrls: { type: [String], default: [] },
    description: { type: String, default: "" },
    howToUse: { type: String, default: "" },
    maxAllowedInCart: { type: Number, default: 10, min: 1 },
    status: {
      type: String,
      enum: ["Active", "Low Stock", "Out of Stock"],
      default: "Active",
    },
    sold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 1, category: 1 }); // Keep the compound index

ProductSchema.pre("save", function (next) {
  if (this.stock === 0) {
    this.status = "Out of Stock";
  } else if (this.stock < 10) {
    this.status = "Low Stock";
  } else {
    this.status = "Active";
  }
  next();
});

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
