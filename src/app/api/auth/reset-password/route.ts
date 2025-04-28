import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({
      verificationCode: token,
      verificationCodeExpires: { $gt: new Date() },
    });

    if (!salon) {
      console.log("No salon found for token:", token);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);
    console.log("Hashed password:", hashedPassword);

    // Update password and clear token
    salon.password = hashedPassword;
    salon.verificationCode = undefined;
    salon.verificationCodeExpires = undefined;
    await salon.save();
    console.log("Salon saved successfully for email:", salon.email);

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}