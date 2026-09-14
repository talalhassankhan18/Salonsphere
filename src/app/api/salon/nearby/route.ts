import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

const EARTH_RADIUS_M = 6371e3;
const MAX_RESULTS = 10;

// GET /api/salon/nearby?lat=&lng=&distance=<metres>&excludeId=
//
// Haversine distance computed with MongoDB's native trig operators. This used
// to be a `$function` (server-side JavaScript) with the query params spliced
// into the JS source — an injection surface, slow, and it coincided with a
// mongod crash. Aggregation expressions run in the query engine with no JS.
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    const distance = Number(searchParams.get("distance") || 5000);
    const excludeId = searchParams.get("excludeId") || "";

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
      return NextResponse.json(
        { message: "Latitude and longitude are required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(distance) || distance <= 0) {
      return NextResponse.json(
        { message: "distance must be a positive number of metres" },
        { status: 400 }
      );
    }

    const toRad = (expr: unknown) => ({ $degreesToRadians: expr });
    const dLat = { $subtract: [toRad("$latitude"), toRad(lat)] };
    const dLng = { $subtract: [toRad("$longitude"), toRad(lng)] };
    const sinHalfLat = { $sin: { $divide: [dLat, 2] } };
    const sinHalfLng = { $sin: { $divide: [dLng, 2] } };
    // a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)
    const a = {
      $add: [
        { $multiply: [sinHalfLat, sinHalfLat] },
        {
          $multiply: [
            { $cos: toRad(lat) },
            { $cos: toRad("$latitude") },
            sinHalfLng,
            sinHalfLng,
          ],
        },
      ],
    };
    // d = 2R · atan2(√a, √(1−a))
    const distanceExpr = {
      $multiply: [
        2 * EARTH_RADIUS_M,
        { $atan2: [{ $sqrt: a }, { $sqrt: { $subtract: [1, a] } }] },
      ],
    };

    const query: Record<string, unknown> = {
      isVerified: true,
      paymentStatus: "completed",
      latitude: { $type: "number" },
      longitude: { $type: "number" },
      $expr: { $lte: [distanceExpr, distance] },
    };
    if (mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const salons = await Salon.find(query)
      .select(
        "salonName address salonType avatar latitude longitude _id name plan isActive createdAt ratings"
      )
      .limit(MAX_RESULTS)
      .lean();

    const formattedSalons = salons.map((salon) => ({
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
    }));

    return NextResponse.json(formattedSalons, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching nearby salons:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
