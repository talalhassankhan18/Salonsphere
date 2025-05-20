import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const salon = await Salon.findOne({ userId });
    if (!salon) {
      console.log(
        `Salon not found for ID: ${userId} { email: ${session.user.email} }`
      );
      return NextResponse.json(
        { error: "Please complete basic information first" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { description, logo, images } = body;

    if (!description || !logo || !images || images.length < 1) {
      return NextResponse.json(
        { error: "Description, logo, and at least one image are required" },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: "Description must be 500 characters or less" },
        { status: 400 }
      );
    }

    salon.description = description;
    salon.logo = logo;
    salon.images = images;

    await salon.save();

    return NextResponse.json(
      { message: "Profile updated successfully", salon },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
