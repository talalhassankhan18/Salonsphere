import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongoose";
import SalonServiceModel from "@/mongoose-models/SalonService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await dbConnect();

    try {
      const services = await SalonServiceModel.find();
      res.status(200).json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch services" });
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
