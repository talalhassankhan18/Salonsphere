import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import Salon from "@/mongoose-models/Salon";
import { requireSalonAdmin } from "@/lib/auth/guards";

// PATCH: update the caller's own salon business hours
export async function PATCH(req: Request) {
  const admin = await requireSalonAdmin();
  if (admin instanceof NextResponse) return admin;

  const dbError = await connectOr503();
  if (dbError) return dbError;

  try {
    const { scheduling } = await req.json();

    // Validate required fields
    if (!scheduling) {
      return NextResponse.json(
        { error: "scheduling is required" },
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

    // Update the caller's Salon document
    const updatedSalon = await Salon.findByIdAndUpdate(
      admin.salonId,
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
