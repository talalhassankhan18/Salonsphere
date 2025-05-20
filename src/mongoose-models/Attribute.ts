import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttribute extends Document {
  name: string;
  values: string[];
  filterable: boolean;
  required: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttributeSchema: Schema<IAttribute> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    values: { type: [String], default: [] },
    filterable: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries on name
AttributeSchema.index({ name: 1 });

const Attribute: Model<IAttribute> =
  mongoose.models.Attribute || mongoose.model<IAttribute>('Attribute', AttributeSchema);

export default Attribute;