import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import mongoose from "mongoose";
import { uploadImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcryptjs from "bcryptjs";

// Define CustomSession type for type safety with next-auth
interface CustomSession {
  user?: {
    salonId?: string;
    email?: string;
    role?: string;
  };
}

// GET: Fetch salon details by ID for the Settings page
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    await dbConnect();
    const { id: paramId } = await params;
    id = paramId;
    console.log(`GET /api/salon/${id} called`);

    if (!id) {
      console.error("Salon ID is undefined or missing");
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(id)) {
      console.error("Invalid salon ID format:", id);
      return NextResponse.json(
        { error: "Invalid salon ID format" },
        { status: 400 }
      );
    }

    const salon = await Salon.findById(id)
      .select(
        "salonName address salonType avatar email name phone username scheduling ratings"
      )
      .lean();
    if (!salon) {
      console.error(`Salon not found for ID: ${id}`);
      return NextResponse.json(
        { error: `Salon with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Ensure _id is a string
    const formattedSalon = {
      ...salon,
      _id: salon._id.toString(),
      ratings: salon.ratings ?? 0,
    };

    console.log("Fetched salon for Settings page:", formattedSalon);
    return NextResponse.json(formattedSalon, { status: 200 });
  } catch (error: any) {
    console.error(
      `Error fetching salon ${id || "unknown"}:`,
      error.message,
      error.stack
    );
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update salon details with optional avatar upload and password change
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    await dbConnect();
    const { id: paramId } = await params;
    id = paramId;
    console.log(`PUT /api/salon/${id} called`);

    if (!id) {
      console.error("Salon ID is undefined or missing");
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(id)) {
      console.error("Invalid salon ID format:", id);
      return NextResponse.json(
        { error: "Invalid salon ID format" },
        { status: 400 }
      );
    }

    // Fetch session and validate
    const session = (await getServerSession(
      authOptions
    )) as CustomSession | null;
    console.log("Session data:", session);
    if (!session) {
      console.error("No session found for salon ID:", id);
      return NextResponse.json(
        { error: "Unauthorized: No session found" },
        { status: 401 }
      );
    }
    if (!session.user || !session.user.salonId) {
      console.error("Session missing user or salon ID:", session);
      return NextResponse.json(
        { error: "Unauthorized: Session missing salon ID" },
        { status: 401 }
      );
    }
    if (session.user.salonId !== id) {
      console.error(
        "Session salon ID mismatch. Expected:",
        id,
        "Got:",
        session.user.salonId
      );
      return NextResponse.json(
        { error: "Unauthorized: Session salon ID does not match" },
        { status: 401 }
      );
    }

    // Find verified salon
    const salon = await Salon.findOne({
      _id: id,
      isVerified: true,
      paymentStatus: "completed",
    });

    if (!salon) {
      console.error(`Salon not found or not verified for ID: ${id}`);
      return NextResponse.json(
        { error: "Salon not found or not verified" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    console.log("Received FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`FormData: ${key} =`, value);
    }

    const salonName = formData.get("salonName")?.toString();
    const phone = formData.get("phone")?.toString();
    const address = formData.get("address")?.toString();
    const salonType = formData.get("salonType")?.toString();
    const email = formData.get("email")?.toString();
    const name = formData.get("name")?.toString();
    const username = formData.get("username")?.toString();
    const avatar = formData.get("avatar") as File | null;
    const schedulingData = formData.get("scheduling")?.toString();
    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();

    // Validate required fields
    if (salonName && !salonName.trim()) {
      console.error("Salon name cannot be empty");
      return NextResponse.json(
        { error: "Salon name is required" },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("Invalid email format:", email);
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
      console.error("Invalid phone number:", phone);
      return NextResponse.json(
        { error: "Phone number must match schema format" },
        { status: 400 }
      );
    }
    if (salonType && !["female", "male", "unisex"].includes(salonType)) {
      console.error("Invalid salon type:", salonType);
      return NextResponse.json(
        { error: "Invalid salon type. Must be 'female', 'male', or 'unisex'" },
        { status: 400 }
      );
    }

    // Check for duplicate email
    if (email && email.toLowerCase() !== salon.email.toLowerCase()) {
      const existingSalon = await Salon.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingSalon) {
        console.error("Email already exists:", email);
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate username
    if (username && username !== salon.username) {
      const existingSalon = await Salon.findOne({
        username,
        _id: { $ne: id },
      });
      if (existingSalon) {
        console.error("Username already taken:", username);
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Validate scheduling data
    if (schedulingData) {
      try {
        const scheduling = JSON.parse(schedulingData);
        if (!Array.isArray(scheduling.businessHours)) {
          throw new Error("businessHours must be an array");
        }
        const validDays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        for (const hour of scheduling.businessHours) {
          if (!hour.day || !validDays.includes(hour.day)) {
            throw new Error(`Invalid day: ${hour.day}`);
          }
          if (typeof hour.isOpen !== "boolean") {
            throw new Error(`isOpen must be a boolean for ${hour.day}`);
          }
          if (hour.isOpen) {
            if (!hour.openTime || !hour.closeTime) {
              throw new Error(
                `Open and close times required for ${hour.day} when open`
              );
            }
            const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
            if (!timeRegex.test(hour.openTime)) {
              throw new Error(
                `Invalid openTime format for ${hour.day} (e.g., 9:00 AM or 09:00 AM)`
              );
            }
            if (!timeRegex.test(hour.closeTime)) {
              throw new Error(
                `Invalid closeTime format for ${hour.day} (e.g., 6:00 PM or 06:00 PM)`
              );
            }
            const open = new Date(`1970-01-01 ${hour.openTime}`);
            const close = new Date(`1970-01-01 ${hour.closeTime}`);
            if (isNaN(open.getTime()) || isNaN(close.getTime())) {
              throw new Error(`Invalid time format for ${hour.day}`);
            }
            if (open >= close) {
              throw new Error(
                `${hour.day}: Close time must be after open time`
              );
            }
          } else {
            if (hour.openTime !== null || hour.closeTime !== null) {
              throw new Error(
                `openTime and closeTime must be null for ${hour.day} when closed`
              );
            }
          }
        }
        if (
          typeof scheduling.appointmentBuffer !== "number" ||
          scheduling.appointmentBuffer < 0 ||
          scheduling.appointmentBuffer > 60
        ) {
          throw new Error("appointmentBuffer must be between 0 and 60");
        }
        if (typeof scheduling.allowOnlineBooking !== "boolean") {
          throw new Error("allowOnlineBooking must be a boolean");
        }
        if (typeof scheduling.requireConfirmation !== "boolean") {
          throw new Error("requireConfirmation must be a boolean");
        }
        salon.scheduling = scheduling;
      } catch (err: any) {
        console.error("Invalid scheduling data:", err.message);
        return NextResponse.json(
          { error: `Invalid scheduling data: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // Handle password update
    if (currentPassword && newPassword) {
      if (!salon.password) {
        console.error("Password not set for salon ID:", id);
        return NextResponse.json(
          { error: "Password not set for this salon" },
          { status: 400 }
        );
      }
      const isMatch = await bcryptjs.compare(currentPassword, salon.password);
      if (!isMatch) {
        console.error("Incorrect current password for salon ID:", id);
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      if (newPassword.length < 8) {
        console.error("New password too short for salon ID:", id);
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }
      salon.password = await bcryptjs.hash(newPassword, 10);
    }

    // Update fields if provided
    if (salonName) salon.salonName = salonName.trim();
    if (phone) salon.phone = phone.trim();
    if (address !== undefined) salon.address = address ? address.trim() : "";
    if (salonType) salon.salonType = salonType as "female" | "male" | "unisex";
    if (email) salon.email = email.toLowerCase();
    if (name !== undefined) salon.name = name ? name.trim() : "";
    if (username !== undefined)
      salon.username = username ? username.trim() : "";

    // Handle avatar upload (non-blocking)
    if (avatar && avatar.size > 0) {
      console.log("Received avatar:", avatar.name, avatar.type, avatar.size);
      if (!["image/jpeg", "image/png", "image/jpg"].includes(avatar.type)) {
        console.error("Invalid avatar file type:", avatar.type);
        return NextResponse.json(
          { error: "Profile image must be JPEG or PNG" },
          { status: 400 }
        );
      }
      if (avatar.size > 5 * 1024 * 1024) {
        console.error("Avatar file too large:", avatar.size);
        return NextResponse.json(
          { error: "Profile image must be less than 5MB" },
          { status: 400 }
        );
      }

      try {
        const buffer = Buffer.from(await avatar.arrayBuffer());
        console.log(
          "Uploading avatar to Cloudinary, buffer size:",
          buffer.length
        );
        const imageUrl = await uploadImage(buffer);
        if (imageUrl) {
          console.log("Avatar uploaded successfully:", imageUrl);
          salon.avatar = imageUrl;
        } else {
          console.warn(
            "Cloudinary upload failed: No image URL returned, continuing with other updates"
          );
        }
      } catch (uploadError: any) {
        console.error(
          "Error uploading avatar to Cloudinary:",
          uploadError.message,
          uploadError.stack
        );
        console.warn("Avatar upload failed, continuing with other updates");
      }
    }

    await salon.save();
    console.log("Updated salon:", salon);

    return NextResponse.json(
      {
        ...salon.toObject(),
        _id: salon._id.toString(),
        ratings: salon.ratings ?? 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      `Error updating salon ${id || "unknown"}:`,
      error.message,
      error.stack
    );
    return NextResponse.json(
      { error: error.message || "Failed to update salon" },
      { status: 500 }
    );
  }
}
