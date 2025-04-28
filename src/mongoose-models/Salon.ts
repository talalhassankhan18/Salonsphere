import mongoose, { Document, Schema } from 'mongoose';

export interface ISalon extends Document {
  name: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
  owner: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const salonSchema = new Schema<ISalon>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Salon = mongoose.models.Salon || mongoose.model<ISalon>('Salon', salonSchema);
export default Salon;