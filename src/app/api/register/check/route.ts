import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email });
    if (salon) {
      return NextResponse.json({ exists: true, isVerified: salon.isVerified });
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    console.error("Check error:", { error: error.message });
    return NextResponse.json({ error: "Failed to check registration" }, { status: 500 });
  }
}