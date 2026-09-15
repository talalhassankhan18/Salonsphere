import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";

/**
 * Connect to MongoDB, or return a 503 JSON response saying why it failed.
 *
 * Route handlers that awaited dbConnect() outside their try/catch surfaced
 * a DB outage as a bare 500 with no body, which is impossible to diagnose
 * from the browser. Use as:
 *
 *   const dbError = await connectOr503();
 *   if (dbError) return dbError;
 */
export async function connectOr503(): Promise<NextResponse | null> {
  try {
    await dbConnect();
    return null;
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Database unavailable:", details);
    return NextResponse.json(
      { error: "Database unavailable", details },
      { status: 503 }
    );
  }
}
