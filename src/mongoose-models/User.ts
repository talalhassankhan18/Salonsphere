// User.ts
import dbConnect from "@/lib/mongoose";
import mongoose, { Schema, Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export interface GlimmerUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    gender: string;
    age: number;
    location: {
        city: string;
        area: string;
    };
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<GlimmerUser> = new Schema<GlimmerUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        gender: {
            type: String,
            enum: ["Male", "Female", "unisex"],
            required: true,
        },
        age: { type: Number, required: true, min: 0 },
        location: {
            city: { type: String, required: true },
            area: { type: String, required: true },
        },
        role: { 
            type: String, 
            enum: ["user", "vendor", "admin"], 
            default: "user", 
            required: true 
        },
    },
    { timestamps: true },
);

const User: Model<GlimmerUser> =
    mongoose.models.User || mongoose.model<GlimmerUser>("User", UserSchema);

export async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method === "GET") {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Error fetching users", error });
        }
    }
    
    if (req.method === "POST") {
        try {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                gender: req.body.gender,
                age: req.body.age,
                location: {
                    city: req.body.location?.city,
                    area: req.body.location?.area,
                },
                role: req.body.role || "user", 
            });

            const result = await user.save();
            res.status(201).json(result);
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Error creating user", error });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}

export default User;
