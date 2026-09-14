import { NextRequest, NextResponse } from "next/server";
import mongoose, { Document } from "mongoose"; // Updated import
import dbConnect from "@/dbConnect";
import Booking from "@/mongoose-models/Booking";
import TimeSlot from "@/mongoose-models/TimeSlot";
import Service from "@/mongoose-models/Service";
import Salon from "@/mongoose-models/Salon";
import { addMinutes, isValid } from "date-fns";
import { isValidObjectId } from "mongoose";
import { formatPakistaniPhone, validatePakistaniPhone } from "@/lib/PhoneUtils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

interface BookingRequest {
  salonId: string;
  serviceId: string;
  userId?: string;
  startTime: string;
  duration: number;
  paymentOption: "full" | "half" | "cash";
  amountPaid: number;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  };
}

interface PopulatedService {
  _id: mongoose.Types.ObjectId;
  salon: mongoose.Types.ObjectId;
  name: string;
  price: number;
}

export async function POST(req: NextRequest) {
  let data: BookingRequest | null = null;
  try {
    await dbConnect();

    data = await req.json();
    console.log("Received booking request:", JSON.stringify(data, null, 2));

    if (!data) {
      console.error("Request body is empty");
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    const {
      salonId,
      serviceId,
      userId,
      startTime,
      duration,
      paymentOption,
      amountPaid,
      customerInfo,
    } = data;

    // Validate required fields
    if (
      !salonId ||
      !serviceId ||
      !startTime ||
      !duration ||
      !paymentOption ||
      amountPaid === undefined ||
      !customerInfo
    ) {
      console.error("Missing required fields:", data);
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing: {
            salonId,
            serviceId,
            startTime,
            duration,
            paymentOption,
            amountPaid,
            customerInfo,
          },
        },
        { status: 400 }
      );
    }

    // Validate customer info
    if (!customerInfo.name || !customerInfo.email) {
      console.error("Missing customer info fields:", customerInfo);
      return NextResponse.json(
        {
          error: "Customer info must include name and email",
          missing: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      console.error("Invalid email format:", customerInfo.email);
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate and format phone number
    if (customerInfo.phone) {
      if (!validatePakistaniPhone(customerInfo.phone)) {
        console.error("Invalid phone number format:", customerInfo.phone);
        return NextResponse.json(
          {
            error:
              "Invalid Pakistani phone number format. Valid formats: 03331234567, 3331234567, or 923331234567",
            received: customerInfo.phone,
          },
          { status: 400 }
        );
      }

      try {
        customerInfo.phone = formatPakistaniPhone(customerInfo.phone);
        console.log("Formatted phone number:", customerInfo.phone);
      } catch (formatError) {
        console.error("Phone number formatting failed:", formatError);
        let errorMessage = "Unknown error";
        if (formatError instanceof Error) {
          errorMessage = formatError.message;
        }
        return NextResponse.json(
          {
            error: "Failed to format phone number",
            details: errorMessage,
          },
          { status: 400 }
        );
      }
    } else {
      console.log("No phone number provided, proceeding without it");
    }

    // Validate ObjectIDs
    if (!isValidObjectId(salonId) || !isValidObjectId(serviceId)) {
      console.error("Invalid ObjectId:", { salonId, serviceId });
      return NextResponse.json(
        {
          error: `Invalid ID: ${
            !isValidObjectId(salonId) ? "salonId" : "serviceId"
          }`,
        },
        { status: 400 }
      );
    }

    if (userId && !isValidObjectId(userId)) {
      console.error("Invalid userId:", userId);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Validate start time
    const startDateTime = new Date(startTime);
    if (!isValid(startDateTime)) {
      console.error(`Invalid startTime: ${startTime}`);
      return NextResponse.json(
        { error: "Invalid start time format" },
        { status: 400 }
      );
    }

    // Validate payment option
    const validPaymentOptions = ["full", "half", "cash"];
    if (!validPaymentOptions.includes(paymentOption)) {
      console.error(`Invalid paymentOption: ${paymentOption}`);
      return NextResponse.json(
        { error: "Invalid payment option" },
        { status: 400 }
      );
    }

    // Fetch and validate service
    const service = (await Service.findById(
      serviceId
    ).lean()) as PopulatedService;
    if (!service) {
      console.error(`Service not found for ID: ${serviceId}`);
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.salon.toString() !== salonId) {
      console.error(`Service ${serviceId} does not belong to salon ${salonId}`);
      return NextResponse.json(
        { error: "Service does not belong to this salon" },
        { status: 403 }
      );
    }

    // Validate payment amounts
    if (paymentOption === "full" && amountPaid !== service.price) {
      console.error(
        `Invalid amountPaid for full payment: ${amountPaid}, expected: ${service.price}`
      );
      return NextResponse.json(
        {
          error: `Amount paid must match service price for full payment. Expected: ${service.price}, Received: ${amountPaid}`,
        },
        { status: 400 }
      );
    }

    if (paymentOption === "half" && amountPaid !== service.price / 2) {
      console.error(
        `Invalid amountPaid for half payment: ${amountPaid}, expected: ${
          service.price / 2
        }`
      );
      return NextResponse.json(
        {
          error: `Amount paid must be half the service price for half payment. Expected: ${
            service.price / 2
          }, Received: ${amountPaid}`,
        },
        { status: 400 }
      );
    }

    if (paymentOption === "cash" && amountPaid !== 0) {
      console.error(
        `Invalid amountPaid for cash payment: ${amountPaid}, expected: 0`
      );
      return NextResponse.json(
        {
          error: `Amount paid must be 0 for cash payment. Received: ${amountPaid}`,
        },
        { status: 400 }
      );
    }

    // Fetch salon and calculate time slots
    const salon = await Salon.findById(salonId).select("scheduling").lean();
    if (!salon) {
      console.error(`Salon not found for ID: ${salonId}`);
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Validate salon ownership (only for salon admins)
    const session = await getServerSession(authOptions);
    if (session?.user?.email && session?.user?.id && session?.user?.role) {
      if (["salon_admin", "admin"].includes(session.user.role)) {
        const salonOwner = await Salon.findById(salonId).lean();
        if (salonOwner?.email !== session.user.email.toLowerCase()) {
          console.error(
            `User ${session.user.email} is not authorized to create bookings for salon ${salonId}`
          );
          return NextResponse.json(
            { error: "Unauthorized to create booking for this salon" },
            { status: 403 }
          );
        }
      }
      // Customers are allowed to create bookings without ownership check
    }

    const slotDuration = salon.scheduling?.appointmentBuffer || 45;
    const requiredSlots = Math.ceil(duration / slotDuration);
    const endDateTime = addMinutes(startDateTime, duration);

    console.log(
      `Booking service ${serviceId} (${duration} mins, ${requiredSlots} slots of ${slotDuration} mins) from ${startDateTime}`
    );

    // Find available time slots
    const timeSlots = await TimeSlot.find({
      salon: salonId,
      startTime: {
        $gte: startDateTime,
        $lt: endDateTime,
      },
      isAvailable: true,
    })
      .sort({ startTime: 1 })
      .lean();

    if (timeSlots.length < requiredSlots) {
      console.error(
        `Not enough available slots for ${duration} minutes. Found ${
          timeSlots.length
        } slots: [${timeSlots
          .map((s) => new Date(s.startTime).toISOString())
          .join(", ")}], needed ${requiredSlots}`
      );
      return NextResponse.json(
        {
          error: `Not enough consecutive time slots available. Found ${timeSlots.length}, needed ${requiredSlots}`,
        },
        { status: 400 }
      );
    }

    // Verify slots cover the required duration
    let currentTime = new Date(startDateTime);
    let slotsUsed = 0;
    for (let i = 0; i < timeSlots.length && slotsUsed < requiredSlots; i++) {
      const slotStart = new Date(timeSlots[i].startTime);
      if (slotStart.getTime() === currentTime.getTime()) {
        slotsUsed++;
        currentTime = addMinutes(currentTime, slotDuration);
      } else if (slotStart.getTime() > currentTime.getTime()) {
        console.error(
          `Gap in slots detected at ${currentTime} (next: ${slotStart})`
        );
        return NextResponse.json(
          { error: "Selected time slots have gaps" },
          { status: 400 }
        );
      }
    }

    if (slotsUsed < requiredSlots) {
      console.error(
        `Insufficient slots to cover duration. Used ${slotsUsed}, needed ${requiredSlots}`
      );
      return NextResponse.json(
        {
          error: `Not enough consecutive time slots available. Used ${slotsUsed}, needed ${requiredSlots}`,
        },
        { status: 400 }
      );
    }

    // Reserve time slots
    const slotIds = timeSlots.slice(0, requiredSlots).map((slot) => slot._id);
    const updateResult = await TimeSlot.updateMany(
      { _id: { $in: slotIds }, isAvailable: true },
      { $set: { isAvailable: false } }
    );

    if (updateResult.modifiedCount !== requiredSlots) {
      console.error(
        `Slot update failed. Modified ${updateResult.modifiedCount} slots, expected ${requiredSlots}`
      );
      return NextResponse.json(
        { error: "One or more slots are no longer available" },
        { status: 400 }
      );
    }

    try {
      // Create the booking
      const bookingData = {
        salon: new mongoose.Types.ObjectId(salonId),
        service: new mongoose.Types.ObjectId(serviceId),
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        startTime: startDateTime,
        duration,
        paymentOption,
        amountPaid,
        customerInfo: {
          ...customerInfo,
          phone: customerInfo.phone || undefined,
        },
        status: "pending",
      };

      console.log(
        "Creating booking with data:",
        JSON.stringify(bookingData, null, 2)
      );

      const booking = await Booking.create(bookingData);
      console.log(`Successfully created booking ${booking._id}`);

      // Send notifications
      try {
        const formattedPhone = customerInfo.phone
          ? formatPakistaniPhone(customerInfo.phone)
          : "N/A";

        const userMessage = `Your booking appointment for ${
          service.name
        } at ${startDateTime.toLocaleString()} has been forwarded. Please wait for approval. Contact: ${formattedPhone}`;

        const adminMessage = `New booking for ${
          service.name
        } at ${startDateTime.toLocaleString()} by ${customerInfo.name} (${
          customerInfo.email
        }, ${formattedPhone}) awaits approval`;

        await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customerInfo.email,
            subject: "Booking Request Submitted",
            message: userMessage,
          }),
        });

        await fetch(`${process.env.NEXTAUTH_URL}/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salonId,
            message: adminMessage,
            type: "booking",
          }),
        });
      } catch (notificationError) {
        console.error("Notification error:", notificationError);
      }

      return NextResponse.json(
        {
          message: "Booking submitted for approval",
          booking: {
            ...booking.toObject(),
            customerInfo: {
              ...booking.customerInfo,
              phone: booking.customerInfo.phone || undefined,
            },
          },
        },
        { status: 201 }
      );
    } catch (bookingError: any) {
      await TimeSlot.updateMany(
        { _id: { $in: slotIds } },
        { $set: { isAvailable: true } }
      );

      console.error("Booking creation failed:", bookingError);
      console.error("Mongoose validation errors:", bookingError.errors);

      return NextResponse.json(
        {
          error: "Booking creation failed",
          details: bookingError.message,
          validationErrors: bookingError.errors,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`Error in /api/bookings: ${error.message}`, {
      data,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}