import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { sendVerificationCodeEmail } from "@/lib/email/emailService";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, action, code } = await req.json();

    if (!email || !action) {
      return NextResponse.json(
        { error: "Email and action are required" },
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

    if (action === "send") {
      // Check resend cooldown (30 seconds)
      const lastResend = salon.lastResend ? new Date(salon.lastResend) : new Date(0);
      const cooldownSeconds = 30;
      const timeSinceLastResend = (Date.now() - lastResend.getTime()) / 1000;
      if (timeSinceLastResend < cooldownSeconds) {
        return NextResponse.json(
          {
            error: `Please wait ${Math.ceil(cooldownSeconds - timeSinceLastResend)} seconds before resending`,
          },
          { status: 429 }
        );
      }

      // Generate new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update salon with new code
      await Salon.updateOne(
        { email: email.toLowerCase() },
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
          name: salon.name || "User",
          code: verificationCode,
        });
        console.log(`Verification code sent to ${email}: ${verificationCode}`); // Remove in production
      } catch (emailError: any) {
        console.error("Email sending failed:", emailError);
        return NextResponse.json(
          { error: "Failed to send verification email. Please check your email configuration." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Verification code sent" },
        { status: 200 }
      );
    } else if (action === "verify") {
      if (!code) {
        return NextResponse.json(
          { error: "Verification code is required" },
          { status: 400 }
        );
      }

      if (salon.verificationCode !== code || salon.verificationCodeExpires < new Date()) {
        return NextResponse.json(
          { error: "Invalid or expired verification code" },
          { status: 400 }
        );
      }

      await Salon.updateOne(
        { email: email.toLowerCase() },
        {
          isVerified: true,
          verificationCode: null,
          verificationCodeExpires: null,
          lastStep: "/salon/register/plan-selection",
        }
      );

      return NextResponse.json(
        {
          success: true,
          message: "Email verified successfully",
          nextStep: "/salon/register/plan-selection",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to process verification: " + error.message },
      { status: 500 }
    );
  }
}