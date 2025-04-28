
import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolioItem extends Document {
  salon: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  image: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioItemSchema: Schema = new Schema({
  salon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  category: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.PortfolioItem || mongoose.model<IPortfolioItem>('PortfolioItem', PortfolioItemSchema);
