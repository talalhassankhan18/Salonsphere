// app/api/salons/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const salon = await Salon.findById(params.id);
    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    // Verify the salon belongs to the requesting user
    if (salon.userId.toString() !== session.user._id) {
      return NextResponse.json(
        { error: "Unauthorized access to salon data" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: salon._id,
      name: salon.name,
      address: salon.address,
      city: salon.city,
      province: salon.province,
      zip: salon.zip,
      phone: salon.phone,
      createdAt: salon.createdAt,
      updatedAt: salon.updatedAt
    });

  } catch (error) {
    console.error("Error fetching salon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}