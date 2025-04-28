import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { sendPasswordResetEmail } from "@/lib/email/emailService";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon) {
      // Don't reveal email non-existence for security
      return NextResponse.json(
        { success: true, message: "If the email exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).slice(2);
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Save token and expiry
    await Salon.updateOne(
      { email: email.toLowerCase() },
      {
        verificationCode: resetToken,
        verificationCodeExpires: expires,
      }
    );

    // Send reset email
    await sendPasswordResetEmail({
      to: email,
      name: salon.name || "User", // Fallback to "User" if name is missing
      resetToken,
    });

    return NextResponse.json(
      { success: true, message: "If the email exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}