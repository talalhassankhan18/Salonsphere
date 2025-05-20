import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const distance = parseInt(searchParams.get("distance") || "5000"); // meters
    const excludeId = searchParams.get("excludeId") || "";

    if (!lat || !lng) {
      return NextResponse.json(
        { message: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const query = {
      isVerified: true,
      paymentStatus: "completed",
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
      _id: { $ne: excludeId },
      $and: [
        {
          $expr: {
            $function: {
              body: `function(latitude, longitude) {
                const R = 6371e3; // metres
                const φ1 = latitude * Math.PI/180;
                const φ2 = ${lat} * Math.PI/180;
                const Δφ = (${lat}-latitude) * Math.PI/180;
                const Δλ = (${lng}-longitude) * Math.PI/180;
                
                const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                          Math.cos(φ1) * Math.cos(φ2) *
                          Math.sin(Δλ/2) * Math.sin(Δλ/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                
                return R * c <= ${distance};
              }`,
              args: ["$latitude", "$longitude"],
              lang: "js",
            },
          },
        },
      ],
    };

    const salons = await Salon.find(query)
      .select(
        "salonName address salonType avatar latitude longitude _id name plan isActive createdAt ratings"
      )
      .limit(10); // Limit to 10 nearby salons

    const formattedSalons = salons.map((salon) => ({
      _id: salon._id.toString(),
      salonName: salon.salonName,
      address: salon.address || "No address provided",
      salonType: salon.salonType || "unisex",
      avatar: salon.avatar || "/default-salon-image.jpg",
      latitude: salon.latitude,
      longitude: salon.longitude,
      name: salon.name || "Unknown",
      plan: salon.plan?.name || "Unknown",
      isActive: salon.isActive,
      createdAt: salon.createdAt,
      ratings: salon.ratings ?? 0,
    }));

    return NextResponse.json(formattedSalons, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching nearby salons:", error.message, error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
