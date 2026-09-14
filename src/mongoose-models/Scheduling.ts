import mongoose, { Schema } from "mongoose";

// Interface for Business Hour
export interface IBusinessHour {
  day: string;
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
}

// Interface for Scheduling
export interface IScheduling {
  businessHours: IBusinessHour[];
  appointmentBuffer: number;
  allowOnlineBooking: boolean;
  requireConfirmation: boolean;
}

// Scheduling schema
const schedulingSchema = new Schema<IScheduling>(
  {
    businessHours: [
      {
        day: {
          type: String,
          required: [true, "Day is required"],
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        isOpen: {
          type: Boolean,
          required: [true, "isOpen is required"],
        },
        openTime: {
          type: String,
          trim: true,
          default: null,
        },
        closeTime: {
          type: String,
          trim: true,
          default: null,
        },
      },
    ],
    appointmentBuffer: {
      type: Number,
      default: 15,
      min: [5, "Appointment buffer must be at least 5 minutes"],
    },
    allowOnlineBooking: {
      type: Boolean,
      default: true,
    },
    requireConfirmation: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Default business hours and validation
schedulingSchema.pre("validate", function (next) {
  if (!this.businessHours || this.businessHours.length === 0) {
    this.businessHours = [
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
    ];
  }

  // Ensure openTime and closeTime are null when isOpen is false
  this.businessHours.forEach((bh) => {
    if (!bh.isOpen) {
      bh.openTime = null;
      bh.closeTime = null;
    } else if (bh.openTime && bh.closeTime) {
      const timeRegex = /^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/;
      if (!timeRegex.test(bh.openTime) || !timeRegex.test(bh.closeTime)) {
        next(
          new Error(
            `Invalid time format for ${bh.day}: ${bh.openTime} - ${bh.closeTime}`
          )
        );
      }
    }
  });

  next();
});

export default schedulingSchema;
