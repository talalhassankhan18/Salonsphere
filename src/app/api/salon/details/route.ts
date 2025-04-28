import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        salonName: salon.salonName,
        name: salon.name,
        isActive: salon.isActive,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching salon details:", error);
    return NextResponse.json(
      { error: "Failed to fetch salon details" },
      { status: 500 }
    );
  }
}