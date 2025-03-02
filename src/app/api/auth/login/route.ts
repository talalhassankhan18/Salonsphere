import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/mongoose-models/register";
import dbConnect from "@/dbConnect";

export async function POST(req: Request) {
  try {
    await dbConnect(); // Connect to MongoDB

    const { email, password } = await req.json();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    // Set cookie
    const response = NextResponse.json({ message: "Login successful", token });
    response.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
