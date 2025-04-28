
import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  salon: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  salon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
