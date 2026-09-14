import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import TimeSlot from "@/mongoose-models/TimeSlot";
import { addMinutes } from "date-fns";
import { requireSalonAdmin } from "@/lib/auth/guards";

// POST: re-open time slots for the caller's own salon
export async function POST(req: NextRequest) {
  const admin = await requireSalonAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    await dbConnect();

    const { startTime, duration } = await req.json();
    // Slots can only be freed on the caller's own salon.
    const salonId = admin.salonId;

    if (!startTime || !duration) {
      console.error("Missing startTime or duration", { startTime, duration });
      return NextResponse.json(
        { message: "Start time and duration are required" },
        { status: 400 }
      );
    }

    const parsedStartTime = new Date(startTime);
    if (isNaN(parsedStartTime.getTime())) {
      console.error("Invalid start time:", startTime);
      return NextResponse.json(
        { message: "Invalid start time" },
        { status: 400 }
      );
    }

    const endTime = addMinutes(parsedStartTime, duration);

    // Update time slots to mark them as available
    const updateResult = await TimeSlot.updateMany(
      {
        salon: salonId,
        startTime: { $gte: parsedStartTime, $lt: endTime },
      },
      { $set: { isAvailable: true, updatedAt: new Date() } }
    );

    console.log(
      `Marked ${updateResult.modifiedCount} slots as available for salon ${salonId}`
    );

    return NextResponse.json(
      { message: "Time slots marked as available" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/timeslots/mark-available:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
