import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import Service, { IService } from "@/mongoose-models/Service";
import Salon from "@/mongoose-models/Salon";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import { requireSalonAdmin } from "@/lib/auth/guards";

// Ensure DB connection
async function ensureDbConnection() {
  const dbError = await connectOr503();
  if (dbError) return dbError;
}

// GET: Fetch all services for a salon
export async function GET(request: Request) {
  try {
    await ensureDbConnection();

    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");

    if (!salonId) {
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 }
      );
    }

    // Validate salonId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(salonId)) {
      return NextResponse.json({ error: "Invalid Salon ID" }, { status: 400 });
    }

    const services = await Service.find({
      salon: new mongoose.Types.ObjectId(salonId),
      isActive: true, // Only return active services
    }).lean();

    return NextResponse.json(services, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching services:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new service (salon admin, own salon only)
export async function POST(request: Request) {
  const admin = await requireSalonAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    await ensureDbConnection();

    const body = await request.json();
    const { name, description, price, duration, category, image, gender } = body;
    // Never trust a salonId from the body — the caller can only add to their own salon.
    const salonId = admin.salonId;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !duration ||
      !category ||
      !gender
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, price, duration, category, gender",
        },
        { status: 400 }
      );
    }

    // Validate price and duration
    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Price must be a valid non-negative number" },
        { status: 400 }
      );
    }
    if (isNaN(parsedDuration) || parsedDuration < 15) {
      return NextResponse.json(
        { error: "Duration must be a valid number >= 15 minutes" },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ["Unisex", "Female", "Male"];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: "Gender must be one of: Unisex, Female, Male" },
        { status: 400 }
      );
    }

    // Verify salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Initialize salon.services if undefined or not an array
    if (!Array.isArray(salon.services)) {
      console.log(`Initializing salon.services for salon ${salonId}`);
      salon.services = [];
      await salon.save();
    }

    // Create new service
    const newService = new Service({
      salon: new mongoose.Types.ObjectId(salonId),
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice, // Price in PKR
      duration: parsedDuration,
      category: category.trim(),
      image,
      gender,
      isActive: true,
    });

    await newService.save();

    // Add service to salon's services array
    salon.services.push(newService._id as Types.ObjectId); // Explicitly cast _id to ObjectId
    await salon.save();

    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
    console.error("Error creating service:", error.message, error.stack);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
