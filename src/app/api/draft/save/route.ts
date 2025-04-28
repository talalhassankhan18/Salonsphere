import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  await dbConnect();

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