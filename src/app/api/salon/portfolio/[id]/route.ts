import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Salon from "@/mongoose-models/Salon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Portfolio from "@/mongoose-models/Portfolio";
import dbConnect from "@/dbConnect";
import { uploadImage } from "@/lib/cloudinary";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await dbConnect();
    console.log("PUT /api/salon/portfolio/[id] called, id:", id);

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "salon_admin") {
      console.error("Unauthorized access attempt:", session?.user);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // const { id } = params; // Already destructured above
    if (!mongoose.isValidObjectId(id)) {
      console.error("Invalid portfolio ID:", id);
      return NextResponse.json(
        { message: "Invalid portfolio ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const category = formData.get("category")?.toString();
    const imageFile = formData.get("image") as File;

    console.log("Form data received:", {
      title,
      description,
      category,
      imageFile: imageFile ? "File present" : "No file",
    });

    if (!title || !category) {
      console.error("Missing required fields:", { title, category });
      return NextResponse.json(
        { message: "Missing required fields: title and category are required" },
        { status: 400 }
      );
    }

    console.log("Finding portfolio:", id);
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      console.error("Portfolio not found:", id);
      return NextResponse.json(
        { message: "Portfolio not found" },
        { status: 404 }
      );
    }

    console.log(
      "Verifying salon for salonId:",
      portfolio.salon,
      "userId:",
      session.user.id
    );
    const salon = await Salon.findOne({
      _id: portfolio.salon,
    });
    if (!salon) {
      console.error("Unauthorized access to salon:", portfolio.salon);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Updating portfolio fields...");
    portfolio.title = title;
    portfolio.description = description || "";
    portfolio.category = category;

    if (imageFile) {
      console.log("Uploading new image to Cloudinary...");
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
      portfolio.image = imageUrl;
    }

    await portfolio.save();
    console.log("Portfolio updated in database:", portfolio._id);

    return NextResponse.json(portfolio, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/salon/portfolio/[id]:", error);
    return NextResponse.json(
      { message: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await dbConnect();
    console.log("DELETE /api/salon/portfolio/[id] called, id:", id);

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "salon_admin") {
      console.error("Unauthorized access attempt:", session?.user);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // const { id } = params; // Already destructured above
    if (!mongoose.isValidObjectId(id)) {
      console.error("Invalid portfolio ID:", id);
      return NextResponse.json(
        { message: "Invalid portfolio ID" },
        { status: 400 }
      );
    }

    console.log("Finding portfolio:", id);
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      console.error("Portfolio not found:", id);
      return NextResponse.json(
        { message: "Portfolio not found" },
        { status: 404 }
      );
    }

    console.log(
      "Verifying salon for salonId:",
      portfolio.salon,
      "userId:",
      session.user.id
    );
    const salon = await Salon.findOne({
      _id: portfolio.salon,
    });
    if (!salon) {
      console.error("Unauthorized access to salon:", portfolio.salon);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Deleting portfolio:", id);
    await Portfolio.findByIdAndDelete(id);
    console.log("Portfolio deleted from database");

    console.log("Removing portfolio ID from salon...");
    await Salon.findByIdAndUpdate(portfolio.salon, {
      $pull: { portfolios: id },
    });
    console.log("Salon updated successfully");

    return NextResponse.json(
      { message: "Portfolio deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/salon/portfolio/[id]:", error);
    return NextResponse.json(
      { message: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
