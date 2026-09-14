import { NextRequest, NextResponse } from "next/server";
import mongoose, { Document } from "mongoose";
import dbConnect from "@/dbConnect";
import Booking from "@/mongoose-models/Booking";
import Salon from "@/mongoose-models/Salon";
import Service from "@/mongoose-models/Service";
import { format } from "date-fns";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface PopulatedBooking {
  _id: string;
  salonName: string;
  serviceName: string;
  date: string; // Added: formatted date string
  time: string; // Added: formatted time string
  duration: number;
  paymentOption: "full" | "half" | "cash";
  amountPaid: number;
  status: "pending" | "confirmed" | "cancelled";
  customerInfo: CustomerInfo;
  createdAt: string; // Changed to string
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      console.error("Missing email in query parameters");
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Fetch bookings for the email
    const bookings = await Booking.find({
      "customerInfo.email": email,
    })
      .populate({
        path: "salon",
        select: "salonName",
        model: Salon,
      })
      .populate({
        path: "service",
        select: "name",
        model: Service,
      })
      .lean();

    if (!bookings.length) {
      console.log(`No bookings found for email: ${email}`);
      return NextResponse.json(
        { message: "No bookings found for this email" },
        { status: 404 }
      );
    }

    // Map bookings to response format
    const formattedBookings: PopulatedBooking[] = bookings.map(
      (booking: any) => {
        const startTime = new Date(booking.startTime);
        const createdAt = new Date(booking.createdAt);
        return {
          _id: booking._id.toString(),
          salonName: booking.salon?.salonName || "Unknown Salon",
          serviceName: booking.service?.name || "Unknown Service",
          date: format(startTime, "MMMM d, yyyy"),
          time: format(startTime, "h:mm a"),
          duration: booking.duration,
          paymentOption: booking.paymentOption,
          amountPaid: booking.amountPaid,
          status: booking.status,
          customerInfo: {
            name: booking.customerInfo.name,
            email: booking.customerInfo.email,
            phone: booking.customerInfo.phone || "N/A",
            notes: booking.customerInfo.notes || "N/A",
          },
          createdAt: format(createdAt, "MMMM d, yyyy h:mm a"),
        };
      }
    );

    console.log(
      `Found ${formattedBookings.length} bookings for email: ${email}`
    );
    return NextResponse.json({ bookings: formattedBookings }, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/bookings/guest:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}