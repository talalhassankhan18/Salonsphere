import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Salon from "@/mongoose-models/Salon";
import Gallery from "@/mongoose-models/Gallery";
import dbConnect from "@/dbConnect";
import { deleteImage } from "@/lib/cloudinary";
import { requireSalonAdmin } from "@/lib/auth/guards";

// DELETE: remove a gallery image (salon admin, own salon only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireSalonAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    await dbConnect();

    // Await params to resolve the dynamic route parameter
    const { id } = await context.params;

    // Validate image ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
    }

    // Find the gallery image
    const image = await Gallery.findById(id);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    if (image.salon.toString() !== admin.salonId) {
      return NextResponse.json(
        { error: "Image does not belong to your salon" },
        { status: 403 }
      );
    }

    // Find the associated salon
    const salon = await Salon.findById(image.salon);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Initialize gallery array if undefined
    if (!Array.isArray(salon.gallery)) {
      salon.gallery = [];
    }

    // Optionally delete the image from Cloudinary
    const publicId = image.imageUrl.split("/").pop()?.split(".")[0];
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error);
        // Continue deletion even if Cloudinary fails (optional)
      }
    }

    // Remove the image ID from the salon's gallery array
    salon.gallery = salon.gallery.filter(
      (galleryId: mongoose.Types.ObjectId) => galleryId.toString() !== id
    );
    await salon.save();

    // Delete the image from the Gallery collection
    await Gallery.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting gallery image:", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery image" },
      { status: 500 }
    );
  }
}
