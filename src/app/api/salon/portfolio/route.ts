import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Salon from "@/mongoose-models/Salon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Portfolio from "@/mongoose-models/Portfolio";
import dbConnect from "@/dbConnect";
import { uploadImage } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    console.log("GET /api/salon/portfolio called");

    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");

    if (!salonId || !mongoose.isValidObjectId(salonId)) {
      console.error("Invalid salon ID:", salonId);
      return NextResponse.json(
        { message: "Invalid salon ID" },
        { status: 400 }
      );
    }

    console.log("Fetching portfolios for salonId:", salonId);
    const portfolios = await Portfolio.find({ salon: salonId }).sort({
      createdAt: -1,
    });
    console.log("Portfolios found:", portfolios);

    return NextResponse.json(portfolios, { status: 200 });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    console.log("POST /api/salon/portfolio called");

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "salon_admin") {
      console.error("Unauthorized access attempt:", session?.user);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const category = formData.get("category")?.toString();
    const salonId = formData.get("salonId")?.toString();
    const imageFile = formData.get("image") as File;

    console.log("Form data received:", {
      title,
      description,
      category,
      salonId,
      imageFile: imageFile ? "File present" : "No file",
    });

    if (!title || !category || !salonId || !imageFile) {
      console.error("Missing required fields:", {
        title,
        category,
        salonId,
        imageFile,
      });
      return NextResponse.json(
        {
          message:
            "Missing required fields: title, category, salonId, and image are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(salonId)) {
      console.error("Invalid salon ID:", salonId);
      return NextResponse.json(
        { message: "Invalid salon ID" },
        { status: 400 }
      );
    }

    console.log(
      "Verifying salon for salonId:",
      salonId,
      "userId:",
      session.user.id
    );
    const salon = await Salon.findOne({
      _id: salonId,
    });
    if (!salon) {
      console.error("Salon not found or unauthorized:", salonId);
      return NextResponse.json(
        { message: "Salon not found or unauthorized" },
        { status: 404 }
      );
    }

    console.log("Uploading image to Cloudinary...");
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const imageUrl = await uploadImage(buffer);
    console.log("Cloudinary image URL:", imageUrl);

    if (!imageUrl) {
      console.error("Failed to upload image to Cloudinary");
      return NextResponse.json(
        { message: "Failed to upload image to Cloudinary" },
        { status: 500 }
      );
    }

    console.log("Creating new portfolio...");
    const portfolio = new Portfolio({
      salon: salonId,
      title,
      description,
      category,
      image: imageUrl,
      createdAt: new Date(),
    });

    await portfolio.save();
    console.log("Saved portfolio:", portfolio);

    console.log("Updating salon with portfolio ID...");
    await Salon.findByIdAndUpdate(salonId, {
      $push: { portfolios: portfolio._id },
    });
    console.log("Salon updated successfully");

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/salon/portfolio:", error);
    return NextResponse.json(
      { message: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
