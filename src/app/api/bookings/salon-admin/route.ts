import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import Booking from "@/mongoose-models/Booking";
import Salon from "@/mongoose-models/Salon";
import Service from "@/mongoose-models/Service";
import { formatPakistaniPhone } from "@/lib/PhoneUtils";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");

    console.log("Received salonId:", salonId);

    if (!salonId) {
      console.error("Missing salonId in query parameters");
      return NextResponse.json(
        { message: "Salon ID is required" },
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

    const salon = await Salon.findById(salonId);
    console.log("Salon found:", salon);

    if (!salon) {
      console.log(`Salon not found: ${salonId}`);
      return NextResponse.json({ message: "Salon not found" }, { status: 404 });
    }

    const bookings = await Booking.find({
      salon: new mongoose.Types.ObjectId(salonId),
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

    console.log("Raw bookings from database:", bookings);

    if (!bookings.length) {
      console.log(`No bookings found for salon: ${salonId}`);
      return NextResponse.json(
        { bookings: [], message: "No bookings found for this salon" },
        { status: 200 }
      );
    }

    const formattedBookings = bookings.map((booking: any) => {
      console.log("Processing booking:", booking);

      const customerInfo = booking.customerInfo || {};

      let formattedPhone = "N/A";
      if (customerInfo.phone) {
        try {
          formattedPhone = formatPakistaniPhone(customerInfo.phone);
        } catch (phoneError) {
          console.warn(
            `Failed to format phone number for booking ${booking._id}:`,
            phoneError instanceof Error ? phoneError.message : phoneError
          );
          formattedPhone = customerInfo.phone;
        }
      }

      return {
        _id: booking._id.toString(),
        salon: booking.salon
          ? { salonName: booking.salon.salonName || "Unknown Salon" }
          : { salonName: "Unknown Salon" },
        service: booking.service
          ? { name: booking.service.name || "Unknown Service" }
          : { name: "Unknown Service" },
        startTime: booking.startTime,
        duration: booking.duration,
        paymentOption: booking.paymentOption,
        amountPaid: booking.amountPaid,
        status: booking.status,
        customerInfo: {
          name: customerInfo.name || "N/A",
          email: customerInfo.email || "N/A",
          phone: formattedPhone,
          notes: customerInfo.notes || "N/A",
        },
        createdAt: booking.createdAt,
      };
    });

    console.log(
      `Found ${formattedBookings.length} bookings for salon: ${salonId}`
    );
    console.log("Formatted bookings:", formattedBookings);
    return NextResponse.json({ bookings: formattedBookings }, { status: 200 });
  } catch (error) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in /api/bookings/salon-admin:", errorMessage);
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
