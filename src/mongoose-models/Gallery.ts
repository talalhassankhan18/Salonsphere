import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGallery extends Document {
  salon: mongoose.Types.ObjectId;
  imageUrl: string; // Cloudinary secure_url
  caption?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", gallerySchema);

export default Gallery;
