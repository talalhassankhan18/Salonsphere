
import mongoose, { Schema, Document } from 'mongoose';
import { IOrderItem, Address } from './types';

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  salon: mongoose.Types.ObjectId;
  products: IOrderItem[];
  totalAmount: number;
  commissionAmount: number; // 5% of totalAmount
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  forwardedToAdmin: boolean;
  forwardedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  salon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    required: true
  },
  products: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    discount: { type: Number }
  }],
  totalAmount: { type: Number, required: true },
  commissionAmount: { type: Number, required: true }, // 5% of totalAmount
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' }
  },
  trackingNumber: { type: String },
  notes: { type: String },
  forwardedToAdmin: { type: Boolean, default: false },
  forwardedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
