import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import axios from "axios";

export async function POST() {
  try {
    await dbConnect();
    const salons = await Salon.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
      ],
    });

    for (const salon of salons) {
      const address = encodeURIComponent(salon.address);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
      );
      const data = response.data;

      if (data.length > 0) {
        const { lat, lon } = data[0];
        await Salon.updateOne(
          { _id: salon._id },
          { $set: { latitude: parseFloat(lat), longitude: parseFloat(lon) } }
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json(
      { message: "Geocoding completed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
