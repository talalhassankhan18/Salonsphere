import { NextRequest, NextResponse } from "next/server";
import { connectOr503 } from "@/lib/db-guard";
import Salon from "@/mongoose-models/Salon";
import axios from "axios";

// Nominatim's usage policy requires an identifying User-Agent and ≤ 1 req/s.
// Browsers cannot set User-Agent, and direct calls from the page were being
// blocked (a blocked response carries no CORS headers, so the browser
// reported "blocked by CORS policy"). Everything goes through here instead.
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const HEADERS = {
  "User-Agent": "SalonSphere/1.0 (salon registration geocoding)",
  Accept: "application/json",
};

async function lookup(address: string) {
  const { data } = await axios.get(NOMINATIM, {
    params: {
      format: "json",
      q: `${address}, Pakistan`,
      countrycodes: "pk",
      addressdetails: 1,
      limit: 1,
    },
    headers: HEADERS,
    timeout: 8000,
  });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

/** GET /api/geocode?q=<address> → { lat, lon, displayName } | 404 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }
  try {
    const hit = await lookup(q);
    if (!hit) {
      return NextResponse.json({ error: "No match" }, { status: 404 });
    }
    return NextResponse.json(
      { lat: hit.lat, lon: hit.lon, displayName: hit.display_name },
      // Same address → same answer; let Vercel's edge cache absorb repeats.
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    console.error("Geocode lookup failed:", status, (error as Error).message);
    return NextResponse.json(
      { error: "Geocoding service unavailable" },
      { status: status === 429 ? 429 : 502 }
    );
  }
}

/** POST /api/geocode — backfill coordinates for salons that have none. */
export async function POST() {
  const dbError = await connectOr503();
  if (dbError) return dbError;
  try {
    const salons = await Salon.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
      ],
    });

    let updated = 0;
    for (const salon of salons) {
      const hit = await lookup(salon.address);
      if (hit) {
        await Salon.updateOne(
          { _id: salon._id },
          { $set: { latitude: parseFloat(hit.lat), longitude: parseFloat(hit.lon) } }
        );
        updated++;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // rate limit
    }

    return NextResponse.json(
      { message: "Geocoding completed", scanned: salons.length, updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
