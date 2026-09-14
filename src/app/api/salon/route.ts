import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function GET(request: Request) {
  try {
    await dbConnect();
    console.log("GET /api/salon called");

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const salonName = searchParams.get("salonName");
    const address = searchParams.get("address");
    const salonType = searchParams.get("salonType");

    // Build query with existing filters
    const query: any = {
      isVerified: true,
      paymentStatus: "completed",
      salonName: { $exists: true, $ne: "" },
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    };

    // Add optional filters
    if (salonName) {
      query.salonName = { $regex: salonName, $options: "i" }; // Case-insensitive
    }
    if (address) {
      query.address = { $regex: address, $options: "i" };
    }
    if (salonType && ["female", "male", "unisex"].includes(salonType)) {
      query.salonType = salonType;
    }

    // Fetch salons with required fields
    const salons = await Salon.find(query).select(
      "salonName address salonType avatar latitude longitude _id name plan isActive createdAt ratings"
    );

    // Format and validate response
    const formattedSalons = salons
      .map((salon) => {
        if (
          typeof salon.salonName !== "string" ||
          typeof salon._id !== "object" ||
          (salon.latitude != null && typeof salon.latitude !== "number") ||
          (salon.longitude != null && typeof salon.longitude !== "number")
        ) {
          console.warn(
            `Skipping invalid salon: _id=${salon._id}, salonName=${salon.salonName}, latitude=${salon.latitude}, longitude=${salon.longitude}`
          );
          return null;
        }
        return {
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
        };
      })
      .filter((salon) => salon !== null);

    console.log("Fetched salons:", formattedSalons);
    return NextResponse.json(formattedSalons, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching salons:", error.message, error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
