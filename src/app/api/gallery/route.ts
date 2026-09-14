import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Salon from "@/mongoose-models/Salon";
import Gallery, { IGallery } from "@/mongoose-models/Gallery";
import dbConnect from "@/dbConnect";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const salonId = formData.get("salonId") as string;
    const image = formData.get("image") as File;
    const caption = formData.get("caption") as string;

    // Validate input
    if (!salonId || !image) {
      return NextResponse.json(
        { error: "Salon ID and image are required" },
        { status: 400 }
      );
    }

    // Validate salonId
    if (!mongoose.Types.ObjectId.isValid(salonId)) {
      console.error("Invalid salonId:", salonId);
      return NextResponse.json({ error: "Invalid salonId" }, { status: 400 });
    }

    // Check if salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      console.error("Salon not found for ID:", salonId);
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Initialize gallery array if undefined or not an array
    if (!salon.gallery || !Array.isArray(salon.gallery)) {
      salon.gallery = [];
    }

    // Upload image to Cloudinary
    const buffer = Buffer.from(await image.arrayBuffer());
    const imageUrl = await uploadImage(buffer);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary" },
        { status: 500 }
      );
    }

    // Create new gallery image
    const newImage = new Gallery({
      salon: new mongoose.Types.ObjectId(salonId),
      imageUrl,
      caption: caption?.trim() || undefined,
      isActive: true,
    });

    // Save gallery image
    const savedImage = (await newImage.save()) as IGallery & mongoose.Document;

    // Update salon's gallery array
    salon.gallery.push(savedImage._id as mongoose.Types.ObjectId);
    await salon.save();

    return NextResponse.json(savedImage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gallery image:", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error.message || "Failed to create gallery image" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const salonId = req.nextUrl.searchParams.get("salonId");
    if (!salonId) {
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(salonId)) {
      console.error("Invalid salonId:", salonId);
      return NextResponse.json({ error: "Invalid salonId" }, { status: 400 });
    }

    const images = await Gallery.find({ salon: salonId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(images);
  } catch (error: any) {
    console.error("Error fetching gallery images:", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error.message || "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}
