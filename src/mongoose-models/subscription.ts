import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // Ensures one active subscription per user
    plan: { type: String, required: true }, // Plan name (e.g., Basic, Premium)
    price: { type: String, required: true }, // Stores monthly/yearly price
    category: { type: String, enum: ["monthly", "yearly", "trial"], required: true }, // Distinguishes plan type
  },
  { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);