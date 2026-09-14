import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import Booking from "@/mongoose-models/Booking";
import Salon from "@/mongoose-models/Salon";
import { sendEmail } from "@/lib/sendEmail";
import crypto from "crypto";
import { requireSalonAdmin } from "@/lib/auth/guards";

export async function POST(req: NextRequest) {
  const caller = await requireSalonAdmin();
  if (caller instanceof NextResponse) return caller;

  try {
    await dbConnect();

    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      console.error("Missing bookingId or status", { bookingId, status });
      return NextResponse.json(
        { message: "Booking ID and status are required" },
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

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      console.error("Invalid status:", status);
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId).populate("salon");
    if (!booking) {
      console.error("Booking not found:", bookingId);
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    const bookingSalonId = String(
      (booking.salon as any)?._id ?? booking.salon ?? ""
    );
    if (bookingSalonId !== caller.salonId) {
      return NextResponse.json(
        { message: "You can only update bookings for your own salon" },
        { status: 403 }
      );
    }

    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    console.log(`Updated booking ${bookingId} to status: ${status}`);

    // Send general status update email
    const salon = booking.salon as any;
    const salonName = salon?.salonName || "Salon";
    const statusMessage = `Your booking at ${salonName} has been updated to ${status}.`;

    await sendEmail({
      to: booking.customerInfo.email,
      subject: `Booking Update - ${salonName}`,
      text: statusMessage,
      fromName: salonName,
    });

    // Send review form email only if status is "completed"
    if (status === "completed") {
      try {
        // Generate a secure review token and set expiration
        const reviewToken = crypto.randomBytes(32).toString("hex");
        const reviewTokenExpires = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ); // 7 days expiration

        await Booking.findByIdAndUpdate(bookingId, {
          reviewToken,
          reviewTokenExpires,
        });

        const reviewFormUrl = `${
          process.env.NEXTAUTH_URL
        }/review?bookingId=${bookingId}&token=${encodeURIComponent(
          reviewToken
        )}`;

        const reviewMessage = `
          Your booking for a service on ${booking.startTime.toLocaleString()} has been completed.
          <br><br>
          We would love to hear your feedback. Please take a moment to rate your experience and leave a review.
          <br><br>
          <a href="${reviewFormUrl}" class="button">Submit Your Review</a>
        `;

        await sendEmail({
          to: booking.customerInfo.email,
          subject: `We Value Your Feedback - Review Your Visit to ${salonName}`,
          text: reviewMessage.replace(/<[^>]+>/g, ""),
          html: reviewMessage, // Use the custom HTML with the review link
          fromName: salonName,
        });

        console.log(
          `Sent review form email to ${booking.customerInfo.email} with link: ${reviewFormUrl}`
        );
      } catch (notificationError) {
        console.error("Failed to send review email:", notificationError);
      }
    }

    return NextResponse.json(
      { message: "Booking status updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/bookings/update-status:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
