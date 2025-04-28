
import mongoose, { Schema, Document } from 'mongoose';

export interface ICommission extends Document {
  salon: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid';
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema: Schema = new Schema({
  salon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    required: true
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: true
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentDate: { type: Date }
}, {
  timestamps: true
});

// Ensure one commission record per order
CommissionSchema.index({ order: 1 }, { unique: true });

export default mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);
