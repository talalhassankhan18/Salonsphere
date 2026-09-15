import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  const dbError = await connectOr503();
  if (dbError) return dbError;

  try {
    const { email, type, data } = await req.json();

    if (!email || !type || !data) {
      return NextResponse.json(
        { error: "Email, type, and data are required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (salon) {
      if (type === "plan") {
        await Salon.updateOne(
          { email: email.toLowerCase() },
          { plan: data, lastStep: "./plan-selection" }
        );
      }
    } else {
      if (type === "plan") {
        await Salon.create({
          email: email.toLowerCase(),
          plan: data,
          lastStep: "./plan-selection",
          authMethod: "email",
          isVerified: false,
          paymentStatus: "pending",
          isActive: false,
        });
      }
    }

    return NextResponse.json(
      { success: true, message: "Draft saved successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Draft save error:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}