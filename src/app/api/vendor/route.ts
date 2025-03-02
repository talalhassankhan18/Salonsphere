import { NextResponse } from "next/server";
import Vendor from "@/mongoose-models/verify";
import dbConnect from "@/lib/mongoose";

export async function GET() {
  try {
    await dbConnect();

    // Fetch the first vendor (adjust this logic for authentication later)
    const vendor = await Vendor.findOne();

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Ensure profile image has correct URL (appends the public path correctly)
    const profileImageUrl = vendor.profileImage ? `/uploads/${vendor.profileImage.split("/").pop()}` : "";

    return NextResponse.json({
      businessName: vendor.businessName,
      profileImage: profileImageUrl, // Sends correct profile image path
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 });
  }
}
