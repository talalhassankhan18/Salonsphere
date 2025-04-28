import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, name, salonName, phone, username, address, salonType, password, authMethod } = await req.json();

    if (!email || !name || !salonName || !phone || !username || !address || !salonType || !password || !authMethod) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingSalon = await Salon.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingSalon) {
      if (existingSalon.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
      if (existingSalon.username === username) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hash(password, 10);
    const userId = uuidv4();

    const salonData = {
      userId,
      email: email.toLowerCase(),
      name,
      salonName,
      phone,
      username,
      address,
      salonType,
      password: hashedPassword,
      authMethod: "email",
      isVerified: false,
      paymentStatus: "pending",
      isActive: false,
      lastStep: "/salon/register/verification", // Ensure this matches the enum
    };

    // Log the data being saved for debugging
    console.log("Saving salonData:", salonData);

    await Salon.create(salonData);

    return NextResponse.json(
      { success: true, message: "Basic information saved successfully", nextStep: "/salon/register/verification" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Basic info save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save basic information" },
      { status: 500 }
    );
  }
}