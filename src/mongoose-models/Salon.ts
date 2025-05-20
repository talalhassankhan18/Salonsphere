import mongoose, { Schema, Document, Model } from "mongoose";
import schedulingSchema, { IScheduling } from "./Scheduling";

// Interface for embedded Plan document
export interface IPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  features: string[];
  isActive: boolean;
  upgradedAt?: Date; // New field for tracking plan upgrades
}

// Interface for Salon document
export interface ISalon extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  username: string;
  password?: string;
  name: string;
  phone: string;
  salonName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  salonType: "female" | "male" | "unisex";
  authMethod: "email";
  verificationCode?: string;
  verificationCodeExpires?: Date;
  isVerified: boolean;
  plan?: IPlan;
  pendingPlan?: IPlan; // New field for temporary plan during upgrade
  paymentStatus: "pending" | "completed" | "failed";
  isActive: boolean;
  avatar?: string;
  role: "admin" | "salon_admin" | "customer" | "super_admin";
  portfolios: mongoose.Types.ObjectId[];
  services: mongoose.Types.ObjectId[];
  gallery: mongoose.Types.ObjectId[];
  lastStep: string;
  scheduling?: IScheduling;
  ratings?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema for Plan
const PlanSubSchema: Schema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true },
    monthlyPrice: {
      type: Number,
      required: true,
      min: [0, "Monthly price cannot be negative"],
    },
    yearlyPrice: {
      type: Number,
      required: true,
      min: [0, "Yearly price cannot be negative"],
    },
    productLimit: {
      type: Number,
      required: true,
      min: [0, "Product limit can be 0 for Free Trial or unlimited plans"],
    },
    features: { type: [String], required: true, default: [] }, // Updated default to empty array
    isActive: { type: Boolean, default: true },
    upgradedAt: { type: Date }, // New field to track when the plan was last upgraded
  },
  { _id: false }
);

// Main Salon schema
const salonSchema = new Schema<ISalon>(
  {
    userId: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    password: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, "Please provide a valid phone number"],
    },
    salonName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    salonType: {
      type: String,
      enum: {
        values: ["female", "male", "unisex"],
        message: "{VALUE} is not a valid salon type",
      },
      required: true,
    },
    authMethod: {
      type: String,
      enum: ["email"],
      default: "email",
      required: true,
    },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    plan: { type: PlanSubSchema },
    pendingPlan: { type: PlanSubSchema }, // New field for pending plan
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
    },
    isActive: { type: Boolean, default: false },
    avatar: { type: String, trim: true },
    role: {
      type: String,
      enum: {
        values: ["admin", "salon_admin", "customer", "super_admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "salon_admin",
    },
    portfolios: [
      { type: Schema.Types.ObjectId, ref: "Portfolio", default: [] },
    ],
    services: [{ type: Schema.Types.ObjectId, ref: "Service", default: [] }],
    gallery: [{ type: Schema.Types.ObjectId, ref: "Gallery", default: [] }],
    lastStep: {
      type: String,
      default: "/salon/register/basic-info",
      enum: {
        values: [
          "/salon/register/basic-info",
          "/salon/register/verification",
          "/salon/register/plan-selection",
          "/salon/register/payment",
          "/salon/dashboard",
        ],
        message: "{VALUE} is not a valid registration step",
      },
    },
    scheduling: {
      type: schedulingSchema,
      default: () => ({
        businessHours: [
          {
            day: "Monday",
            isOpen: true,
            openTime: "9:00 AM",
            closeTime: "6:00 PM",
          },
          {
            day: "Tuesday",
            isOpen: true,
            openTime: "9:00 AM",
            closeTime: "6:00 PM",
          },
          {
            day: "Wednesday",
            isOpen: true,
            openTime: "9:00 AM",
            closeTime: "6:00 PM",
          },
          {
            day: "Thursday",
            isOpen: true,
            openTime: "9:00 AM",
            closeTime: "6:00 PM",
          },
          {
            day: "Friday",
            isOpen: true,
            openTime: "9:00 AM",
            closeTime: "6:00 PM",
          },
          {
            day: "Saturday",
            isOpen: true,
            openTime: "10:00 AM",
            closeTime: "4:00 PM",
          },
          { day: "Sunday", isOpen: false, openTime: null, closeTime: null },
        ],
        appointmentBuffer: 15,
        allowOnlineBooking: true,
        requireConfirmation: false,
      }),
    },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook for validation
salonSchema.pre("save", function (next) {
  console.log("Salon pre-save hook: Starting for email", this.email, {
    schedulingExists: !!this.scheduling,
  });

  // Initialize arrays
  this.services = this.services || [];
  this.gallery = this.gallery || [];
  this.portfolios = this.portfolios || [];

  // Ensure scheduling is initialized
  if (!this.scheduling || typeof this.scheduling !== "object") {
    console.log(
      "Salon pre-save hook: Initializing missing scheduling for email",
      this.email
    );
    this.scheduling = {
      businessHours: [
        {
          day: "Monday",
          isOpen: true,
          openTime: "9:00 AM",
          closeTime: "6:00 PM",
        },
        {
          day: "Tuesday",
          isOpen: true,
          openTime: "9:00 AM",
          closeTime: "6:00 PM",
        },
        {
          day: "Wednesday",
          isOpen: true,
          openTime: "9:00 AM",
          closeTime: "6:00 PM",
        },
        {
          day: "Thursday",
          isOpen: true,
          openTime: "9:00 AM",
          closeTime: "6:00 PM",
        },
        {
          day: "Friday",
          isOpen: true,
          openTime: "9:00 AM",
          closeTime: "6:00 PM",
        },
        {
          day: "Saturday",
          isOpen: true,
          openTime: "10:00 AM",
          closeTime: "4:00 PM",
        },
        { day: "Sunday", isOpen: false, openTime: null, closeTime: null },
      ],
      appointmentBuffer: 15,
      allowOnlineBooking: true,
      requireConfirmation: false,
    };
  }

  // Validate scheduling
  if (this.scheduling && Array.isArray(this.scheduling.businessHours)) {
    console.log(
      "Salon pre-save hook: Validating businessHours for email",
      this.email,
      {
        businessHoursLength: this.scheduling.businessHours.length,
      }
    );
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const businessHours = this.scheduling.businessHours;

    if (businessHours.length !== days.length) {
      console.log(
        "Salon pre-save hook: Invalid businessHours length for email",
        this.email,
        {
          length: businessHours.length,
        }
      );
      return next(
        new Error("Business hours must include all days of the week")
      );
    }

    for (const bh of businessHours) {
      if (!days.includes(bh.day)) {
        console.log("Salon pre-save hook: Invalid day for email", this.email, {
          day: bh.day,
        });
        return next(new Error(`Invalid day: ${bh.day}`));
      }
      if (bh.isOpen) {
        if (!bh.openTime || !bh.closeTime) {
          console.log(
            "Salon pre-save hook: Missing times for open day for email",
            this.email,
            {
              day: bh.day,
              openTime: bh.openTime,
              closeTime: bh.closeTime,
            }
          );
          return next(
            new Error(
              `Open and close times are required for open days (${bh.day})`
            )
          );
        }
      } else {
        bh.openTime = null;
        bh.closeTime = null;
      }
    }
  } else {
    console.log(
      "Salon pre-save hook: Invalid businessHours array for email",
      this.email,
      {
        scheduling: this.scheduling,
      }
    );
    return next(new Error("Scheduling business hours must be an array"));
  }

  console.log("Salon pre-save hook: Completed for email", this.email);
  next();
});

// Indexes for performance
salonSchema.index({ salonName: 1 });
salonSchema.index({ verificationCode: 1, verificationCodeExpires: 1 });
salonSchema.index({ userId: 1 });

// Clear model cache to ensure updated schema is used
delete mongoose.models.Salon;

// Create or reuse Salon model
const Salon: Model<ISalon> = mongoose.model<ISalon>("Salon", salonSchema);

export default Salon;