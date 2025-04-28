import { NextResponse } from "next/server";
import User from "@/mongoose-models/User";
import Salon from "@/mongoose-models/Salon";
import dbConnect from "@/dbConnect";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const {
      name,
      address,
      city,
      province,
      zip,
      phone,
      userId,
    } = await request.json();

    // Validate required fields
    const requiredFields = { name, address, city, province, zip, phone, userId };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate phone and zip
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Must be 10-15 digits." },
        { status: 400 }
      );
    }

    const zipRegex = /^[A-Za-z0-9]{5,10}$/;
    if (!zipRegex.test(zip)) {
      return NextResponse.json(
        { error: "Invalid ZIP code. Must be 5-10 alphanumeric characters." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please register again." },
        { status: 404 }
      );
    }

    // Validate user registration status
    if (user.registrationStatus === "completed") {
      return NextResponse.json(
        { error: "Registration already completed" },
        { status: 400 }
      );
    }

    // Check for existing salon
    const existingSalon = await Salon.findOne({ name, address });
    if (existingSalon) {
      return NextResponse.json(
        { error: "A salon with this name and address already exists" },
        { status: 400 }
      );
    }

    // Create salon
    const salon = new Salon({
      name,
      address,
      city,
      province,
      zip,
      phone,
      owner: userId,
    });
    await salon.save();

    // Update user
    user.salon = salon._id;
    user.registrationStatus = "completed";
    user.role = "salonOwner";
    await user.save();

    return NextResponse.json(
      { message: "Salon registered successfully", salonId: salon._id.toString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in step2 registration:", error);
    return NextResponse.json(
      { error: "Failed to save salon information. Please try again." },
      { status: 500 }
    );
  }
}