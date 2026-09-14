import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "booking" | "status_update" | "system" | "promotion";
  target: "all" | "salons" | "customers" | "specific" | "salonAdmin";
  recipientIds: string[];
  status: "draft" | "sent";
  scheduledFor?: Date;
  createdAt: Date;
  sentAt?: Date;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: {
        values: ["booking", "status_update", "system", "promotion"],
        message: "{VALUE} is not a valid notification type",
      },
      required: true,
    },
    target: {
      type: String,
      enum: {
        values: ["all", "salons", "customers", "specific", "salonAdmin"],
        message: "{VALUE} is not a valid notification target",
      },
      required: true,
    },
    recipientIds: [{ type: String, required: true }],
    status: {
      type: String,
      enum: {
        values: ["draft", "sent"],
        message: "{VALUE} is not a valid notification status",
      },
      default: "draft",
    },
    scheduledFor: { type: Date },
    createdAt: { type: Date, default: Date.now },
    sentAt: { type: Date },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;