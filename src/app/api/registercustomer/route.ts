import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/dbConnect";
import Customer, { ICustomer } from "@/mongoose-models/Customer";

export async function POST(request: Request) {
  try {
    console.log(
      "MONGODB_URI in /api/registercustomer:",
      process.env.MONGODB_URI
    );

    await dbConnect();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase(),
    });
    if (existingCustomer) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const verificationToken = uuidv4();
    console.log("Generated verification token:", verificationToken); // Debug log

    const customer: ICustomer = await Customer.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authMethod: "email",
      isVerified: false,
      verificationToken,
      role: "customer",
    });

    console.log("Created customer with token:", customer.verificationToken); // Debug log

    const emailResponse = await fetch(
      `${
        process.env.NEXTAUTH_URL
      }/api/send-verification-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token: verificationToken }),
      }
    );

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.error || "Failed to send verification email");
    }

    return NextResponse.json(
      {
        message:
          "Registration successful! Please check your email to verify your account.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
