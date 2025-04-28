import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/mongoose-models/User";
import dbConnect from "@/dbConnect";
import { sendVerificationEmail } from "@/lib/emailService";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "salonOwner",
      registrationStatus: "started",
      emailVerified: false,
    });
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user._id.toString());
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account created successfully. Please verify your email." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in step1 registration:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}