import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Salon from "@/mongoose-models/Salon";
import dbConnect from "@/dbConnect";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email });
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({ salon }, { status: 200 });
  } catch (error) {
    console.error("Error checking salon:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
