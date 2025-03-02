import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongoose";
import SalonServiceModel from "@/mongoose-models/SalonService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await dbConnect();

    try {
      const { salonId, userId, serviceName, price, duration, category, gender } = req.body;

      // Validate required fields
      if (!serviceName || !price || !duration || !gender) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newService = new SalonServiceModel({
        salonId,
        userId,
        serviceName,
        price,
        duration,
        category,
        gender,
      });

      const savedService = await newService.save();
      res.status(201).json(savedService);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create service" });
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
