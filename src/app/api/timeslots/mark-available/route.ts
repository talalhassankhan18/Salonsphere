import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import TimeSlot from "@/mongoose-models/TimeSlot";
import { addMinutes } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { salonId, startTime, duration } = await req.json();

    if (!salonId || !startTime || !duration) {
      console.error("Missing salonId, startTime, or duration", {
        salonId,
        startTime,
        duration,
      });
      return NextResponse.json(
        { message: "Salon ID, start time, and duration are required" },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(salonId)) {
      console.error("Invalid salon ID:", salonId);
      return NextResponse.json(
        { message: "Invalid salon ID" },
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
