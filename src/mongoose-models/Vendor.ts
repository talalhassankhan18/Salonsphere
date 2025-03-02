import dbConnect from "@/lib/mongoose";
import mongoose, { Schema, Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto"; // For generating unique registration numbers

// Vendor model interface
export interface GlimmerVendor {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobileNumber: string;
    country: string;
    shopName: string;
    city: string;
    area: string;
    registrationNumber: string; // Added registration number field
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

// Vendor Schema
const VendorSchema: Schema<GlimmerVendor> = new Schema<GlimmerVendor>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        country: { type: String, required: true },
        shopName: { type: String, required: true },
        city: { type: String, required: true },
        area: { type: String, required: true },
        registrationNumber: { 
            type: String, 
            required: true, 
            unique: true // Ensure the registration number is unique
        },
        role: { 
            type: String, 
            enum: ["vendor", "admin"], 
            default: "vendor", 
            required: true 
        },
    },
    { timestamps: true }
);

const Vendor: Model<GlimmerVendor> = mongoose.models.Vendor || mongoose.model<GlimmerVendor>("Vendor", VendorSchema);

// API handler function
export async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method === "GET") {
        try {
            const vendors = await Vendor.find();
            res.status(200).json(vendors);
        } catch (error) {
            res.status(500).json({ message: "Error fetching vendors", error });
        }
    }

    if (req.method === "POST") {
        try {
            // Generate a unique registration number
            const registrationNumber = crypto.randomBytes(6).toString("hex").toUpperCase();

            const vendor = new Vendor({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                mobileNumber: req.body.mobileNumber,
                country: req.body.country,
                shopName: req.body.shopName,
                city: req.body.city,
                area: req.body.area,
                registrationNumber, // Assign the generated registration number
                role: req.body.role || "vendor", 
            });

            const result = await vendor.save();
            res.status(201).json(result);
        } catch (error) {
            console.error("Error creating vendor:", error);
            res.status(500).json({ message: "Error creating vendor", error });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}

export default Vendor;
