import mongoose, { Schema, Document, Model } from "mongoose";

interface ICustomerInfo {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

interface IBooking extends Document {
  salon: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  startTime: Date;
  duration: number;
  paymentOption: "full" | "half" | "cash";
  amountPaid: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customerInfo: ICustomerInfo;
  reviewToken?: string;
  reviewTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerInfoSchema = new Schema<ICustomerInfo>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  phone: { type: String, trim: true },
  notes: { type: String, trim: true },
});

const BookingSchema = new Schema<IBooking>(
  {
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    startTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 minute"],
    },
    paymentOption: {
      type: String,
      enum: {
        values: ["full", "half", "cash"],
        message: "{VALUE} is not a valid payment option",
      },
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: [0, "Amount paid cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    customerInfo: {
      type: CustomerInfoSchema,
      required: true,
    },
    reviewToken: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while enforcing uniqueness
    },
    reviewTokenExpires: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Ensure updatedAt is modified on save
BookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
BookingSchema.index({ salon: 1, startTime: 1 });
// Removed redundant BookingSchema.index({ reviewToken: 1 }) since unique: true already creates the index

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
