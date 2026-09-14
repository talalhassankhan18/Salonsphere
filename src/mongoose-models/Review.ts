import mongoose, { Schema, Model } from "mongoose";

interface IReview {
  salon: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  customerEmail: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for salon and booking
reviewSchema.index({ salon: 1, booking: 1 });

// Prevent model overwrite by checking if the model already exists
const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default Review;
