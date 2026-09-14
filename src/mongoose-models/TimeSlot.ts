import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimeSlot extends Document {
  _id: mongoose.Types.ObjectId;
  salon: mongoose.Types.ObjectId;
  startTime: Date;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: [true, "Salon is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
timeSlotSchema.index({ salon: 1, startTime: 1 }, { unique: true });

const TimeSlot: Model<ITimeSlot> =
  mongoose.models.TimeSlot ||
  mongoose.model<ITimeSlot>("TimeSlot", timeSlotSchema);

export default TimeSlot;
