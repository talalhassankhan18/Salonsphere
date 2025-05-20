import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { uploadImage } from "@/lib/cloudinary";
import { validatePakistaniPhone } from "@/lib/PhoneUtils";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const email = formData.get("email")?.toString();
    const name = formData.get("name")?.toString();
    const salonName = formData.get("salonName")?.toString();
    const phone = formData.get("phone")?.toString();
    const username = formData.get("username")?.toString();
    const address = formData.get("address")?.toString();
    const salonType = formData.get("salonType")?.toString();
    const password = formData.get("password")?.toString();
    const authMethod = formData.get("authMethod")?.toString();
    const avatar = formData.get("avatar") as File;
    const latitude = formData.get("latitude")?.toString();
    const longitude = formData.get("longitude")?.toString();

    // Log incoming formData for debugging
    console.log("Received formData:", Object.fromEntries(formData));

    // Validate required fields
    if (
      !email ||
      !name ||
      !salonName ||
      !phone ||
      !username ||
      !address ||
      !salonType ||
      !password ||
      !authMethod ||
      !avatar
    ) {
      return NextResponse.json(
        { error: "All fields, including profile image, are required" },
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

    // Validate phone format using phoneUtils
    if (!validatePakistaniPhone(phone)) {
      return NextResponse.json(
        {
          error:
            "Phone number must be in Pakistani format (e.g., 03335759985)",
        },
        { status: 400 }
      );
    }

    // Validate salonType
    const validSalonTypes = ["female", "male", "unisex"];
    if (!validSalonTypes.includes(salonType)) {
      return NextResponse.json(
        { error: "Invalid salon type. Must be 'female', 'male', or 'unisex'" },
        { status: 400 }
      );
    }

    // Validate authMethod
    if (authMethod !== "email") {
      return NextResponse.json(
        { error: "Invalid auth method. Must be 'email'" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate image type and size
    if (!["image/jpeg", "image/png", "image/jpg"].includes(avatar.type)) {
      return NextResponse.json(
        { error: "Profile image must be JPEG or PNG" },
        { status: 400 }
      );
    }
    if (avatar.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Profile image must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate latitude and longitude (optional, but must be valid numbers if provided)
    let parsedLatitude: number | undefined;
    let parsedLongitude: number | undefined;
    if (latitude && longitude) {
      parsedLatitude = parseFloat(latitude);
      parsedLongitude = parseFloat(longitude);
      if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
        return NextResponse.json(
          { error: "Invalid latitude or longitude" },
          { status: 400 }
        );
      }
    }

    // Check for existing salon
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

    // Upload image to Cloudinary
    const buffer = Buffer.from(await avatar.arrayBuffer());
    const imageUrl = await uploadImage(buffer);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload profile image" },
        { status: 500 }
      );
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
      avatar: imageUrl,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      lastStep: "/salon/register/verification",
      role: "salon_admin",
      portfolios: [],
      services: [],
      gallery: [],
    };

    // Log the data being saved for debugging
    console.log("Saving salonData:", {
      ...salonData,
      password: "[REDACTED]",
      avatar: imageUrl,
    });

    await Salon.create(salonData);

    return NextResponse.json(
      {
        success: true,
        message: "Basic information saved successfully",
        nextStep: "/salon/register/verification",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Basic info save error:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to save basic information" },
      { status: 500 }
    );
  }
}
