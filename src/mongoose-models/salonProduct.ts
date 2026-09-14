import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISalonProduct extends Document {
  salonId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  stockId?: mongoose.Types.ObjectId; // Added to reference Stock
  commissionRate: number;
  isActive: boolean;
  stock: number;
  sold: number;
  uniqueProductCode: string;
  desiredStock: number;
  lastStockUpdateReason?: string;
}

const SalonProductSchema: Schema<ISalonProduct> = new Schema(
  {
    salonId: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stockId: {
      type: Schema.Types.ObjectId,
      ref: "Stock",
      default: null, // Optional, set when stock is allocated
    },
    commissionRate: {
      type: Number,
      required: true,
      default: 0.05,
      min: [0, "Commission rate cannot be negative"],
      max: [1, "Commission rate cannot exceed 100%"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sold: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Sold cannot be negative"],
    },
    uniqueProductCode: {
      type: String,
      required: true,
      unique: true,
    },
    desiredStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Desired stock cannot be negative"],
    },
    lastStockUpdateReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

SalonProductSchema.index({ salonId: 1, productId: 1 }, { unique: true });

SalonProductSchema.pre<ISalonProduct>("save", async function (next) {
  const Salon = mongoose.model("Salon");
  const ProductModel = mongoose.model("Product");

  interface ISalonLean {
    _id: mongoose.Types.ObjectId;
    salonName: string;
  }

  const [productExists, salon] = await Promise.all([
    ProductModel.exists({ _id: this.productId }),
    Salon.findById(this.salonId)
      .select("salonName")
      .lean() as Promise<ISalonLean | null>,
  ]);

  if (!productExists) {
    return next(new Error(`Product with ID ${this.productId} does not exist`));
  }
  if (!salon) {
    return next(new Error(`Salon with ID ${this.salonId} does not exist`));
  }

  if (this.isNew) {
    const salonName = salon.salonName || "salon";
    const sanitizedSalonName = salonName
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    let uniqueCode = `${sanitizedSalonName}-${randomCode}`;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      const existing = await mongoose
        .model("SalonProduct")
        .findOne({ uniqueProductCode: uniqueCode })
        .lean();
      if (!existing) {
        isUnique = true;
      } else {
        const newRandomCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        uniqueCode = `${sanitizedSalonName}-${newRandomCode}`;
        attempts++;
      }
    }

    if (!isUnique) {
      return next(
        new Error(
          "Failed to generate a unique product code after multiple attempts"
        )
      );
    }

    this.uniqueProductCode = uniqueCode;
  }

  next();
});

export default (mongoose.models.SalonProduct as Model<ISalonProduct>) ||
  mongoose.model<ISalonProduct>("SalonProduct", SalonProductSchema);
