
import mongoose, { Schema, Document } from 'mongoose';

export interface IProductListing extends Document {
  product: mongoose.Types.ObjectId;
  salon: mongoose.Types.ObjectId;
  discount?: number; // Percentage discount
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductListingSchema: Schema = new Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true
  },
  salon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    required: true
  },
  discount: { 
    type: Number,
    min: 0,
    max: 100
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Compound index to ensure a product is only listed once per salon
ProductListingSchema.index({ product: 1, salon: 1 }, { unique: true });

export default mongoose.models.ProductListing || mongoose.model<IProductListing>('ProductListing', ProductListingSchema);
