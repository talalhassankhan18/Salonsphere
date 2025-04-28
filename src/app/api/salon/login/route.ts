import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { compare } from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon) {
      console.log("No salon found for email:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!salon.isActive) {
      console.log("Salon not active for email:", email);
      return NextResponse.json(
        { error: "Salon registration is not complete" },
        { status: 403 }
      );
    }

    // Check if password is defined
    if (!salon.password) {
      console.log("No password set for salon:", email);
      return NextResponse.json(
        { error: "No password set for this account" },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, salon.password);
    console.log("Password comparison result for email:", email, isPasswordValid);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // In a real app, you'd generate a JWT or session token here
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        nextStep: "/salon/dashboard",
        email: salon.email,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}