import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const { userId, scheduling } = await req.json();

    // Validate required fields
    if (!userId || !scheduling) {
      return NextResponse.json(
        { error: "userId and scheduling are required" },
        { status: 400 }
      );
    }

    // Validate scheduling structure (optional, as Mongoose will handle it)
    if (!scheduling.businessHours || scheduling.businessHours.length !== 7) {
      return NextResponse.json(
        { error: "Business hours must include all 7 days of the week" },
        { status: 400 }
      );
    }

    // Update the Salon document
    const updatedSalon = await Salon.findOneAndUpdate(
      { userId },
      { $set: { scheduling } },
      { new: true, runValidators: true }
    );

    if (!updatedSalon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Scheduling updated successfully",
        data: updatedSalon.scheduling,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Scheduling update error:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update scheduling" },
      { status: 500 }
    );
  }
}
