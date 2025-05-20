import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import Booking from "@/mongoose-models/Booking";
import Review from "@/mongoose-models/Review";
import Salon from "@/mongoose-models/Salon";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");

    if (!salonId || !mongoose.Types.ObjectId.isValid(salonId)) {
      return NextResponse.json(
        { message: "Valid salonId is required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ salon: salonId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching reviews:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { bookingId, token, rating, comment } = await req.json();

    // Input validation and sanitization
    if (!bookingId || !token || rating === undefined) {
      console.error("Missing required fields", { bookingId, token, rating });
      return NextResponse.json(
        { message: "Booking ID, token, and rating are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      console.error("Invalid booking ID:", bookingId);
      return NextResponse.json(
        { message: "Invalid booking ID format" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      console.error("Invalid rating:", rating);
      return NextResponse.json(
        { message: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment && comment.length > 500) {
      console.error("Comment too long:", comment.length);
      return NextResponse.json(
        { message: "Comment must not exceed 500 characters" },
        { status: 400 }
      );
    }

    // Validate token and check expiration
    const booking = await Booking.findById(bookingId).populate("salon").lean();
    if (!booking) {
      console.error("Booking not found:", bookingId);
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (
      booking.reviewToken !== token ||
      (booking.reviewTokenExpires && booking.reviewTokenExpires < new Date())
    ) {
      console.error("Invalid or expired token:", { bookingId, token });
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 403 }
      );
    }

    if (booking.status !== "completed") {
      console.error("Booking not completed:", bookingId, booking.status);
      return NextResponse.json(
        { message: "Reviews can only be submitted for completed bookings" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId }).lean();
    if (existingReview) {
      console.error("Review already exists for booking:", bookingId);
      return NextResponse.json(
        { message: "A review has already been submitted for this booking" },
        { status: 400 }
      );
    }

    // Create review with sanitized data
    const reviewData = {
      salon: booking.salon._id,
      booking: bookingId,
      customerEmail: booking.customerInfo.email.trim(),
      rating,
      comment: comment?.trim() || undefined,
    };

    const review = await Review.create(reviewData);
    console.log(`Created review ${review._id} for booking ${bookingId}`);

    // Invalidate review token
    await Booking.findByIdAndUpdate(bookingId, {
      reviewToken: null,
      reviewTokenExpires: null,
    });

    // Update salon's average rating
    try {
      const reviews = await Review.find({ salon: booking.salon._id }).lean();
      const averageRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      await Salon.findByIdAndUpdate(booking.salon._id, {
        ratings: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      });

      console.log(
        `Updated salon ${booking.salon._id} rating to ${averageRating}`
      );
    } catch (updateError) {
      console.error("Failed to update salon rating:", updateError);
      // Log the error but don't fail the review submission
    }

    return NextResponse.json(
      { message: "Review submitted successfully", reviewId: review._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in /api/reviews:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
