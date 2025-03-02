import mongoose, { Schema, Model } from "mongoose";

export interface GlimmerVendor {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    businessName: string;
    shopNumber: string;
    street: string;
    city: string;
    province: string;
    area: string;
    businessRegistrationNumber: string;
    termsAccepted: Boolean;
    profileImage?: string;
    role: "vendor" | "admin";
    createdAt: Date;
    updatedAt: Date;
}

const VendorSchema: Schema<GlimmerVendor> = new Schema<GlimmerVendor>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true },
        businessName: { type: String, required: true },
        shopNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        area: { type: String, required: true },
        businessRegistrationNumber: { type: String, required: true, unique: true },
        termsAccepted: { type: Boolean, required: true },
        profileImage: { type: String, default: "" },
        role: { type: String, enum: ["vendor", "admin"], default: "vendor" },
    },
    { timestamps: true }
);

const Vendor: Model<GlimmerVendor> = mongoose.models.Vendor || mongoose.model<GlimmerVendor>("Vendor", VendorSchema);

export default Vendor;
