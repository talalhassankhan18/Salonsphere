import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongoose";
import SalonServiceModel from "@/mongoose-models/SalonService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    await dbConnect();

    const { id } = req.query;

    try {
      const deletedService = await SalonServiceModel.findByIdAndDelete(id);

      if (!deletedService) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.status(200).json({ message: "Service deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete service" });
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
