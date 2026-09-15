import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  const dbError = await connectOr503();
  if (dbError) return dbError;

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon || !salon.isVerified) {
      return NextResponse.json({ isVerified: false }, { status: 200 });
    }

    return NextResponse.json({ isVerified: true }, { status: 200 });
  } catch (error: any) {
    console.error("Check verification error:", error);
    return NextResponse.json({ error: "Failed to check verification" }, { status: 500 });
  }
}