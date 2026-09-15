import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — liveness plus a real database check, so a deployment can
 * be diagnosed from one URL. 200 when Mongo answers, 503 (with the driver's
 * message, e.g. Atlas "IP isn't whitelisted") when it doesn't.
 */
export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ status: "ok", db: "connected" }, { status: 200 });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "degraded", db: "unreachable", details },
      { status: 503 }
    );
  }
}
