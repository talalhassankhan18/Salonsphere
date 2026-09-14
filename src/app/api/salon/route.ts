import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import Service from "@/mongoose-models/Service";

export async function GET(request: Request) {
  try {
    await dbConnect();
    console.log("GET /api/salon called");

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const salonName = searchParams.get("salonName");
    const address = searchParams.get("address");
    const salonType = searchParams.get("salonType");
    const serviceName = searchParams.get("serviceName");

    // Build query with existing filters
    const query: any = {
      isVerified: true,
      paymentStatus: "completed",
      salonName: { $exists: true, $ne: "" },
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    };

    // Add optional salon filters
    if (salonName) {
      query.salonName = { $regex: salonName, $options: "i" }; // Partial match
      console.log("Salon Name Query:", query.salonName);
    }
    if (address) {
      query.address = { $regex: address, $options: "i" }; // Partial match
    }
    if (salonType && ["female", "male", "unisex"].includes(salonType)) {
      query.salonType = salonType;
    }

    // Add service-based filtering
    if (serviceName) {
      // Find services with matching names (partial match)
      const matchingServices = await Service.find({
        name: { $regex: serviceName, $options: "i" },
        isActive: true,
      }).select("_id");

      console.log("Matching Services:", JSON.stringify(matchingServices, null, 2));

      // Extract service IDs
      const serviceIds = matchingServices.map((service) => service._id);

      // Filter salons that have these services
      if (serviceIds.length > 0) {
        query.services = { $in: serviceIds };
      } else {
        // If no services match, return no salons
        return NextResponse.json([], { status: 200 });
      }
    }

    // Log the final query
    console.log("Final Query:", JSON.stringify(query, null, 2));

    // Fetch salons with populated services
    const salons = await Salon.find(query)
      .populate({
        path: "services",
        select: "name category isActive",
      })
      .lean();

    // Log raw MongoDB response for debugging
    console.log("Raw MongoDB Salons:", JSON.stringify(salons, null, 2));

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

        const sanitizedServices = (salon.services || []).map((service: any) => ({
          name: typeof service.name === "string" ? service.name : "Unknown Service",
          category: service.category || "Other",
          isActive: service.isActive ?? true,
        }));

        return {
          _id: salon._id.toString(),
          salonName: salon.salonName,
          address: salon.address || "No address provided",
          salonType: salon.salonType || "unisex",
          avatar: salon.avatar || "/placeholder.svg",
          latitude: salon.latitude,
          longitude: salon.longitude,
          name: salon.name || "Unknown",
          plan: salon.plan?.name || "Unknown",
          isActive: salon.isActive,
          createdAt: salon.createdAt,
          ratings: salon.ratings ?? 0,
          services: sanitizedServices,
        };
      })
      .filter((salon) => salon !== null);

    // Log formatted response for debugging
    console.log("Fetched Salons:", JSON.stringify(formattedSalons, null, 2));

    return NextResponse.json(formattedSalons, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching salons:", error.message, error.stack);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
