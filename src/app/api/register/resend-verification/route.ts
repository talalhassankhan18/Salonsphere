import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import Salon from "@/mongoose-models/Salon";
import { sendVerificationCodeEmail } from "@/lib/email/emailService";

export async function POST(req: Request) {
  const dbError = await connectOr503();
  if (dbError) return dbError;

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Find unverified user
    const user = await Salon.findOne({
      email: email.toLowerCase(),
      isVerified: false,
      authMethod: "email",
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No pending verification found for this email" },
        { status: 404 }
      );
    }

    // Check resend cooldown (30 seconds)
    const lastResend = user.lastResend ? new Date(user.lastResend) : new Date(0);
    const cooldownSeconds = 30;
    const timeSinceLastResend = (Date.now() - lastResend.getTime()) / 1000;
    if (timeSinceLastResend < cooldownSeconds) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${Math.ceil(cooldownSeconds - timeSinceLastResend)} seconds before resending`,
        },
        { status: 429 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new code
    await Salon.updateOne(
      { _id: user._id },
      {
        verificationCode,
        verificationCodeExpires,
        lastResend: new Date(),
      }
    );

    // Send verification email
    try {
      await sendVerificationCodeEmail({
        to: email,
        name: user.name || user.username,
        code: verificationCode,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        { success: false, error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Verification code resent" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resend code" },
      { status: 500 }
    );
  }
}