import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Service from "@/mongoose-models/Service";
import Salon from "@/mongoose-models/Salon";
import dbConnect from "@/dbConnect";

// Ensure DB connection
async function ensureDbConnection() {
  try {
    await dbConnect();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

// GET: Fetch a single service by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let serviceId: string | undefined; // Declare serviceId outside try block
  try {
    await ensureDbConnection();

    const { id } = await params;
    serviceId = id; // Assign serviceId here
    const salonId = req.nextUrl.searchParams.get("salonId");

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      console.error(`Invalid service ID: ${serviceId}`);
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const service = await Service.findById(serviceId).lean();
    if (!service) {
      console.error(`Service not found for ID: ${serviceId}`);
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Validate service belongs to salon if salonId is provided
    if (salonId) {
      if (!mongoose.Types.ObjectId.isValid(salonId)) {
        console.error(`Invalid salon ID: ${salonId}`);
        return NextResponse.json(
          { error: "Invalid salon ID" },
          { status: 400 }
        );
      }
      if (service.salon.toString() !== salonId) {
        console.error(
          `Service ${serviceId} does not belong to salon ${salonId}`
        );
        return NextResponse.json(
          { error: "Service does not belong to this salon" },
          { status: 403 }
        );
      }
    }

    console.log(`Fetched service: ${serviceId}`);
    return NextResponse.json(service, { status: 200 });
  } catch (error: any) {
    console.error(
      `Error fetching service ${serviceId || "unknown"}: ${error.message}`
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update a service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let serviceId: string | undefined; // Declare serviceId outside try block
  try {
    await ensureDbConnection();

    const { id } = await params;
    serviceId = id; // Assign serviceId here
    const body = await req.json();
    const {
      name,
      description,
      price,
      duration,
      category,
      image,
      gender,
      isActive,
      salonId,
    } = body;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      console.error(`Invalid service ID: ${serviceId}`);
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !name ||
      !description ||
      price == null ||
      !duration ||
      !category ||
      !gender
    ) {
      console.error(`Missing required fields for service ${serviceId}`);
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
    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      console.error(`Invalid price for service ${serviceId}: ${price}`);
      return NextResponse.json(
        { error: "Price must be a valid non-negative number" },
        { status: 400 }
      );
    }
    if (isNaN(parsedDuration) || parsedDuration < 15) {
      console.error(`Invalid duration for service ${serviceId}: ${duration}`);
      return NextResponse.json(
        { error: "Duration must be a valid number >= 15 minutes" },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ["Unisex", "Female", "Male"];
    if (!validGenders.includes(gender)) {
      console.error(`Invalid gender for service ${serviceId}: ${gender}`);
      return NextResponse.json(
        { error: "Gender must be one of: Unisex, Female, Male" },
        { status: 400 }
      );
    }

    // Validate image URL (if provided)
    if (image && !/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(image)) {
      console.error(`Invalid image URL for service ${serviceId}: ${image}`);
      return NextResponse.json(
        { error: "Image must be a valid URL (jpg, jpeg, png, webp)" },
        { status: 400 }
      );
    }

    // Validate isActive (if provided)
    if (isActive !== undefined && typeof isActive !== "boolean") {
      console.error(
        `Invalid isActive value for service ${serviceId}: ${isActive}`
      );
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Validate salon ownership
    const service = await Service.findById(serviceId);
    if (!service) {
      console.error(`Service not found for ID: ${serviceId}`);
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    if (salonId && service.salon.toString() !== salonId) {
      console.error(`Service ${serviceId} does not belong to salon ${salonId}`);
      return NextResponse.json(
        { error: "Service does not belong to this salon" },
        { status: 403 }
      );
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        duration: parsedDuration,
        category: category.trim(),
        image: image || service.image,
        gender,
        isActive: isActive !== undefined ? isActive : service.isActive,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedService) {
      console.error(`Failed to update service ${serviceId}`);
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    console.log(`Updated service: ${serviceId}`);
    return NextResponse.json(updatedService, { status: 200 });
  } catch (error: any) {
    console.error(
      `Error updating service ${serviceId || "unknown"}: ${error.message}`
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let serviceId: string | undefined; // Declare serviceId outside try block
  try {
    await ensureDbConnection();

    const { id } = await params;
    serviceId = id; // Assign serviceId here

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      console.error(`Invalid service ID: ${serviceId}`);
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      console.error(`Service not found for ID: ${serviceId}`);
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete service
    await Service.findByIdAndDelete(serviceId);

    // Remove service from salon's services array
    const salon = await Salon.findById(service.salon);
    if (salon) {
      salon.services = salon.services.filter(
        (id) => id.toString() !== serviceId
      );
      await salon.save();
      console.log(`Removed service ${serviceId} from salon ${salon._id}`);
    }

    console.log(`Deleted service: ${serviceId}`);
    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      `Error deleting service ${serviceId || "unknown"}: ${error.message}`
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
