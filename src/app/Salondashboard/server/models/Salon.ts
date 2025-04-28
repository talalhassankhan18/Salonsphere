
import mongoose, { Schema, Document } from 'mongoose';
import { BusinessHours } from './types';

export interface ISalon extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  description: string;
  profileImage?: string;
  coverImage?: string;
  businessHours: BusinessHours;
  createdAt: Date;
  updatedAt: Date;
}

const SalonSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  profileImage: { type: String },
  coverImage: { type: String },
  businessHours: {
    monday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    tuesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    wednesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    thursday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    friday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    saturday: { 
      open: { type: String, default: '10:00' }, 
      close: { type: String, default: '16:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    sunday: { 
      open: { type: String, default: '00:00' }, 
      close: { type: String, default: '00:00' }, 
      isOpen: { type: Boolean, default: false } 
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Salon || mongoose.model<ISalon>('Salon', SalonSchema);
