import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  services: { type: [String], default: [] },
  businessStatus: { type: String, enum: ["active", "inactive"], default: "active" },
  registrationDate: { type: Date, default: Date.now },
});

const ServiceModel = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

export default ServiceModel;
