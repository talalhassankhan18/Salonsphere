import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import Booking from "@/mongoose-models/Booking";
import TimeSlot from "@/mongoose-models/TimeSlot";
import Service from "@/mongoose-models/Service";
import { addMinutes } from "date-fns";

// Utility to format Pakistani phone number
const formatPakistaniPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 10) return phone;
  const countryCode = cleaned.startsWith("92") ? "+92" : "+92";
  const number = cleaned.startsWith("92") ? cleaned.slice(2) : cleaned;
  return `${countryCode} ${number.slice(0, 3)} ${number.slice(3)}`;
};

interface PopulatedService {
  name: string;
}

interface PopulatedBooking {
  _id: mongoose.Types.ObjectId;
  salon: mongoose.Types.ObjectId;
  service: PopulatedService;
  startTime: Date;
  duration: number;
  status: "pending" | "confirmed" | "cancelled";
  customerInfo: {
    email: string;
    phone: string;
  };
  user?: mongoose.Types.ObjectId;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { bookingId, email } = await req.json();

    if (!bookingId || !email) {
      console.error("Missing bookingId or email", { bookingId, email });
      return NextResponse.json(
        { message: "Booking ID and email are required" },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      console.error("Invalid booking ID:", bookingId);
      return NextResponse.json(
        { message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = (await Booking.findOne({
      _id: bookingId,
      "customerInfo.email": email,
    })
      .populate<{ service: PopulatedService }>({
        path: "service",
        select: "name",
        model: Service,
      })
      .lean()) as PopulatedBooking;

    if (!booking) {
      console.error("Booking not found for ID and email:", {
        bookingId,
        email,
      });
      return NextResponse.json(
        { message: "Booking not found or email does not match" },
        { status: 404 }
      );
    }

    if (booking.status === "cancelled") {
      console.error("Booking already cancelled:", bookingId);
      return NextResponse.json(
        { message: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Update booking status
    await Booking.findByIdAndUpdate(
      bookingId,
      { status: "cancelled", updatedAt: new Date() },
      { new: true }
    );

    // Restore time slots
    const startTime = new Date(booking.startTime);
    const endTime = addMinutes(startTime, booking.duration);
    await TimeSlot.updateMany(
      {
        salon: booking.salon,
        startTime: { $gte: startTime, $lt: endTime },
      },
      { $set: { isAvailable: true, updatedAt: new Date() } }
    );

    console.log(`Cancelled booking ${bookingId} for email: ${email}`);

    // Send cancellation notification
    try {
      const formattedPhone = booking.customerInfo.phone
        ? formatPakistaniPhone(booking.customerInfo.phone)
        : "N/A";
      const message = `Your booking for ${
        booking.service?.name
      } at ${startTime.toISOString()} has been cancelled. Contact: ${formattedPhone}`;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: booking.user || null,
          adminId: booking.salon.toString(),
          userEmail: booking.customerInfo.email,
          message,
        }),
      });
    } catch (notificationError) {
      console.error("Cancellation notification error:", notificationError);
    }

    return NextResponse.json(
      { message: "Booking cancelled successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/bookings/cancel:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
