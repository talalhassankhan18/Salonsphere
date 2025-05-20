import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  format,
  parse,
  addMinutes,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import TimeSlot from "@/mongoose-models/TimeSlot";
import Booking from "@/mongoose-models/Booking";

// Define IBusinessHour interface
interface IBusinessHour {
  day: string;
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
}

// Define ISalonScheduling interface
interface ISalonScheduling {
  allowOnlineBooking: boolean;
  businessHours: IBusinessHour[];
  appointmentBuffer: number;
}

// Define ISalon interface (subset for typing)
interface ISalon {
  scheduling?: ISalonScheduling;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");
    const dateStr = searchParams.get("date");

    // Validate query parameters
    if (!salonId || !dateStr) {
      console.error("Missing salonId or date in query parameters", {
        salonId,
        dateStr,
      });
      return NextResponse.json(
        { message: "Salon ID and date are required" },
        { status: 400 }
      );
    }

    console.log(`Fetching time slots for salon ${salonId} on ${dateStr}`);

    if (!mongoose.isValidObjectId(salonId)) {
      console.error(`Invalid salon ID: ${salonId}`);
      return NextResponse.json(
        { message: "Invalid salon ID" },
        { status: 400 }
      );
    }

    // Parse the date (e.g., "2025-05-05")
    let selectedDate: Date;
    try {
      selectedDate = parse(dateStr, "yyyy-MM-dd", new Date());
    } catch (error) {
      console.error(`Invalid date format: ${dateStr}`);
      return NextResponse.json(
        { message: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    console.log(
      `Fetching time slots for salon ${salonId} on ${selectedDate.toISOString()}`
    );

    // Fetch salon scheduling data
    const salon = await Salon.findById(salonId).select("scheduling").lean();
    if (!salon) {
      console.error(`Salon not found: ${salonId}`);
      return NextResponse.json({ message: "Salon not found" }, { status: 404 });
    }

    if (!salon.scheduling?.allowOnlineBooking) {
      console.error("Online booking disabled for salon:", salonId);
      return NextResponse.json(
        { message: "Online booking is not enabled for this salon" },
        { status: 403 }
      );
    }

    const { businessHours, appointmentBuffer } = salon.scheduling;
    if (!businessHours || !appointmentBuffer) {
      console.error("Incomplete scheduling configuration for salon:", salonId);
      return NextResponse.json(
        { message: "Salon scheduling configuration is incomplete" },
        { status: 400 }
      );
    }

    // Determine the day of the week
    const dayOfWeek = format(selectedDate, "EEEE");
    const businessHour = businessHours.find(
      (bh: IBusinessHour) => bh.day === dayOfWeek
    );
    if (!businessHour || !businessHour.isOpen) {
      console.log(`Salon is closed on ${dayOfWeek} for salon ${salonId}`);
      return NextResponse.json([], { status: 200 });
    }

    // Parse open and close times with type guards
    if (!businessHour.openTime || !businessHour.closeTime) {
      console.error("Missing openTime or closeTime for business hours");
      return NextResponse.json(
        { message: "Business hours configuration is incomplete" },
        { status: 400 }
      );
    }

    const openTime = parse(businessHour.openTime, "h:mm a", selectedDate);
    const closeTime = parse(businessHour.closeTime, "h:mm a", selectedDate);

    if (isBefore(closeTime, openTime)) {
      console.error(
        `Invalid business hours: openTime=${businessHour.openTime}, closeTime=${businessHour.closeTime}`
      );
      return NextResponse.json(
        { message: "Invalid business hours configuration" },
        { status: 400 }
      );
    }

    // Generate time slots
    const timeSlots: { startTime: Date; endTime: Date }[] = [];
    let currentTime = openTime;
    while (isBefore(currentTime, closeTime)) {
      const slotEnd = addMinutes(currentTime, appointmentBuffer);
      if (isAfter(slotEnd, closeTime)) break;

      timeSlots.push({
        startTime: currentTime,
        endTime: slotEnd,
      });

      currentTime = slotEnd;
    }

    if (timeSlots.length === 0) {
      console.log(`No time slots generated for ${dateStr}, salon ${salonId}`);
      return NextResponse.json([], { status: 200 });
    }

    // Fetch existing time slots
    const existingTimeSlots = await TimeSlot.find({
      salon: salonId,
      startTime: {
        $gte: startOfDay(selectedDate),
        $lte: endOfDay(selectedDate),
      },
    }).lean();

    // Persist new time slots if they don't exist
    const newSlots = timeSlots.filter(
      (slot) =>
        !existingTimeSlots.some(
          (ts: any) =>
            new Date(ts.startTime).getTime() === slot.startTime.getTime()
        )
    );

    if (newSlots.length > 0) {
      const slotsToInsert = newSlots.map((slot) => ({
        salon: new mongoose.Types.ObjectId(salonId),
        startTime: slot.startTime,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await TimeSlot.insertMany(slotsToInsert);
      console.log(
        `Inserted ${newSlots.length} new time slots for ${dateStr}, salon ${salonId}`
      );
    }

    // Refresh existing time slots after insertion
    const updatedTimeSlots = await TimeSlot.find({
      salon: salonId,
      startTime: {
        $gte: startOfDay(selectedDate),
        $lte: endOfDay(selectedDate),
      },
    }).lean();

    // Fetch bookings for the day
    const bookings = await Booking.find({
      salon: salonId,
      startTime: {
        $gte: startOfDay(selectedDate),
        $lte: endOfDay(selectedDate),
      },
      status: { $ne: "cancelled" },
    }).lean();

    // Map time slots to response format
    const result = timeSlots.map((slot) => {
      const existingSlot = updatedTimeSlots.find(
        (ts: any) =>
          new Date(ts.startTime).getTime() === slot.startTime.getTime()
      );

      const isBooked = bookings.some((booking: any) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = addMinutes(bookingStart, booking.duration);
        return (
          slot.startTime.getTime() >= bookingStart.getTime() &&
          slot.startTime.getTime() < bookingEnd.getTime()
        );
      });

      return {
        _id: existingSlot?._id || new mongoose.Types.ObjectId(),
        salon: salonId,
        startTime: slot.startTime.toISOString(),
        isAvailable: existingSlot
          ? !isBooked && existingSlot.isAvailable
          : true,
        createdAt: existingSlot?.createdAt || new Date().toISOString(),
        updatedAt: existingSlot?.updatedAt || new Date().toISOString(),
      };
    });

    console.log(
      `Generated ${result.length} time slots for salon ${salonId} on ${dateStr}:`,
      result.map((r) => ({
        time: format(new Date(r.startTime), "h:mm a"),
        isAvailable: r.isAvailable,
      }))
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/timeslots:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
