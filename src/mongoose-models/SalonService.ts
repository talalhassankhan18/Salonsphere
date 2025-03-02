import mongoose, { Schema, Document, Types, Model } from "mongoose";

// Define the TypeScript interface for the SalonService
interface ISalonService extends Document {
  salonId: Types.ObjectId; // Refers to Vendor's _id
  userId: Types.ObjectId;  // Refers to the user managing the salon (if applicable)
  serviceName: string;
  price: number;
  duration: string; // E.g., "30 minutes", "2 hours"
  category: string;
  gender: "Male" | "Female" | "Unisex";
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the SalonService
const salonServiceSchema = new Schema<ISalonService>(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor", // Relates to Vendor's _id
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Relates to User's _id
      required: true,
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      minlength: [3, "Service name must be at least 3 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      validate: {
        validator: function (value: string) {
          return /^[0-9]+ (minutes|hours)$/.test(value);
        },
        message: "Duration must be a valid string like '30 minutes' or '2 hours'",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Unisex"],
      required: [true, "Gender is required"],
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Export the model
const SalonServiceModel: Model<ISalonService> =
  mongoose.models.SalonService ||
  mongoose.model<ISalonService>("SalonService", salonServiceSchema);

export default SalonServiceModel;
