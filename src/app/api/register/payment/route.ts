import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon, { ISalon } from "@/mongoose-models/Salon";
import { sendPaymentConfirmationEmail } from "@/lib/email/emailService";
import { Document } from "mongoose";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, plan, cardNumber, expiry, cvv } = await req.json();
    console.log(`Payment processing for ${email}:`, { plan, cardNumber: cardNumber.slice(-4) });

    if (!email || !plan || !cardNumber || !expiry || !cvv) {
      return NextResponse.json(
        { error: "Email, plan, and payment details are required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    if (!salon.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    if (!salon.plan || salon.plan.name !== plan.name) {
      return NextResponse.json(
        { error: "Selected plan does not match saved plan" },
        { status: 400 }
      );
    }

    // Simulate payment processing (replace with actual payment gateway integration)
    const paymentSuccess = true; // Replace with actual payment logic
    if (!paymentSuccess) {
      return NextResponse.json(
        { error: "Payment processing failed" },
        { status: 400 }
      );
    }

    // Update salon with payment completion
    const updateResult = await Salon.updateOne(
      { email: email.toLowerCase() },
      {
        paymentStatus: "completed",
        isActive: true,
        lastStep: "/salon/dashboard",
      }
    );

    console.log(`Payment update result for ${email}:`, updateResult);

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update salon: No matching document found" },
        { status: 404 }
      );
    }

    // Verify the update
    const updatedSalon: (Document & ISalon) | null = await Salon.findOne({ email: email.toLowerCase() });
    if (!updatedSalon || updatedSalon.paymentStatus !== "completed" || !updatedSalon.isActive) {
      console.error(`Payment status not updated for ${email}:`, updatedSalon);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }

    // Send payment confirmation email
    await sendPaymentConfirmationEmail({
      to: email,
      name: updatedSalon.name || "User",
      planName: updatedSalon.plan!.name,
      planPrice: updatedSalon.plan!.price,
      billingCycle: updatedSalon.plan!.billingCycle,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment completed successfully",
        nextStep: "/salon/login",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: `Failed to process payment: ${error.message}` },
      { status: 500 }
    );
  }
}