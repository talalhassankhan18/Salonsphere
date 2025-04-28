import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  productLimit: { type: Number, required: true },
  billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
});

const DraftSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  type: { type: String, enum: ["basic", "profile"], required: true },
  data: {
    // Basic registration fields
    name: { type: String },
    phone: { type: String },
    username: { type: String },
    password: { type: String },
    salonName: { type: String },
    address: { type: String },
    plan: { type: PlanSchema },
    authMethod: { type: String, enum: ["email", "google"] },
    // Profile fields
    description: { type: String },
    logo: { type: String },
    images: { type: [String] },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DraftSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Draft || mongoose.model("Draft", DraftSchema);