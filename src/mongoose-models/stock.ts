import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStock extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  category: mongoose.Types.ObjectId;
  sku: string;
  stockQuantity: number;
  reserved: number;
  available: number;
  status: string;
  lowStockThreshold: number;
  reorderPoint: number;
  warehouse: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema<IStock> = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    sku: { type: String, required: true, unique: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
    available: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    lowStockThreshold: { type: Number, required: true, min: 0 },
    reorderPoint: { type: Number, required: true, min: 0 },
    warehouse: { 
      type: String, 
      enum: ['Main Warehouse', 'Equipment Warehouse'], 
      required: true 
    },
  },
  { timestamps: true }
);

// Index for faster queries
StockSchema.index({ productId: 1, sku: 1 });

// Update status and available before saving
StockSchema.pre('save', function (next) {
  this.available = this.stockQuantity - this.reserved;
  if (this.stockQuantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.stockQuantity <= this.lowStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

const Stock: Model<IStock> =
  mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);

export default Stock;